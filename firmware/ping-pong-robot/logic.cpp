#include "logic.h"
#include "config.h"
#include "utils.h"
#include "servos.h"
#include "motors.h"
#include <Arduino.h>

// Forward declaration para acessar os motores diretamente
extern AF_DCMotor motor1;
extern AF_DCMotor motor2;
extern AF_DCMotor motor3;

// ================= Auto state vars =================
float panDir = 1.0f;
float tiltDir = 1.0f;
unsigned long panLastStepMs = 0;
unsigned long tiltLastStepMs = 0;

const unsigned long AUTO2_PAUSE_MS = 1000;

// ================= Globals =================
Screen currentScreen = SCREEN_HOME;

float livePan = 0.0f;
float liveTilt = 0.0f;

bool isRunning = false;
unsigned long runStartMs = 0;

unsigned long maxPlayedMs = 0;

int homeIndex = 0;
int wizardIndex = 0;

int panMenuIndex = 0;
int tiltMenuIndex = 0;

int launcherIndex = 0;
int spinIndex = 0;
int feederIndex = 0;
int timerMenuIndex = 0;
int settingsIndex = 0;  // 0=Servo1, 1=Servo2, 2=M1, 3=M2, 4=M3, 5=M4, 6=Back
int settingsServoEditIndex = 0;  // 0: MIN, 1: MID, 2: MAX, 3: Back
int settingsServoSelected = 0;  // 0: Servo 1 (TILT), 1: Servo 2 (PAN)
int settingsMotorTest = 0;      // 0=nada, 1=M1, 2=M2, 3=M3, 4=M4
int settingsMotorSpeed = 0;     // 0..255 para teste individual

Config cfg;

// ================= Auto update =================
float auto1Update(float base, float &dir, float speed, float minVal, float maxVal) {
  base += dir * speed;
  if (base >= maxVal) { base = maxVal; dir = -1.0f; }
  if (base <= minVal) { base = minVal; dir = 1.0f; }
  return base;
}

float auto2Update(float base, float &dir, unsigned long &lastStepMs, float step, unsigned long pauseMs, float minVal, float maxVal) {
  unsigned long now = millis();
  if (now - lastStepMs < pauseMs) return base;

  lastStepMs = now;
  base += dir * step;

  if (base >= maxVal) { base = maxVal; dir = -1.0f; }
  if (base <= minVal) { base = minVal; dir = 1.0f; }

  return base;
}

static float pickRandomTarget(float minVal, float maxVal, float current, float minDist) {
  float range = maxVal - minVal;
  if (range <= 0.0f) return current;
  for (int attempt = 0; attempt < 20; attempt++) {
    float t = minVal + (float)(random(0, 10001) / 10000.0) * range;
    if (fabs(t - current) >= minDist) return t;
  }
  return current + (current < (minVal + maxVal) * 0.5f ? minDist : -minDist);
}

void applyAuto(float &value, AxisMode mode, float &dir, unsigned long &lastStepMs, float auto1Speed, float auto2Step,
               float minVal, float maxVal, unsigned long randomPauseMs, float randomMinDist) {
  if (mode == AXIS_AUTO1) {
    value = auto1Update(value, dir, auto1Speed, minVal, maxVal);
  } else if (mode == AXIS_AUTO2) {
    value = auto2Update(value, dir, lastStepMs, auto2Step, AUTO2_PAUSE_MS, minVal, maxVal);
  } else if (mode == AXIS_RANDOM) {
    unsigned long now = millis();
    if (now - lastStepMs >= randomPauseMs) {
      value = pickRandomTarget(minVal, maxVal, value, randomMinDist);
      lastStepMs = now;
    }
  }
}

