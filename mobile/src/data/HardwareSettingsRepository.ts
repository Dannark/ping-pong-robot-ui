import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVO_TILT_KEY = '@PingPongRobot/servoTilt';
const SERVO_PAN_KEY = '@PingPongRobot/servoPan';

export type ServoLimits = { min: number; mid: number; max: number };

const DEFAULT_TILT: ServoLimits = { min: 45, mid: 100, max: 120 };
const DEFAULT_PAN: ServoLimits = { min: 15, mid: 70, max: 125 };

type Listener = () => void;
const tiltListeners: Listener[] = [];
const panListeners: Listener[] = [];

function notifyTilt() {
  tiltListeners.forEach((fn) => fn());
}
function notifyPan() {
  panListeners.forEach((fn) => fn());
}

export async function getServoTiltLimits(): Promise<ServoLimits> {
  try {
    const raw = await AsyncStorage.getItem(SERVO_TILT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ServoLimits;
      if (typeof parsed.min === 'number' && typeof parsed.mid === 'number' && typeof parsed.max === 'number') {
        return clampServoLimits(parsed);
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_TILT };
}

export async function setServoTiltLimits(limits: ServoLimits): Promise<void> {
  const clamped = clampServoLimits(limits);
  await AsyncStorage.setItem(SERVO_TILT_KEY, JSON.stringify(clamped));
  notifyTilt();
}

export async function getServoPanLimits(): Promise<ServoLimits> {
  try {
    const raw = await AsyncStorage.getItem(SERVO_PAN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ServoLimits;
      if (typeof parsed.min === 'number' && typeof parsed.mid === 'number' && typeof parsed.max === 'number') {
        return clampServoLimits(parsed);
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_PAN };
}

export async function setServoPanLimits(limits: ServoLimits): Promise<void> {
  const clamped = clampServoLimits(limits);
  await AsyncStorage.setItem(SERVO_PAN_KEY, JSON.stringify(clamped));
  notifyPan();
}

export function subscribeServoTilt(cb: Listener): () => void {
  tiltListeners.push(cb);
  return () => {
    const i = tiltListeners.indexOf(cb);
    if (i >= 0) tiltListeners.splice(i, 1);
  };
}

export function subscribeServoPan(cb: Listener): () => void {
  panListeners.push(cb);
  return () => {
    const i = panListeners.indexOf(cb);
    if (i >= 0) panListeners.splice(i, 1);
  };
}

export function getDefaultServoTilt(): ServoLimits {
  return { ...DEFAULT_TILT };
}

export function getDefaultServoPan(): ServoLimits {
  return { ...DEFAULT_PAN };
}

function clampServoLimits(l: ServoLimits): ServoLimits {
  const clamp = (v: number) => Math.max(0, Math.min(180, Math.round(v)));
  return {
    min: clamp(l.min),
    mid: clamp(l.mid),
    max: clamp(l.max),
  };
}
