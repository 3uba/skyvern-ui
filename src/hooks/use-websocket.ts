'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketManager } from '@/lib/ws/websocket-manager';

export function useWebSocket(url: string | null) {
  const managerRef = useRef<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    if (!url) return;

    const manager = WebSocketManager.getInstance(url);
    managerRef.current = manager;

    const unsubConnected = manager.on('connected', () => setIsConnected(true));
    const unsubDisconnected = manager.on('disconnected', () => setIsConnected(false));
    const unsubMessage = manager.on('message', (data) => setLastMessage(data));

    manager.connect();

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubMessage();
      manager.disconnect();
    };
  }, [url]);

  const send = useCallback((data: unknown) => {
    managerRef.current?.send(data);
  }, []);

  return { isConnected, lastMessage, send };
}
