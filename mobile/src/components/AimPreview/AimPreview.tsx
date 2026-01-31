import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { AxisMode } from '../../data/RobotConfig';

const TICK_MS = 50;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function auto1Update(
  base: number,
  dir: number,
  speed: number,
  min: number,
  max: number
): { value: number; dir: number } {
  let value = base + dir * speed;
  let newDir = dir;
  if (value >= max) {
    value = max;
    newDir = -1;
  } else if (value <= min) {
    value = min;
    newDir = 1;
  }
  return { value, dir: newDir };
}

function auto2Update(
  base: number,
  dir: number,
  step: number,
  lastStepMs: number,
  nowMs: number,
  pauseMs: number,
  min: number,
  max: number
): { value: number; dir: number; lastStepMs: number } {
  if (nowMs - lastStepMs < pauseMs) {
    return { value: base, dir, lastStepMs };
  }
  let value = base + dir * step;
  let newDir = dir;
  if (value >= max) {
    value = max;
    newDir = -1;
  } else if (value <= min) {
    value = min;
    newDir = 1;
  }
  return { value, dir: newDir, lastStepMs: nowMs };
}

function pickRandomTarget(min: number, max: number, current: number, minDist: number): number {
  const range = max - min;
  if (range <= 0) return current;
  for (let attempt = 0; attempt < 20; attempt++) {
    const t = min + Math.random() * range;
    if (Math.abs(t - current) >= minDist) return t;
  }
  return current + (current < (min + max) / 2 ? minDist : -minDist);
}

function auto3CheckPause(
  lastStepMs: number,
  nowMs: number,
  pauseMs: number
): { lastStepMs: number; pauseElapsed: boolean } {
  const pauseElapsed = nowMs - lastStepMs >= pauseMs;
  return {
    lastStepMs: pauseElapsed ? nowMs : lastStepMs,
    pauseElapsed,
  };
}

type AimPreviewProps = {
  size: number;
  pan: number;
  tilt: number;
  panMode?: AxisMode;
  tiltMode?: AxisMode;
  panMin?: number;
  panMax?: number;
  tiltMin?: number;
  tiltMax?: number;
  panAuto1Speed?: number;
  panAuto2Step?: number;
  panAuto2PauseMs?: number;
  tiltAuto1Speed?: number;
  tiltAuto2Step?: number;
  tiltAuto2PauseMs?: number;
  panRandomMinDist?: number;
  panRandomPauseMs?: number;
  tiltRandomMinDist?: number;
  tiltRandomPauseMs?: number;
};

