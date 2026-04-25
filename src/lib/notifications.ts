import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FrictionPoint } from '@/store/userStore';

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
          notifications: [{ title, body, id: Math.floor(Math.random() * 1000000), channelId: 'general', schedule: { at: new Date(Date.now() + 100) } }]
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

  scheduleFrictionNotifications: async (points: FrictionPoint[]) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Cancel all previous notifications to avoid duplicates
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notifications: any[] = [];
      let idCounter = 1;

      points.forEach(point => {
        const [startH, startM] = point.startTime.split(':').map(Number);
        const [endH, endM] = point.endTime.split(':').map(Number);

        point.days.forEach(day => {
          // Capacitor weekday: 1 (Sun) to 7 (Sat)
          // Our day: 0 (Sun) to 6 (Sat)
          const capacitorDay = day + 1;

          // Start notification
          notifications.push({
            id: idCounter++,
            title: `🕐 Friction time: ${point.label}`,
            body: `Your "${point.label}" block just started — make the most of it!`,
            channelId: 'general',
            schedule: {
              on: { weekday: capacitorDay, hour: startH, minute: startM },
              repeats: true,
              allowWhileIdle: true
            }
          });

          // End notification
          notifications.push({
            id: idCounter++,
            title: `✅ Friction time ending: ${point.label}`,
            body: `Your "${point.label}" block is wrapping up. Great job staying productive!`,
            channelId: 'general',
            schedule: {
              on: { weekday: capacitorDay, hour: endH, minute: endM },
              repeats: true,
              allowWhileIdle: true
            }
          });
        });
      });

      if (notifications.length > 0) {
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({ id: 'general', name: 'General', importance: 4 });
        }
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error('Failed to schedule native notifications', e);
    }
  }
};
