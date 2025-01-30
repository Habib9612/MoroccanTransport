import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectLoad } from "@db/schema";
import { MapPin, Calendar, Weight, Truck } from "lucide-react";
import { format } from "date-fns";

interface LoadCardProps {
  load: SelectLoad;
  onBook?: () => void;
  showBookButton?: boolean;
}

export default function LoadCard({ load, onBook, showBookButton = true }: LoadCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{load.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{load.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{load.price} MAD</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(load.pickupDate), "MMM d, yyyy")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <span>{load.weight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>{load.equipmentType}</span>
          </div>
        </div>

        {load.description && (
          <p className="text-sm text-muted-foreground">{load.description}</p>
        )}
      </CardContent>

      {showBookButton && (
        <CardFooter>
          <Button onClick={onBook} className="w-full">
            Book Load
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
