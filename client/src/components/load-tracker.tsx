import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SelectLoad } from "@db/schema";
import { Truck, MapPin } from "lucide-react";
import { useTracking } from '@/hooks/use-tracking';

interface LoadTrackerProps {
  load: SelectLoad;
}

export function LoadTracker({ load }: LoadTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(load.status);
  const [currentLocation, setCurrentLocation] = useState({
    lat: load.currentLat || load.originLat,
    lng: load.currentLng || load.originLng,
  });

  const handleUpdate = (update: any) => {
    if (update.loadId === load.id) {
      setCurrentLocation({
        lat: update.latitude,
        lng: update.longitude,
      });
      if (update.status) {
        setCurrentStatus(update.status);
      }
    }
  };

  const { isConnected } = useTracking(handleUpdate);

  // Calculate progress based on status
  const getProgress = (status: string) => {
    switch (status) {
      case 'booked': return 25;
      case 'in_transit': return 50;
      case 'delivered': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Load #{load.id} Status
          {isConnected && (
            <span className="text-xs text-green-500 ml-2">
              Live
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{load.origin}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{load.destination}</span>
          </div>
        </div>

        <Progress value={getProgress(currentStatus)} className="h-2" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status: {currentStatus}</span>
          {currentLocation.lat && currentLocation.lng && (
            <span className="text-muted-foreground">
              Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          )}
          {load.estimatedArrival && (
            <span className="text-muted-foreground">
              ETA: {new Date(load.estimatedArrival).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}