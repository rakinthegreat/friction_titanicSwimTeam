'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { pushToast } from '@/components/ui/ToastNotification';
import { NotificationService } from '@/lib/notifications';

/**
 * NotificationInitializer — polls every 30 s and fires both an in-app toast
 * AND a native browser/push notification when the current time matches 
 * a friction point's startTime on the correct day of the week.
 */
export const NotificationInitializer = () => {
  const frictionPoints = useUserStore((s) => s.frictionPoints);

  // Track which (id + date) combos have already fired today so we don't
  // spam the user if the component re-renders near the minute boundary.
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permissions on mount
    NotificationService.requestPermission().catch(console.error);
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hh}:${mm}`;
      const currentDay = now.getDay(); // 0 = Sun … 6 = Sat
      const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // DEBUG LOG
      console.log(`[FrictionCheck] Checking at ${currentTime} (Day: ${currentDay}). Points: ${frictionPoints.length}`);

      for (const point of frictionPoints) {
        console.log(`  - Checking point: ${point.label} | Days: [${point.days.join(',')}] | Start: ${point.startTime} | End: ${point.endTime}`);

        // Only fire on the configured days
        if (!point.days.includes(currentDay)) {
          console.log(`    SKIPPED: Day ${currentDay} not in [${point.days.join(',')}]`);
          continue;
        }

        // Fire at startTime
        if (point.startTime === currentTime) {
          console.log(`    MATCH START! firedRef has key? ${firedRef.current.has(`${point.id}-start-${today}`)}`);
          const key = `${point.id}-start-${today}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);

            console.log(`[FrictionTime] Triggered start: ${point.label} (${point.startTime})`);

            const title = `🕐 Friction time: ${point.label}`;
            const body = `Your "${point.label}" block just started — make the most of it!`;

            // 1. In-app UI Toast
            pushToast(title, body, '/');

            // 2. Native Browser Notification
            NotificationService.sendNotification(title, body);
          }
        }

        // Also fire a reminder at endTime
        if (point.endTime === currentTime) {
          const key = `${point.id}-end-${today}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);

            const title = `✅ Friction time ending: ${point.label}`;
            const body = `Your "${point.type}" block is wrapping up. Great job staying productive!`;

            // 1. In-app UI Toast
            pushToast(title, body, '/');

            // 2. Native Browser Notification
            NotificationService.sendNotification(title, body);
          }
        }
      }

      // Prune stale keys from previous days to keep the set small
      for (const key of firedRef.current) {
        if (!key.includes(today)) firedRef.current.delete(key);
      }
    };

    // Run once immediately in case the component mounts exactly at the right minute
    check();

    const interval = setInterval(check, 30_000); // every 30 seconds
    return () => clearInterval(interval);
  }, [frictionPoints]);

  return null;
};
