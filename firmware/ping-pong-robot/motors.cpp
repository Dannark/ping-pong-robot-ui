#include "motors.h"
#include "config.h"
#include <Arduino.h>
#include <math.h>

// Motores do launcher (M1, M2, M3)
AF_DCMotor motor1(MOTOR_LAUNCHER_1);
AF_DCMotor motor2(MOTOR_LAUNCHER_2);
AF_DCMotor motor3(MOTOR_LAUNCHER_3);

// Motor feeder (M4)
AF_DCMotor motor4(MOTOR_FEEDER);

// Variáveis de estado do feeder
unsigned long feederLastPulseMs = 0;
bool feederPulseState = false;
int feederPulseCount = 0;

// Cache dos valores dos motores
int lastLauncherSpeed1 = -1;
int lastLauncherSpeed2 = -1;
int lastLauncherSpeed3 = -1;
int lastFeederSpeed = -1;
bool lastFeederRunning = false;

void initMotors() {
  // Inicializa todos os motores parados
  motor1.setSpeed(0);
  motor2.setSpeed(0);
  motor3.setSpeed(0);
  motor4.setSpeed(0);

  motor1.run(RELEASE);
  motor2.run(RELEASE);
  motor3.run(RELEASE);
  motor4.run(RELEASE);

  // Reseta cache
  lastLauncherSpeed1 = -1;
  lastLauncherSpeed2 = -1;
  lastLauncherSpeed3 = -1;
  lastFeederSpeed = -1;
  lastFeederRunning = false;
}

// Posições dos motores em graus: M1=12h(N), M2=4h(SE), M3=8h(SW)
#define MOTOR_ANGLE_1  0.0
#define MOTOR_ANGLE_2  120.0
#define MOTOR_ANGLE_3  240.0
#define DEG_TO_RAD    0.01745329252

static float spinAlign(float motorDeg, float targetRad) {
  float diffRad = (motorDeg * (float)DEG_TO_RAD) - targetRad;
  float c = (float)cos((double)diffRad);
  return (c + 1.0f) * 0.5f;  // 0..1
}

void updateLauncherMotors(int power, SpinMode spinMode, int spinIntensity) {
  int baseSpeed = power;
  int speed1 = baseSpeed;
  int speed2 = baseSpeed;
  int speed3 = baseSpeed;

  int targetAngle = spinModeToAngleDeg(spinMode);
  if (targetAngle < 0 || spinIntensity == 0) {
    speed1 = baseSpeed;
    speed2 = baseSpeed;
    speed3 = baseSpeed;
  } else {
    // intensityFactor > 1 (intensity > 255) produz valores negativos = motor em REVERSE
    float intensityFactor = (float)spinIntensity / 255.0f;
    float targetRad = (float)targetAngle * (float)DEG_TO_RAD;

    float a1 = spinAlign((float)MOTOR_ANGLE_1, targetRad);
    float a2 = spinAlign((float)MOTOR_ANGLE_2, targetRad);
    float a3 = spinAlign((float)MOTOR_ANGLE_3, targetRad);

    speed1 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a1)) + 0.5f);
    speed2 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a2)) + 0.5f);
    speed3 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a3)) + 0.5f);
  }

  // Limita ao range lógico -255..255 (negativo = girar em REVERSE)
  speed1 = (speed1 < -255) ? -255 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < -255) ? -255 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < -255) ? -255 : (speed3 > 255) ? 255 : speed3;

  // Aplica: valor negativo = BACKWARD com |speed|, positivo = FORWARD
  if (speed1 != lastLauncherSpeed1) {
    int mag1 = (speed1 < 0) ? -speed1 : speed1;
    motor1.setSpeed(mag1);
    motor1.run(speed1 < 0 ? BACKWARD : FORWARD);
    lastLauncherSpeed1 = speed1;
  }
  if (speed2 != lastLauncherSpeed2) {
    int mag2 = (speed2 < 0) ? -speed2 : speed2;
    motor2.setSpeed(mag2);
    motor2.run(speed2 < 0 ? BACKWARD : FORWARD);
    lastLauncherSpeed2 = speed2;
  }
  if (speed3 != lastLauncherSpeed3) {
    int mag3 = (speed3 < 0) ? -speed3 : speed3;
    motor3.setSpeed(mag3);
    motor3.run(speed3 < 0 ? BACKWARD : FORWARD);
    lastLauncherSpeed3 = speed3;
  }
}

