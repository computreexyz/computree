import {
  date,
  integer,
  numeric,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const usageDailyTable = pgTable(
  "usage_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountsTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    credits: numeric("credits", { precision: 10, scale: 1 })
      .notNull()
      .default("0"),
    jobs: integer("jobs").notNull().default(0),
  },
  (t) => [unique("usage_daily_account_date_unique").on(t.accountId, t.date)],
);

export const insertUsageDailySchema = createInsertSchema(usageDailyTable).omit({
  id: true,
});
export type InsertUsageDaily = z.infer<typeof insertUsageDailySchema>;
export type UsageDaily = typeof usageDailyTable.$inferSelect;
