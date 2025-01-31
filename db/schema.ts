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
  // Carrier specific fields
  verificationStatus: text("verification_status").default('pending'), // pending, verified, rejected
  fleetSize: integer("fleet_size"),
  equipmentTypes: text("equipment_types"), // JSON string of available equipment
  operatingRegions: text("operating_regions"), // JSON string of regions
  insuranceInfo: text("insurance_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Location tracking for carriers
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  lastLocationUpdate: timestamp("last_location_update"),
  status: text("status").default('inactive'), // active, inactive, maintenance
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
  status: text("status").notNull().default('available'), // available, booked, in_transit, delivered, completed
  description: text("description"),
  equipmentType: text("equipment_type"),
  pickupDate: timestamp("pickup_date").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  // Tracking and payment fields
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  lastLocationUpdate: timestamp("last_location_update"),
  estimatedArrival: timestamp("estimated_arrival"),
  paymentStatus: text("payment_status").default('pending'), // pending, paid, overdue
  invoiceId: text("invoice_id"),
  totalAmount: integer("total_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const loadUpdates = pgTable("load_updates", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").notNull(),
  status: text("status").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").notNull(),
  shipperId: integer("shipper_id").notNull(),
  carrierId: integer("carrier_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default('pending').notNull(), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertLoadSchema = createInsertSchema(loads);
export const selectLoadSchema = createSelectSchema(loads);
export const insertLoadUpdateSchema = createInsertSchema(loadUpdates);
export const selectLoadUpdateSchema = createSelectSchema(loadUpdates);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertLoad = typeof loads.$inferInsert;
export type SelectLoad = typeof loads.$inferSelect;
export type InsertLoadUpdate = typeof loadUpdates.$inferInsert;
export type SelectLoadUpdate = typeof loadUpdates.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type SelectInvoice = typeof invoices.$inferSelect;

export const aiModelStates = pgTable("ai_model_states", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(),
  stateData: text("state_data").notNull(), // JSON string of model state
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertAIModelStateSchema = createInsertSchema(aiModelStates);
export const selectAIModelStateSchema = createSelectSchema(aiModelStates);
export type InsertAIModelState = typeof aiModelStates.$inferInsert;
export type SelectAIModelState = typeof aiModelStates.$inferSelect;