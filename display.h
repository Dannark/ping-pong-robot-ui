#ifndef DISPLAY_H
#define DISPLAY_H

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"

void initDisplay();
void drawHeader(const char* title);
void drawMiniRadar(int x0, int y0, int size, float pan, float tilt);

extern Adafruit_SSD1306 display;

#endif
