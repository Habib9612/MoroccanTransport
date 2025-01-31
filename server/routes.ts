import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { setupSecurity } from "./middleware/security";
import { db } from "@db";
import { loads, users, loadUpdates } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { loadMatcher, dynamicPricing } from "./ml";
import * as OpenApiValidator from 'express-openapi-validator';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerRoutes(app: Express): Server {
  // Fleet Management Endpoints
  app.get("/api/admin/fleet", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }

    try {
      const fleetStatus = await db.query(`
        SELECT 
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_trucks,
          COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as in_maintenance,
          SUM(total_distance) as total_distance_covered
        FROM vehicles
      `);
      
      res.json(fleetStatus);
    } catch (error) {
      console.error('Error fetching fleet status:', error);
      res.status(500).json({ error: "Failed to fetch fleet status" });
    }
  });

  app.post("/api/admin/maintenance", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }

    try {
      const { vehicleId, type, description } = req.body;
      const maintenance = await db.insert(maintenanceRecords).values({
        vehicleId,
        type,
        description,
        scheduledDate: new Date()
      }).returning();
      
      res.json(maintenance);
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      res.status(500).json({ error: "Failed to schedule maintenance" });
    }
  });
  try {
    // Setup security middleware
    setupSecurity(app);

    // Setup authentication - ensuring this is called before other routes
    setupAuth(app);

    // Setup OpenAPI validation and documentation
    const openApiDocument = YAML.load(join(__dirname, './openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

    app.use(
      OpenApiValidator.middleware({
        apiSpec: openApiDocument,
        validateRequests: true,
        validateResponses: true,
      }),
    );

    // Get load tracking updates
    app.get("/api/loads/:id/tracking", async (req, res) => {
      const loadId = parseInt(req.params.id);
      try {
        const updates = await db
          .select()
          .from(loadUpdates)
          .where(eq(loadUpdates.loadId, loadId))
          .orderBy(desc(loadUpdates.createdAt))
          .limit(50);
        res.json(updates);
      } catch (error) {
        console.error('Error fetching tracking updates:', error);
        res.status(400).json({ error: "Failed to fetch tracking updates" });
      }
    });

    // Get available loads
    app.get("/api/loads", async (req, res) => {
      try {
        const allLoads = await db.select().from(loads);
        res.json(allLoads);
      } catch (error) {
        console.error('Error fetching loads:', error);
        res.status(400).json({ error: "Failed to fetch loads" });
      }
    });

    // Create new load
    app.post("/api/loads", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      try {
        const [newLoad] = await db.insert(loads).values({
          ...req.body,
          shipperId: req.user!.id,
        }).returning();
        res.json(newLoad);
      } catch (error) {
        console.error('Error creating load:', error);
        res.status(400).json({ error: "Invalid load data" });
      }
    });

    // Book a load
    app.post("/api/loads/:id/book", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const loadId = parseInt(req.params.id);
      try {
        const [updatedLoad] = await db
          .update(loads)
          .set({
            carrierId: req.user!.id,
            status: "booked"
          })
          .where(eq(loads.id, loadId))
          .returning();

        res.json(updatedLoad);
      } catch (error) {
        console.error('Error booking load:', error);
        res.status(400).json({ error: "Booking failed" });
      }
    });

    // Get carrier recommendations
    app.get("/api/loads/:id/recommendations", async (req, res) => {
      try {
        const [load] = await db
          .select()
          .from(loads)
          .where(eq(loads.id, parseInt(req.params.id)))
          .limit(1);

        if (!load) {
          return res.status(404).json({ error: "Load not found" });
        }

        const carriers = await db
          .select()
          .from(users)
          .where(eq(users.userType, "carrier"));

        const recommendations = await loadMatcher.findMatches(load, carriers);
        res.json(recommendations);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(400).json({ error: "Failed to get recommendations" });
      }
    });

    // Get price suggestion
    app.post("/api/loads/price-suggestion", async (req, res) => {
      try {
        const historicalLoads = await db
          .select()
          .from(loads)
          .where(eq(loads.status, "completed"))
          .limit(100);

        const suggestion = await dynamicPricing.suggestPrice(req.body, historicalLoads);
        res.json(suggestion);
      } catch (error) {
        console.error('Error generating price suggestion:', error);
        res.status(400).json({ error: "Failed to generate price suggestion" });
      }
    });

    // Error handler for OpenAPI validation
    app.use((err: any, req: any, res: any, next: any) => {
      // Handle validation errors
      if (err.status === 400 || err.status === 401) {
        return res.status(err.status).json({
          error: err.status === 400 ? 'Validation Error' : 'Authentication Error',
          details: err.errors,
        });
      }
      next(err);
    });

    // Setup HTTP server and WebSocket
    const httpServer = createServer(app);
    setupWebSocket(httpServer);

    return httpServer;
  } catch (error) {
    console.error('Error setting up routes:', error);
    throw error;
  }
}