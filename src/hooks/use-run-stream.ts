'use client';

import { useEffect, useRef, useState } from 'react';

interface StreamState {
  /** Base64 PNG screenshot from the stream */
  screenshot: string | null;
  /** Whether the SSE connection is active */
  connected: boolean;
  /** Error message if stream failed */
  error: string | null;
}

/**
 * Connects to the Skyvern screenshot stream via our SSE proxy.
 * Only active when `enabled` is true (run is active).
 */
export function useRunStream(runId: string, enabled: boolean): StreamState {
  const [state, setState] = useState<StreamState>({
    screenshot: null,
    connected: false,
    error: null,
  });
  const closedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !runId) {
      setState({ screenshot: null, connected: false, error: null });
      return;
    }

    closedRef.current = false;
    const es = new EventSource(`/api/skyvern/stream/${runId}`);

    es.onmessage = (event) => {
      if (closedRef.current) return;
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setState((prev) => ({ ...prev, error: data.error, connected: false }));
          closedRef.current = true;
          es.close();
          return;
        }

        if (data.connected) {
          setState((prev) => ({ ...prev, connected: true }));
          return;
        }

        // Final status — run finished
        if (
          ['completed', 'failed', 'terminated', 'canceled', 'cancelled', 'timed_out', 'timeout', 'not_found'].includes(
            data.status,
          ) && !data.screenshot
        ) {
          closedRef.current = true;
          es.close();
          return;
        }

        if (data.screenshot) {
          setState((prev) => ({
            ...prev,
            screenshot: data.screenshot,
            connected: true,
          }));
        }
      } catch {
        // skip malformed events
      }
    };

    es.onerror = () => {
      if (closedRef.current) return;
      setState((prev) => ({ ...prev, connected: false }));
      // Close after error — don't let EventSource auto-reconnect endlessly
      closedRef.current = true;
      es.close();
      setState((prev) => ({ ...prev, error: 'disconnected' }));
    };

    return () => {
      closedRef.current = true;
      es.close();
    };
  }, [runId, enabled]);

  return state;
}
