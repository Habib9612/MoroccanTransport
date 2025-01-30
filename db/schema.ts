import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'carrier' or 'shipper'
  companyName: text("company_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  preferredLanguage: text("preferred_language").default('fr').notNull(),
  notificationPreferences: text("notification_preferences").default('email').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  shipperId: integer("shipper_id").notNull(),
  carrierId: integer("carrier_id"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originLat: doublePrecision("origin_lat").notNull(),
  originLng: doublePrecision("origin_lng").notNull(),
  destinationLat: doublePrecision("destination_lat").notNull(),
  destinationLng: doublePrecision("destination_lng").notNull(),
  weight: integer("weight").notNull(),
  price: integer("price").notNull(),
  status: text("status").notNull().default('available'), // available, booked, in_transit, delivered
  description: text("description"),
  equipmentType: text("equipment_type"),
  pickupDate: timestamp("pickup_date").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertLoadSchema = createInsertSchema(loads);
export const selectLoadSchema = createSelectSchema(loads);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertLoad = typeof loads.$inferInsert;
export type SelectLoad = typeof loads.$inferSelect;