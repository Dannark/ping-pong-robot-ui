#include "bt_command.h"
#include "config.h"
#include "logic.h"
#include "motors.h"
#include "servos.h"
#include <Arduino.h>
#include <string.h>

static char lineBuf[BT_LINE_BUF_SIZE];
static int lineLen = 0;

volatile bool btConnected = false;
char btDeviceName[BT_DEVICE_NAME_LEN + 1] = { '\0' };
static unsigned long stateHighSinceMs = 0;
static unsigned long stateNotConnectedSinceMs = 0;

#define BT_STATE_SOLID_HIGH_MS 1500UL
#define BT_STATE_DISCONNECT_MS 2000UL

bool getBtConnected(void) {
  return btConnected;
}

const char* getBtDeviceName() {
  return btDeviceName;
}

static void setBTDisconnected(void) {
  if (btConnected) {
    btConnected = false;
    btDeviceName[0] = '\0';
    stateHighSinceMs = 0;
    stateNotConnectedSinceMs = 0;
    Serial.println(F("[BT] DISCONNECTED"));
  }
}

void updateBTState() {
  const int raw = digitalRead(BT_STATE_PIN);
  const unsigned long now = millis();

  // Many HM-10 boards blink STATE while advertising and keep it solid when connected.
  // So we consider "module connected" only when the pin stays in the connected level
  // continuously for BT_STATE_SOLID_HIGH_MS.
  const bool pinIsConnectedLevel =
    (raw == HIGH) ? (BT_STATE_HIGH_WHEN_CONNECTED != 0) : (BT_STATE_HIGH_WHEN_CONNECTED == 0);

  if (pinIsConnectedLevel) {
    if (stateHighSinceMs == 0) stateHighSinceMs = now;
  } else {
    stateHighSinceMs = 0;
  }

  const bool moduleConnected = (stateHighSinceMs != 0) && ((now - stateHighSinceMs) >= BT_STATE_SOLID_HIGH_MS);

  if (moduleConnected) {
    stateNotConnectedSinceMs = 0;
    btConnected = true;
    return;
  }

  // Not connected: only clear UI after it's been not-connected for BT_STATE_DISCONNECT_MS.
  if (btConnected) {
    if (stateNotConnectedSinceMs == 0) {
      stateNotConnectedSinceMs = now;
    } else if ((now - stateNotConnectedSinceMs) >= BT_STATE_DISCONNECT_MS) {
      setBTDisconnected();
      stateNotConnectedSinceMs = 0;
    }
  } else {
    stateNotConnectedSinceMs = 0;
  }
}

static void clampFloat(float &v, float lo, float hi) {
  if (v < lo) v = lo;
  if (v > hi) v = hi;
}

static void clampInt(int &v, int lo, int hi) {
  if (v < lo) v = lo;
  if (v > hi) v = hi;
}

static void clampUL(unsigned long &v, unsigned long lo, unsigned long hi) {
  if (v < lo) v = lo;
  if (v > hi) v = hi;
}

// Converte enum recebido (0..3) em AxisMode
static AxisMode intToAxisMode(int v) {
  if (v < 0 || v >= AXIS_MODE_COUNT) return AXIS_LIVE;
  return (AxisMode)v;
}

static FeederMode intToFeederMode(int v) {
  if (v < 0 || v >= FEED_MODE_COUNT) return FEED_CONTINUOUS;
  return (FeederMode)v;
}

static SpinMode intToSpinMode(int v) {
  if (v < 0 || v >= SPIN_MODE_COUNT) return SPIN_NONE;
  return (SpinMode)v;
}

static void logLineReceived(void) {
  Serial.print(F("[BT RX] "));
  for (int i = 0; i < lineLen; i++) {
    char c = lineBuf[i];
    Serial.print((c >= 32 && c < 127) ? c : '.');
  }
  Serial.println();
}

