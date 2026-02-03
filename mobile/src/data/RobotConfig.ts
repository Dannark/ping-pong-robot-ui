export type AxisMode = 'LIVE' | 'AUTO1' | 'AUTO2' | 'RANDOM';

export type SpinDirection =
  | 'NONE'
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW';

export type FeederMode = 'CONT' | 'P1/1' | 'P2/1' | 'P2/2' | 'CUSTOM';

export type RobotConfig = {
  panMode: AxisMode;
  tiltMode: AxisMode;
  panTarget: number;
  tiltTarget: number;
  panMin: number;
  panMax: number;
  tiltMin: number;
  tiltMax: number;
  panAuto1Speed: number;
  panAuto2Step: number;
  panAuto2PauseMs: number;
  tiltAuto1Speed: number;
  tiltAuto2Step: number;
  tiltAuto2PauseMs: number;
  panRandomMinDist: number;
  panRandomPauseMs: number;
  tiltRandomMinDist: number;
  tiltRandomPauseMs: number;
  launcherPower: number;
  spinDirection: SpinDirection;
  spinIntensity: number;
  spinRandom: boolean;
  spinRandomIntervalSec: number;
  feederMode: FeederMode;
  feederSpeed: number;
  feederCustomOnMs: number;
  feederCustomOffMs: number;
  timerIndex: number;
  timerSoundAlert: boolean;
};

export const DEFAULT_CONFIG: RobotConfig = {
  panMode: 'LIVE',
  tiltMode: 'LIVE',
  panTarget: 0,
  tiltTarget: 0,
  panMin: -1,
  panMax: 1,
  tiltMin: -1,
  tiltMax: 1,
  panAuto1Speed: 0.035,
  panAuto2Step: 0.25,
  panAuto2PauseMs: 1000,
  tiltAuto1Speed: 0.035,
  tiltAuto2Step: 0.25,
  tiltAuto2PauseMs: 1000,
  panRandomMinDist: 0.2,
  panRandomPauseMs: 1500,
  tiltRandomMinDist: 0.2,
  tiltRandomPauseMs: 1500,
  launcherPower: 255,
  spinDirection: 'NONE',
  spinIntensity: 255,
  spinRandom: false,
  spinRandomIntervalSec: 5,
  feederMode: 'CONT',
  feederSpeed: 160,
  feederCustomOnMs: 1000,
  feederCustomOffMs: 1000,
  timerIndex: 0,
  timerSoundAlert: false,
};

export const AXIS_MODES: AxisMode[] = ['LIVE', 'AUTO1', 'AUTO2', 'RANDOM'];
export const SPIN_DIRECTIONS: SpinDirection[] = [
  'NONE',
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW',
];
export const FEEDER_MODES: FeederMode[] = ['CONT', 'P1/1', 'P2/1', 'P2/2', 'CUSTOM'];

/** Tempos on/off (ms) por modo; CUSTOM usa customOnMs/customOffMs. */
export function getFeederOnOffMs(
  mode: FeederMode,
  customOnMs: number,
  customOffMs: number
): { onMs: number; offMs: number } {
  switch (mode) {
    case 'P1/1': return { onMs: 1000, offMs: 1000 };
    case 'P2/1': return { onMs: 2000, offMs: 1000 };
    case 'P2/2': return { onMs: 2000, offMs: 2000 };
    case 'CUSTOM': return { onMs: customOnMs, offMs: customOffMs };
    default: return { onMs: 0, offMs: 0 };
  }
}
export const TIMER_OPTIONS = ['OFF', '15s', '30s', '1m', '2m', '5m'] as const;

export function spinDirectionToAngleDeg(dir: SpinDirection): number {
  const map: Record<SpinDirection, number> = {
    NONE: -1,
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
  };
  return map[dir];
}

export function timerMsByIndex(idx: number): number {
  switch (idx) {
    case 0: return 0;
    case 1: return 15000;
    case 2: return 30000;
    case 3: return 60000;
    case 4: return 120000;
    case 5: return 300000;
    default: return 0;
  }
}

export function axisModeName(mode: AxisMode): string {
  return mode;
}

export function spinDirectionLabel(dir: SpinDirection, random: boolean): string {
  return random ? 'Random' : dir;
}

const MOTOR_ANGLE_1 = 0;
const MOTOR_ANGLE_2 = 120;
const MOTOR_ANGLE_3 = 240;
const DEG_TO_RAD = Math.PI / 180;

function spinAlign(motorDeg: number, targetRad: number): number {
  const diffRad = motorDeg * DEG_TO_RAD - targetRad;
  const c = Math.cos(diffRad);
  return (c + 1) * 0.5;
}

export function getLauncherMotorSpeeds(
  power: number,
  spinDirection: SpinDirection,
  spinIntensity: number
): { speed1: number; speed2: number; speed3: number } {
  const baseSpeed = power;
  let speed1 = baseSpeed;
  let speed2 = baseSpeed;
  let speed3 = baseSpeed;

  const targetAngle = spinDirectionToAngleDeg(spinDirection);
  if (targetAngle >= 0 && spinIntensity > 0) {
    const intensityFactor = spinIntensity / 255;
    const targetRad = targetAngle * DEG_TO_RAD;
    const a1 = spinAlign(MOTOR_ANGLE_1, targetRad);
    const a2 = spinAlign(MOTOR_ANGLE_2, targetRad);
    const a3 = spinAlign(MOTOR_ANGLE_3, targetRad);
    speed1 = Math.round(baseSpeed * (1 - intensityFactor * (1 - a1)));
    speed2 = Math.round(baseSpeed * (1 - intensityFactor * (1 - a2)));
    speed3 = Math.round(baseSpeed * (1 - intensityFactor * (1 - a3)));
  }

  const clamp = (v: number) => Math.max(-255, Math.min(255, v));
  return {
    speed1: clamp(speed1),
    speed2: clamp(speed2),
    speed3: clamp(speed3),
  };
}
