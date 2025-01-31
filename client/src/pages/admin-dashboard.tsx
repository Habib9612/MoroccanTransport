
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { useState } from "react";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("week");
  
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stats?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    }
  });

  const { data: fleetStatus } = useQuery({
    queryKey: ["admin", "fleet"],
    queryFn: async () => {
      const res = await fetch("/api/admin/fleet");
      if (!res.ok) throw new Error("Failed to fetch fleet status");
      return res.json();
    }
  });

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fleetStatus?.activeTrucks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fleetStatus?.pendingDeliveries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats?.dailyRevenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={stats?.performanceData || []} />
        </CardContent>
      </Card>
    </div>
  );
}
