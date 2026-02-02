#include "screens.h"
#include "display.h"
#include "logic.h"
#include "config.h"
#include "motors.h"
#include "servos.h"
#include <Arduino.h>
#include <stdio.h>

void renderHome() {
  display.clearDisplay();
  drawHeader("HOME");

  const char* items[3] = { "Start Wizard", "Info / Stats", "Settings" };

  for (int i = 0; i < 3; i++) {
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

  // Mostra o valor acima da label SW=OK
  display.setCursor(0, 48);
  display.print("v: ");
  display.print(value, 2);

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
  display.print("Spin Config");
  
  display.setCursor(0, BODY_Y + 24);
  display.print(launcherIndex == 2 ? "> " : "  ");
  display.println("Back");

  display.display();
}

void renderSpin() {
  display.clearDisplay();
  drawHeader("SPIN");

  display.setCursor(0, BODY_Y);
  display.print(spinIndex == 0 ? "> " : "  ");
  display.print("Direction: ");
  display.println(spinModeName(cfg.spinMode));

  display.setCursor(0, BODY_Y + 12);
  display.print(spinIndex == 1 ? "> " : "  ");
  display.print("Intensity: ");
  display.println(cfg.spinIntensity);

  display.setCursor(0, BODY_Y + 24);
  display.print(spinIndex == 2 ? "> " : "  ");
  display.println("Back");

  // Visualizador de spin no canto direito
  drawSpinVisualizer(92, BODY_Y, 32, cfg.spinMode);

  // Mostra as potências dos motores na última linha (só se não for NONE)
  if (cfg.spinMode != SPIN_NONE && cfg.spinIntensity > 0) {
    int speed1, speed2, speed3;
    getLauncherMotorSpeeds(cfg.launcherPower, cfg.spinMode, cfg.spinIntensity, speed1, speed2, speed3);
    
    display.setCursor(0, 56);
    display.print("M1:");
    display.print(speed1);
    display.print(" M2:");
    display.print(speed2);
    display.print(" M3:");
    display.print(speed3);
  }

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

// Índices: 0=Servo1, 1=Servo2, 2=M1, 3=M2, 4=M3, 5=Back
#define SETTINGS_ITEMS 6
#define SETTINGS_VISIBLE 4

void renderSettings() {
  display.clearDisplay();
  drawHeader("SETTINGS");

  int scrollOffset = (settingsIndex >= SETTINGS_ITEMS - SETTINGS_VISIBLE)
    ? (SETTINGS_ITEMS - SETTINGS_VISIBLE)
    : (settingsIndex >= 1 ? settingsIndex - 1 : 0);
  if (scrollOffset < 0) scrollOffset = 0;

  const char* labels[SETTINGS_ITEMS] = { "Servo 1", "Servo 2", "M1", "M2", "M3", "Back" };

  for (int i = 0; i < SETTINGS_VISIBLE && (scrollOffset + i) < SETTINGS_ITEMS; i++) {
    int idx = scrollOffset + i;
    display.setCursor(0, BODY_Y + i * 12);
    display.print(idx == settingsIndex ? "> " : "  ");
    display.println(labels[idx]);
  }

  display.display();
}

void renderSettingsMotor() {
  char title[12];
  sprintf(title, "M%d Test", settingsMotorTest);

  display.clearDisplay();
  drawHeader(title);

  display.setCursor(0, BODY_Y);
  display.print("Speed: ");
  display.println(settingsMotorSpeed);

  // Barra 0..255
  int barX = 0;
  int barY = BODY_Y + 14;
  int barW = 128;
  int barH = 8;
  display.drawRect(barX, barY, barW, barH, SSD1306_WHITE);
  int fillW = (settingsMotorSpeed * (barW - 2)) / 255;
  if (fillW > 0) {
    display.fillRect(barX + 1, barY + 1, fillW, barH - 2, SSD1306_WHITE);
  }

  display.setCursor(0, BODY_Y + 28);
  display.println("> Back");

  display.display();
}

void renderSettingsServo() {
  display.clearDisplay();
  
  // Título baseado no servo selecionado
  if (settingsServoSelected == 0) {
    drawHeader("SERVO 1");
  } else {
    drawHeader("SERVO 2");
  }

  // Mostra os limites do servo selecionado
  if (settingsServoSelected == 0) {
    // Servo 1 (TILT)
    display.setCursor(0, BODY_Y);
    display.print(settingsServoEditIndex == 0 ? "> " : "  ");
    display.print("MIN: ");
    if (settingsServoEditIndex == 0) display.print("[");
    display.print(servo_tilt_up);
    if (settingsServoEditIndex == 0) display.print("]");
    else display.println();

    display.setCursor(0, BODY_Y + 12);
    display.print(settingsServoEditIndex == 1 ? "> " : "  ");
    display.print("MID: ");
    if (settingsServoEditIndex == 1) display.print("[");
    display.print(servo_tilt_mid);
    if (settingsServoEditIndex == 1) display.print("]");
    else display.println();

    display.setCursor(0, BODY_Y + 24);
    display.print(settingsServoEditIndex == 2 ? "> " : "  ");
    display.print("MAX: ");
    if (settingsServoEditIndex == 2) display.print("[");
    display.print(servo_tilt_down);
    if (settingsServoEditIndex == 2) display.print("]");
    else display.println();
  } else {
    // Servo 2 (PAN)
    display.setCursor(0, BODY_Y);
    display.print(settingsServoEditIndex == 0 ? "> " : "  ");
    display.print("MIN: ");
    if (settingsServoEditIndex == 0) display.print("[");
    display.print(servo_pan_left);
    if (settingsServoEditIndex == 0) display.print("]");
    else display.println();

    display.setCursor(0, BODY_Y + 12);
    display.print(settingsServoEditIndex == 1 ? "> " : "  ");
    display.print("MID: ");
    if (settingsServoEditIndex == 1) display.print("[");
    display.print(servo_pan_mid);
    if (settingsServoEditIndex == 1) display.print("]");
    else display.println();

    display.setCursor(0, BODY_Y + 24);
    display.print(settingsServoEditIndex == 2 ? "> " : "  ");
    display.print("MAX: ");
    if (settingsServoEditIndex == 2) display.print("[");
    display.print(servo_pan_right);
    if (settingsServoEditIndex == 2) display.print("]");
    else display.println();
  }

  // Back
  display.setCursor(0, BODY_Y + 36);
  display.print(settingsServoEditIndex == 3 ? "> " : "  ");
  display.println("Back");

  display.display();
}
