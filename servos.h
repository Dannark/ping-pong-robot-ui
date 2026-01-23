#ifndef SERVOS_H
#define SERVOS_H

#include <Servo.h>

// ===== SERVO 1 (TILT) =====
#define SERVO_TILT_UP   45
#define SERVO_TILT_MID  100
#define SERVO_TILT_DOWN 120

// ===== SERVO 2 (PAN) =====
#define SERVO_PAN_LEFT  15
#define SERVO_PAN_MID   70
#define SERVO_PAN_RIGHT 125

// Pinos do shield L293D
#define SERVO_TILT_PIN 10  // SERVO1
#define SERVO_PAN_PIN  9   // SERVO2

void initServos();
void updateServos(float panNormalized, float tiltNormalized);
int normalizedToAngle(float x, int minAngle, int midAngle, int maxAngle);

extern Servo tiltServo;
extern Servo panServo;

#endif
