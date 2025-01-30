import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { SelectLoad } from "@db/schema";
import { useTracking } from "@/hooks/use-tracking";

interface MapViewProps {
  loads: SelectLoad[];
}

declare global {
  interface Window {
    google: any;
  }
}

interface MarkerMap {
  [key: number]: google.maps.Marker;
}

export default function MapView({ loads }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<MarkerMap>({});
  const [trackingUpdates, setTrackingUpdates] = useState<{[key: number]: {lat: number, lng: number}}>({});

  const { sendUpdate } = useTracking((update) => {
    setTrackingUpdates(prev => ({
      ...prev,
      [update.loadId]: { lat: update.latitude, lng: update.longitude }
    }));
  });

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
          const marker = new window.google.maps.Marker({
            position: { lat: load.originLat, lng: load.originLng },
            map: googleMapRef.current,
            title: `Load ${load.id}`,
          });

          markersRef.current[load.id] = marker;

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

  // Update marker positions when tracking updates are received
  useEffect(() => {
    Object.entries(trackingUpdates).forEach(([loadId, position]) => {
      const marker = markersRef.current[Number(loadId)];
      if (marker) {
        marker.setPosition(position);
      }
    });
  }, [trackingUpdates]);

  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </Card>
  );
}