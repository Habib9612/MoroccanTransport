import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { db } from "@db";
import { loads, loadUpdates } from "@db/schema";
import { eq } from "drizzle-orm";

interface TrackingUpdate {
  loadId: number;
  latitude: number;
  longitude: number;
  status?: string;
  message?: string;
}

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    ws.on('message', async (message: string) => {
      try {
        const data: TrackingUpdate = JSON.parse(message);
        
        // Update load location
        await db.update(loads)
          .set({
            currentLat: data.latitude,
            currentLng: data.longitude,
            lastLocationUpdate: new Date(),
          })
          .where(eq(loads.id, data.loadId));

        // Create tracking update record
        if (data.status || data.message) {
          await db.insert(loadUpdates).values({
            loadId: data.loadId,
            status: data.status || 'location_update',
            latitude: data.latitude,
            longitude: data.longitude,
            message: data.message,
          });
        }

        // Broadcast update to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error processing tracking update:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
}
