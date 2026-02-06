import type { RunState } from '../../data/RobotConnectionRepository';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { timerMsByIndex } from '../../data/RobotConfig';

export function getRunState(): RunState {
  return RobotConnectionRepository.getRunState();
}

export function sendLiveAim(pan: number, tilt: number): Promise<void> {
  return RobotConnectionRepository.sendLiveAim(pan, tilt);
}

export function subscribeRunState(listener: (s: RunState) => void): () => void {
  return RobotConnectionRepository.subscribeRunState(listener);
}

export function stopRun(): Promise<void> {
  return RobotConnectionRepository.stopRun();
}

export function getElapsedSeconds(runStartTime: number | null): number {
  if (runStartTime == null) return 0;
  return Math.floor((Date.now() - runStartTime) / 1000);
}

export function getLeftSeconds(
  runStartTime: number | null,
  timerIndex: number
): number | null {
  if (runStartTime == null) return null;
  const tms = timerMsByIndex(timerIndex);
  if (tms === 0) return null;
  const elapsed = Date.now() - runStartTime;
  const left = Math.max(0, Math.floor((tms - elapsed) / 1000));
  return left;
}
