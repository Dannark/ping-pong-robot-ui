#ifndef DISPLAY_H
#define DISPLAY_H

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"

void initDisplay();
void drawHeader(const char* title);
void drawMiniRadar(int x0, int y0, int size, float pan, float tilt);
void drawMiniRadarWithLimits(int x0, int y0, int size, float pan, float tilt, float panMin, float panMax, float tiltMin, float tiltMax);
void drawSpinVisualizer(int x0, int y0, int size, SpinMode spinMode);
void drawFeederModeGraph(int x0, int y0, int w, int h, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs);
void drawFeederRotor(int x0, int y0, int size, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs, int feederSpeed);

extern Adafruit_SSD1306 display;

#endif
