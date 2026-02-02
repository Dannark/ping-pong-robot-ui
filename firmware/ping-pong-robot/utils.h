#ifndef UTILS_H
#define UTILS_H

int clampInt(int v, int mn, int mx);
float clampFloat(float v, float mn, float mx);
float joyToNorm(int raw);
void applyIncremental(float &value, float stickNorm);

#endif
