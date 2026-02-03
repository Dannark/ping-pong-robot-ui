import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { FeederMode } from '../../data/RobotConfig';

const GRAPH_HEIGHT = 20;
/** 1 segmento = 0.25 s (250 ms), igual ao step mínimo; 32 segmentos = 8 s no gráfico (mais repetições) */
const MS_PER_SEGMENT = 250;
const SEGMENTS = 32;

type FeederModeGraphProps = {
  feederMode: FeederMode;
  onMs: number;
  offMs: number;
  width?: number;
};

/**
 * Gráfico tipo onda quadrada. CONT = barra cheia.
 * P1/1, P2/1, P2/2, CUSTOM: cada segmento = 250 ms; 32 segmentos = 8 s (mais repetições visíveis).
 * P1/1: 4+4+4+4…; P2/2: 8+8+8+8…; mesma largura, mais “espaço” para ver o padrão.
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

  const segments: { on: boolean }[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const t = (i * MS_PER_SEGMENT) % cycleMs;
    segments.push({ on: t < onMs });
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.row}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { flex: 1, minWidth: 2 },
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
