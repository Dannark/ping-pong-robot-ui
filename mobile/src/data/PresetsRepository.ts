import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RobotConfig } from './RobotConfig';

const PRESETS_KEY = '@PingPongRobot/wizardPresets';

export type WizardPreset = {
  id: string;
  name: string;
  config: RobotConfig;
  updatedAt: number;
};

type Listener = (presets: WizardPreset[]) => void;
const listeners = new Set<Listener>();

function notify(presets: WizardPreset[]) {
  const snapshot = [...presets];
  listeners.forEach((fn) => fn(snapshot));
}

async function readPresets(): Promise<WizardPreset[]> {
  try {
    const raw = await AsyncStorage.getItem(PRESETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WizardPreset[];
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (p) =>
              p &&
              typeof p.id === 'string' &&
              typeof p.name === 'string' &&
              p.config &&
              typeof p.updatedAt === 'number'
          )
          .sort((a, b) => b.updatedAt - a.updatedAt);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

async function writePresets(presets: WizardPreset[]): Promise<void> {
  await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  notify(presets);
}

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const PresetsRepository = {
  async getAll(): Promise<WizardPreset[]> {
    return readPresets();
  },

  async getById(id: string): Promise<WizardPreset | null> {
    const presets = await readPresets();
    return presets.find((p) => p.id === id) ?? null;
  },

  async save(config: RobotConfig, name: string, existingId?: string): Promise<WizardPreset> {
    const presets = await readPresets();
    const now = Date.now();
    if (existingId) {
      const idx = presets.findIndex((p) => p.id === existingId);
      const updated: WizardPreset = {
        id: existingId,
        name: (name.trim() || presets[idx]?.name) ?? 'Preset',
        config: { ...config },
        updatedAt: now,
      };
      if (idx >= 0) {
        presets[idx] = updated;
      } else {
        presets.unshift(updated);
      }
      await writePresets(presets);
      return updated;
    }
    const existingByName = presets.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (existingByName) {
      const updated: WizardPreset = {
        ...existingByName,
        name: name.trim(),
        config: { ...config },
        updatedAt: now,
      };
      const idx = presets.findIndex((p) => p.id === existingByName.id);
      if (idx >= 0) presets[idx] = updated;
      await writePresets(presets);
      return updated;
    }
    const newPreset: WizardPreset = {
      id: generateId(),
      name: name.trim() || 'Preset',
      config: { ...config },
      updatedAt: now,
    };
    presets.unshift(newPreset);
    await writePresets(presets);
    return newPreset;
  },

  async delete(id: string): Promise<void> {
    const presets = await readPresets();
    const filtered = presets.filter((p) => p.id !== id);
    if (filtered.length !== presets.length) {
      await writePresets(filtered);
    }
  },

  subscribe(fn: Listener): () => void {
    readPresets().then((list) => {
      fn(list);
    });
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
