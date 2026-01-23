#include "display.h"
#include "config.h"
#include <Wire.h>
#include <Arduino.h>

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

  // Se for NONE, não desenha seta (ou desenha um círculo pequeno no centro)
  if (spinMode == SPIN_NONE) {
    display.fillCircle(cx, cy, 2, SSD1306_WHITE);
    return;
  }

  // Desenha a seta indicando a direção do spin
  int arrowLength = radius - 4;
  int arrowHeadSize = 3;

  switch (spinMode) {
    case SPIN_TOP: {
      // Seta para cima
      int endY = cy - arrowLength;
      display.drawLine(cx, cy, cx, endY, SSD1306_WHITE);
      // Cabeça da seta (triângulo)
      display.drawLine(cx, endY, cx - arrowHeadSize, endY + arrowHeadSize, SSD1306_WHITE);
      display.drawLine(cx, endY, cx + arrowHeadSize, endY + arrowHeadSize, SSD1306_WHITE);
      break;
    }
    case SPIN_BACK: {
      // Seta para baixo
      int endY = cy + arrowLength;
      display.drawLine(cx, cy, cx, endY, SSD1306_WHITE);
      // Cabeça da seta (triângulo)
      display.drawLine(cx, endY, cx - arrowHeadSize, endY - arrowHeadSize, SSD1306_WHITE);
      display.drawLine(cx, endY, cx + arrowHeadSize, endY - arrowHeadSize, SSD1306_WHITE);
      break;
    }
    case SPIN_LEFT: {
      // Seta para esquerda
      int endX = cx - arrowLength;
      display.drawLine(cx, cy, endX, cy, SSD1306_WHITE);
      // Cabeça da seta (triângulo)
      display.drawLine(endX, cy, endX + arrowHeadSize, cy - arrowHeadSize, SSD1306_WHITE);
      display.drawLine(endX, cy, endX + arrowHeadSize, cy + arrowHeadSize, SSD1306_WHITE);
      break;
    }
    case SPIN_RIGHT: {
      // Seta para direita
      int endX = cx + arrowLength;
      display.drawLine(cx, cy, endX, cy, SSD1306_WHITE);
      // Cabeça da seta (triângulo)
      display.drawLine(endX, cy, endX - arrowHeadSize, cy - arrowHeadSize, SSD1306_WHITE);
      display.drawLine(endX, cy, endX - arrowHeadSize, cy + arrowHeadSize, SSD1306_WHITE);
      break;
    }
    default:
      break;
  }
}
