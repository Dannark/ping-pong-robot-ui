import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { FeederMode } from '../../data/RobotConfig';

const TICK_MS = 50;
const DEG_PER_TICK_BASE = 8;

type FeederVisualizationProps = {
  size: number;
  feederMode: FeederMode;
  feederSpeed: number;
  feederP1OnMs?: number;
  feederP1OffMs?: number;
  feederP2OnMs?: number;
  feederP2OffMs?: number;
  animate?: boolean;
};

export function FeederVisualization({
  size,
  feederMode,
  feederSpeed,
  feederP1OnMs = 1000,
  feederP1OffMs = 1000,
  feederP2OnMs = 2000,
  feederP2OffMs = 2000,
  animate = true,
}: FeederVisualizationProps) {
  const [rotation, setRotation] = useState(0);
  const phaseRef = useRef<'on' | 'off'>('on');
  const phaseStartRef = useRef(Date.now());

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = (feederSpeed / 255) * DEG_PER_TICK_BASE;

      if (feederMode === 'CONT') {
        setRotation((r) => (r + delta) % 360);
        return;
      }

      if (feederMode === 'P1/1') {
        const elapsed = now - phaseStartRef.current;
        if (phaseRef.current === 'on') {
          setRotation((r) => (r + delta) % 360);
          if (elapsed >= feederP1OnMs) {
            phaseRef.current = 'off';
            phaseStartRef.current = now;
          }
        } else {
          if (elapsed >= feederP1OffMs) {
            phaseRef.current = 'on';
            phaseStartRef.current = now;
          }
        }
        return;
      }

      if (feederMode === 'P2/2') {
        const elapsed = now - phaseStartRef.current;
        if (phaseRef.current === 'on') {
          setRotation((r) => (r + delta) % 360);
          if (elapsed >= feederP2OnMs) {
            phaseRef.current = 'off';
            phaseStartRef.current = now;
          }
        } else {
          if (elapsed >= feederP2OffMs) {
            phaseRef.current = 'on';
            phaseStartRef.current = now;
          }
        }
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [
    animate,
    feederMode,
    feederSpeed,
    feederP1OnMs,
    feederP1OffMs,
    feederP2OnMs,
    feederP2OffMs,
  ]);

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
