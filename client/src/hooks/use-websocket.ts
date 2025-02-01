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
      // Get the current protocol and host
      const isSecure = window.location.protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';

      // In development, CRA runs on port 3000 and proxies to backend
      // In production, we use the same host
      let wsUrl: string;
      if (process.env.NODE_ENV === 'development') {
        // Use the same host but different port for WebSocket in development
        const host = window.location.hostname;
        wsUrl = `${wsProtocol}//${host}:5000${path}`;
      } else {
        // In production, use the same host
        wsUrl = `${wsProtocol}//${window.location.host}${path}`;
      }

      console.log('Initializing WebSocket connection to:', wsUrl);

      wsRef.current = new ReconnectingWebSocket(wsUrl, [], {
        maxRetries: 15,
        reconnectionDelayGrowFactor: 1.3,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        connectionTimeout: 4000,
        debug: process.env.NODE_ENV === 'development',
      });

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        setIsConnected(false);
        setError('Connection closed. Attempting to reconnect...');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);

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
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
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
      console.error('Error setting up WebSocket:', error);
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
      console.error('Error sending message:', error);
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