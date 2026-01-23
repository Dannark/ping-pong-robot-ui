#ifndef LOGIC_H
#define LOGIC_H

#include "config.h"

// ================= Auto state vars =================
extern float panDir;
extern float tiltDir;
extern unsigned long panLastStepMs;
extern unsigned long tiltLastStepMs;

extern const unsigned long AUTO2_PAUSE_MS;

// ================= Globals =================
extern Screen currentScreen;
extern float livePan;
extern float liveTilt;
extern bool isRunning;
extern unsigned long runStartMs;
extern unsigned long maxPlayedMs;

extern int homeIndex;
extern int wizardIndex;
extern int panMenuIndex;
extern int tiltMenuIndex;
extern int launcherIndex;
extern int feederIndex;
extern int timerMenuIndex;

extern Config cfg;

// ================= Auto update =================
float auto1Update(float base, float &dir, float speed);
float auto2Update(float base, float &dir, unsigned long &lastStepMs, float step, unsigned long pauseMs);
void applyAuto(float &value, AxisMode mode, float &dir, unsigned long &lastStepMs, float auto1Speed, float auto2Step);

// ================= Logic updates =================
void updateRunningLogic();
void updateAxisPreviewTargets();

// ================= Flow helpers =================
void goBackToWizard();
void cancelToHome();
void startRunning();

// ================= Axis menu helpers =================
int axisMaxIndex(AxisMode mode);
bool axisHasSecondOption(AxisMode mode);
const char* axisSecondLabel(AxisMode mode);

#endif
