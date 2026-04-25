'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { scheduleFrictionNotifications } from '@/lib/notifications';

export const NotificationInitializer = () => {
  const frictionPoints = useUserStore((state) => state.frictionPoints);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && frictionPoints.length > 0) {
      scheduleFrictionNotifications(frictionPoints);
    }
  }, [_hasHydrated, frictionPoints]);

  return null; // This component doesn't render anything
};
