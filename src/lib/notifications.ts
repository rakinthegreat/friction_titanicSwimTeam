import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * General-purpose notification service.
 * Friction-time notifications have been removed — friction points are
 * still stored and editable in the profile, but they no longer trigger
 * any notifications on web or Android.
 */
export const NotificationService = {
  requestPermission: async () => {
    if (!Capacitor.isNativePlatform() && 'Notification' in window) {
      const res = await Notification.requestPermission();
      return { display: res === 'granted' ? 'granted' : 'denied' };
    }
    return await LocalNotifications.requestPermissions();
  },

  sendNotification: async (title: string, body: string) => {
    const isNative = Capacitor.isNativePlatform();
    try {
      if (isNative) {
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({ id: 'general', name: 'General', importance: 4 });
        }
        await LocalNotifications.schedule({
          notifications: [{ title, body, id: Date.now(), channelId: 'general', schedule: { at: new Date(Date.now() + 100) } }]
        });
      } else {
        // Web: try browser Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }
    } catch (e) {
      console.error('Notification failed', e);
    }
  },
};
