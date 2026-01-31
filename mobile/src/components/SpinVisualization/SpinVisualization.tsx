import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { SpinDirection } from '../../data/RobotConfig';
import {
  spinDirectionToAngleDeg,
  getLauncherMotorSpeeds,
} from '../../data/RobotConfig';

const DEG = Math.PI / 180;


function positionFromTop(angleDeg: number, radius: number, center: number) {
  const rad = angleDeg * DEG;
  return {
    x: center + radius * Math.sin(rad),
    y: center - radius * Math.cos(rad),
  };
}

const MOTOR_ANGLES = [0, 120, 240];
const MOTOR_RADIUS_RATIO = 0.72;
const RING_RADIUS_RATIO = 0.88;

type SpinVisualizationProps = {
  size: number;
  spinDirection: SpinDirection;
  spinIntensity: number;
  launcherPower: number;
  animate?: boolean;
};

export function SpinVisualization({
  size,
  spinDirection,
  spinIntensity,
  launcherPower,
  animate = true,
}: SpinVisualizationProps) {
  const center = size / 2;
  const baseRadius = size / 2 - 4;
  const motorRadius = baseRadius * MOTOR_RADIUS_RATIO;
  const ringRadius = baseRadius * RING_RADIUS_RATIO;
  const motorDotSize = 8;
  const arrowSize = 24;

  const { speed1, speed2, speed3 } = getLauncherMotorSpeeds(
    launcherPower,
    spinDirection,
    spinIntensity
  );
  const avgSpeed = (Math.abs(speed1) + Math.abs(speed2) + Math.abs(speed3)) / 3;
  const hasSpin = spinDirection !== 'NONE' && spinIntensity > 0;

  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate || !hasSpin) {
      rotationAnim.setValue(0);
      return;
    }
    rotationAnim.setValue(0);
    const duration = Math.max(400, 2500 - (avgSpeed / 255) * 2000);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate, hasSpin, avgSpeed, rotationAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const arrowAngle = spinDirectionToAngleDeg(spinDirection);
  const arrowIcon = spinDirection === 'NONE' ? 'circle-outline' : 'arrow-up';
  const arrowRotate = arrowAngle >= 0 ? `${arrowAngle}deg` : '0deg';

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
        {hasSpin && (
          <Animated.View
            style={[
              styles.ring,
              {
                width: ringRadius * 2,
                height: ringRadius * 2,
                borderRadius: ringRadius,
                left: center - ringRadius,
                top: center - ringRadius,
                borderWidth: 2,
                borderColor: theme.colors.primaryMuted,
                transform: [{ rotate: rotation }],
              },
            ]}
          />
        )}
        {MOTOR_ANGLES.map((angle, i) => {
          const pos = positionFromTop(angle, motorRadius, center);
          const speed = [speed1, speed2, speed3][i];
          const isReverse = speed < 0;
          return (
            <View
              key={angle}
              style={[
                styles.motorDot,
                {
                  width: motorDotSize,
                  height: motorDotSize,
                  borderRadius: motorDotSize / 2,
                  left: pos.x - motorDotSize / 2,
                  top: pos.y - motorDotSize / 2,
                  backgroundColor: isReverse
                    ? theme.colors.warning
                    : theme.colors.primary,
                  opacity: 0.4 + (Math.abs(speed) / 255) * 0.6,
                },
              ]}
            />
          );
        })}
        <View
          style={[
            styles.centerArrow,
            {
              left: center - arrowSize / 2,
              top: center - arrowSize / 2,
              width: arrowSize,
              height: arrowSize,
              transform: [{ rotate: arrowRotate }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={arrowIcon as any}
            size={arrowSize}
            color={spinDirection === 'NONE' ? theme.colors.textSecondary : theme.colors.primary}
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
  outer: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  motorDot: {
    position: 'absolute',
  },
  centerArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
