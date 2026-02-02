#include "joystick.h"
#include "config.h"
#include <Arduino.h>

// ================= Button handling (short press + long press) =================
bool swPressedEvent = false;
bool swLongPressEvent = false;

bool swPrev = false;
unsigned long swDownAt = 0;
bool swLongFired = false;

const unsigned long SW_LONG_MS = 1000;

void initJoystick() {
  pinMode(JOY_SW, INPUT_PULLUP);
}

void updateButton() {
  bool pressed = (digitalRead(JOY_SW) == LOW);

  swPressedEvent = false;
  swLongPressEvent = false;

  if (pressed && !swPrev) {
    swDownAt = millis();
    swLongFired = false;
  }

  if (pressed && !swLongFired) {
    if (millis() - swDownAt >= SW_LONG_MS) {
      swLongFired = true;
      swLongPressEvent = true;
    }
  }

  if (!pressed && swPrev) {
    // release
    if (!swLongFired) {
      swPressedEvent = true;
    }
  }

  swPrev = pressed;
}

// ================= Navigation =================
unsigned long lastNavAt = 0;

NavEvent readNavEvent() {
  if (millis() - lastNavAt < REPEAT_MS) return NAV_NONE;

  int x = analogRead(JOY_X);
  int y = analogRead(JOY_Y);

  int dx = x - 512;
  int dy = y - 512;

  if (abs(dx) > abs(dy)) {
    if (dx > 250) { lastNavAt = millis(); return NAV_RIGHT; }
    if (dx < -250) { lastNavAt = millis(); return NAV_LEFT; }
  } else {
    if (dy > 250) { lastNavAt = millis(); return NAV_DOWN; }
    if (dy < -250) { lastNavAt = millis(); return NAV_UP; }
  }

  return NAV_NONE;
}
