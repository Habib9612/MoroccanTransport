import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import { db } from "@db";
import { loads, loadUpdates, users } from "@db/schema";
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
  try {
    const wss = new WebSocketServer({ 
      server: httpServer,
      verifyClient: (info: VerifyClientInfo, callback) => {
        // Skip verification for vite-hmr requests
        if (info.req.headers['sec-websocket-protocol'] === 'vite-hmr') {
          callback(false);
          return;
        }

        const origin = info.origin || '';
        const isReplit = origin.includes('.repl.') || origin.includes('.replit.dev');
        // Accept connections from localhost (development) and Replit domains
        if (isReplit || origin.includes('localhost') || origin === '') {
          callback(true);
          return;
        }
        console.log('Rejected WebSocket connection from origin:', origin);
        callback(false);
      }
    });

    console.log('WebSocket server initialized successfully');

    // Broadcast carrier locations periodically
    const broadcastInterval = setInterval(async () => {
      try {
        // Query active carriers from users table
        const activeCarriers = await db.select({
          id: users.id,
          currentLat: users.currentLat,
          currentLng: users.currentLng,
          name: users.companyName
        })
        .from(users)
        .where(eq(users.userType, 'carrier'))
        .where(eq(users.status, 'active'));

        const carrierData = activeCarriers
          .filter(carrier => carrier.currentLat && carrier.currentLng)
          .map(carrier => ({
            id: carrier.id,
            location: [carrier.currentLat, carrier.currentLng],
            name: carrier.name || `Carrier ${carrier.id}`
          }));

        if (wss.clients.size > 0) {
          const message = JSON.stringify({
            type: 'carrier_locations',
            carriers: carrierData
          });

          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      } catch (error) {
        console.error('Error broadcasting carrier locations:', error);
      }
    }, 5000);

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
          const broadcastData = JSON.stringify({
            type: 'load_update',
            data
          });

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        } catch (error) {
          console.error('Error processing tracking update:', error);
          ws.send(JSON.stringify({ error: 'Failed to process update' }));
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('Client disconnected from tracking system');
      });
    });

    // Cleanup on server close
    httpServer.on('close', () => {
      clearInterval(broadcastInterval);
      wss.close(() => {
        console.log('WebSocket server closed');
      });
    });

    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  } catch (error) {
    console.error('Error setting up WebSocket server:', error);
    throw error;
  }
}