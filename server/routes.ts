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
  // Setup security middleware
  setupSecurity(app);

  // Setup authentication
  setupAuth(app);

  // Setup OpenAPI validation and documentation
  const openApiDocument = YAML.load(join(__dirname, 'openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(
    OpenApiValidator.middleware({
      apiSpec: openApiDocument,
      validateRequests: true,
      validateResponses: true,
    }),
  );

  // Error handler for OpenAPI validation
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.status === 400) {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors,
      });
    }
    next(err);
  });

  // Profile update endpoint
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user!.id))
        .returning();

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

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
      res.status(400).json({ error: "Failed to fetch tracking updates" });
    }
  });

  // Get available loads
  app.get("/api/loads", async (req, res) => {
    const allLoads = await db.select().from(loads).where(eq(loads.status, "available"));
    res.json(allLoads);
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
      res.status(400).json({ error: "Booking failed" });
    }
  });

  // Get carrier recommendations for a load
  app.get("/api/loads/:id/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const loadId = parseInt(req.params.id);
    try {
      const [load] = await db
        .select()
        .from(loads)
        .where(eq(loads.id, loadId))
        .limit(1);

      if (!load) {
        return res.status(404).send("Load not found");
      }

      const carriers = await db
        .select()
        .from(users)
        .where(eq(users.userType, "carrier"));

      const recommendations = await loadMatcher.findMatches(load, carriers);
      res.json(recommendations);
    } catch (error) {
      res.status(400).json({ error: "Failed to get recommendations" });
    }
  });

  // Get price suggestion for a new load
  app.post("/api/loads/price-suggestion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      // Get historical loads for price modeling
      const historicalLoads = await db
        .select()
        .from(loads)
        .where(eq(loads.status, "completed"))
        .limit(1000);

      const suggestion = await dynamicPricing.suggestPrice(req.body, historicalLoads);
      res.json(suggestion);
    } catch (error) {
      res.status(400).json({ error: "Failed to generate price suggestion" });
    }
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}