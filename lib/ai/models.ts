import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type ModelProvider = "openai" | "google";

// Build Google provider with explicit API key support for both env var names
function getGoogleProvider() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
  return createGoogleGenerativeAI({ apiKey });
}

export function getPrimaryModel() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("PASTE_YOUR");
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  // Prefer OpenAI if available, then fall back to Gemini
  if (hasOpenAI) {
    console.log("[SynapseAI] Selecting GPT-4o-Mini (OpenAI) as primary model");
    return {
      provider: "openai" as ModelProvider,
      model: openai("gpt-4o-mini"),
    };
  }

  if (hasGemini) {
    console.log("[SynapseAI] Selecting Gemini 1.5 Flash (Google) as primary model");
    const googleAI = getGoogleProvider();
    return {
      provider: "google" as ModelProvider,
      model: googleAI("gemini-1.5-flash"),
    };
  }

  // Default fallback — will fail gracefully via error handling
  console.warn("[SynapseAI] No AI API keys found. Using OpenAI default (will hit fallback).");
  return {
    provider: "openai" as ModelProvider,
    model: openai("gpt-4o-mini"),
  };
}

export function getBackupModel(primaryProvider: ModelProvider) {
  if (primaryProvider === "openai") {
    const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    if (hasGemini) {
      console.log("[SynapseAI] Backup: switching to Gemini");
      const googleAI = getGoogleProvider();
      return {
        provider: "google" as ModelProvider,
        model: googleAI("gemini-1.5-flash"),
      };
    }
  } else {
    const hasOpenAI = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("PASTE_YOUR");
    if (hasOpenAI) {
      console.log("[SynapseAI] Backup: switching to OpenAI");
      return {
        provider: "openai" as ModelProvider,
        model: openai("gpt-4o-mini"),
      };
    }
  }
  return null;
}

/**
 * A highly resilient runner that executes Vercel AI SDK operations (like generateText, generateObject)
 * and automatically falls back to the backup model if the primary provider encounters any API error.
 */
export async function runWithFallback<T>(
  operation: (model: any) => Promise<T>
): Promise<T> {
  const primary = getPrimaryModel();

  try {
    return await operation(primary.model);
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    // Catch quota, auth, permission, and rate limit errors from any provider
    const isRecoverableError =
      errorMessage.includes("quota") ||
      errorMessage.includes("limit") ||
      errorMessage.includes("429") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("key") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("PERMISSION_DENIED") ||
      errorMessage.includes("API_KEY") ||
      errorMessage.includes("identity");

    if (isRecoverableError) {
      console.warn(`[SynapseAI] Primary provider (${primary.provider}) failed:`, errorMessage);
      const backup = getBackupModel(primary.provider);

      if (backup) {
        console.log(`[SynapseAI] Failover → switching to backup provider: ${backup.provider}`);
        try {
          return await operation(backup.model);
        } catch (backupError: any) {
          console.error(`[SynapseAI] Backup provider (${backup.provider}) also failed:`, backupError);
          throw backupError;
        }
      } else {
        console.warn("[SynapseAI] No backup provider configured.");
      }
    }

    throw error;
  }
}
