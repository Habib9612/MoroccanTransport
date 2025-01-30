import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TrackingUpdate {
  loadId: number;
  latitude: number;
  longitude: number;
  status?: string;
  message?: string;
}

export function useTracking(onUpdate: (update: TrackingUpdate) => void) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    try {
      const socket = new WebSocket(`ws://${window.location.host}`);
      ws.current = socket;

      socket.onopen = () => {
        console.log('Connected to tracking server');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        toast({
          title: "Connected",
          description: "Real-time tracking is now active",
        });
      };

      socket.onmessage = (event) => {
        try {
          const update: TrackingUpdate = JSON.parse(event.data);
          onUpdate(update);
        } catch (error) {
          console.error('Error processing tracking update:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;

          toast({
            title: "Connection Lost",
            description: `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`,
          });

          setTimeout(connect, delay);
        } else {
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not establish connection to tracking server. Please refresh the page.",
          });
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendUpdate = (update: TrackingUpdate) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(update));
    } else {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Cannot send update: not connected to tracking server",
      });
    }
  };

  return { 
    sendUpdate,
    isConnected 
  };
}