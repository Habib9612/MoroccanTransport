
import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

interface Vehicle {
  id: string;
  location: [number, number];
  status: string;
}

export default function LiveTracking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "VEHICLE_UPDATE") {
        setVehicles(prev => {
          const newVehicles = [...prev];
          const index = newVehicles.findIndex(v => v.id === data.vehicle.id);
          if (index >= 0) {
            newVehicles[index] = data.vehicle;
          } else {
            newVehicles.push(data.vehicle);
          }
          return newVehicles;
        });
      }
    });

    return () => {
      socket.close();
    };
  }, [socket]);

  return (
    <div className="h-[600px] relative">
      {/* Add your preferred mapping library here */}
      {vehicles.map(vehicle => (
        <VehicleMarker key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
