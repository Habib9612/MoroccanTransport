import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Truck } from 'lucide-react';

interface VehicleMarkerProps {
  position: [number, number];
  name: string;
  popupContent?: React.ReactNode;
}

// Create a custom icon using Lucide React's Truck icon
const createTruckIcon = () => {
  const svg = document.createElement('div');
  const truck = document.createElement('div');
  truck.style.color = '#0066cc';
  truck.style.width = '24px';
  truck.style.height = '24px';
  svg.appendChild(truck);
  
  return L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${Truck.toString()}
    </svg>`,
    className: 'vehicle-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function VehicleMarker({ position, name, popupContent }: VehicleMarkerProps) {
  return (
    <Marker 
      position={position} 
      icon={createTruckIcon()}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{name}</h3>
          {popupContent}
        </div>
      </Popup>
    </Marker>
  );
}
