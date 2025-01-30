import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Truck, MapPin } from "lucide-react";
import { SelectLoad, SelectUser } from "@db/schema";

interface CarrierMatch extends SelectUser {
  matching_score: number;
}

interface CarrierRecommendationsProps {
  load: SelectLoad;
  onSelect?: (carrierId: number) => void;
}

export function CarrierRecommendations({ load, onSelect }: CarrierRecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery<CarrierMatch[]>({
    queryKey: [`/api/loads/${load.id}/recommendations`],
    queryFn: async () => {
      const res = await fetch(`/api/loads/${load.id}/recommendations`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!load.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recommendations?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No carrier recommendations available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Carriers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((carrier) => (
          <div
            key={carrier.id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{carrier.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{carrier.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {(carrier.matching_score * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
            {onSelect && (
              <Button
                onClick={() => onSelect(carrier.id)}
                variant="outline"
                size="sm"
              >
                Select Carrier
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}