import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { SpinDirection } from '../../data/RobotConfig';
import { SPIN_DIRECTIONS, spinDirectionToAngleDeg } from '../../data/RobotConfig';

type SpinClockPickerProps = {
  size: number;
  value: SpinDirection;
  onSelect: (dir: SpinDirection) => void;
};

const DEG = Math.PI / 180;

const SPIN_ARROW_ICONS: Record<Exclude<SpinDirection, 'NONE'>, string> = {
  N: 'arrow-up',
  NE: 'arrow-top-right',
  E: 'arrow-right',
  SE: 'arrow-bottom-right',
  S: 'arrow-down',
  SW: 'arrow-bottom-left',
  W: 'arrow-left',
  NW: 'arrow-top-left',
};

function positionForAngle(angleDeg: number, radius: number, center: number) {
  const rad = (angleDeg - 90) * DEG;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

const TOUCH_SIZE = 36;
const ICON_SIZE = 22;

export function SpinClockPicker({ size, value, onSelect }: SpinClockPickerProps) {
  const center = size / 2;
  const labelRadius = size / 2 - 28;

  const directionsToShow = SPIN_DIRECTIONS.filter((d) => d !== 'NONE');

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.clock, { width: size, height: size }]}>
        {directionsToShow.map((dir) => {
          const angle = spinDirectionToAngleDeg(dir);
          const pos = positionForAngle(angle, labelRadius, center);
          const isSelected = value === dir;
          const iconName = SPIN_ARROW_ICONS[dir];
          return (
            <TouchableOpacity
              key={dir}
              style={[
                styles.labelTouch,
                {
                  left: pos.x - TOUCH_SIZE / 2,
                  top: pos.y - TOUCH_SIZE / 2,
                  width: TOUCH_SIZE,
                  height: TOUCH_SIZE,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onSelect(dir)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={ICON_SIZE}
                color={isSelected ? theme.colors.background : theme.colors.text}
              />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[
            styles.centerTouch,
            {
              left: center - 22,
              top: center - 14,
              width: 44,
              height: 28,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: value === 'NONE' ? theme.colors.primary : theme.colors.surfaceElevated,
              borderWidth: 1,
              borderColor: value === 'NONE' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => onSelect('NONE')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="circle-outline"
            size={16}
            color={value === 'NONE' ? theme.colors.background : theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clock: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceElevated,
    position: 'relative',
  },
  labelTouch: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTouch: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
