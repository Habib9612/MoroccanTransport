import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PriceSuggestionProps {
  loadData: {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
    weight: number;
    equipmentType?: string;
    pickupDate: string;
  };
}

export function PriceSuggestion({ loadData }: PriceSuggestionProps) {
  const { data: suggestion, isLoading } = useQuery({
    queryKey: ["/api/loads/price-suggestion", loadData],
    queryFn: async () => {
      const res = await fetch("/api/loads/price-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loadData),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      return res.json();
    },
    enabled: !!loadData.originLat && !!loadData.destinationLat,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Suggestion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Suggested Price:</span>
            <span className="font-semibold">{suggestion.suggested_price} MAD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price Range:</span>
            <span>
              {suggestion.price_range.min} - {suggestion.price_range.max} MAD
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Confidence:</span>
            <span className="capitalize">{suggestion.confidence}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
