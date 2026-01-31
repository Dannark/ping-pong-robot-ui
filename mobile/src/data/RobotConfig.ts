export type AxisMode = 'LIVE' | 'AUTO1' | 'AUTO2';

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

export type FeederMode = 'CONT' | 'P1/1' | 'P2/2';

export type RobotConfig = {
  panMode: AxisMode;
  tiltMode: AxisMode;
  panTarget: number;
  tiltTarget: number;
  panAuto1Speed: number;
  panAuto2Step: number;
  tiltAuto1Speed: number;
  tiltAuto2Step: number;
  launcherPower: number;
  spinDirection: SpinDirection;
  spinIntensity: number;
  spinRandom: boolean;
  feederMode: FeederMode;
  feederSpeed: number;
  timerIndex: number;
};

export const DEFAULT_CONFIG: RobotConfig = {
  panMode: 'LIVE',
  tiltMode: 'LIVE',
  panTarget: 0,
  tiltTarget: 0,
  panAuto1Speed: 0.035,
  panAuto2Step: 0.25,
  tiltAuto1Speed: 0.035,
  tiltAuto2Step: 0.25,
  launcherPower: 255,
  spinDirection: 'NONE',
  spinIntensity: 255,
  spinRandom: false,
  feederMode: 'CONT',
  feederSpeed: 160,
  timerIndex: 0,
};

export const AXIS_MODES: AxisMode[] = ['LIVE', 'AUTO1', 'AUTO2'];
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
export const FEEDER_MODES: FeederMode[] = ['CONT', 'P1/1', 'P2/2'];
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
