import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Card } from "@/components/ui/card";
import { SelectLoad } from "@db/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import MarkerIcon from 'leaflet/dist/images/marker-icon.png';
import MarkerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import MarkerShadow from 'leaflet/dist/images/marker-shadow.png';

// Initialize leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: MarkerIcon2x,
  iconUrl: MarkerIcon,
  shadowUrl: MarkerShadow,
});

interface MapViewProps {
  loads: SelectLoad[];
  carriers?: Array<{
    id: number;
    location: [number, number];
    name: string;
  }>;
}

declare global {
  interface Window {
    L: {
      heatLayer: (
        latlngs: number[][],
        options?: {
          minOpacity?: number;
          maxZoom?: number;
          max?: number;
          radius?: number;
          blur?: number;
          gradient?: { [key: string]: string };
        }
      ) => any;
    };
  }
}

// HeatLayer component
function HeatmapLayer({ points }: { points: number[][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length || !window.L?.heatLayer) return;

    const heat = window.L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

const truckIconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%23000' d='M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E";

export default function MapView({ loads, carriers = [] }: MapViewProps) {
  const { isConnected, carriers: wsCarriers, error } = useWebSocket('/ws/tracking');
  const [carrierLocations, setCarrierLocations] = useState(carriers);
  const mapRef = useRef(null);

  useEffect(() => {
    if (wsCarriers) {
      console.log('Updating carrier locations:', wsCarriers);
      setCarrierLocations(wsCarriers);
    }
  }, [wsCarriers]);

  // Log connection status and any errors
  useEffect(() => {
    if (error) {
      console.error('WebSocket error:', error);
    }
    console.log('WebSocket connected:', isConnected);
  }, [isConnected, error]);

  // Calculate map bounds based on all points
  const allPoints = [
    ...loads.map(load => [
      Number(load.originLat),
      Number(load.originLng)
    ]),
    ...carrierLocations.map(carrier => carrier.location)
  ];

  const center = allPoints.length > 0 
    ? [
        allPoints.reduce((sum, point) => sum + point[0], 0) / allPoints.length,
        allPoints.reduce((sum, point) => sum + point[1], 0) / allPoints.length
      ] as [number, number]
    : [31.7917, -7.0926] as [number, number]; // Default center of Morocco

  return (
    <Card className="w-full h-[600px] p-0 overflow-hidden">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Heat map layer for carrier density */}
        <HeatmapLayer points={carrierLocations.map(c => c.location)} />

        {/* Load Markers */}
        {loads.map((load) => (
          <Marker 
            key={load.id}
            position={[
              Number(load.originLat),
              Number(load.originLng)
            ]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Load #{load.id}</h3>
                <p>From: {load.origin}</p>
                <p>To: {load.destination}</p>
                <p>Status: {load.status}</p>
                {error && <p className="text-red-500">Connection error: {error}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Carrier Markers */}
        {carrierLocations.map((carrier) => (
          <Marker
            key={carrier.id}
            position={carrier.location}
            icon={new Icon({
              iconUrl: truckIconUrl,
              iconSize: [25, 25],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{carrier.name}</h3>
                <p>Carrier ID: {carrier.id}</p>
                {!isConnected && <p className="text-yellow-500">Reconnecting...</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}