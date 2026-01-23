#include "display.h"
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
