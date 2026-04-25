import { LocalNotifications } from '@capacitor/local-notifications';
import { FrictionPoint } from '@/store/userStore';
import { Capacitor } from '@capacitor/core';

const stringToId = (str: string, suffix = 0) => {
  let hash = 0;
  const combined = str + suffix;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Web Fallback Timer Storage
let webTimers: any[] = [];

export const scheduleFrictionNotifications = async (points: FrictionPoint[]) => {
  try {
    const isNative = Capacitor.isNativePlatform();
    console.log(`[WaitLess] Initializing scheduling (Native: ${isNative})`);
    
    // 1. Permissions
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted' && isNative) {
      await LocalNotifications.requestPermissions();
    }

    // 2. Clear existing
    if (isNative) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } else {
      webTimers.forEach(t => clearTimeout(t));
      webTimers = [];
    }

    // 3. Schedule next occurrences
    const now = new Date();

    points.forEach(point => {
      const [hour, minute] = point.startTime.split(':').map(Number);
      
      // Calculate the next occurrence
      // We check today and the next 7 days
      for (let i = 0; i < 7; i++) {
        const target = new Date();
        target.setDate(now.getDate() + i);
        target.setHours(hour, minute, 0, 0);

        const day = target.getDay();
        if ((point.days || [0,1,2,3,4,5,6]).includes(day)) {
          // If it's today but already passed, skip to next day
          if (i === 0 && target.getTime() <= now.getTime()) continue;

          if (isNative) {
            // "Meditation Pathway": Use exact 'at' timestamp for reliability
            LocalNotifications.schedule({
              notifications: [{
                id: stringToId(point.id, day),
                title: `Wait Window: ${point.label}`,
                body: "You have some idle time. Ready for a quick learning session?",
                channelId: 'friction-alerts',
                schedule: { 
                  at: target,
                  allowWhileIdle: true 
                }
              }]
            });
          } else {
            // Web Fallback
            const delay = target.getTime() - now.getTime();
            if (delay > 0 && delay < 86400000) { // Only set timers for the next 24h on web
              console.log(`[WaitLess Web] Setting timer for ${point.label} in ${Math.round(delay/1000)}s`);
              const timer = setTimeout(() => {
                NotificationService.sendNotification(
                  `Wait Window: ${point.label}`,
                  "Time for a quick learning session!"
                );
              }, delay);
              webTimers.push(timer);
            }
          }
          // Only schedule the NEXT occurrence per point to keep the queue clean
          break; 
        }
      }
    });

    console.log(`[WaitLess] ${isNative ? 'Native alarms' : 'Web timers'} updated for ${points.length} points.`);
  } catch (error) {
    console.error('[WaitLess] Scheduling Error:', error);
  }
};

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
        // Web Notification Fallback
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        } else {
          alert(`${title}\n\n${body}`);
        }
      }
    } catch (e) {
      console.error('Notification failed', e);
    }
  },
  scheduleFrictionNotifications
};
