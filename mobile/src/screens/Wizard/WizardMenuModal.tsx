import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

type WizardMenuModalProps = {
  visible: boolean;
  onSaveAsPreset: () => void;
  onManagePresets: () => void;
  onClose: () => void;
};

export function WizardMenuModal({
  visible,
  onSaveAsPreset,
  onManagePresets,
  onClose,
}: WizardMenuModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuWrap}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.menu}
          >
            <Text style={styles.menuTitle}>{t('wizard.presets.menuTitle')}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onSaveAsPreset();
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={22}
                color={theme.colors.primary}
              />
              <Text style={styles.menuItemLabel}>
                {t('wizard.presets.saveAs')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onManagePresets();
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="folder-multiple-outline"
                size={22}
                color={theme.colors.primary}
              />
              <Text style={styles.menuItemLabel}>
                {t('wizard.presets.manage')}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuWrap: {
    position: 'absolute',
    top: 56,
    right: theme.spacing.md,
    minWidth: 220,
  },
  menu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
    ...theme.shadow.lg,
  },
  menuTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItemLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
});
