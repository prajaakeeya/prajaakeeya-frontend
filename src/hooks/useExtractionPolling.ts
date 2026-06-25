import { useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

// H-PERF-5: poll every 30s instead of 5s. The admin dashboard does not need
// second-by-second freshness, and 5s amounted to ~17k requests/day per open
// tab. Same endpoint, same onUpdate contract — only the cadence changes.
const POLL_INTERVAL_MS = 30_000;

const useExtractionPolling = (onUpdate: (data: unknown) => void) => {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Guard the poll so a transient failure doesn't surface as an unhandled
    // promise rejection. Polling continues regardless; onUpdate is unchanged.
    const poll = async () => {
      // H-PERF-5: skip the request entirely while the tab is backgrounded.
      // A dashboard left open in another tab would otherwise keep hitting the
      // API for data nobody is looking at. We refetch immediately on return
      // (visibilitychange handler below), so data is never stale when viewed.
      if (document.visibilityState !== 'visible') return;
      try {
        const { data } = await apiClient.get('/admin/dashboard');
        onUpdate(data);
      } catch (err) {
        console.warn('[useExtractionPolling] poll failed', err);
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    // Refresh as soon as the tab becomes visible again, so a user returning to
    // a backgrounded dashboard sees current data without waiting for the next
    // 30s tick.
    const onVisible = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [onUpdate]);
};

export default useExtractionPolling;
