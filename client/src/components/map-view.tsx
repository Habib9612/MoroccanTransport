import { Card } from "@/components/ui/card";
import { SelectLoad } from "@db/schema";
import { MapPin } from "lucide-react";

interface MapViewProps {
  loads: SelectLoad[];
}

export default function MapView({ loads }: MapViewProps) {
  return (
    <Card className="w-full p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Load Locations</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loads.map((load) => (
            <Card key={load.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Load #{load.id}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>From: {load.origin}</p>
                  <p>To: {load.destination}</p>
                  <p>Status: {load.status}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}