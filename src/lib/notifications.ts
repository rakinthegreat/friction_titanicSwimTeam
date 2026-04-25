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

export const scheduleFrictionNotifications = async (points: FrictionPoint[]) => {
  try {
    console.log('[WaitLess] Initializing friction notification scheduling...');
    
    // 1. Request permission if not granted
    const permission = await LocalNotifications.checkPermissions();
    console.log('[WaitLess] Current notification permissions:', JSON.stringify(permission));
    
    if (permission.display !== 'granted') {
      const request = await LocalNotifications.requestPermissions();
      console.log('[WaitLess] Requested permissions result:', JSON.stringify(request));
      if (request.display !== 'granted') {
        console.warn('[WaitLess] Notification permission denied by user');
        return;
      }
    }

    // 2. Create Android Channel
    if (Capacitor.getPlatform() === 'android') {
      console.log('[WaitLess] Creating Android notification channel: friction-alerts');
      await LocalNotifications.createChannel({
        id: 'friction-alerts',
        name: 'Friction Alerts',
        description: 'Notifications for your scheduled idle periods',
        importance: 5,
        visibility: 1,
        vibration: true,
      });
    }

    // 3. Clear all existing scheduled notifications
    const pendingBefore = await LocalNotifications.getPending();
    console.log(`[WaitLess] Pending notifications before clear: ${pendingBefore.notifications.length}`);
    
    if (pendingBefore.notifications.length > 0) {
      await LocalNotifications.cancel(pendingBefore);
      console.log('[WaitLess] Canceled all pending notifications');
    }

    // 4. Schedule new ones
    const notifications = points.flatMap(point => {
      const [hour, minute] = point.startTime.split(':').map(Number);
      
      return (point.days || [1, 2, 3, 4, 5]).map(day => {
        const id = stringToId(point.id, day);
        const logMsg = `Scheduling: ${point.label} (ID: ${id}) at ${hour}:${minute} on weekday ${day + 1}`;
        console.log(`[WaitLess] ${logMsg}`);
        
        return {
          id,
          title: `Wait Window: ${point.label}`,
          body: "You have some idle time. Ready for a quick learning session?",
          largeBody: `Your scheduled ${point.label} window has started. Why not spend 5 minutes on your interests?`,
          summaryText: "Time to WaitLess",
          channelId: 'friction-alerts',
          schedule: {
            on: {
              weekday: day + 1, // 1=Sunday, 2=Monday...
              hour,
              minute
            },
            repeats: true,
            allowWhileIdle: true
          },
          sound: 'beep.wav',
          extra: {
            frictionId: point.id,
            type: point.type
          }
        };
      });
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      const pendingAfter = await LocalNotifications.getPending();
      console.log(`[WaitLess] Success! Scheduled ${notifications.length} friction notifications. Verified pending: ${pendingAfter.notifications.length}`);
    } else {
      console.log('[WaitLess] No friction points to schedule');
    }
  } catch (error) {
    console.error('[WaitLess] Error during notification scheduling:', error);
  }
};

// Listen for notifications while app is active
LocalNotifications.addListener('localNotificationReceived', (notification) => {
  console.log('[WaitLess] Notification TRIGGERED and RECEIVED in foreground:', JSON.stringify(notification));
});

LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
  console.log('[WaitLess] Notification ACTION performed:', JSON.stringify(action));
});

export const NotificationService = {
  // ... (rest of the service remains the same)
  requestPermission: async () => {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      return await LocalNotifications.requestPermissions();
    }
    return permission;
  },
  sendNotification: async (title: string, body: string) => {
    try {
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'general-alerts',
          name: 'General Alerts',
          importance: 4,
        });
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            channelId: 'general-alerts',
            schedule: { at: new Date(Date.now() + 500) }
          }
        ]
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  },
  scheduleFrictionNotifications
};
