import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";
import { logger } from "./logger";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// An unhandled 'error' event from an idle pool client (e.g. the remote end
// dropping the connection) would otherwise crash the process.
pool.on("error", (err) => {
  logger.error({ err }, "idle database client error");
});

export const db = drizzle(pool, { schema });
