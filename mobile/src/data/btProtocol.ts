import type { RobotConfig, AxisMode, FeederMode, SpinDirection } from './RobotConfig';

const AXIS_MODE_ORDER: AxisMode[] = ['LIVE', 'AUTO1', 'AUTO2', 'RANDOM'];
const FEEDER_MODE_ORDER: FeederMode[] = ['CONT', 'P1/1', 'P2/1', 'P2/2', 'CUSTOM'];
const SPIN_ORDER: SpinDirection[] = ['NONE', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function axisModeToInt(m: AxisMode): number {
  const i = AXIS_MODE_ORDER.indexOf(m);
  return i >= 0 ? i : 0;
}
function feederModeToInt(m: FeederMode): number {
  const i = FEEDER_MODE_ORDER.indexOf(m);
  return i >= 0 ? i : 0;
}
function spinDirectionToInt(d: SpinDirection): number {
  const i = SPIN_ORDER.indexOf(d);
  return i >= 0 ? i : 0;
}

/** Converte RobotConfig na linha CONFIG do protocolo (C,v0,v1,...,v25). Valores float em *1000. */
export function configToConfigLine(config: RobotConfig): string {
  const a = [
    axisModeToInt(config.panMode),
    axisModeToInt(config.tiltMode),
    Math.round(config.panTarget * 1000),
    Math.round(config.tiltTarget * 1000),
    Math.round(config.panMin * 1000),
    Math.round(config.panMax * 1000),
    Math.round(config.tiltMin * 1000),
    Math.round(config.tiltMax * 1000),
    Math.round(config.panAuto1Speed * 1000),
    Math.round(config.panAuto2Step * 1000),
    config.panAuto2PauseMs,
    Math.round(config.tiltAuto1Speed * 1000),
    Math.round(config.tiltAuto2Step * 1000),
    config.tiltAuto2PauseMs,
    Math.round(config.panRandomMinDist * 1000),
    config.panRandomPauseMs,
    Math.round(config.tiltRandomMinDist * 1000),
    config.tiltRandomPauseMs,
    config.launcherPower,
    spinDirectionToInt(config.spinDirection),
    config.spinIntensity,
    feederModeToInt(config.feederMode),
    config.feederSpeed,
    config.feederCustomOnMs,
    config.feederCustomOffMs,
    config.timerIndex,
  ];
  return 'C,' + a.join(',') + '\n';
}

export function getStartCommand(): string {
  return 'S\n';
}

export function getStopCommand(): string {
  return 'P\n';
}

/** Send device name to robot for Info screen (max 24 chars, newlines/commas stripped). */
export function getDeviceNameCommand(deviceName: string): string {
  const sanitized = deviceName.replace(/[\n\r,]/g, '').slice(0, 24);
  return 'N,' + sanitized + '\n';
}

/** Notify robot that app is disconnecting; send before closing BLE so the display updates. */
export function getDisconnectCommand(): string {
  return 'D\n';
}

/** Short live-aim line (pan/tilt only) to avoid BLE truncation. Values *1000. */
export function getLiveAimLine(pan: number, tilt: number): string {
  return `A,${Math.round(pan * 1000)},${Math.round(tilt * 1000)}\n`;
}