export function AimPreview({
  size,
  pan,
  tilt,
  panMode = 'LIVE',
  tiltMode = 'LIVE',
  panMin = -1,
  panMax = 1,
  tiltMin = -1,
  tiltMax = 1,
  panAuto1Speed = 0.035,
  panAuto2Step = 0.25,
  panAuto2PauseMs = 1000,
  tiltAuto1Speed = 0.035,
  tiltAuto2Step = 0.25,
  tiltAuto2PauseMs = 1000,
  panRandomMinDist = 0.2,
  panRandomPauseMs = 1500,
  tiltRandomMinDist = 0.2,
  tiltRandomPauseMs = 1500,
}: AimPreviewProps) {
  const [simulatedPan, setSimulatedPan] = useState(pan);
  const [simulatedTilt, setSimulatedTilt] = useState(tilt);
  const panDirRef = useRef(1);
  const tiltDirRef = useRef(1);
  const panLastStepRef = useRef(0);
  const tiltLastStepRef = useRef(0);
  const panTargetRef = useRef(pan);
  const tiltTargetRef = useRef(tilt);

  useEffect(() => {
    if (panMode !== 'LIVE') setSimulatedPan(pan);
    if (tiltMode !== 'LIVE') setSimulatedTilt(tilt);
    if (panMode === 'RANDOM') {
      panTargetRef.current = pan;
      panLastStepRef.current = Date.now();
    }
    if (tiltMode === 'RANDOM') {
      tiltTargetRef.current = tilt;
      tiltLastStepRef.current = Date.now();
    }
  }, [panMode, tiltMode, pan, tilt]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setSimulatedPan((prev) => {
        if (panMode === 'LIVE') return prev;
        const dir = panDirRef.current;
        if (panMode === 'AUTO1') {
          const { value, dir: newDir } = auto1Update(prev, dir, panAuto1Speed, panMin, panMax);
          panDirRef.current = newDir;
          return value;
        }
        if (panMode === 'AUTO2') {
          const { value, dir: newDir, lastStepMs } = auto2Update(
            prev,
            dir,
            panAuto2Step,
            panLastStepRef.current,
            now,
            panAuto2PauseMs,
            panMin,
            panMax
          );
          panDirRef.current = newDir;
          panLastStepRef.current = lastStepMs;
          return value;
        }
        if (panMode === 'RANDOM') {
          const { lastStepMs, pauseElapsed } = auto3CheckPause(
            panLastStepRef.current,
            now,
            panRandomPauseMs
          );
          panLastStepRef.current = lastStepMs;
          if (pauseElapsed) {
            const newTarget = pickRandomTarget(panMin, panMax, prev, panRandomMinDist);
            panTargetRef.current = newTarget;
            return newTarget;
          }
          return prev;
        }
        return prev;
      });
      setSimulatedTilt((prev) => {
        if (tiltMode === 'LIVE') return prev;
        const dir = tiltDirRef.current;
        if (tiltMode === 'AUTO1') {
          const { value, dir: newDir } = auto1Update(prev, dir, tiltAuto1Speed, tiltMin, tiltMax);
          tiltDirRef.current = newDir;
          return value;
        }
        if (tiltMode === 'AUTO2') {
          const { value, dir: newDir, lastStepMs } = auto2Update(
            prev,
            dir,
            tiltAuto2Step,
            tiltLastStepRef.current,
            now,
            tiltAuto2PauseMs,
            tiltMin,
            tiltMax
          );
          tiltDirRef.current = newDir;
          tiltLastStepRef.current = lastStepMs;
          return value;
        }
        if (tiltMode === 'RANDOM') {
          const { lastStepMs, pauseElapsed } = auto3CheckPause(
            tiltLastStepRef.current,
            now,
            tiltRandomPauseMs
          );
          tiltLastStepRef.current = lastStepMs;
          if (pauseElapsed) {
            const newTarget = pickRandomTarget(tiltMin, tiltMax, prev, tiltRandomMinDist);
            tiltTargetRef.current = newTarget;
            return newTarget;
          }
          return prev;
        }
        return prev;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [
    panMode,
    tiltMode,
    panMin,
    panMax,
    tiltMin,
    tiltMax,
    panAuto1Speed,
    panAuto2Step,
    panAuto2PauseMs,
    tiltAuto1Speed,
    tiltAuto2Step,
    tiltAuto2PauseMs,
    panRandomMinDist,
    panRandomPauseMs,
    tiltRandomMinDist,
    tiltRandomPauseMs,
  ]);

  const displayPan = panMode === 'LIVE' ? pan : simulatedPan;
  const displayTilt = tiltMode === 'LIVE' ? tilt : simulatedTilt;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  const p = clamp(displayPan, panMin, panMax);
  const t = clamp(displayTilt, tiltMin, tiltMax);
  const px = cx + p * radius;
  const py = cy + t * radius;

  const panMinPx = cx + panMin * radius;
  const panMaxPx = cx + panMax * radius;
  const tiltMinPx = cy + tiltMin * radius;
  const tiltMaxPx = cy + tiltMax * radius;

  const deadZoneTop = tiltMinPx;
  const deadZoneBottom = tiltMaxPx;
  const deadZoneLeft = panMinPx;
  const deadZoneRight = panMaxPx;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.box, { width: size, height: size }]}>
        {deadZoneTop > 0 && (
          <View
            style={[
              styles.deadZone,
              { left: 0, top: 0, width: size, height: deadZoneTop },
            ]}
          />
        )}
        {deadZoneBottom < size && (
          <View
            style={[
              styles.deadZone,
              {
                left: 0,
                top: deadZoneBottom,
                width: size,
                height: size - deadZoneBottom,
              },
            ]}
          />
        )}
        {deadZoneLeft > 0 && (
          <View
            style={[
              styles.deadZone,
              {
                left: 0,
                top: deadZoneTop,
                width: deadZoneLeft,
                height: deadZoneBottom - deadZoneTop,
              },
            ]}
          />
        )}
        {deadZoneRight < size && (
          <View
            style={[
              styles.deadZone,
              {
                left: deadZoneRight,
                top: deadZoneTop,
                width: size - deadZoneRight,
                height: deadZoneBottom - deadZoneTop,
              },
            ]}
          />
        )}
        <View style={[styles.crossHair, { left: cx - 2, top: cy - 1, width: 4, height: 2 }]} />
        <View style={[styles.crossHair, { left: cx - 1, top: cy - 2, width: 2, height: 4 }]} />
        <View
          style={[
            styles.dot,
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              left: px - 4,
              top: py - 4,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    position: 'relative',
  },
  crossHair: {
    position: 'absolute',
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
  },
  deadZone: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 60, 60, 0.35)',
    borderRadius: 0,
    pointerEvents: 'none',
  },
});
