#include "servos.h"
#include "utils.h"
#include <Arduino.h>

Servo tiltServo; // SERVO1 (subir/descer)
Servo panServo;  // SERVO2 (esquerda/direita)

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
  tiltServo.write(SERVO_TILT_MID);
  panServo.write(SERVO_PAN_MID);
}

void updateServos(float panNormalized, float tiltNormalized) {
  int tiltAngle = normalizedToAngle(tiltNormalized, SERVO_TILT_UP, SERVO_TILT_MID, SERVO_TILT_DOWN);
  int panAngle  = normalizedToAngle(panNormalized, SERVO_PAN_LEFT, SERVO_PAN_MID, SERVO_PAN_RIGHT);

  tiltServo.write(tiltAngle);
  panServo.write(panAngle);
}
