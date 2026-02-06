#include "display.h"
#include "config.h"
#include "bt_command.h"
#include <Wire.h>
#include <Arduino.h>
#include <math.h>

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void initDisplay() {
  Wire.begin();
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("### ERRO: OLED nao encontrado");
    while (true) delay(100);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.println("### UI Boot...");
  display.display();
  delay(400);
}

void drawHeader(const char* title) {
  display.setCursor(0, 0);
  display.print(title);
  if (getBtConnected()) {
    int cx = SCREEN_WIDTH - 18;
    display.setCursor(cx, 0);
    display.print("B");
    display.fillTriangle(cx + 8, 0, cx + 14, 0, cx + 11, 4, SSD1306_WHITE);
    display.fillTriangle(cx + 8, 8, cx + 14, 8, cx + 11, 4, SSD1306_WHITE);
  }
  display.println();
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);
}

void drawMiniRadar(int x0, int y0, int size, float pan, float tilt) {
  drawMiniRadarWithLimits(x0, y0, size, pan, tilt, -1.0f, 1.0f, -1.0f, 1.0f);
}

void drawMiniRadarWithLimits(int x0, int y0, int size, float pan, float tilt, float panMin, float panMax, float tiltMin, float tiltMax) {
  int cx = x0 + size / 2;
  int cy = y0 + size / 2;
  int radius = size / 2;

  display.drawRect(x0, y0, size, size, SSD1306_WHITE);
  if (size > 2) {
    display.fillRect(x0 + 1, y0 + 1, size - 2, size - 2, SSD1306_WHITE);
  }

  if (panMin < panMax && tiltMin < tiltMax) {
    int rx = x0 + (int)((panMin + 1.0f) * 0.5f * (float)size + 0.5f);
    int ry = y0 + (int)((tiltMin + 1.0f) * 0.5f * (float)size + 0.5f);
    int rw = (int)((panMax - panMin) * 0.5f * (float)size + 0.5f);
    int rh = (int)((tiltMax - tiltMin) * 0.5f * (float)size + 0.5f);
    if (rw > 0 && rh > 0) {
      if (rw >= 3 && rh >= 3) {
        display.fillRect(rx + 1, ry + 1, rw - 2, rh - 2, SSD1306_BLACK);
      }
      display.drawRect(rx, ry, rw, rh, SSD1306_WHITE);
    }
  }

  display.drawPixel(cx, cy, SSD1306_WHITE);
  display.drawLine(cx - 2, cy, cx + 2, cy, SSD1306_WHITE);
  display.drawLine(cx, cy - 2, cx, cy + 2, SSD1306_WHITE);

  int px = cx + (int)(pan * (float)radius + 0.5f);
  int py = cy + (int)(tilt * (float)radius + 0.5f);
  display.fillCircle(px, py, 2, SSD1306_WHITE);
}

void drawSpinVisualizer(int x0, int y0, int size, SpinMode spinMode) {
  int cx = x0 + size / 2;
  int cy = y0 + size / 2;
  int radius = size / 2 - 2;

  // Desenha a bolinha (círculo maior)
  display.drawCircle(cx, cy, radius, SSD1306_WHITE);

  // Se for NONE, não desenha seta
  int angleDeg = spinModeToAngleDeg(spinMode);
  if (angleDeg < 0) {
    display.fillCircle(cx, cy, 2, SSD1306_WHITE);
    return;
  }

  // Seta na direção do ângulo: 0°=N(up), 90°=E(right)
  int arrowLength = radius - 4;
  int arrowHeadSize = 3;
  double rad = (double)angleDeg * 0.01745329252;
  float dx = (float)sin(rad);
  float dy = -(float)cos(rad);

  int endX = cx + (int)(dx * arrowLength + 0.5f);
  int endY = cy + (int)(dy * arrowLength + 0.5f);

  display.drawLine(cx, cy, endX, endY, SSD1306_WHITE);

  // Cabeça da seta: dois segmentos a partir da ponta
  int backX = endX - (int)(dx * arrowHeadSize + 0.5f);
  int backY = endY - (int)(dy * arrowHeadSize + 0.5f);
  int leftX = backX + (int)(-dy * arrowHeadSize + 0.5f);
  int leftY = backY + (int)(dx * arrowHeadSize + 0.5f);
  int rightX = backX - (int)(-dy * arrowHeadSize + 0.5f);
  int rightY = backY - (int)(dx * arrowHeadSize + 0.5f);
  display.drawLine(endX, endY, leftX, leftY, SSD1306_WHITE);
  display.drawLine(endX, endY, rightX, rightY, SSD1306_WHITE);
}

