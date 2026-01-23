#include "screens.h"
#include "display.h"
#include "logic.h"
#include "config.h"
#include <Arduino.h>

void renderHome() {
  display.clearDisplay();
  drawHeader("HOME");

  const char* items[2] = { "Start Wizard", "Info / Stats" };

  for (int i = 0; i < 2; i++) {
    display.setCursor(0, BODY_Y + i * 12);
    display.print(i == homeIndex ? "> " : "  ");
    display.println(items[i]);
  }

  display.setCursor(0, 56);
  display.print("SW=Select");

  display.display();
}

void renderInfo() {
  display.clearDisplay();
  drawHeader("INFO");

  display.setCursor(0, BODY_Y);
  display.println("PingPong Bot UI v5");

  display.setCursor(0, BODY_Y + 12);
  display.print("Max played: ");
  display.print(maxPlayedMs / 1000);
  display.println("s");

  display.setCursor(0, 56);
  display.println("SW=Back");

  display.display();
}

void renderWizard() {
  display.clearDisplay();
  drawHeader("WIZARD");

  const char* items[6] = { "Pan", "Tilt", "Launcher", "Feeder", "Timer", "START" };

  for (int i = 0; i < 6; i++) {
    display.setCursor(0, BODY_Y + i * 8);
    display.print(i == wizardIndex ? "> " : "  ");
    display.print(items[i]);

    if (i == 0) { display.setCursor(80, BODY_Y + i * 8); display.print(axisModeName(cfg.panMode)); }
    if (i == 1) { display.setCursor(80, BODY_Y + i * 8); display.print(axisModeName(cfg.tiltMode)); }
    if (i == 2) { display.setCursor(80, BODY_Y + i * 8); display.print(cfg.launcherPower); }
    if (i == 3) { display.setCursor(80, BODY_Y + i * 8); display.print(cfg.feederSpeed); }
    if (i == 4) { display.setCursor(80, BODY_Y + i * 8); display.print(timerNameByIndex(cfg.timerIndex)); }
  }

  display.display();
}

void renderAxisMenu(const char* title, AxisMode mode, float targetValue, int menuIndex) {
  display.clearDisplay();
  drawHeader(title);

  float pan = (title[0] == 'P') ? targetValue : cfg.panTarget;
  float tilt = (title[0] == 'T') ? targetValue : cfg.tiltTarget;
  drawMiniRadar(92, BODY_Y, 32, pan, tilt);

  display.setCursor(0, BODY_Y);
  display.print(menuIndex == 0 ? "> " : "  ");
  display.print("Mode: ");
  display.println(axisModeName(mode));

  int line = BODY_Y + 12;

  if (axisHasSecondOption(mode)) {
    display.setCursor(0, line);
    display.print(menuIndex == 1 ? "> " : "  ");
    display.print(axisSecondLabel(mode));
    display.print(": ");

    if (mode == AXIS_AUTO1) {
      float v = (title[0] == 'P') ? cfg.panAuto1Speed : cfg.tiltAuto1Speed;
      display.println(v, 3);
    } else if (mode == AXIS_AUTO2) {
      float v = (title[0] == 'P') ? cfg.panAuto2Step : cfg.tiltAuto2Step;
      display.println(v, 2);
    } else {
      display.println();
    }

    line += 12;
    display.setCursor(0, line);
    display.print(menuIndex == 2 ? "> " : "  ");
    display.println("Back");
  } else {
    display.setCursor(0, line);
    display.print(menuIndex == 1 ? "> " : "  ");
    display.println("Back");
  }

  display.display();
}

void renderAxisEdit(const char* title, float value) {
  display.clearDisplay();
  drawHeader(title);

  float pan = (title[0] == 'P') ? value : cfg.panTarget;
  float tilt = (title[0] == 'T') ? value : cfg.tiltTarget;

  drawMiniRadar(38, 12, 52, pan, tilt);

  display.setCursor(0, 56);
  display.print("SW=OK");

  display.display();
}

void renderLauncher() {
  display.clearDisplay();
  drawHeader("LAUNCHER");

  display.setCursor(0, BODY_Y);
  display.print(launcherIndex == 0 ? "> " : "  ");
  display.print("Power: ");
  display.println(cfg.launcherPower);

  display.setCursor(0, BODY_Y + 12);
  display.print(launcherIndex == 1 ? "> " : "  ");
  display.print("Spin: ");
  display.println(spinModeName(cfg.spinMode));

  display.setCursor(0, BODY_Y + 24);
  display.print(launcherIndex == 2 ? "> " : "  ");
  display.println("Back");

  display.display();
}

void renderFeeder() {
  display.clearDisplay();
  drawHeader("FEEDER");

  display.setCursor(0, BODY_Y);
  display.print(feederIndex == 0 ? "> " : "  ");
  display.print("Mode: ");
  display.println(feederModeLabel(cfg.feederMode));

  display.setCursor(0, BODY_Y + 12);
  display.print(feederIndex == 1 ? "> " : "  ");
  display.print("Speed: ");
  display.println(cfg.feederSpeed);

  display.setCursor(0, BODY_Y + 24);
  display.print(feederIndex == 2 ? "> " : "  ");
  display.println("Back");

  display.display();
}

void renderTimer() {
  display.clearDisplay();
  drawHeader("TIMER");

  display.setCursor(0, BODY_Y);
  display.print(timerMenuIndex == 0 ? "> " : "  ");
  display.print("Timer: ");
  display.println(timerNameByIndex(cfg.timerIndex));

  display.setCursor(0, BODY_Y + 12);
  display.print(timerMenuIndex == 1 ? "> " : "  ");
  display.println("Back");

  display.display();
}

void renderRunning() {
  display.clearDisplay();

  bool blink = ((millis() / 350) % 2) == 0;
  display.setCursor(0, 0);
  if (blink) display.println("RUNNING");
  else display.println("       ");

  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);

  unsigned long tms = timerMsByIndex(cfg.timerIndex);

  display.setCursor(0, BODY_Y);
  if (tms == 0) {
    unsigned long elapsed = millis() - runStartMs;
    display.print("Elapsed: ");
    display.print(elapsed / 1000);
    display.println("s");
  } else {
    unsigned long elapsed = millis() - runStartMs;
    long left = (long)tms - (long)elapsed;
    if (left < 0) left = 0;

    display.print("Left: ");
    display.print(left / 1000);
    display.println("s");
  }

  display.setCursor(0, BODY_Y + 10);
  display.print("Pan: ");
  display.println(axisModeName(cfg.panMode));

  display.setCursor(0, BODY_Y + 18);
  display.print("Tilt: ");
  display.println(axisModeName(cfg.tiltMode));

  display.setCursor(0, BODY_Y + 28);
  display.print("Power: ");
  display.println(cfg.launcherPower);

  display.setCursor(0, BODY_Y + 38);
  display.print("Spin: ");
  display.println(spinModeName(cfg.spinMode));

  // Radar a bit higher
  drawMiniRadar(92, BODY_Y + 14, 32, livePan, liveTilt);

  display.display();
}
