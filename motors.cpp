#include "motors.h"
#include <Arduino.h>

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
}

void updateLauncherMotors(int power, SpinMode spinMode) {
  // Velocidade base para todos os motores
  int baseSpeed = power;

  // Calcula velocidades individuais baseado no modo de spin
  int speed1 = baseSpeed;
  int speed2 = baseSpeed;
  int speed3 = baseSpeed;

  switch (spinMode) {
    case SPIN_NONE:
      // Todos na mesma velocidade
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;

    case SPIN_TOP:
      // Top spin: motor superior (M1) mais rápido
      speed1 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;

    case SPIN_BACK:
      // Back spin: motores inferiores (M2, M3) mais rápidos
      speed1 = baseSpeed;
      speed2 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed3 = (int)(baseSpeed * SPIN_MULTIPLIER);
      break;

    case SPIN_LEFT:
      // Left spin: motor esquerdo (M3) mais rápido
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = (int)(baseSpeed * SPIN_MULTIPLIER);
      break;

    case SPIN_RIGHT:
      // Right spin: motor direito (M2) mais rápido
      speed1 = baseSpeed;
      speed2 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed3 = baseSpeed;
      break;

    default:
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;
  }

  // Limita velocidades entre 0 e 255
  speed1 = (speed1 < 0) ? 0 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < 0) ? 0 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < 0) ? 0 : (speed3 > 255) ? 255 : speed3;

  // Aplica velocidades e inicia rotação
  motor1.setSpeed(speed1);
  motor2.setSpeed(speed2);
  motor3.setSpeed(speed3);

  motor1.run(FORWARD);
  motor2.run(FORWARD);
  motor3.run(FORWARD);
}

void getLauncherMotorSpeeds(int power, SpinMode spinMode, int &speed1, int &speed2, int &speed3) {
  // Velocidade base para todos os motores
  int baseSpeed = power;

  // Calcula velocidades individuais baseado no modo de spin
  speed1 = baseSpeed;
  speed2 = baseSpeed;
  speed3 = baseSpeed;

  switch (spinMode) {
    case SPIN_NONE:
      // Todos na mesma velocidade
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;

    case SPIN_TOP:
      // Top spin: motor superior (M1) mais rápido
      speed1 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;

    case SPIN_BACK:
      // Back spin: motores inferiores (M2, M3) mais rápidos
      speed1 = baseSpeed;
      speed2 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed3 = (int)(baseSpeed * SPIN_MULTIPLIER);
      break;

    case SPIN_LEFT:
      // Left spin: motor esquerdo (M3) mais rápido
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = (int)(baseSpeed * SPIN_MULTIPLIER);
      break;

    case SPIN_RIGHT:
      // Right spin: motor direito (M2) mais rápido
      speed1 = baseSpeed;
      speed2 = (int)(baseSpeed * SPIN_MULTIPLIER);
      speed3 = baseSpeed;
      break;

    default:
      speed1 = baseSpeed;
      speed2 = baseSpeed;
      speed3 = baseSpeed;
      break;
  }

  // Limita velocidades entre 0 e 255
  speed1 = (speed1 < 0) ? 0 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < 0) ? 0 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < 0) ? 0 : (speed3 > 255) ? 255 : speed3;
}

void updateFeederMotor(int speed, FeederMode mode) {
  unsigned long now = millis();

  switch (mode) {
    case FEED_CONTINUOUS:
      // Modo contínuo: sempre girando
      motor4.setSpeed(speed);
      motor4.run(FORWARD);
      break;

    case FEED_PULSE_1_1: {
      // Pulso 1 segundo ligado, 1 segundo desligado
      unsigned long cycleTime = now % 2000UL; // Ciclo de 2 segundos
      if (cycleTime < 1000UL) {
        motor4.setSpeed(speed);
        motor4.run(FORWARD);
      } else {
        motor4.run(RELEASE);
      }
      break;
    }

    case FEED_PULSE_2_2: {
      // Pulso 2 segundos ligado, 2 segundos desligado
      unsigned long cycleTime = now % 4000UL; // Ciclo de 4 segundos
      if (cycleTime < 2000UL) {
        motor4.setSpeed(speed);
        motor4.run(FORWARD);
      } else {
        motor4.run(RELEASE);
      }
      break;
    }

    default:
      motor4.run(RELEASE);
      break;
  }
}

void stopAllMotors() {
  motor1.run(RELEASE);
  motor2.run(RELEASE);
  motor3.run(RELEASE);
  motor4.run(RELEASE);
}
