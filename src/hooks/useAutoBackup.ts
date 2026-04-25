'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';

/**
 * Mounts a timer that fires `syncWithFirebase` once per day at the
 * user-configured `autoBackupTime` (stored as "HH:MM" in 24-hour format).
 *
 * The hook polls every 60 seconds and triggers a sync when the current
 * local time (HH:MM) matches `autoBackupTime`.  A ref tracks whether the
 * backup already fired for the current minute so it won't double-fire if
 * the component re-renders within the same minute.
 */
export function useAutoBackup() {
  const uid = useUserStore((s) => s.uid);
  const autoBackupTime = useUserStore((s) => s.autoBackupTime);
  const syncWithFirebase = useUserStore((s) => s.syncWithFirebase);
  const lastAutoBackupMinute = useRef<string | null>(null);

  useEffect(() => {
    // Nothing to do when the user is not signed-in or hasn't set a time
    if (!uid || !autoBackupTime) return;

    const check = async () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentMinute = `${hh}:${mm}`;

      // Fire only once per matching minute
      if (currentMinute === autoBackupTime && lastAutoBackupMinute.current !== currentMinute) {
        lastAutoBackupMinute.current = currentMinute;
        try {
          await syncWithFirebase();
          console.log(`[AutoBackup] Backup completed at ${currentMinute}`);
        } catch (err) {
          console.error('[AutoBackup] Backup failed:', err);
        }
      }
    };

    // Check immediately in case the app was opened exactly at the target time
    check();

    const interval = setInterval(check, 60_000); // poll every minute
    return () => clearInterval(interval);
  }, [uid, autoBackupTime, syncWithFirebase]);
}
