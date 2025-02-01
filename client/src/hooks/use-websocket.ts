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

    // Handle various Replit domain patterns
    const wsUrl = hostname.endsWith('.replit.dev')
      ? `${protocol}//${hostname}${path}`
      : hostname.includes('.repl.co')
      ? `${protocol}//${hostname}${path}`
      : `${protocol}//${hostname}${port ? `:${port}` : ''}${path}`;

    console.log('Attempting WebSocket connection to:', wsUrl);

    wsRef.current = new ReconnectingWebSocket(wsUrl, [], {
      maxRetries: 5,
      reconnectionDelayGrowFactor: 1.3,
      maxReconnectionDelay: 30000,
      minReconnectionDelay: 1000,
      debug: true,
    });

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
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
      }
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