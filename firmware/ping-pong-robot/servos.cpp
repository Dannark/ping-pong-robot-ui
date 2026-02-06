#include "servos.h"
#include "utils.h"
#include <Arduino.h>
#include <EEPROM.h>

#define EEPROM_SERVO_BASE  0
#define EEPROM_SERVO_MAGIC 6
#define EEPROM_SERVO_MAGIC_VAL 0xA5

Servo tiltServo; // SERVO1 (subir/descer)
Servo panServo;  // SERVO2 (esquerda/direita)

// ===== SERVO 1 (TILT) - Valores padrão =====
int servo_tilt_up = 45;
int servo_tilt_mid = 100;
int servo_tilt_down = 120;

// ===== SERVO 2 (PAN) - Valores padrão =====
int servo_pan_left = 15;
int servo_pan_mid = 70;
int servo_pan_right = 125;

// Mapeamento genérico assimétrico: (-1..+1) com MID real no centro lógico
int normalizedToAngle(float x, int minAngle, int midAngle, int maxAngle) {
  x = clampFloat(x, -1.0f, 1.0f);

  if (x < 0.0f) {
    // MID -> MIN
    float a = (float)midAngle + x * (midAngle - minAngle);
    return clampInt((int)(a + 0.5f), minAngle, midAngle);
  } else {
    // MID -> MAX
    float a = (float)midAngle + x * (maxAngle - midAngle);
    return clampInt((int)(a + 0.5f), midAngle, maxAngle);
  }
}

void loadServoLimitsFromEEPROM() {
  if (EEPROM.read(EEPROM_SERVO_MAGIC) != EEPROM_SERVO_MAGIC_VAL) return;
  servo_tilt_up    = EEPROM.read(EEPROM_SERVO_BASE + 0);
  servo_tilt_mid   = EEPROM.read(EEPROM_SERVO_BASE + 1);
  servo_tilt_down  = EEPROM.read(EEPROM_SERVO_BASE + 2);
  servo_pan_left   = EEPROM.read(EEPROM_SERVO_BASE + 3);
  servo_pan_mid    = EEPROM.read(EEPROM_SERVO_BASE + 4);
  servo_pan_right  = EEPROM.read(EEPROM_SERVO_BASE + 5);
  servo_tilt_up   = clampInt(servo_tilt_up, 0, 180);
  servo_tilt_mid  = clampInt(servo_tilt_mid, 0, 180);
  servo_tilt_down = clampInt(servo_tilt_down, 0, 180);
  servo_pan_left  = clampInt(servo_pan_left, 0, 180);
  servo_pan_mid   = clampInt(servo_pan_mid, 0, 180);
  servo_pan_right = clampInt(servo_pan_right, 0, 180);
}

void saveServoLimitsToEEPROM() {
  EEPROM.write(EEPROM_SERVO_BASE + 0, (uint8_t)servo_tilt_up);
  EEPROM.write(EEPROM_SERVO_BASE + 1, (uint8_t)servo_tilt_mid);
  EEPROM.write(EEPROM_SERVO_BASE + 2, (uint8_t)servo_tilt_down);
  EEPROM.write(EEPROM_SERVO_BASE + 3, (uint8_t)servo_pan_left);
  EEPROM.write(EEPROM_SERVO_BASE + 4, (uint8_t)servo_pan_mid);
  EEPROM.write(EEPROM_SERVO_BASE + 5, (uint8_t)servo_pan_right);
  EEPROM.write(EEPROM_SERVO_MAGIC, EEPROM_SERVO_MAGIC_VAL);
}

void initServos() {
  loadServoLimitsFromEEPROM();

  tiltServo.attach(SERVO_TILT_PIN); // SERVO1
  panServo.attach(SERVO_PAN_PIN);   // SERVO2

  tiltServo.write(servo_tilt_mid);
  panServo.write(servo_pan_mid);
}

void updateServos(float panNormalized, float tiltNormalized) {
  int tiltAngle = normalizedToAngle(tiltNormalized, servo_tilt_up, servo_tilt_mid, servo_tilt_down);
  int panAngle  = normalizedToAngle(panNormalized, servo_pan_left, servo_pan_mid, servo_pan_right);

  tiltServo.write(tiltAngle);
  panServo.write(panAngle);
}

void updateServosForSettingsPreview(int selectedServo, int editIndex) {
  if (editIndex == 3) {
    servosGoToMid();
    return;
  }
  if (selectedServo == 0) {
    int tiltAngle = (editIndex == 0) ? servo_tilt_up : (editIndex == 1) ? servo_tilt_mid : servo_tilt_down;
    tiltServo.write(tiltAngle);
    panServo.write(servo_pan_mid);
  } else {
    int panAngle = (editIndex == 0) ? servo_pan_left : (editIndex == 1) ? servo_pan_mid : servo_pan_right;
    panServo.write(panAngle);
    tiltServo.write(servo_tilt_mid);
  }
}

void servosGoToMid() {
  tiltServo.write(servo_tilt_mid);
  panServo.write(servo_pan_mid);
}
