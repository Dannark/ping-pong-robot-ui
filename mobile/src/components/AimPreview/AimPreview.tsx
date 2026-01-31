import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { AxisMode } from '../../data/RobotConfig';

const TICK_MS = 50;
const AUTO2_PAUSE_MS = 1000;

function auto1Update(base: number, dir: number, speed: number): { value: number; dir: number } {
  let value = base + dir * speed;
  let newDir = dir;
  if (value >= 1) {
    value = 1;
    newDir = -1;
  } else if (value <= -1) {
    value = -1;
    newDir = 1;
  }
  return { value, dir: newDir };
}

function auto2Update(
  base: number,
  dir: number,
  step: number,
  lastStepMs: number,
  nowMs: number
): { value: number; dir: number; lastStepMs: number } {
  if (nowMs - lastStepMs < AUTO2_PAUSE_MS) {
    return { value: base, dir, lastStepMs };
  }
  let value = base + dir * step;
  let newDir = dir;
  if (value >= 1) {
    value = 1;
    newDir = -1;
  } else if (value <= -1) {
    value = -1;
    newDir = 1;
  }
  return { value, dir: newDir, lastStepMs: nowMs };
}

type AimPreviewProps = {
  size: number;
  pan: number;
  tilt: number;
  panMode?: AxisMode;
  tiltMode?: AxisMode;
  panAuto1Speed?: number;
  panAuto2Step?: number;
  tiltAuto1Speed?: number;
  tiltAuto2Step?: number;
};

export function AimPreview({
  size,
  pan,
  tilt,
  panMode = 'LIVE',
  tiltMode = 'LIVE',
  panAuto1Speed = 0.035,
  panAuto2Step = 0.25,
  tiltAuto1Speed = 0.035,
  tiltAuto2Step = 0.25,
}: AimPreviewProps) {
  const [simulatedPan, setSimulatedPan] = useState(pan);
  const [simulatedTilt, setSimulatedTilt] = useState(tilt);
  const panDirRef = useRef(1);
  const tiltDirRef = useRef(1);
  const panLastStepRef = useRef(0);
  const tiltLastStepRef = useRef(0);

  useEffect(() => {
    if (panMode !== 'LIVE') setSimulatedPan(pan);
    if (tiltMode !== 'LIVE') setSimulatedTilt(tilt);
  }, [panMode, tiltMode, pan, tilt]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setSimulatedPan((prev) => {
        if (panMode === 'LIVE') return prev;
        const dir = panDirRef.current;
        if (panMode === 'AUTO1') {
          const { value, dir: newDir } = auto1Update(prev, dir, panAuto1Speed);
          panDirRef.current = newDir;
          return value;
        }
        const { value, dir: newDir, lastStepMs } = auto2Update(
          prev,
          dir,
          panAuto2Step,
          panLastStepRef.current,
          now
        );
        panDirRef.current = newDir;
        panLastStepRef.current = lastStepMs;
        return value;
      });
      setSimulatedTilt((prev) => {
        if (tiltMode === 'LIVE') return prev;
        const dir = tiltDirRef.current;
        if (tiltMode === 'AUTO1') {
          const { value, dir: newDir } = auto1Update(prev, dir, tiltAuto1Speed);
          tiltDirRef.current = newDir;
          return value;
        }
        const { value, dir: newDir, lastStepMs } = auto2Update(
          prev,
          dir,
          tiltAuto2Step,
          tiltLastStepRef.current,
          now
        );
        tiltDirRef.current = newDir;
        tiltLastStepRef.current = lastStepMs;
        return value;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [
    panMode,
    tiltMode,
    panAuto1Speed,
    panAuto2Step,
    tiltAuto1Speed,
    tiltAuto2Step,
  ]);

  const displayPan = panMode === 'LIVE' ? pan : simulatedPan;
  const displayTilt = tiltMode === 'LIVE' ? tilt : simulatedTilt;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  const p = Math.max(-1, Math.min(1, displayPan));
  const t = Math.max(-1, Math.min(1, displayTilt));
  const px = cx + p * radius;
  const py = cy + t * radius;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.box, { width: size, height: size }]}>
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
});
