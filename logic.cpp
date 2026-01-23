#include "logic.h"
#include "config.h"
#include "utils.h"
#include <Arduino.h>

// ================= Auto state vars =================
float panDir = 1.0f;
float tiltDir = 1.0f;
unsigned long panLastStepMs = 0;
unsigned long tiltLastStepMs = 0;

const unsigned long AUTO2_PAUSE_MS = 1000;

// ================= Globals =================
Screen currentScreen = SCREEN_HOME;

float livePan = 0.0f;
float liveTilt = 0.0f;

bool isRunning = false;
unsigned long runStartMs = 0;

unsigned long maxPlayedMs = 0;

int homeIndex = 0;
int wizardIndex = 0;

int panMenuIndex = 0;
int tiltMenuIndex = 0;

int launcherIndex = 0;
int feederIndex = 0;
int timerMenuIndex = 0;

Config cfg;

// ================= Auto update =================
float auto1Update(float base, float &dir, float speed) {
  base += dir * speed;
  if (base >= 1.0f) { base = 1.0f; dir = -1.0f; }
  if (base <= -1.0f) { base = -1.0f; dir = 1.0f; }
  return base;
}

float auto2Update(float base, float &dir, unsigned long &lastStepMs, float step, unsigned long pauseMs) {
  unsigned long now = millis();
  if (now - lastStepMs < pauseMs) return base;

  lastStepMs = now;
  base += dir * step;

  if (base >= 1.0f) { base = 1.0f; dir = -1.0f; }
  if (base <= -1.0f) { base = -1.0f; dir = 1.0f; }

  return base;
}

void applyAuto(float &value, AxisMode mode, float &dir, unsigned long &lastStepMs, float auto1Speed, float auto2Step) {
  if (mode == AXIS_AUTO1) {
    value = auto1Update(value, dir, auto1Speed);
  } else if (mode == AXIS_AUTO2) {
    value = auto2Update(value, dir, lastStepMs, auto2Step, AUTO2_PAUSE_MS);
  }
}

// ================= Logic updates =================
void updateRunningLogic() {
  if (!isRunning) return;

  unsigned long played = millis() - runStartMs;
  if (played > maxPlayedMs) maxPlayedMs = played;

  unsigned long tms = timerMsByIndex(cfg.timerIndex);
  if (tms > 0 && millis() - runStartMs >= tms) {
    isRunning = false;
    currentScreen = SCREEN_HOME;
    return;
  }

  // PAN
  if (cfg.panMode == AXIS_LIVE) {
    float stickX = joyToNorm(analogRead(JOY_X));
    applyIncremental(livePan, stickX);
  } else {
    applyAuto(livePan, cfg.panMode, panDir, panLastStepMs, cfg.panAuto1Speed, cfg.panAuto2Step);
  }

  // TILT
  if (cfg.tiltMode == AXIS_LIVE) {
    float stickY = joyToNorm(analogRead(JOY_Y));
    applyIncremental(liveTilt, stickY);
  } else {
    applyAuto(liveTilt, cfg.tiltMode, tiltDir, tiltLastStepMs, cfg.tiltAuto1Speed, cfg.tiltAuto2Step);
  }
}

void updateAxisPreviewTargets() {
  if (currentScreen == SCREEN_PAN) {
    applyAuto(cfg.panTarget, cfg.panMode, panDir, panLastStepMs, cfg.panAuto1Speed, cfg.panAuto2Step);
  }
  if (currentScreen == SCREEN_TILT) {
    applyAuto(cfg.tiltTarget, cfg.tiltMode, tiltDir, tiltLastStepMs, cfg.tiltAuto1Speed, cfg.tiltAuto2Step);
  }
}

// ================= Flow helpers =================
void goBackToWizard() {
  currentScreen = SCREEN_WIZARD;
}

void cancelToHome() {
  isRunning = false;
  currentScreen = SCREEN_HOME;
}

void startRunning() {
  isRunning = true;
  runStartMs = millis();

  livePan = cfg.panTarget;
  liveTilt = cfg.tiltTarget;

  currentScreen = SCREEN_RUNNING;
}

// ================= Axis menu helpers =================
int axisMaxIndex(AxisMode mode) {
  if (mode == AXIS_LIVE) return 2;
  if (mode == AXIS_AUTO1) return 2;
  if (mode == AXIS_AUTO2) return 2;
  return 1;
}

bool axisHasSecondOption(AxisMode mode) {
  return (mode == AXIS_LIVE || mode == AXIS_AUTO1 || mode == AXIS_AUTO2);
}

const char* axisSecondLabel(AxisMode mode) {
  if (mode == AXIS_LIVE) return "Edit Target";
  if (mode == AXIS_AUTO1) return "Speed";
  if (mode == AXIS_AUTO2) return "Step";
  return "";
}
