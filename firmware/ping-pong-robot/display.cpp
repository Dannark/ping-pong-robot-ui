#include "display.h"
#include "config.h"
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
  display.println(title);
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);
}

void drawMiniRadar(int x0, int y0, int size, float pan, float tilt) {
  display.drawRect(x0, y0, size, size, SSD1306_WHITE);

  int cx = x0 + size / 2;
  int cy = y0 + size / 2;

  display.drawPixel(cx, cy, SSD1306_WHITE);
  display.drawLine(cx - 2, cy, cx + 2, cy, SSD1306_WHITE);
  display.drawLine(cx, cy - 2, cx, cy + 2, SSD1306_WHITE);

  int px = cx + (int)(pan * (size / 2 - 2));
  int py = cy + (int)(tilt * (size / 2 - 2));
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

// Mini gráfico do modo feeder: 16 px largura, 8 px altura. Onda on/off; 1 px = 250 ms.
void drawFeederModeGraph(int x0, int y0, int w, int h, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs) {
  if (w <= 0 || h <= 0) return;

  for (int col = 0; col < w; col++) {
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
      display.fillRect(x0 + col, y0, 1, h, SSD1306_WHITE);
    }
  }
}
