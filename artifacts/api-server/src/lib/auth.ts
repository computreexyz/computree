import type { NextFunction, Request, Response } from "express";
import { PrivyClient } from "@privy-io/server-auth";
import { eq } from "drizzle-orm";
import { accountsTable, type Account } from "@workspace/db/schema";
import { db } from "./db";
import { logger } from "./logger";

type AuthedRequest = Request & { account?: Account };

/** Returns the account attached by requireAuth. Throws if missing. */
export function getAccount(req: Request): Account {
  const account = (req as AuthedRequest).account;
  if (!account) throw new Error("account not attached to request");
  return account;
}

let privy: PrivyClient | null = null;

function getPrivy(): PrivyClient {
  if (!privy) {
    const appId = process.env.PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error("PRIVY_APP_ID and PRIVY_APP_SECRET must be set");
    }
    privy = new PrivyClient(appId, appSecret);
  }
  return privy;
}

export async function upsertAccount(privyDid: string): Promise<Account> {
  await db
    .insert(accountsTable)
    .values({ privyDid })
    .onConflictDoNothing({ target: accountsTable.privyDid });
  const [account] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.privyDid, privyDid))
    .limit(1);
  return account;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (process.env.DEMO_AUTH === "1") {
      const demoDid = req.header("x-demo-account");
      if (demoDid) {
        (req as AuthedRequest).account = await upsertAccount(demoDid);
        next();
        return;
      }
    }

    const header = req.header("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ error: "missing or malformed Authorization header" });
      return;
    }

    const claims = await getPrivy().verifyAuthToken(header.slice(7));
    (req as AuthedRequest).account = await upsertAccount(claims.userId);
    next();
  } catch (err) {
    logger.warn({ err }, "auth failed");
    res.status(401).json({ error: "invalid or expired token" });
  }
}
