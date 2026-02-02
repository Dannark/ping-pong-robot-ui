/**
 * Estimativa de bolas por minuto do feeder (disco com 3 furos por volta).
 * Calibração assumindo alimentação 7,5 V (padrão do sistema).
 */

/** Voltagem padrão assumida para a estimativa (poderá vir do Arduino via BT no futuro). */
export const DEFAULT_FEEDER_VOLTAGE = 7.5;

/**
 * Pontos medidos a 7,5 V:
 * - Speed 80  → T = 4 s/volta  → 45 bolas/min
 * - Speed 255 → T = 2,7 s/volta → ~66,7 bolas/min
 * - Speed < 60 → motor não inicia o giro (0 bolas/min)
 * Fórmula: bolas/min = (60 / T) * 3, com T interpolado entre os pontos.
 */

const FEEDER_MIN_SPEED_TO_ROTATE = 60;
const T_SEC_AT_SPEED_80 = 4;
const T_SEC_AT_SPEED_255 = 2.7;
const HOLES_PER_ROTATION = 3;

/** Segundos por volta completa do disco para um dado speed (0–255), assumindo 7,5 V. */
function secondsPerRotation(speed: number): number {
  if (speed <= 80) {
    const t =
      T_SEC_AT_SPEED_80 +
      ((80 - speed) / 80) * (6 - T_SEC_AT_SPEED_80);
    return Math.min(6, Math.max(T_SEC_AT_SPEED_80, t));
  }
  const t =
    T_SEC_AT_SPEED_80 -
    ((T_SEC_AT_SPEED_80 - T_SEC_AT_SPEED_255) / (255 - 80)) * (speed - 80);
  return Math.max(T_SEC_AT_SPEED_255, Math.min(T_SEC_AT_SPEED_80, t));
}

/**
 * Estima quantas bolas por minuto serão disparadas para o speed dado (0–255).
 * Assume 7,5 V. Abaixo de 60 o motor não gira → 0.
 */
export function estimateBallsPerMinute(speed: number): number {
  if (speed < FEEDER_MIN_SPEED_TO_ROTATE) return 0;
  const t = secondsPerRotation(speed);
  return Math.round((60 / t) * HOLES_PER_ROTATION);
}
