import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { FeederMode } from '../../data/RobotConfig';

const GRAPH_HEIGHT = 20;
const NUM_CYCLES = 3;

type FeederModeGraphProps = {
  feederMode: FeederMode;
  onMs: number;
  offMs: number;
  width?: number;
};

/**
 * Gráfico tipo onda quadrada: __|   |__|   |__
 * CONT = barra cheia; P1/1, P2/1, P2/2, CUSTOM = ciclos on (alto) / off (baixo).
 */
export function FeederModeGraph({
  feederMode,
  onMs,
  offMs,
  width = 160,
}: FeederModeGraphProps) {
  if (feederMode === 'CONT') {
    return (
      <View style={[styles.container, { width }]}>
        <View style={[styles.bar, styles.barOn, { width }]} />
      </View>
    );
  }

  const cycleMs = onMs + offMs;
  if (cycleMs <= 0) {
    return <View style={[styles.container, { width }]} />;
  }

  const onRatio = onMs / cycleMs;
  const offRatio = offMs / cycleMs;
  const segmentCount = NUM_CYCLES * 2;
  const segmentWidth = width / segmentCount;

  const segments: { on: boolean; flex: number }[] = [];
  for (let i = 0; i < NUM_CYCLES; i++) {
    segments.push({ on: true, flex: onRatio });
    segments.push({ on: false, flex: offRatio });
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.row}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { flex: seg.flex, minWidth: 2 },
              seg.on ? styles.barOn : styles.barOff,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: GRAPH_HEIGHT,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    height: GRAPH_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  bar: {
    height: GRAPH_HEIGHT,
    borderRadius: 4,
  },
  barOn: {
    backgroundColor: theme.colors.primary,
  },
  barOff: {
    backgroundColor: theme.colors.primaryMuted,
  },
});
