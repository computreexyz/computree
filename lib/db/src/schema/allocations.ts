import {
  date,
  integer,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const allocationsTable = pgTable(
  "allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountsTable.id, { onDelete: "cascade" }),
    cycleDate: date("cycle_date").notNull(),
    total: integer("total").notNull().default(1000),
    used: integer("used").notNull().default(0),
  },
  (t) => [unique("allocations_account_cycle_unique").on(t.accountId, t.cycleDate)],
);

export const insertAllocationSchema = createInsertSchema(allocationsTable).omit({
  id: true,
});
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type Allocation = typeof allocationsTable.$inferSelect;
