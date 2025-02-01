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
      noServer: true,
      path: '/ws/tracking'
    });

    // Handle upgrade event manually to avoid conflicts with Vite's WebSocket
    httpServer.on('upgrade', (request, socket, head) => {
      try {
        const url = new URL(request.url!, `http://${request.headers.host}`);
        const pathname = url.pathname;

        // Debug logging
        console.log('WebSocket upgrade request:', {
          url: request.url,
          host: request.headers.host,
          origin: request.headers.origin,
          protocol: request.headers['sec-websocket-protocol'],
          pathname
        });

        // Skip if this is a Vite HMR WebSocket request
        if (request.headers['sec-websocket-protocol']?.includes('vite-hmr')) {
          console.log('Skipping Vite HMR WebSocket request');
          return;
        }

        // Handle CORS for WebSocket upgrade
        const origin = request.headers.origin;
        if (origin) {
          const allowedOrigins = [
            /\.repl\.co$/,
            /\.replit\.dev$/,
            /^http:\/\/localhost:/,
            // Add your production domains here
          ];

          const isAllowed = process.env.NODE_ENV !== 'production' || 
                          allowedOrigins.some(pattern => pattern.test(origin));

          if (!isAllowed) {
            console.log(`Rejected WebSocket connection from unauthorized origin: ${origin}`);
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }
        }

        // Only handle tracking WebSocket connections
        if (pathname === '/ws/tracking') {
          console.log('Handling WebSocket upgrade for tracking');
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        } else {
          console.log(`Unhandled WebSocket path: ${pathname}`);
          socket.destroy();
        }
      } catch (error) {
        console.error('Error in WebSocket upgrade handler:', error);
        socket.destroy();
      }
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