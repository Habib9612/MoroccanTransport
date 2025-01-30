import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { SelectLoad } from "@db/schema";

interface MapViewProps {
  loads: SelectLoad[];
}

declare global {
  interface Window {
    google: any;
  }
}

export default function MapView({ loads }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (mapRef.current) {
        // Center map on Morocco
        const moroccoCenter = { lat: 31.7917, lng: -7.0926 };
        
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: moroccoCenter,
          zoom: 6,
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry",
              stylers: [{ visibility: "simplified" }],
            },
          ],
        });

        // Add markers for each load
        loads.forEach((load) => {
          new window.google.maps.Marker({
            position: { lat: load.originLat, lng: load.originLng },
            map: googleMapRef.current,
            title: `Pickup: ${load.origin}`,
          });

          new window.google.maps.Marker({
            position: { lat: load.destinationLat, lng: load.destinationLng },
            map: googleMapRef.current,
            title: `Delivery: ${load.destination}`,
          });

          // Draw route line
          const route = new window.google.maps.Polyline({
            path: [
              { lat: load.originLat, lng: load.originLng },
              { lat: load.destinationLat, lng: load.destinationLng },
            ],
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });

          route.setMap(googleMapRef.current);
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [loads]);

  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </Card>
  );
}
