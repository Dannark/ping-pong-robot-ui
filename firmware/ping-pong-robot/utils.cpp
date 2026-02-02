#include "utils.h"
#include "config.h"
#include <Arduino.h>

int clampInt(int v, int mn, int mx) {
  if (v < mn) return mn;
  if (v > mx) return mx;
  return v;
}

float clampFloat(float v, float mn, float mx) {
  if (v < mn) return mn;
  if (v > mx) return mx;
  return v;
}

float joyToNorm(int raw) {
  int d = raw - 512;
  if (abs(d) < DEADZONE) return 0.0f;
  float n = (float)d / 512.0f;
  return clampFloat(n, -1.0f, 1.0f);
}

void applyIncremental(float &value, float stickNorm) {
  float mag = abs(stickNorm);
  if (mag < 0.05f) return;

  float mult = 1.0f + (mag * AIM_FAST);
  float delta = stickNorm * AIM_STEP * mult;

  value = clampFloat(value + delta, -1.0f, 1.0f);
}