// Step mínimo = 0.25 s = 250 ms; 1 pixel = 250 ms no eixo do tempo (todos os modos).
#define FEEDER_MS_PER_PIXEL 250UL

// Retorna 1 se no tempo (col * 250 ms) estamos na fase "on" do ciclo onMs/offMs.
static int feederPixelOnAt(unsigned long col, unsigned long onMs, unsigned long offMs) {
  unsigned long total = onMs + offMs;
  if (total == 0) total = 1;
  unsigned long t = (col * FEEDER_MS_PER_PIXEL) % total;
  return (t < onMs) ? 1 : 0;
}

// Mini gráfico do modo feeder: borda 1px, margem 1px, barras 32x4 px (total 36x8). 1 px = 250 ms.
#define FEEDER_GRAPH_BORDER 1
#define FEEDER_GRAPH_GAP    1
#define FEEDER_GRAPH_BAR_W  32
#define FEEDER_GRAPH_BAR_H  4

void drawFeederModeGraph(int x0, int y0, int w, int h, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs) {
  if (w <= 0 || h <= 0) return;

  // Borda ao redor do gráfico (1 px)
  display.drawRect(x0, y0, w, h, SSD1306_WHITE);

  // Área das barras: 1px de espaçamento da borda, altura reduzida em 4 px (2 cima, 2 baixo)
  int barX = x0 + FEEDER_GRAPH_BORDER + FEEDER_GRAPH_GAP;
  int barY = y0 + FEEDER_GRAPH_BORDER + FEEDER_GRAPH_GAP;
  int barW = FEEDER_GRAPH_BAR_W;
  int barH = FEEDER_GRAPH_BAR_H;

  for (int col = 0; col < barW; col++) {
    int fillCol;
    if (mode == FEED_CONTINUOUS) {
      fillCol = 1;
    } else if (mode == FEED_PULSE_1_1) {
      fillCol = feederPixelOnAt((unsigned long)col, 1000UL, 1000UL);
    } else if (mode == FEED_PULSE_2_1) {
      fillCol = feederPixelOnAt((unsigned long)col, 2000UL, 1000UL);
    } else if (mode == FEED_PULSE_2_2) {
      fillCol = feederPixelOnAt((unsigned long)col, 2000UL, 2000UL);
    } else {
      fillCol = feederPixelOnAt((unsigned long)col, customOnMs, customOffMs);
    }

    if (fillCol) {
      display.fillRect(barX + col, barY, 1, barH, SSD1306_WHITE);
    }
  }
}

// Rotor (hélices) do feeder: 3 blades, sincronizado com fase on/off, sentido horário.
// Calibração a 7,5 V (modo contínuo): 70→4,50s, 160→2,91s, 255→2,60s.
#define FEEDER_ROTOR_BLADES 3
#define FEEDER_T_SEC_AT_70  4.50f
#define FEEDER_T_SEC_AT_160 2.91f
#define FEEDER_T_SEC_AT_255 2.60f

