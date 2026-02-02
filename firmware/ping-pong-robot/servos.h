#ifndef SERVOS_H
#define SERVOS_H

#include <Servo.h>

// Pinos do shield L293D
#define SERVO_TILT_PIN 10  // SERVO1
#define SERVO_PAN_PIN  9   // SERVO2

// Limites dos servos (editáveis)
extern int servo_tilt_up;
extern int servo_tilt_mid;
extern int servo_tilt_down;

extern int servo_pan_left;
extern int servo_pan_mid;
extern int servo_pan_right;

void initServos();
void updateServos(float panNormalized, float tiltNormalized);
int normalizedToAngle(float x, int minAngle, int midAngle, int maxAngle);

extern Servo tiltServo;
extern Servo panServo;

#endif
