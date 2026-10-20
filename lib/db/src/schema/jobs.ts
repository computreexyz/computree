import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";
import { apiKeysTable } from "./api-keys";

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  accountId: uuid("account_id").references(() => accountsTable.id, {
    onDelete: "cascade",
  }),
  apiKeyId: uuid("api_key_id").references(() => apiKeysTable.id, {
    onDelete: "set null",
  }),
  model: text("model").notNull(),
  gpu: text("gpu").notNull().default("H100"),
  provider: text("provider"),
  status: text("status").notNull().default("queued"),
  durationSec: integer("duration_sec"),
  credits: numeric("credits", { precision: 10, scale: 1 }),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertJobSchema = createInsertSchema(jobsTable);
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