// Segundos por volta para um dado speed (0–255), interpolação linear entre os 3 pontos.
static float feederSecondsPerRotation(int speed) {
  if (speed <= 0) return 6.0f;
  if (speed <= 70) {
    float t = FEEDER_T_SEC_AT_70 + (70 - speed) / 70.0f * (6.0f - FEEDER_T_SEC_AT_70);
    if (t > 6.0f) t = 6.0f;
    if (t < FEEDER_T_SEC_AT_70) t = FEEDER_T_SEC_AT_70;
    return t;
  }
  if (speed <= 160) {
    return FEEDER_T_SEC_AT_70 - (FEEDER_T_SEC_AT_70 - FEEDER_T_SEC_AT_160) / (160.0f - 70.0f) * (float)(speed - 70);
  }
  if (speed <= 255) {
    float t = FEEDER_T_SEC_AT_160 - (FEEDER_T_SEC_AT_160 - FEEDER_T_SEC_AT_255) / (255.0f - 160.0f) * (float)(speed - 160);
    if (t < FEEDER_T_SEC_AT_255) t = FEEDER_T_SEC_AT_255;
    if (t > FEEDER_T_SEC_AT_160) t = FEEDER_T_SEC_AT_160;
    return t;
  }
  return FEEDER_T_SEC_AT_255;
}

// Tempo acumulado em fase "on" (ms); em off o valor fica congelado.
static unsigned long feederRotorAccumulatedOnMs(FeederMode mode, unsigned long customOnMs, unsigned long customOffMs) {
  unsigned long now = millis();
  if (mode == FEED_CONTINUOUS) return now;

  unsigned long onMs = customOnMs;
  unsigned long offMs = customOffMs;
  if (mode == FEED_PULSE_1_1) { onMs = 1000UL; offMs = 1000UL; }
  else if (mode == FEED_PULSE_2_1) { onMs = 2000UL; offMs = 1000UL; }
  else if (mode == FEED_PULSE_2_2) { onMs = 2000UL; offMs = 2000UL; }

  unsigned long total = onMs + offMs;
  if (total == 0) total = 1;
  unsigned long fullCycles = now / total;
  unsigned long inCycle = now % total;
  unsigned long accumulated;
  if (inCycle < onMs)
    accumulated = fullCycles * onMs + inCycle;
  else
    accumulated = fullCycles * onMs + onMs;
  return accumulated;
}

// Ângulo integrado por delta para não resetar ao mudar speed.
static float feederRotorLastAngle = 0.0f;
static unsigned long feederRotorPrevAccumulatedOn = 0xFFFFFFFFUL;

void drawFeederRotor(int x0, int y0, int size, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs, int feederSpeed) {
  if (size < 6) return;

  int cx = x0 + size / 2;
  int cy = y0 + size / 2;
  int radius = size / 2 - 2;
  if (radius < 2) radius = 2;

  float tSec = feederSecondsPerRotation(feederSpeed);
  float degPerMs = 360.0f / (tSec * 1000.0f);

  unsigned long accumulatedOn = feederRotorAccumulatedOnMs(mode, customOnMs, customOffMs);

  if (feederRotorPrevAccumulatedOn == 0xFFFFFFFFUL) {
    feederRotorLastAngle = (float)(accumulatedOn % 360000UL) * degPerMs;
    feederRotorPrevAccumulatedOn = accumulatedOn;
  } else {
    unsigned long delta = accumulatedOn - feederRotorPrevAccumulatedOn;
    if (delta < 2000UL) {
      feederRotorLastAngle += (float)delta * degPerMs;
    }
    feederRotorPrevAccumulatedOn = accumulatedOn;
  }

  while (feederRotorLastAngle >= 360.0f) feederRotorLastAngle -= 360.0f;
  while (feederRotorLastAngle < 0.0f) feederRotorLastAngle += 360.0f;

  int baseAngle = (int)(feederRotorLastAngle + 0.5f) % 360;
  if (baseAngle < 0) baseAngle += 360;
  // Sentido horário: ângulo decrescente na tela (y para cima = 0°)
  baseAngle = (360 - baseAngle) % 360;
  if (baseAngle < 0) baseAngle += 360;

  for (int i = 0; i < FEEDER_ROTOR_BLADES; i++) {
    float bladeDeg = (float)(baseAngle + i * 120);
    float rad = bladeDeg * 0.01745329252f;
    int ex = cx + (int)(radius * cos(rad) + 0.5f);
    int ey = cy - (int)(radius * sin(rad) + 0.5f);
    display.drawLine(cx, cy, ex, ey, SSD1306_WHITE);
  }

  display.drawCircle(cx, cy, 2, SSD1306_WHITE);
}
