import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { PresetsRepository, type WizardPreset } from '../../data/PresetsRepository';

type PresetsListModalProps = {
  visible: boolean;
  currentConfigSnapshot: unknown;
  onLoad: (preset: WizardPreset) => void;
  onClose: () => void;
};

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function PresetsListModal({
  visible,
  currentConfigSnapshot,
  onLoad,
  onClose,
}: PresetsListModalProps) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<WizardPreset[]>([]);

  useEffect(() => {
    if (!visible) return;
    PresetsRepository.getAll().then(setPresets);
  }, [visible]);

  const handleLoad = (preset: WizardPreset) => {
    onLoad(preset);
    onClose();
  };

  const handleOverwrite = (preset: WizardPreset) => {
    Alert.alert(
      t('wizard.presets.overwrite'),
      t('wizard.presets.confirmOverwrite', { name: preset.name }),
      [
        { text: t('wizard.presets.cancel'), style: 'cancel' },
        {
          text: t('wizard.presets.save'),
          onPress: async () => {
            await PresetsRepository.save(
              currentConfigSnapshot as WizardPreset['config'],
              preset.name,
              preset.id
            );
            PresetsRepository.getAll().then(setPresets);
          },
        },
      ]
    );
  };

  const handleDelete = (preset: WizardPreset) => {
    Alert.alert(
      t('wizard.presets.delete'),
      t('wizard.presets.confirmDelete', { name: preset.name }),
      [
        { text: t('wizard.presets.cancel'), style: 'cancel' },
        {
          text: t('wizard.presets.delete'),
          style: 'destructive',
          onPress: async () => {
            await PresetsRepository.delete(preset.id);
            PresetsRepository.getAll().then(setPresets);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('wizard.presets.listTitle')}</Text>
          {presets.length === 0 ? (
            <Text style={styles.empty}>{t('wizard.presets.empty')}</Text>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {presets.map((preset) => (
                <View key={preset.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {preset.name}
                    </Text>
                    <Text style={styles.rowDate}>
                      {formatDate(preset.updatedAt)}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleLoad(preset)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <MaterialCommunityIcons
                        name="folder-open"
                        size={22}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleOverwrite(preset)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <MaterialCommunityIcons
                        name="content-save"
                        size={22}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDelete(preset)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={22}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeLabel}>{t('wizard.presets.cancel')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  empty: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  rowDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  closeLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
