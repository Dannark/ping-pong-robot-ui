#ifndef MOTORS_H
#define MOTORS_H

#include <AFMotor_R4.h>
#include "config.h"

// Pinos dos motores no shield
#define MOTOR_LAUNCHER_1 1  // M1
#define MOTOR_LAUNCHER_2 2  // M2
#define MOTOR_LAUNCHER_3 3  // M3
#define MOTOR_FEEDER     4  // M4

// Spin intensity agora é controlado via Config.spinIntensity (0-255)

void initMotors();
void updateLauncherMotors(int power, SpinMode spinMode, int spinIntensity);
void updateFeederMotor(int speed, FeederMode mode);
void stopAllMotors();
void getLauncherMotorSpeeds(int power, SpinMode spinMode, int spinIntensity, int &speed1, int &speed2, int &speed3);
void resetMotorCache();
void setMotorCache(int s1, int s2, int s3);

// Expor os motores para acesso direto quando necessário
extern AF_DCMotor motor1;
extern AF_DCMotor motor2;
extern AF_DCMotor motor3;
extern AF_DCMotor motor4;

// Variáveis de estado do feeder
extern unsigned long feederLastPulseMs;
extern bool feederPulseState;
extern int feederPulseCount;

// Cache dos valores dos motores para evitar atualizações desnecessárias
extern int lastLauncherSpeed1;
extern int lastLauncherSpeed2;
extern int lastLauncherSpeed3;
extern int lastFeederSpeed;
extern bool lastFeederRunning;

#endif
