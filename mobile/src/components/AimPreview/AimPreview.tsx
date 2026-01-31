import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type AimPreviewProps = {
  size: number;
  pan: number;
  tilt: number;
};

export function AimPreview({ size, pan, tilt }: AimPreviewProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  const p = Math.max(-1, Math.min(1, pan));
  const t = Math.max(-1, Math.min(1, tilt));
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
