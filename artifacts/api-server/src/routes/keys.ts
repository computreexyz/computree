import { Router, type IRouter } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { apiKeysTable, type ApiKey } from "@workspace/db/schema";
import { getAccount, requireAuth } from "../lib/auth";
import { db } from "../lib/db";
import { ensureAllocation } from "../lib/allocations";
import { getEligibility } from "../lib/eligibility";
import {
  generateApiKeySecret,
  maskApiKey,
  sha256Hex,
} from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

async function usagePctFor(accountId: string): Promise<number> {
  const allocation = await ensureAllocation(accountId);
  return allocation.total > 0
    ? Math.round((allocation.used / allocation.total) * 100)
    : 0;
}

function shapeKey(key: ApiKey, usagePct: number) {
  return {
    id: key.id,
    name: key.name,
    masked: key.keyPrefix,
    createdAt: key.createdAt.getTime(),
    lastUsedAt: key.lastUsedAt ? key.lastUsedAt.getTime() : null,
    usagePct,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const keys = await db
      .select()
      .from(apiKeysTable)
      .where(
        and(
          eq(apiKeysTable.accountId, getAccount(req).id),
          isNull(apiKeysTable.revokedAt),
        ),
      );
    const usagePct = await usagePctFor(getAccount(req).id);
    res.json(keys.map((k) => shapeKey(k, usagePct)));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createKeySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "invalid body" });
      return;
    }
    const account = getAccount(req);
    const eligibility = await getEligibility(account, req);
    if (!eligibility.eligible) {
      res.status(403).json({
        error: "API keys require an active allocation - stake tokenized NVDA first",
        code: "INELIGIBLE",
      });
      return;
    }
    const secret = generateApiKeySecret();
    const [key] = await db
      .insert(apiKeysTable)
      .values({
        accountId: account.id,
        name: parsed.data.name,
        keyPrefix: maskApiKey(secret),
        keyHash: sha256Hex(secret),
      })
      .returning();
    res.status(201).json({
      ...shapeKey(key, 0),
      secret,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [revoked] = await db
      .update(apiKeysTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(apiKeysTable.id, req.params.id),
          eq(apiKeysTable.accountId, getAccount(req).id),
          isNull(apiKeysTable.revokedAt),
        ),
      )
      .returning({ id: apiKeysTable.id });
    if (!revoked) {
      res.status(404).json({ error: "key not found" });
      return;
    }
    res.json({ id: revoked.id, revoked: true });
  } catch (err) {
    next(err);
  }
});

export default router;
