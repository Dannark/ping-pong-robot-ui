#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "config.h"
#include "utils.h"
#include "joystick.h"
#include "display.h"
#include "logic.h"
#include "screens.h"
#include "servos.h"
#include "motors.h"

// ================= Main =================
void setup() {
  Serial.begin(9600);

  initJoystick();
  initDisplay();
  initServos();
  initMotors();
}

void loop() {
  updateButton();
  updateRunningLogic();
  updateAxisPreviewTargets();

  // Long press em qualquer tela volta para Home (exceto se já estiver no Home)
  if (swLongPressEvent && currentScreen != SCREEN_HOME) {
    if (isRunning) {
      stopAllMotors();
      isRunning = false;
    }
    if (currentScreen == SCREEN_SETTINGS_MOTOR || currentScreen == SCREEN_SETTINGS) {
      stopAllMotors();
    }
    currentScreen = SCREEN_HOME;
    return;
  }

  NavEvent nav = readNavEvent();

  switch (currentScreen) {
    case SCREEN_HOME: {
      if (nav == NAV_UP) homeIndex = clampInt(homeIndex - 1, 0, 2);
      if (nav == NAV_DOWN) homeIndex = clampInt(homeIndex + 1, 0, 2);

      if (swPressedEvent) {
        if (homeIndex == 0) currentScreen = SCREEN_WIZARD;
        if (homeIndex == 1) currentScreen = SCREEN_INFO;
        if (homeIndex == 2) { settingsIndex = 0; currentScreen = SCREEN_SETTINGS; }
      }

      renderHome();
      break;
    }

    case SCREEN_INFO: {
      if (swPressedEvent) currentScreen = SCREEN_HOME;
      renderInfo();
      break;
    }

    case SCREEN_SETTINGS: {
      if (nav == NAV_UP) settingsIndex = clampInt(settingsIndex - 1, 0, 6);
      if (nav == NAV_DOWN) settingsIndex = clampInt(settingsIndex + 1, 0, 6);

      if (swPressedEvent) {
        if (settingsIndex == 0) {
          settingsServoSelected = 0;
          settingsServoEditIndex = 0;
          currentScreen = SCREEN_SETTINGS_SERVO;
        } else if (settingsIndex == 1) {
          settingsServoSelected = 1;
          settingsServoEditIndex = 0;
          currentScreen = SCREEN_SETTINGS_SERVO;
        } else if (settingsIndex == 2) {
          settingsMotorTest = 1;
          settingsMotorSpeed = 0;
          currentScreen = SCREEN_SETTINGS_MOTOR;
        } else if (settingsIndex == 3) {
          settingsMotorTest = 2;
          settingsMotorSpeed = 0;
          currentScreen = SCREEN_SETTINGS_MOTOR;
        } else if (settingsIndex == 4) {
          settingsMotorTest = 3;
          settingsMotorSpeed = 0;
          currentScreen = SCREEN_SETTINGS_MOTOR;
        } else if (settingsIndex == 5) {
          settingsMotorTest = 4;
          settingsMotorSpeed = 0;
          currentScreen = SCREEN_SETTINGS_MOTOR;
        } else if (settingsIndex == 6) {
          stopAllMotors();
          currentScreen = SCREEN_HOME;
        }
      }

      renderSettings();
      break;
    }

    case SCREEN_SETTINGS_MOTOR: {
      if (nav == NAV_LEFT) settingsMotorSpeed = clampInt(settingsMotorSpeed - 10, 0, 255);
      if (nav == NAV_RIGHT) settingsMotorSpeed = clampInt(settingsMotorSpeed + 10, 0, 255);

      runSingleMotor(settingsMotorTest, settingsMotorSpeed);

      if (swPressedEvent) {
        stopAllMotors();
        currentScreen = SCREEN_SETTINGS;
      }

      renderSettingsMotor();
      break;
    }

    case SCREEN_SETTINGS_SERVO: {
      if (nav == NAV_UP) settingsServoEditIndex = clampInt(settingsServoEditIndex - 1, 0, 3);
      if (nav == NAV_DOWN) settingsServoEditIndex = clampInt(settingsServoEditIndex + 1, 0, 3);

      // Edição dos valores
      if (nav == NAV_LEFT) {
        if (settingsServoSelected == 0) {
          // Servo 1 (TILT)
          switch (settingsServoEditIndex) {
            case 0: servo_tilt_up = clampInt(servo_tilt_up - 1, 0, 180); break;
            case 1: servo_tilt_mid = clampInt(servo_tilt_mid - 1, 0, 180); break;
            case 2: servo_tilt_down = clampInt(servo_tilt_down - 1, 0, 180); break;
          }
        } else {
          // Servo 2 (PAN)
          switch (settingsServoEditIndex) {
            case 0: servo_pan_left = clampInt(servo_pan_left - 1, 0, 180); break;
            case 1: servo_pan_mid = clampInt(servo_pan_mid - 1, 0, 180); break;
            case 2: servo_pan_right = clampInt(servo_pan_right - 1, 0, 180); break;
          }
        }
      }
      if (nav == NAV_RIGHT) {
        if (settingsServoSelected == 0) {
          // Servo 1 (TILT)
          switch (settingsServoEditIndex) {
            case 0: servo_tilt_up = clampInt(servo_tilt_up + 1, 0, 180); break;
            case 1: servo_tilt_mid = clampInt(servo_tilt_mid + 1, 0, 180); break;
            case 2: servo_tilt_down = clampInt(servo_tilt_down + 1, 0, 180); break;
          }
        } else {
          // Servo 2 (PAN)
          switch (settingsServoEditIndex) {
            case 0: servo_pan_left = clampInt(servo_pan_left + 1, 0, 180); break;
            case 1: servo_pan_mid = clampInt(servo_pan_mid + 1, 0, 180); break;
            case 2: servo_pan_right = clampInt(servo_pan_right + 1, 0, 180); break;
          }
        }
      }

      if (swPressedEvent) {
        if (settingsServoEditIndex == 3) {
          // Back para tela de Settings
          currentScreen = SCREEN_SETTINGS;
        }
      }

      renderSettingsServo();
      break;
    }

    case SCREEN_WIZARD: {
      if (nav == NAV_UP) wizardIndex = clampInt(wizardIndex - 1, 0, 5);
      if (nav == NAV_DOWN) wizardIndex = clampInt(wizardIndex + 1, 0, 5);

      if (swPressedEvent) {
        if (wizardIndex == 0) { panMenuIndex = 0; currentScreen = SCREEN_PAN; }
        if (wizardIndex == 1) { tiltMenuIndex = 0; currentScreen = SCREEN_TILT; }
        if (wizardIndex == 2) { launcherIndex = 0; currentScreen = SCREEN_LAUNCHER; }
        if (wizardIndex == 3) { feederIndex = 0; currentScreen = SCREEN_FEEDER; }
        if (wizardIndex == 4) { timerMenuIndex = 0; currentScreen = SCREEN_TIMER; }
        if (wizardIndex == 5) { startRunning(); }
      }

      renderWizard();
      break;
    }

    case SCREEN_PAN: {
      int maxIndex = axisMaxIndex(cfg.panMode);

      if (nav == NAV_UP) panMenuIndex = clampInt(panMenuIndex - 1, 0, maxIndex);
      if (nav == NAV_DOWN) panMenuIndex = clampInt(panMenuIndex + 1, 0, maxIndex);

      if (panMenuIndex == 0) {
        if (nav == NAV_LEFT)  cfg.panMode = (AxisMode)((cfg.panMode + AXIS_MODE_COUNT - 1) % AXIS_MODE_COUNT);
        if (nav == NAV_RIGHT) cfg.panMode = (AxisMode)((cfg.panMode + 1) % AXIS_MODE_COUNT);
      }

      if (cfg.panMode == AXIS_AUTO1 && panMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.panAuto1Speed = clampFloat(cfg.panAuto1Speed - 0.005f, 0.005f, 0.080f);
        if (nav == NAV_RIGHT) cfg.panAuto1Speed = clampFloat(cfg.panAuto1Speed + 0.005f, 0.005f, 0.080f);
      }

      if (cfg.panMode == AXIS_AUTO2 && panMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.panAuto2Step = clampFloat(cfg.panAuto2Step - 0.05f, 0.05f, 0.50f);
        if (nav == NAV_RIGHT) cfg.panAuto2Step = clampFloat(cfg.panAuto2Step + 0.05f, 0.05f, 0.50f);
      }

      if (cfg.panMode == AXIS_RANDOM && panMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.panMin = clampFloat(cfg.panMin - 0.05f, -1.0f, cfg.panMax - 0.05f);
        if (nav == NAV_RIGHT) cfg.panMin = clampFloat(cfg.panMin + 0.05f, -1.0f, cfg.panMax - 0.05f);
      }
      if (cfg.panMode == AXIS_RANDOM && panMenuIndex == 2) {
        if (nav == NAV_LEFT)  cfg.panMax = clampFloat(cfg.panMax - 0.05f, cfg.panMin + 0.05f, 1.0f);
        if (nav == NAV_RIGHT) cfg.panMax = clampFloat(cfg.panMax + 0.05f, cfg.panMin + 0.05f, 1.0f);
      }
      if (cfg.panMode == AXIS_RANDOM && panMenuIndex == 3) {
        if (nav == NAV_LEFT)  cfg.panRandomPauseMs = (unsigned long)clampInt((int)(cfg.panRandomPauseMs - 250), 500, 10000);
        if (nav == NAV_RIGHT) cfg.panRandomPauseMs = (unsigned long)clampInt((int)(cfg.panRandomPauseMs + 250), 500, 10000);
      }

      if (swPressedEvent) {
        if (cfg.panMode == AXIS_LIVE && panMenuIndex == 1) {
          currentScreen = SCREEN_PAN_EDIT;
        } else if (cfg.panMode == AXIS_RANDOM && panMenuIndex == 4) {
          goBackToWizard();
        } else if (cfg.panMode != AXIS_RANDOM && ((axisHasSecondOption(cfg.panMode) && panMenuIndex == 2) ||
              (!axisHasSecondOption(cfg.panMode) && panMenuIndex == 1))) {
          goBackToWizard();
        }
      }

      renderAxisMenu("PAN", cfg.panMode, cfg.panTarget, panMenuIndex);
      break;
    }

    case SCREEN_TILT: {
      int maxIndex = axisMaxIndex(cfg.tiltMode);

      if (nav == NAV_UP) tiltMenuIndex = clampInt(tiltMenuIndex - 1, 0, maxIndex);
      if (nav == NAV_DOWN) tiltMenuIndex = clampInt(tiltMenuIndex + 1, 0, maxIndex);

      if (tiltMenuIndex == 0) {
        if (nav == NAV_LEFT)  cfg.tiltMode = (AxisMode)((cfg.tiltMode + AXIS_MODE_COUNT - 1) % AXIS_MODE_COUNT);
        if (nav == NAV_RIGHT) cfg.tiltMode = (AxisMode)((cfg.tiltMode + 1) % AXIS_MODE_COUNT);
      }

      if (cfg.tiltMode == AXIS_AUTO1 && tiltMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.tiltAuto1Speed = clampFloat(cfg.tiltAuto1Speed - 0.005f, 0.005f, 0.080f);
        if (nav == NAV_RIGHT) cfg.tiltAuto1Speed = clampFloat(cfg.tiltAuto1Speed + 0.005f, 0.005f, 0.080f);
      }

      if (cfg.tiltMode == AXIS_AUTO2 && tiltMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.tiltAuto2Step = clampFloat(cfg.tiltAuto2Step - 0.05f, 0.05f, 0.50f);
        if (nav == NAV_RIGHT) cfg.tiltAuto2Step = clampFloat(cfg.tiltAuto2Step + 0.05f, 0.05f, 0.50f);
      }

      if (cfg.tiltMode == AXIS_RANDOM && tiltMenuIndex == 1) {
        if (nav == NAV_LEFT)  cfg.tiltMin = clampFloat(cfg.tiltMin - 0.05f, -1.0f, cfg.tiltMax - 0.05f);
        if (nav == NAV_RIGHT) cfg.tiltMin = clampFloat(cfg.tiltMin + 0.05f, -1.0f, cfg.tiltMax - 0.05f);
      }
      if (cfg.tiltMode == AXIS_RANDOM && tiltMenuIndex == 2) {
        if (nav == NAV_LEFT)  cfg.tiltMax = clampFloat(cfg.tiltMax - 0.05f, cfg.tiltMin + 0.05f, 1.0f);
        if (nav == NAV_RIGHT) cfg.tiltMax = clampFloat(cfg.tiltMax + 0.05f, cfg.tiltMin + 0.05f, 1.0f);
      }
      if (cfg.tiltMode == AXIS_RANDOM && tiltMenuIndex == 3) {
        if (nav == NAV_LEFT)  cfg.tiltRandomPauseMs = (unsigned long)clampInt((int)(cfg.tiltRandomPauseMs - 250), 500, 10000);
        if (nav == NAV_RIGHT) cfg.tiltRandomPauseMs = (unsigned long)clampInt((int)(cfg.tiltRandomPauseMs + 250), 500, 10000);
      }

      if (swPressedEvent) {
        if (cfg.tiltMode == AXIS_LIVE && tiltMenuIndex == 1) {
          currentScreen = SCREEN_TILT_EDIT;
        } else if (cfg.tiltMode == AXIS_RANDOM && tiltMenuIndex == 4) {
          goBackToWizard();
        } else if (cfg.tiltMode != AXIS_RANDOM && ((axisHasSecondOption(cfg.tiltMode) && tiltMenuIndex == 2) ||
              (!axisHasSecondOption(cfg.tiltMode) && tiltMenuIndex == 1))) {
          goBackToWizard();
        }
      }

      renderAxisMenu("TILT", cfg.tiltMode, cfg.tiltTarget, tiltMenuIndex);
      break;
    }

    case SCREEN_PAN_EDIT: {
      float stickX = joyToNorm(analogRead(JOY_X));
      applyIncremental(cfg.panTarget, stickX);

      // Atualizar servos em tempo real durante edição
      updateServos(cfg.panTarget, cfg.tiltTarget);

      if (swPressedEvent) currentScreen = SCREEN_PAN;
      renderAxisEdit("PAN", cfg.panTarget);
      break;
    }

    case SCREEN_TILT_EDIT: {
      float stickY = joyToNorm(analogRead(JOY_Y));
      applyIncremental(cfg.tiltTarget, stickY);

      // Atualizar servos em tempo real durante edição
      updateServos(cfg.panTarget, cfg.tiltTarget);

      if (swPressedEvent) currentScreen = SCREEN_TILT;
      renderAxisEdit("TILT", cfg.tiltTarget);
      break;
    }

    case SCREEN_LAUNCHER: {
      if (nav == NAV_UP) launcherIndex = clampInt(launcherIndex - 1, 0, 2);
      if (nav == NAV_DOWN) launcherIndex = clampInt(launcherIndex + 1, 0, 2);

      if (launcherIndex == 0) {
        if (nav == NAV_LEFT)  cfg.launcherPower = clampInt(cfg.launcherPower - 5, 0, 255);
        if (nav == NAV_RIGHT) cfg.launcherPower = clampInt(cfg.launcherPower + 5, 0, 255);
      }

      if (swPressedEvent) {
        if (launcherIndex == 1) { spinIndex = 0; currentScreen = SCREEN_SPIN; }
        if (launcherIndex == 2) goBackToWizard();
      }

      renderLauncher();
      break;
    }

    case SCREEN_SPIN: {
      if (nav == NAV_UP) spinIndex = clampInt(spinIndex - 1, 0, 2);
      if (nav == NAV_DOWN) spinIndex = clampInt(spinIndex + 1, 0, 2);

      if (spinIndex == 0) {
        if (nav == NAV_LEFT)  cfg.spinMode = (SpinMode)((cfg.spinMode + SPIN_MODE_COUNT - 1) % SPIN_MODE_COUNT);
        if (nav == NAV_RIGHT) cfg.spinMode = (SpinMode)((cfg.spinMode + 1) % SPIN_MODE_COUNT);
      }

      if (spinIndex == 1) {
        if (nav == NAV_LEFT)  cfg.spinIntensity = clampInt(cfg.spinIntensity - 10, 0, 512);
        if (nav == NAV_RIGHT) cfg.spinIntensity = clampInt(cfg.spinIntensity + 10, 0, 512);
      }

      if (swPressedEvent) {
        if (spinIndex == 2) currentScreen = SCREEN_LAUNCHER;
      }

      renderSpin();
      break;
    }

    case SCREEN_FEEDER: {
      int feederMaxIndex = (cfg.feederMode == FEED_CUSTOM) ? 4 : 2;
      if (nav == NAV_UP) feederIndex = clampInt(feederIndex - 1, 0, feederMaxIndex);
      if (nav == NAV_DOWN) feederIndex = clampInt(feederIndex + 1, 0, feederMaxIndex);

      if (feederIndex == 0) {
        if (nav == NAV_LEFT)  cfg.feederMode = (FeederMode)((cfg.feederMode + FEED_MODE_COUNT - 1) % FEED_MODE_COUNT);
        if (nav == NAV_RIGHT) cfg.feederMode = (FeederMode)((cfg.feederMode + 1) % FEED_MODE_COUNT);
        feederMaxIndex = (cfg.feederMode == FEED_CUSTOM) ? 4 : 2;
        if (feederIndex > feederMaxIndex) feederIndex = feederMaxIndex;
      }

      if (feederIndex == 1) {
        if (nav == NAV_LEFT)  cfg.feederSpeed = clampInt(cfg.feederSpeed - 5, 0, 255);
        if (nav == NAV_RIGHT) cfg.feederSpeed = clampInt(cfg.feederSpeed + 5, 0, 255);
      }

      if (cfg.feederMode == FEED_CUSTOM) {
        if (feederIndex == 2) {
          if (nav == NAV_LEFT)  cfg.feederCustomOnMs = (unsigned long)clampInt((int)(cfg.feederCustomOnMs - 250), 500, 5000);
          if (nav == NAV_RIGHT) cfg.feederCustomOnMs = (unsigned long)clampInt((int)(cfg.feederCustomOnMs + 250), 500, 5000);
        }
        if (feederIndex == 3) {
          if (nav == NAV_LEFT)  cfg.feederCustomOffMs = (unsigned long)clampInt((int)(cfg.feederCustomOffMs - 250), 500, 5000);
          if (nav == NAV_RIGHT) cfg.feederCustomOffMs = (unsigned long)clampInt((int)(cfg.feederCustomOffMs + 250), 500, 5000);
        }
      }

      if (swPressedEvent) {
        if (feederIndex == feederMaxIndex) goBackToWizard();
      }

      renderFeeder();
      break;
    }

    case SCREEN_TIMER: {
      if (nav == NAV_UP) timerMenuIndex = clampInt(timerMenuIndex - 1, 0, 1);
      if (nav == NAV_DOWN) timerMenuIndex = clampInt(timerMenuIndex + 1, 0, 1);

      if (timerMenuIndex == 0) {
        if (nav == NAV_LEFT)  cfg.timerIndex = clampInt(cfg.timerIndex - 1, 0, 5);
        if (nav == NAV_RIGHT) cfg.timerIndex = clampInt(cfg.timerIndex + 1, 0, 5);
      }

      if (swPressedEvent) {
        if (timerMenuIndex == 1) goBackToWizard();
      }

      renderTimer();
      break;
    }

    case SCREEN_RUNNING: {
      // short press => back to wizard
      if (swPressedEvent) {
        isRunning = false;
        stopAllMotors();
        currentScreen = SCREEN_WIZARD;
      }

      renderRunning();
      break;
    }

    default: {
      currentScreen = SCREEN_HOME;
      break;
    }
  }
}
