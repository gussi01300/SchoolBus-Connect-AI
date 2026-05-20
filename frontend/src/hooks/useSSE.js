import { useEffect, useRef, useState } from 'react';

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

export function useSSE(url, onMessage, { onError } = {}) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const urlRef = useRef(url);

  useEffect(() => {
    urlRef.current = url;
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [url]);

  function connect() {
    if (!urlRef.current) return;

    if (eventSourceRef.current) eventSourceRef.current.close();

    const eventSource = new EventSource(urlRef.current);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      backoffRef.current = INITIAL_BACKOFF_MS;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.warn('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      if (onError) onError();
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
    backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
    reconnectTimeoutRef.current = setTimeout(connect, delay);
  }

  return { connected };
}