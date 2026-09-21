import type { AppConfig } from "../types/config.js";

export interface LlmPolicy {
  enabled: boolean;
  useFor: Set<"executive_summary" | "final_review">;
}

export function getLlmPolicy(config: AppConfig): LlmPolicy {
  return {
    enabled: config.llm?.enabled ?? false,
    useFor: new Set(config.llm?.use_for ?? [])
  };
}
