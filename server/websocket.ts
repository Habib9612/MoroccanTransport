import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
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

interface VerifyClientInfo {
  origin: string;
  secure: boolean;
  req: IncomingMessage;
}

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    verifyClient: (info: VerifyClientInfo) => {
      // Only ignore vite-hmr protocol, accept all other connections
      return info.req.headers['sec-websocket-protocol'] !== 'vite-hmr';
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to tracking system');

    ws.on('message', async (message: string) => {
      try {
        const data: TrackingUpdate = JSON.parse(message);
        console.log('Received tracking update:', data);

        // Update load location
        await db.update(loads)
          .set({
            currentLat: data.latitude,
            currentLng: data.longitude,
            lastLocationUpdate: new Date(),
            ...(data.status && { status: data.status })
          })
          .where(eq(loads.id, data.loadId));

        // Create tracking update record
        await db.insert(loadUpdates).values({
          loadId: data.loadId,
          status: data.status || 'location_update',
          latitude: data.latitude,
          longitude: data.longitude,
          message: data.message,
        });

        // Broadcast update to all connected clients
        const broadcastData = JSON.stringify(data);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(broadcastData);
          }
        });
      } catch (error) {
        console.error('Error processing tracking update:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('Client disconnected from tracking system');
    });
  });
}