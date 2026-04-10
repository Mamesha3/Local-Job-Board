'use client';

import { useEffect } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtime';

export function RealtimeNotifications() {
  useEffect(() => {
    console.log('[RealtimeNotifications] Component mounted');
  }, []);

  useRealtimeNotifications();
  return null;
}