// Processa uma linha: S/START = start, P/STOP = stop, N,name = device name, C,... = config
static void processLine() {
  if (lineLen <= 0) return;

  lineBuf[lineLen] = '\0';
  logLineReceived();

  if (lineBuf[0] == 'S') {
    if (lineLen == 1 || (lineLen >= 5 && strncmp(lineBuf, "START", 5) == 0)) {
      startRunning();
      BT_SERIAL.print(F("OK,S\n"));
    }
    lineLen = 0;
    return;
  }
  if (lineBuf[0] == 'P') {
    if (lineLen == 1 || (lineLen >= 4 && strncmp(lineBuf, "STOP", 4) == 0)) {
      if (isRunning) {
        isRunning = false;
        stopAllMotors();
      }
      currentScreen = SCREEN_HOME;
    }
    lineLen = 0;
    return;
  }
  if (lineBuf[0] == 'D' && (lineLen == 1 || (lineLen >= 8 && strncmp(lineBuf, "DISCONNECT", 8) == 0))) {
    setBTDisconnected();
    lineLen = 0;
    return;
  }
  const char* nCmd = strstr(lineBuf, "N,");
  if (nCmd != nullptr) {
    int i = 0;
    const char* src = nCmd + 2;
    while (*src && *src != '\r' && *src != '\n' && *src != ',' && i < BT_DEVICE_NAME_LEN) {
      btDeviceName[i++] = *src++;
    }
    btDeviceName[i] = '\0';
    btConnected = true;
    stateHighSinceMs = 0;
    stateNotConnectedSinceMs = 0;
    Serial.print(F("[BT] CONNECTED name="));
    Serial.println(btDeviceName[0] ? btDeviceName : "(none)");
  }
  if (nCmd != nullptr && lineBuf[0] != 'S' && lineBuf[0] != 'P' && lineBuf[0] != 'C' && lineBuf[0] != 'A') {
    lineLen = 0;
    return;
  }
  if (lineBuf[0] == 'A' && lineBuf[1] == ',') {
    int p1000 = 0, t1000 = 0;
    char* q = lineBuf + 2;
    if (*q) { p1000 = atoi(q); while (*q && *q != ',') q++; if (*q == ',') q++; }
    if (*q) t1000 = atoi(q);
    cfg.panTarget = (float)p1000 / 1000.0f;
    cfg.tiltTarget = (float)t1000 / 1000.0f;
    clampFloat(cfg.panTarget, -1.0f, 1.0f);
    clampFloat(cfg.tiltTarget, -1.0f, 1.0f);
    livePan = cfg.panTarget;
    liveTilt = cfg.tiltTarget;
    updateServos(cfg.panTarget, cfg.tiltTarget);
    lineLen = 0;
    return;
  }
  // CONFIG: framed as <C,v0,v1,...,v25> so we only run when a complete block (start+end) is received.
  const char* configStartMarker = "<C,";
  const size_t configStartLen = 3;
  char* lastBlock = (char*)lineBuf;
  for (char* q = lineBuf; *q; q++) {
    if (q[0] == '<' && q[1] == 'C' && q[2] == ',') lastBlock = q + configStartLen;
  }
  bool hasConfigMarker = (strstr(lineBuf, configStartMarker) != nullptr);
  bool endsWithClose = (lineLen >= 1 && lineBuf[lineLen - 1] == '>');

  if (hasConfigMarker) {
    if (!endsWithClose) {
      Serial.println(F("[BT] Config rejected: incomplete (block does not end with '>')"));
      BT_SERIAL.print(F("ERR,C,INCOMPLETE\n"));
      lineLen = 0;
      return;
    }
    char* endBlock = (char*)(lineBuf + lineLen - 1);
    if (lastBlock > endBlock) {
      Serial.println(F("[BT] Config rejected: invalid (no content between markers)"));
      BT_SERIAL.print(F("ERR,C,INVALID\n"));
      lineLen = 0;
      return;
    }
    *endBlock = '\0';
    // CONFIG: 26 ints (order same as app): panMode, tiltMode, panTarget*1000, ...
    int v[26];
    int n = 0;
    char* p = lastBlock;
    while (n < 26 && *p) {
      v[n++] = atoi(p);
      while (*p && *p != ',') p++;
      if (*p == ',') p++;
    }
    if (n >= 26) {
      cfg.panMode = intToAxisMode(v[0]);
      cfg.tiltMode = intToAxisMode(v[1]);
      cfg.panTarget = (float)v[2] / 1000.0f;
      cfg.tiltTarget = (float)v[3] / 1000.0f;
      cfg.panMin = (float)v[4] / 1000.0f;
      cfg.panMax = (float)v[5] / 1000.0f;
      cfg.tiltMin = (float)v[6] / 1000.0f;
      cfg.tiltMax = (float)v[7] / 1000.0f;
      clampFloat(cfg.panTarget, -1.0f, 1.0f);
      clampFloat(cfg.tiltTarget, -1.0f, 1.0f);
      clampFloat(cfg.panMin, -1.0f, 1.0f);
      clampFloat(cfg.panMax, -1.0f, 1.0f);
      clampFloat(cfg.tiltMin, -1.0f, 1.0f);
      clampFloat(cfg.tiltMax, -1.0f, 1.0f);

      cfg.panAuto1Speed = (float)v[8] / 1000.0f;
      cfg.panAuto2Step = (float)v[9] / 1000.0f;
      cfg.panAuto2PauseMs = (unsigned long)v[10];
      cfg.tiltAuto1Speed = (float)v[11] / 1000.0f;
      cfg.tiltAuto2Step = (float)v[12] / 1000.0f;
      cfg.tiltAuto2PauseMs = (unsigned long)v[13];
      clampFloat(cfg.panAuto1Speed, 0.005f, 0.08f);
      clampFloat(cfg.panAuto2Step, 0.05f, 0.5f);
      clampFloat(cfg.tiltAuto1Speed, 0.005f, 0.08f);
      clampFloat(cfg.tiltAuto2Step, 0.05f, 0.5f);
      clampUL(cfg.panAuto2PauseMs, 100UL, 10000UL);
      clampUL(cfg.tiltAuto2PauseMs, 100UL, 10000UL);

      cfg.panRandomMinDist = (float)v[14] / 1000.0f;
      cfg.panRandomPauseMs = (unsigned long)v[15];
      cfg.tiltRandomMinDist = (float)v[16] / 1000.0f;
      cfg.tiltRandomPauseMs = (unsigned long)v[17];
      clampFloat(cfg.panRandomMinDist, 0.1f, 0.5f);
      clampFloat(cfg.tiltRandomMinDist, 0.1f, 0.5f);
      clampUL(cfg.panRandomPauseMs, 500UL, 30000UL);
      clampUL(cfg.tiltRandomPauseMs, 500UL, 30000UL);

      cfg.launcherPower = v[18];
      cfg.spinMode = intToSpinMode(v[19]);
      cfg.spinIntensity = v[20];
      cfg.feederMode = intToFeederMode(v[21]);
      cfg.feederSpeed = v[22];
      cfg.feederCustomOnMs = (unsigned long)v[23];
      cfg.feederCustomOffMs = (unsigned long)v[24];
      cfg.timerIndex = v[25];

      clampInt(cfg.launcherPower, 0, 255);
      clampInt(cfg.spinIntensity, 0, 512);
      clampInt(cfg.feederSpeed, 0, 255);
      clampInt(cfg.timerIndex, 0, 5);
      clampUL(cfg.feederCustomOnMs, 100UL, 10000UL);
      clampUL(cfg.feederCustomOffMs, 100UL, 10000UL);

      if (!isRunning) {
        updateServos(cfg.panTarget, cfg.tiltTarget);
      }
      BT_SERIAL.print(F("OK,C\n"));
    } else {
      Serial.println(F("[BT] Config rejected: invalid (expected 26 fields)"));
      BT_SERIAL.print(F("ERR,C,INVALID\n"));
    }
    lineLen = 0;
    return;
  }

  lineLen = 0;
}

