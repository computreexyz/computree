/** Shared upstream helpers - keep provider names out of client-facing text. */

/** 'auto' is the public alias routed by the inference service. */
export function upstreamModel(model: string): string {
  return model === "auto" ? "openrouter/auto" : model;
}

/** Never leak upstream provider names to clients. */
export function redactUpstreamText(text: string): string {
  return text.replace(/openrouter(\.ai)?/gi, "computree");
}
