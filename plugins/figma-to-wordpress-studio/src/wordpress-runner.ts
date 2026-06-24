import type { GeneratedArtifact } from "./types";

export interface WordPressRunnerError {
  code: string;
  message: string;
  data?: unknown;
}

export interface WordPressRunnerResponse {
  schema: "figma-to-wordpress-studio/runner-response/v1";
  success: boolean;
  status: "created" | "opened" | "queued" | "blocked" | "failed";
  open_url?: string;
  session_id?: string;
  contained_site?: Record<string, unknown>;
  preview_boot?: Record<string, unknown>;
  preview_session?: Record<string, unknown>;
  materialization?: Record<string, unknown>;
  error?: WordPressRunnerError;
  message?: string;
}

const runnerTimeoutMs = 15000;

export async function createWordPressPreview(endpoint: string, artifact: GeneratedArtifact): Promise<WordPressRunnerResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), runnerTimeoutMs);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(artifact.runnerRequest),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("WordPress Studio session creation timed out. Start a compatible WP Codebox runner or try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => null) as WordPressRunnerResponse | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `WordPress runner failed with HTTP ${response.status}.`);
  }

  if (!data?.success || !data.open_url) {
    throw new Error(data?.error?.message || data?.message || "WordPress runner did not return a Studio URL.");
  }

  return data;
}
