import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  async requestPermission() {
    console.log('[NotificationService] Requesting permission...');
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      console.log('[NotificationService] Mobile permission status:', status);
      return status.display === 'granted';
    } else {
      if (!('Notification' in window)) {
        console.warn('[NotificationService] Browser does not support notifications');
        return false;
      }
      const permission = await Notification.requestPermission();
      console.log('[NotificationService] Web permission status:', permission);
      return permission === 'granted';
    }
  },

  async sendNotification(title: string, body: string) {
    console.log(`[NotificationService] Sending: ${title}`);
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 10000),
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
            },
          ],
        });
      } catch (err) {
        console.error('[NotificationService] Mobile notification failed:', err);
      }
    } else {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification(title, { body });
          } catch (err) {
            console.error('[NotificationService] Web notification failed:', err);
          }
        } else {
          console.warn('[NotificationService] Web permission not granted. Status:', Notification.permission);
          // Try requesting again if it's default
          if (Notification.permission === 'default') {
            const res = await this.requestPermission();
            if (res) new Notification(title, { body });
          }
        }
      }
    }
  },
};
