#ifndef SCREENS_H
#define SCREENS_H

#include "config.h"

void renderHome();
void renderInfo();
void renderWizard();
void renderAxisMenu(const char* title, AxisMode mode, float targetValue, int menuIndex);
void renderAxisEdit(const char* title, float value);
void renderLauncher();
void renderFeeder();
void renderTimer();
void renderRunning();
void renderSettings();
void renderSettingsServo();

#endif
