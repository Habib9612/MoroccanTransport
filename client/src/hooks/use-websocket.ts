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
      // Get the current protocol and hostname
      const isSecure = window.location.protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const port = window.location.port;

      // Normalize the hostname and port for different environments
      let wsUrl: string;
      const isReplit = hostname.includes('.repl.co') || hostname.includes('.replit.dev');
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      if (isReplit) {
        // For Replit environments, use the full hostname
        wsUrl = `${wsProtocol}//${hostname}${path}`;
      } else if (isLocalhost) {
        // For local development
        wsUrl = `${wsProtocol}//${hostname}:${port || '5000'}${path}`;
      } else {
        // For other hosts (production, staging, etc.)
        wsUrl = `${wsProtocol}//${hostname}${port ? `:${port}` : ''}${path}`;
      }

      console.log('Initializing WebSocket connection to:', wsUrl);

      // Initialize WebSocket with comprehensive error handling
      wsRef.current = new ReconnectingWebSocket(wsUrl, [], {
        maxRetries: 15,
        reconnectionDelayGrowFactor: 1.3,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        connectionTimeout: 4000,
        debug: process.env.NODE_ENV !== 'production',
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

      // Cleanup function
      return () => {
        console.log('Cleaning up WebSocket connection');
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setError('Failed to initialize WebSocket connection');
    }
  }, [path]);

  // Function to send messages with error handling
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