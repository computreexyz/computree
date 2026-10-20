import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providersTable = pgTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  gpuClass: text("gpu_class"),
  online: boolean("online").notNull().default(true),
  capacityPct: integer("capacity_pct").notNull().default(0),
  jobs24h: integer("jobs_24h").notNull().default(0),
});

export const insertProviderSchema = createInsertSchema(providersTable);
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