// ================= Logic updates =================
void updateRunningLogic() {
  if (!isRunning) return;

  unsigned long played = millis() - runStartMs;
  if (played > maxPlayedMs) maxPlayedMs = played;

  unsigned long tms = timerMsByIndex(cfg.timerIndex);
  if (tms > 0 && millis() - runStartMs >= tms) {
    isRunning = false;
    stopAllMotors();
    currentScreen = SCREEN_HOME;
    return;
  }

  // PAN
  if (cfg.panMode == AXIS_LIVE) {
    float stickX = joyToNorm(analogRead(JOY_X));
    applyIncremental(livePan, stickX);
  } else {
    applyAuto(livePan, cfg.panMode, panDir, panLastStepMs, cfg.panAuto1Speed, cfg.panAuto2Step,
              cfg.panMin, cfg.panMax, cfg.panRandomPauseMs, cfg.panRandomMinDist);
  }

  // TILT
  if (cfg.tiltMode == AXIS_LIVE) {
    float stickY = joyToNorm(analogRead(JOY_Y));
    applyIncremental(liveTilt, stickY);
  } else {
    applyAuto(liveTilt, cfg.tiltMode, tiltDir, tiltLastStepMs, cfg.tiltAuto1Speed, cfg.tiltAuto2Step,
              cfg.tiltMin, cfg.tiltMax, cfg.tiltRandomPauseMs, cfg.tiltRandomMinDist);
  }

  // Atualizar servos com os valores normalizados
  updateServos(livePan, liveTilt);

  // Atualizar motores do launcher (M1, M2, M3)
  updateLauncherMotors(cfg.launcherPower, cfg.spinMode, cfg.spinIntensity);

  // Atualizar motor feeder (M4)
  updateFeederMotor(cfg.feederSpeed, cfg.feederMode, cfg.feederCustomOnMs, cfg.feederCustomOffMs);
}

void updateAxisPreviewTargets() {
  if (currentScreen == SCREEN_PAN) {
    applyAuto(cfg.panTarget, cfg.panMode, panDir, panLastStepMs, cfg.panAuto1Speed, cfg.panAuto2Step,
              cfg.panMin, cfg.panMax, cfg.panRandomPauseMs, cfg.panRandomMinDist);
  }
  if (currentScreen == SCREEN_TILT) {
    applyAuto(cfg.tiltTarget, cfg.tiltMode, tiltDir, tiltLastStepMs, cfg.tiltAuto1Speed, cfg.tiltAuto2Step,
              cfg.tiltMin, cfg.tiltMax, cfg.tiltRandomPauseMs, cfg.tiltRandomMinDist);
  }
}

// ================= Flow helpers =================
void goBackToWizard() {
  currentScreen = SCREEN_WIZARD;
}

void cancelToHome() {
  isRunning = false;
  stopAllMotors();
  currentScreen = SCREEN_HOME;
}

void startRunning() {
  isRunning = true;
  runStartMs = millis();

  livePan = cfg.panTarget;
  liveTilt = cfg.tiltTarget;

  // Inicia os motores gradualmente para evitar pico de corrente
  // Primeiro inicia com velocidade baixa (metade da velocidade configurada)
  int initialSpeed = cfg.launcherPower / 2;
  if (initialSpeed < 50) initialSpeed = 50; // Mínimo de 50 para garantir que gire
  
  // Reseta cache e inicia com velocidade reduzida
  resetMotorCache();
  
  motor1.setSpeed(initialSpeed);
  motor2.setSpeed(initialSpeed);
  motor3.setSpeed(initialSpeed);
  motor1.run(FORWARD);
  motor2.run(FORWARD);
  motor3.run(FORWARD);
  
  // Atualiza cache manualmente (sem spin no início)
  setMotorCache(initialSpeed, initialSpeed, initialSpeed);

  currentScreen = SCREEN_RUNNING;
  
  // A velocidade completa será aplicada no próximo loop através de updateRunningLogic()
}

// ================= Axis menu helpers =================
int axisMaxIndex(AxisMode mode) {
  if (mode == AXIS_LIVE) return 2;
  if (mode == AXIS_AUTO1) return 2;
  if (mode == AXIS_AUTO2) return 2;
  if (mode == AXIS_RANDOM) return 4;
  return 1;
}

bool axisHasSecondOption(AxisMode mode) {
  return (mode == AXIS_LIVE || mode == AXIS_AUTO1 || mode == AXIS_AUTO2 || mode == AXIS_RANDOM);
}

const char* axisSecondLabel(AxisMode mode) {
  if (mode == AXIS_LIVE) return "Edit Target";
  if (mode == AXIS_AUTO1) return "Speed";
  if (mode == AXIS_AUTO2) return "Step";
  if (mode == AXIS_RANDOM) return "Min";
  return "";
}
