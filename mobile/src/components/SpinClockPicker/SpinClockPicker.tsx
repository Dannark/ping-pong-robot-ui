import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { SpinDirection } from '../../data/RobotConfig';
import { SPIN_DIRECTIONS, spinDirectionToAngleDeg } from '../../data/RobotConfig';


type SpinClockPickerProps = {
  size: number;
  value: SpinDirection;
  onSelect: (dir: SpinDirection) => void;
};

const DEG = Math.PI / 180;

function positionForAngle(angleDeg: number, radius: number, center: number) {
  const rad = (angleDeg - 90) * DEG;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

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
          return (
            <TouchableOpacity
              key={dir}
              style={[
                styles.labelTouch,
                {
                  left: pos.x - 18,
                  top: pos.y - 14,
                  width: 36,
                  height: 28,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onSelect(dir)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.labelText,
                  { color: isSelected ? theme.colors.background : theme.colors.text },
                ]}
              >
                {dir}
              </Text>
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
          <Text
            style={[
              styles.labelText,
              { color: value === 'NONE' ? theme.colors.background : theme.colors.text },
            ]}
          >
            NONE
          </Text>
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
  labelText: {
    ...theme.typography.label,
    fontSize: 11,
  },
});
