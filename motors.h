#ifndef MOTORS_H
#define MOTORS_H

#include <AFMotor_R4.h>
#include "config.h"

// Pinos dos motores no shield
#define MOTOR_LAUNCHER_1 1  // M1
#define MOTOR_LAUNCHER_2 2  // M2
#define MOTOR_LAUNCHER_3 3  // M3
#define MOTOR_FEEDER     4  // M4

// Fator de multiplicação para spin (quanto mais rápido o motor gira para criar spin)
#define SPIN_MULTIPLIER 1.5f

void initMotors();
void updateLauncherMotors(int power, SpinMode spinMode);
void updateFeederMotor(int speed, FeederMode mode);
void stopAllMotors();
void getLauncherMotorSpeeds(int power, SpinMode spinMode, int &speed1, int &speed2, int &speed3);

// Variáveis de estado do feeder
extern unsigned long feederLastPulseMs;
extern bool feederPulseState;
extern int feederPulseCount;

#endif
