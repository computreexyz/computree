import crypto from "node:crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function newJobId(): string {
  return `job_${crypto.randomBytes(8).toString("hex")}`;
}

export function generateApiKeySecret(): string {
  return `ct_live_${crypto.randomBytes(16).toString("hex")}`;
}

export function maskApiKey(secret: string): string {
  return `${secret.slice(0, 12)}…${secret.slice(-4)}`;
}

type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
};

export function creditsForUsage(usage: TokenUsage | undefined | null): number {
  if (!usage) return 1;
  const total = (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0);
  return Math.max(1, Math.ceil(total / 100));
}

/** Current UTC day as YYYY-MM-DD (matches the `date` columns). */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Epoch ms of UTC midnight for a YYYY-MM-DD date string. */
export function utcMidnightMs(dateStr: string): number {
  return Date.parse(`${dateStr}T00:00:00Z`);
}
