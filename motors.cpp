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

void updateLauncherMotors(int power, SpinMode spinMode, int spinIntensity) {
  // Velocidade base para todos os motores
  int baseSpeed = power;

  // Calcula velocidades individuais baseado no modo de spin
  int speed1 = baseSpeed;
  int speed2 = baseSpeed;
  int speed3 = baseSpeed;

  // Se spinIntensity é 0 ou SPIN_NONE, todos ficam iguais
  if (spinMode == SPIN_NONE || spinIntensity == 0) {
    speed1 = baseSpeed;
    speed2 = baseSpeed;
    speed3 = baseSpeed;
  } else {
    // Intensidade subtrai dos motores secundários
    // Power é o máximo, motores secundários recebem (power - intensity)
    int secondarySpeed = baseSpeed - spinIntensity;
    if (secondarySpeed < 0) secondarySpeed = 0;

    switch (spinMode) {
      case SPIN_TOP:
        // Top spin: motor superior (M1) no máximo, outros reduzidos
        speed1 = baseSpeed;
        speed2 = secondarySpeed;
        speed3 = secondarySpeed;
        break;

      case SPIN_BACK:
        // Back spin: motores inferiores (M2, M3) no máximo, superior reduzido
        speed1 = secondarySpeed;
        speed2 = baseSpeed;
        speed3 = baseSpeed;
        break;

      case SPIN_LEFT:
        // Left spin: motor esquerdo (M3) no máximo, outros reduzidos
        speed1 = secondarySpeed;
        speed2 = secondarySpeed;
        speed3 = baseSpeed;
        break;

      case SPIN_RIGHT:
        // Right spin: motor direito (M2) no máximo, outros reduzidos
        speed1 = secondarySpeed;
        speed2 = baseSpeed;
        speed3 = secondarySpeed;
        break;

      default:
        speed1 = baseSpeed;
        speed2 = baseSpeed;
        speed3 = baseSpeed;
        break;
    }
  }

  // Limita velocidades entre 0 e 255
  speed1 = (speed1 < 0) ? 0 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < 0) ? 0 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < 0) ? 0 : (speed3 > 255) ? 255 : speed3;

  // Só atualiza se os valores mudaram (otimização para evitar picos de energia)
  if (speed1 != lastLauncherSpeed1) {
    motor1.setSpeed(speed1);
    lastLauncherSpeed1 = speed1;
  }
  if (speed2 != lastLauncherSpeed2) {
    motor2.setSpeed(speed2);
    lastLauncherSpeed2 = speed2;
  }
  if (speed3 != lastLauncherSpeed3) {
    motor3.setSpeed(speed3);
    lastLauncherSpeed3 = speed3;
  }

  // Sempre mantém os motores rodando (mas só atualiza velocidade se mudou)
  motor1.run(FORWARD);
  motor2.run(FORWARD);
  motor3.run(FORWARD);
}

void getLauncherMotorSpeeds(int power, SpinMode spinMode, int spinIntensity, int &speed1, int &speed2, int &speed3) {
  // Velocidade base para todos os motores
  int baseSpeed = power;

  // Calcula velocidades individuais baseado no modo de spin
  speed1 = baseSpeed;
  speed2 = baseSpeed;
  speed3 = baseSpeed;

  // Se spinIntensity é 0 ou SPIN_NONE, todos ficam iguais
  if (spinMode == SPIN_NONE || spinIntensity == 0) {
    speed1 = baseSpeed;
    speed2 = baseSpeed;
    speed3 = baseSpeed;
  } else {
    // Intensidade subtrai dos motores secundários
    // Power é o máximo, motores secundários recebem (power - intensity)
    int secondarySpeed = baseSpeed - spinIntensity;
    if (secondarySpeed < 0) secondarySpeed = 0;

    switch (spinMode) {
      case SPIN_TOP:
        // Top spin: motor superior (M1) no máximo, outros reduzidos
        speed1 = baseSpeed;
        speed2 = secondarySpeed;
        speed3 = secondarySpeed;
        break;

      case SPIN_BACK:
        // Back spin: motores inferiores (M2, M3) no máximo, superior reduzido
        speed1 = secondarySpeed;
        speed2 = baseSpeed;
        speed3 = baseSpeed;
        break;

      case SPIN_LEFT:
        // Left spin: motor esquerdo (M3) no máximo, outros reduzidos
        speed1 = secondarySpeed;
        speed2 = secondarySpeed;
        speed3 = baseSpeed;
        break;

      case SPIN_RIGHT:
        // Right spin: motor direito (M2) no máximo, outros reduzidos
        speed1 = secondarySpeed;
        speed2 = baseSpeed;
        speed3 = secondarySpeed;
        break;

      default:
        speed1 = baseSpeed;
        speed2 = baseSpeed;
        speed3 = baseSpeed;
        break;
    }
  }

  // Limita velocidades entre 0 e 255
  speed1 = (speed1 < 0) ? 0 : (speed1 > 255) ? 255 : speed1;
  speed2 = (speed2 < 0) ? 0 : (speed2 > 255) ? 255 : speed2;
  speed3 = (speed3 < 0) ? 0 : (speed3 > 255) ? 255 : speed3;
}

void updateFeederMotor(int speed, FeederMode mode) {
  unsigned long now = millis();
  bool shouldRun = false;

  switch (mode) {
    case FEED_CONTINUOUS:
      // Modo contínuo: sempre girando
      shouldRun = true;
      break;

    case FEED_PULSE_1_1: {
      // Pulso 1 segundo ligado, 1 segundo desligado
      unsigned long cycleTime = now % 2000UL; // Ciclo de 2 segundos
      shouldRun = (cycleTime < 1000UL);
      break;
    }

    case FEED_PULSE_2_2: {
      // Pulso 2 segundos ligado, 2 segundos desligado
      unsigned long cycleTime = now % 4000UL; // Ciclo de 4 segundos
      shouldRun = (cycleTime < 2000UL);
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

void stopAllMotors() {
  motor1.run(RELEASE);
  motor2.run(RELEASE);
  motor3.run(RELEASE);
  motor4.run(RELEASE);

  resetMotorCache();
}
