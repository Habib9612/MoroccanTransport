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

    // Handle upgrade manually to support both CRA and Vite
    httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
      try {
        const url = new URL(request.url!, `http://${request.headers.host}`);
        const pathname = url.pathname;

        // Skip Vite HMR WebSocket requests
        if (request.headers['sec-websocket-protocol']?.includes('vite-hmr')) {
          console.log('Skipping Vite HMR WebSocket request');
          return;
        }

        // Always allow in development mode
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
          if (pathname === '/ws/tracking') {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          } else {
            socket.destroy();
          }
          return;
        }

        // Production CORS check
        const origin = request.headers.origin;
        if (origin) {
          const allowedOrigins = [
            /\.repl\.co$/,
            /\.replit\.dev$/,
            // Add your production domains here
          ];

          if (!allowedOrigins.some(pattern => pattern.test(origin))) {
            console.log(`Rejected connection from unauthorized origin: ${origin}`);
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }
        }

        // Handle tracking WebSocket connections
        if (pathname === '/ws/tracking') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        } else {
          socket.destroy();
        }
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.destroy();
      }
    });

    // Connection handling
    wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientIp = request.socket.remoteAddress;
      console.log(`New WebSocket connection from ${clientIp}`);

      // Send initial connection confirmation
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

          // Create tracking update
          await db.insert(loadUpdates).values({
            loadId: data.loadId,
            status: data.status || 'location_update',
            latitude: data.latitude,
            longitude: data.longitude,
            message: data.message,
          });

          // Broadcast update to all clients
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
          console.error('Message processing error:', error);
          ws.send(JSON.stringify({ 
            type: 'error',
            error: 'Failed to process message'
          }));
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log(`Connection closed (${clientIp})`);
      });
    });

    console.log('WebSocket server initialized successfully');
    return wss;
  } catch (error) {
    console.error('Fatal WebSocket server error:', error);
    throw error;
  }
}