void getLauncherMotorSpeeds(int power, SpinMode spinMode, int spinIntensity, int &speed1, int &speed2, int &speed3) {
  int baseSpeed = power;
  speed1 = baseSpeed;
  speed2 = baseSpeed;
  speed3 = baseSpeed;

  int targetAngle = spinModeToAngleDeg(spinMode);
  if (targetAngle < 0 || spinIntensity == 0) {
    speed1 = baseSpeed;
    speed2 = baseSpeed;
    speed3 = baseSpeed;
  } else {
    float intensityFactor = (float)spinIntensity / 255.0f;
    float targetRad = (float)targetAngle * (float)DEG_TO_RAD;

    float a1 = spinAlign((float)MOTOR_ANGLE_1, targetRad);
    float a2 = spinAlign((float)MOTOR_ANGLE_2, targetRad);
    float a3 = spinAlign((float)MOTOR_ANGLE_3, targetRad);

    speed1 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a1)) + 0.5f);
    speed2 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a2)) + 0.5f);
    speed3 = (int)(baseSpeed * (1.0f - intensityFactor * (1.0f - a3)) + 0.5f);
  }

  // Limita ao range lógico -255..255 (preview pode mostrar negativo)
  speed1 = (speed1 < -255) ? -255 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < -255) ? -255 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < -255) ? -255 : (speed3 > 255) ? 255 : speed3;
}

void updateFeederMotor(int speed, FeederMode mode, unsigned long customOnMs, unsigned long customOffMs, unsigned long runStartMs) {
  unsigned long now = millis();

  // Recuada padrão ao iniciar partida: M4 gira em reverso por FEEDER_PULLBACK_MS para a bolinha recuar antes do spin máximo
  static bool wasInPullback = false;
  if (runStartMs != 0UL && (now - runStartMs) < FEEDER_PULLBACK_MS) {
    wasInPullback = true;
    if (speed != lastFeederSpeed) {
      motor4.setSpeed(speed);
      lastFeederSpeed = speed;
    }
    motor4.run(BACKWARD);
    lastFeederRunning = true;
    return;
  }
  if (wasInPullback) {
    lastFeederRunning = false;
    lastFeederSpeed = -1;
    wasInPullback = false;
  }

  bool shouldRun = false;
  switch (mode) {
    case FEED_CONTINUOUS:
      shouldRun = true;
      break;

    case FEED_PULSE_1_1: {
      unsigned long cycleTime = now % 2000UL;
      shouldRun = (cycleTime < 1000UL);
      break;
    }

    case FEED_PULSE_2_1: {
      unsigned long cycleTime = now % 3000UL;
      shouldRun = (cycleTime < 2000UL);
      break;
    }

    case FEED_PULSE_2_2: {
      unsigned long cycleTime = now % 4000UL;
      shouldRun = (cycleTime < 2000UL);
      break;
    }

    case FEED_CUSTOM: {
      unsigned long cycleMs = customOnMs + customOffMs;
      if (cycleMs == 0) break;
      unsigned long cycleTime = now % cycleMs;
      shouldRun = (cycleTime < customOnMs);
      break;
    }

    default:
      shouldRun = false;
      break;
  }

  // Só atualiza velocidade se mudou
  if (speed != lastFeederSpeed) {
    motor4.setSpeed(speed);
    lastFeederSpeed = speed;
  }

  // Só muda estado se necessário
  if (shouldRun != lastFeederRunning) {
    if (shouldRun) {
      motor4.run(FORWARD);
    } else {
      motor4.run(RELEASE);
    }
    lastFeederRunning = shouldRun;
  }
}

void resetMotorCache() {
  // Reseta cache para forçar atualização na próxima vez
  lastLauncherSpeed1 = -1;
  lastLauncherSpeed2 = -1;
  lastLauncherSpeed3 = -1;
  lastFeederSpeed = -1;
  lastFeederRunning = false;
}

void setMotorCache(int s1, int s2, int s3) {
  // Define o cache manualmente
  lastLauncherSpeed1 = s1;
  lastLauncherSpeed2 = s2;
  lastLauncherSpeed3 = s3;
}

void runSingleMotor(int which, int speed) {
  motor1.run(RELEASE);
  motor2.run(RELEASE);
  motor3.run(RELEASE);
  motor4.run(RELEASE);
  if (which == 0 || speed == 0) {
    return;
  }
  int s = (speed < 0) ? 0 : (speed > 255) ? 255 : speed;
  if (which == 1) {
    motor1.setSpeed(s);
    motor1.run(FORWARD);
  } else if (which == 2) {
    motor2.setSpeed(s);
    motor2.run(FORWARD);
  } else if (which == 3) {
    motor3.setSpeed(s);
    motor3.run(FORWARD);
  } else if (which == 4) {
    motor4.setSpeed(s);
    motor4.run(FORWARD);
  }
}

void stopAllMotors() {
  motor1.run(RELEASE);
  motor2.run(RELEASE);
  motor3.run(RELEASE);
  motor4.run(RELEASE);

  resetMotorCache();
}
