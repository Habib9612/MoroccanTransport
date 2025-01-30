import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TrackingUpdate {
  loadId: number;
  latitude: number;
  longitude: number;
  status?: string;
  message?: string;
}

export function useTracking(onUpdate: (update: TrackingUpdate) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Simplified tracking hook for future implementation
  const sendUpdate = (update: TrackingUpdate) => {
    toast({
      title: "Tracking Update",
      description: "Real-time tracking will be available soon.",
    });
  };

  return { 
    sendUpdate,
    isConnected: false
  };
}