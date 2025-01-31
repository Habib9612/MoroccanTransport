import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Card } from "@/components/ui/card";
import { SelectLoad } from "@db/schema";
import ReconnectingWebSocket from 'reconnecting-websocket';

// Custom hook for WebSocket connection
function useWebSocket(url: string) {
  const [data, setData] = useState<any>(null);
  const ws = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    // Get the current hostname from window.location
    const hostname = window.location.hostname;
    // Check if we're running on Replit
    const isReplit = hostname.includes('.repl');
    // Construct WebSocket URL based on environment
    const wsUrl = isReplit 
      ? `wss://${hostname.replace('00-', '')}/ws/tracking` 
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/tracking`;

    console.log('Connecting to WebSocket URL:', wsUrl);

    const websocket = new ReconnectingWebSocket(wsUrl, [], {
      WebSocket: window.WebSocket,
      connectionTimeout: 4000,
      maxRetries: 10,
    });

    websocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('Received WebSocket data:', parsedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current = websocket;

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return data;
}

// Initialize leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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
    L: any;
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

export default function MapView({ loads, carriers = [] }: MapViewProps) {
  const wsData = useWebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/tracking`);
  const [carrierLocations, setCarrierLocations] = useState(carriers);
  const mapRef = useRef(null);

  useEffect(() => {
    if (wsData?.type === 'carrier_locations') {
      console.log('Updating carrier locations:', wsData.carriers);
      setCarrierLocations(wsData.carriers);
    }
  }, [wsData]);

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
              iconUrl: '/truck-icon.svg',
              iconSize: [25, 25],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{carrier.name}</h3>
                <p>Carrier ID: {carrier.id}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}