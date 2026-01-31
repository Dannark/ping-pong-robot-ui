import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import i18n from '../i18n';

const TRAINING_COMPLETE_CHANNEL_ID = 'training-complete';

/**
 * Garante que o canal Android existe e que a permissão iOS foi pedida.
 * Chamado antes de exibir qualquer notificação.
 */
async function ensureReady(): Promise<string | undefined> {
  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
    return undefined;
  }
  await notifee.createChannel({
    id: TRAINING_COMPLETE_CHANNEL_ID,
    name: 'Training',
    sound: 'default',
  });
  return TRAINING_COMPLETE_CHANNEL_ID;
}

/**
 * Pede permissão de notificações ao utilizador (iOS mostra o diálogo do sistema).
 * Deve ser chamado quando o utilizador ativa "Aviso sonoro ao terminar", para que
 * o pedido faça sentido no contexto.
 */
export async function requestNotificationPermission(): Promise<void> {
  try {
    await ensureReady();
  } catch (e) {
    if (__DEV__) {
      console.warn('Request notification permission failed:', e);
    }
  }
}

/**
 * Exibe uma notificação local "Treino concluído" (útil quando o app está
 * em segundo plano ou o ecrã está bloqueado). Funciona em iOS e Android.
 * No iOS é necessário que o utilizador tenha concedido permissão de notificações.
 */
export async function showTrainingCompleteNotification(): Promise<void> {
  try {
    const channelId = await ensureReady();
    const title = i18n.t('trainingComplete.title');
    const body = i18n.t('trainingComplete.subtitle');

    await notifee.displayNotification({
      id: 'training-complete',
      title,
      body,
      ...(Platform.OS === 'android' &&
        channelId && {
          android: {
            channelId,
            pressAction: { id: 'default' },
          },
        }),
    });
  } catch (e) {
    if (__DEV__) {
      console.warn('Local notification failed:', e);
    }
  }
}
