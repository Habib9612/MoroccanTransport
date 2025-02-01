import { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface WebSocketMessage {
  type: string;
  data?: any;
  carriers?: Array<{
    id: number;
    location: [number, number];
    name: string;
  }>;
}

export function useWebSocket(path: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [carriers, setCarriers] = useState<WebSocketMessage['carriers']>([]);
  const [lastUpdate, setLastUpdate] = useState<WebSocketMessage['data']>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Handle Replit domain specifically
    const wsUrl = hostname.includes('.replit.dev')
      ? `${protocol}//${hostname.replace('00-', '')}${path}`
      : `${protocol}//${hostname}${port ? `:${port}` : ''}${path}`;

    console.log('Attempting WebSocket connection to:', wsUrl);

    wsRef.current = new ReconnectingWebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected to:', wsUrl);
      setIsConnected(true);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'carrier_locations':
            setCarriers(message.carriers);
            break;
          case 'load_update':
            setLastUpdate(message.data);
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [path]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return {
    isConnected,
    carriers,
    lastUpdate,
    sendMessage
  };
}