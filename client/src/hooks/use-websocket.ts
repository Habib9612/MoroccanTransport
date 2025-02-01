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
  error?: string;
  timestamp?: string;
}

export function useWebSocket(path: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [carriers, setCarriers] = useState<WebSocketMessage['carriers']>([]);
  const [lastUpdate, setLastUpdate] = useState<WebSocketMessage['data']>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const isReplit = host.includes('.repl.co') || host.includes('.replit.dev');

      // For Replit deployments, use the same host
      // For local development, connect to port 5000
      const wsUrl = isReplit
        ? `${protocol}//${host}${path}`
        : `${protocol}//${window.location.hostname}:5000${path}`;

      console.log('Connecting WebSocket to:', wsUrl);

      wsRef.current = new ReconnectingWebSocket(wsUrl, [], {
        maxRetries: 15,
        reconnectionDelayGrowFactor: 1.3,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        connectionTimeout: 4000,
        debug: process.env.NODE_ENV === 'development',
      });

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        setError('Connection closed. Attempting to reconnect...');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received message:', message);

          switch (message.type) {
            case 'connection_established':
              console.log('Connection confirmed:', message.timestamp);
              break;
            case 'carrier_locations':
              if (Array.isArray(message.carriers)) {
                setCarriers(message.carriers);
              }
              break;
            case 'load_update':
              setLastUpdate(message.data);
              break;
            case 'error':
              setError(message.error || 'Unknown error occurred');
              break;
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to process message:', error);
          setError('Failed to process server message');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setError('Failed to initialize WebSocket connection');
    }
  }, [path]);

  const sendMessage = (message: any) => {
    if (!wsRef.current) {
      setError('WebSocket not initialized');
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  return {
    isConnected,
    carriers,
    lastUpdate,
    error,
    sendMessage
  };
}