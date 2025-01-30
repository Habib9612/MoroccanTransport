import { useEffect, useRef } from 'react';
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
  const { toast } = useToast();

  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket(`ws://${window.location.host}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log('Connected to tracking server');
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
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to tracking server",
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onUpdate]);

  const sendUpdate = (update: TrackingUpdate) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(update));
    }
  };

  return { sendUpdate };
}
