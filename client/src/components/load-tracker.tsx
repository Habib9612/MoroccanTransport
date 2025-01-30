import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SelectLoad } from "@db/schema";
import { Truck, MapPin } from "lucide-react";

interface LoadTrackerProps {
  load: SelectLoad;
}

export function LoadTracker({ load }: LoadTrackerProps) {
  // Calculate a simple progress based on status
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

        <Progress value={getProgress(load.status)} className="h-2" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status: {load.status}</span>
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