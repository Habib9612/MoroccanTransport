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

export function setupWebSocket(httpServer: Server) {
  try {
    console.log('Initializing WebSocket server...');

    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/ws/tracking'
    });

    // Connection handling with detailed logging
    wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientIp = request.socket.remoteAddress;
      console.log(`New WebSocket connection established from ${clientIp}`);

      // Send initial message to confirm connection
      ws.send(JSON.stringify({ 
        type: 'connection_established', 
        timestamp: new Date().toISOString() 
      }));

      ws.on('message', async (message: string) => {
        try {
          console.log('Received message:', message.toString());
          const data: TrackingUpdate = JSON.parse(message.toString());

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
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({ 
            type: 'error',
            error: 'Failed to process message'
          }));
        }
      });

      // Error handling
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Cleanup on close
      ws.on('close', () => {
        console.log(`WebSocket connection closed (${clientIp})`);
      });
    });

    console.log('WebSocket server setup completed successfully');
    return wss;
  } catch (error) {
    console.error('Fatal error setting up WebSocket server:', error);
    throw error;
  }
}