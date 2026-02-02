#include "servos.h"
#include "utils.h"
#include <Arduino.h>

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

void initServos() {
  // Shield L293D: geralmente SERVO1 = D10, SERVO2 = D9
  tiltServo.attach(SERVO_TILT_PIN); // SERVO1
  panServo.attach(SERVO_PAN_PIN);    // SERVO2

  // Começa centralizado
  tiltServo.write(servo_tilt_mid);
  panServo.write(servo_pan_mid);
}

void updateServos(float panNormalized, float tiltNormalized) {
  int tiltAngle = normalizedToAngle(tiltNormalized, servo_tilt_up, servo_tilt_mid, servo_tilt_down);
  int panAngle  = normalizedToAngle(panNormalized, servo_pan_left, servo_pan_mid, servo_pan_right);

  tiltServo.write(tiltAngle);
  panServo.write(panAngle);
}
