import { and, eq } from "drizzle-orm";
import { allocationsTable, type Allocation } from "@workspace/db/schema";
import { db } from "./db";
import { utcToday } from "./metering";

export const DAILY_TOTAL = 1000;

/** Lazily create and return the allocation row for an account + UTC day. */
export async function ensureAllocation(
  accountId: string,
  cycleDate: string = utcToday(),
  total: number = DAILY_TOTAL,
): Promise<Allocation> {
  await db
    .insert(allocationsTable)
    .values({ accountId, cycleDate, total, used: 0 })
    .onConflictDoUpdate({
      target: [allocationsTable.accountId, allocationsTable.cycleDate],
      // Eligibility can change intraday — keep the row's total in sync.
      set: { total },
    });
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
