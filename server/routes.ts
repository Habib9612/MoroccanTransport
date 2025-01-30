import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { loads } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
