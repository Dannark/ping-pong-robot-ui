import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { FeederMode } from '../../data/RobotConfig';
import { secondsPerRotation } from '../../data/feederCalibration';

const TICK_MS = 50;
const FEEDER_MIN_SPEED_TO_ROTATE = 60;

type FeederVisualizationProps = {
  size: number;
  feederMode: FeederMode;
  feederSpeed: number;
  feederOnMs?: number;
  feederOffMs?: number;
  animate?: boolean;
};

export function FeederVisualization({
  size,
  feederMode,
  feederSpeed,
  feederOnMs = 1000,
  feederOffMs = 1000,
  animate = true,
}: FeederVisualizationProps) {
  const [rotation, setRotation] = useState(0);
  const phaseRef = useRef<'on' | 'off'>('on');
  const phaseStartRef = useRef(Date.now());

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => {
      const now = Date.now();
      const tSec = secondsPerRotation(feederSpeed);
      const degPerTick =
        feederSpeed >= FEEDER_MIN_SPEED_TO_ROTATE
          ? (360 / (tSec * 1000)) * TICK_MS
          : 0;

      if (feederMode === 'CONT') {
        setRotation((r) => (r + degPerTick) % 360);
        return;
      }

      const elapsed = now - phaseStartRef.current;
      if (phaseRef.current === 'on') {
        setRotation((r) => (r + degPerTick) % 360);
        if (elapsed >= feederOnMs) {
          phaseRef.current = 'off';
          phaseStartRef.current = now;
        }
      } else {
        if (elapsed >= feederOffMs) {
          phaseRef.current = 'on';
          phaseStartRef.current = now;
        }
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [animate, feederMode, feederSpeed, feederOnMs, feederOffMs]);

  useEffect(() => {
    phaseRef.current = 'on';
    phaseStartRef.current = Date.now();
  }, [feederMode]);

  const borderWidth = 2;
  const innerSize = size - borderWidth * 2;
  const fanSize = Math.round(innerSize * 0.88);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
          },
        ]}
      >
        <View
          style={[
            styles.fanWrap,
            {
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="fan"
            size={fanSize}
            color={theme.colors.primary}
            style={styles.fan}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    overflow: 'hidden',
  },
  fanWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fan: {
    textAlign: 'center',
  },
});
