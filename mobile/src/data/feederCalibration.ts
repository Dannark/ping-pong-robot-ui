/**
 * Estimativa de bolas por minuto do feeder (disco com 3 furos por volta).
 * Calibração assumindo alimentação 7,5 V (padrão do sistema).
 */

/** Voltagem padrão assumida para a estimativa (poderá vir do Arduino via BT no futuro). */
export const DEFAULT_FEEDER_VOLTAGE = 7.5;

/**
 * Pontos medidos a 7,5 V (modo contínuo):
 * - Speed 70  → T = 4,50 s/volta
 * - Speed 160 → T = 2,91 s/volta
 * - Speed 255 → T = 2,60 s/volta
 * Fórmula: bolas/min = (60 / T) * 3, com T interpolado linearmente entre os pontos.
 */

const FEEDER_MIN_SPEED_TO_ROTATE = 60;
const T_SEC_AT_70 = 4.5;
const T_SEC_AT_160 = 2.91;
const T_SEC_AT_255 = 2.6;
const HOLES_PER_ROTATION = 3;

/** Segundos por volta completa do disco para um dado speed (0–255), assumindo 7,5 V. Exportado para preview de rotação. */
export function secondsPerRotation(speed: number): number {
  if (speed <= 70) {
    const t = T_SEC_AT_70 + ((70 - speed) / 70) * (6 - T_SEC_AT_70);
    return Math.min(6, Math.max(T_SEC_AT_70, t));
  }
  if (speed <= 160) {
    return (
      T_SEC_AT_70 -
      ((T_SEC_AT_70 - T_SEC_AT_160) / (160 - 70)) * (speed - 70)
    );
  }
  if (speed <= 255) {
    const t =
      T_SEC_AT_160 -
      ((T_SEC_AT_160 - T_SEC_AT_255) / (255 - 160)) * (speed - 160);
    return Math.max(T_SEC_AT_255, Math.min(T_SEC_AT_160, t));
  }
  return T_SEC_AT_255;
}

/**
 * Estima quantas bolas por minuto serão disparadas para o speed dado (0–255).
 * Assume motor a girar continuamente (modo CONT). Abaixo de 60 o motor não gira → 0.
 */
export function estimateBallsPerMinute(speed: number): number {
  if (speed < FEEDER_MIN_SPEED_TO_ROTATE) return 0;
  const t = secondsPerRotation(speed);
  return Math.round((60 / t) * HOLES_PER_ROTATION);
}

/**
 * Bolas/min efetivas quando o motor não está sempre ligado (P1/1, P2/1, P2/2, CUSTOM).
 * Aplica o duty cycle: efectivo = contínuo × (onMs / (onMs + offMs)).
 */
export function effectiveBallsPerMinute(
  continuousBallsPerMin: number,
  onMs: number,
  offMs: number
): number {
  const cycleMs = onMs + offMs;
  if (cycleMs <= 0) return 0;
  return Math.round(continuousBallsPerMin * (onMs / cycleMs));
}
