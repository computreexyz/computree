import { and, eq } from "drizzle-orm";
import { allocationsTable, type Allocation } from "@workspace/db/schema";
import { db } from "./db";
import { utcToday } from "./metering";

export const DAILY_TOTAL = 1000;

/** Lazily create and return the allocation row for an account + UTC day. */
export async function ensureAllocation(
  accountId: string,
  cycleDate: string = utcToday(),
): Promise<Allocation> {
  await db
    .insert(allocationsTable)
    .values({ accountId, cycleDate, total: DAILY_TOTAL, used: 0 })
    .onConflictDoNothing();
  const [allocation] = await db
    .select()
    .from(allocationsTable)
    .where(
      and(
        eq(allocationsTable.accountId, accountId),
        eq(allocationsTable.cycleDate, cycleDate),
      ),
    )
    .limit(1);
  return allocation;
}