void notifyLiveAimToApp(float pan, float tilt) {
  int p1000 = (int)(pan * 1000.0f);
  int t1000 = (int)(tilt * 1000.0f);
  BT_SERIAL.print(F("A,"));
  BT_SERIAL.print(p1000);
  BT_SERIAL.print(F(","));
  BT_SERIAL.print(t1000);
  BT_SERIAL.print('\n');
}

void initBTCommand() {
  pinMode(BT_STATE_PIN, INPUT);
  BT_SERIAL.begin(BT_BAUD);
  lineLen = 0;

#if BT_AT_INIT_AT_STARTUP
  delay(500);
  for (int i = 0; i < 10; i++) BT_SERIAL.print(F("xxxxxxxx"));
  delay(100);
  BT_SERIAL.print(F("AT+NAMESpinRobot"));
  delay(200);
  BT_SERIAL.print(F("AT+RESET"));
  delay(2500);
#endif
}

void processBTInput() {
  while (BT_SERIAL.available()) {
    char c = (char)BT_SERIAL.read();
    if (c == '\n' || c == '\r') {
      if (lineLen > 0) processLine();
      continue;
    }
    if (lineLen < BT_LINE_BUF_SIZE - 1) {
      lineBuf[lineLen++] = c;
    } else {
      lineLen = 0;  // overflow, descarta linha
    }
  }
}
