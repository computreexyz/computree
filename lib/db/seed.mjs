import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(here, "../../artifacts/api-server/.env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const tables = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name",
);
console.log("tables:", tables.rows.map((r) => r.table_name).join(", "));

const providers = [
  ["golem", "Golem", "L40S", true, 62, 412],
  ["coreweave", "CoreWeave", "H100", true, 81, 1384],
  ["lambda", "Lambda", "A100", true, 44, 655],
  ["nebius", "Nebius", "H100", true, 57, 842],
  ["crusoe", "Crusoe", "A100", false, 0, 0],
  ["other", "Other", "MIXED", true, 23, 208],
];
for (const [id, name, gpu, online, cap, jobs] of providers) {
  await pool.query(
    `INSERT INTO providers (id, name, gpu_class, online, capacity_pct, jobs_24h)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, gpu_class=EXCLUDED.gpu_class,
       online=EXCLUDED.online, capacity_pct=EXCLUDED.capacity_pct, jobs_24h=EXCLUDED.jobs_24h`,
    [id, name, gpu, online, cap, jobs],
  );
}
const seeded = await pool.query("SELECT id, name, online FROM providers ORDER BY name");
console.log("providers seeded:", JSON.stringify(seeded.rows));

await pool.end();
