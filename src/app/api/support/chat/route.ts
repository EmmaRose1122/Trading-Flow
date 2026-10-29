import { NextResponse } from "next/server";
import { buildSupportSystemPrompt } from "@/lib/support-knowledge";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 1_500;
const MAX_TOTAL_LENGTH = 7_000;
const requestBuckets = new Map<string, number[]>();

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  if (requestBuckets.size > 2_000) requestBuckets.clear();
  const recent = (requestBuckets.get(clientKey) || []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT) {
    requestBuckets.set(clientKey, recent);
    return true;
  }
  recent.push(now);
  requestBuckets.set(clientKey, recent);
  return false;
}

function invalid(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalid("Invalid request body.");
  }

  const body = payload as { messages?: unknown; page?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return invalid("A conversation message is required.");
  }

  const messages: ChatMessage[] = [];
  for (const entry of body.messages.slice(-MAX_MESSAGES)) {
    if (!entry || typeof entry !== "object") return invalid("Invalid message.");
    const candidate = entry as { role?: unknown; content?: unknown };
    if (candidate.role !== "user" && candidate.role !== "assistant") {
      return invalid("Invalid message role.");
    }
    if (typeof candidate.content !== "string") return invalid("Invalid message content.");
    const content = candidate.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return invalid(`Messages must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`);
    }
    messages.push({ role: candidate.role, content });
  }

  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  if (firstUserIndex === -1 || messages[messages.length - 1]?.role !== "user") {
    return invalid("The latest message must be from the user.");
  }
  const conversation = messages.slice(firstUserIndex);
  const totalLength = conversation.reduce((total, message) => total + message.content.length, 0);
  if (totalLength > MAX_TOTAL_LENGTH) {
    return NextResponse.json(
      { error: "This conversation is too long. Please start a new chat." },
      { status: 413 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI support is not configured yet. Please email tradingflow.demo@gmail.com.",
        code: "AI_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const configuredModel = (process.env.GEMINI_MODEL || "gemini-3-flash-preview").replace(
    /[^a-zA-Z0-9._-]/g,
    ""
  );
  if (!configuredModel) {
    return NextResponse.json(
      { error: "AI support configuration is invalid. Please contact support." },
      { status: 503 }
    );
  }
  // 3.8/3.6/3.5 flash can be intermittently unavailable or spend too long
  // thinking; the preview flash model currently responds reliably.
  const unstableModels = new Set([
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
  ]);
  const primaryModel = unstableModels.has(configuredModel)
    ? "gemini-3-flash-preview"
    : configuredModel;
  const models = Array.from(
    new Set([primaryModel, "gemini-3-flash-preview", "gemini-3.1-flash-lite"])
  ).filter(Boolean);

  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const message of conversation) {
    const role = message.role === "assistant" ? "model" : "user";
    const previous = contents[contents.length - 1];
    if (previous?.role === role) {
      previous.parts[0].text += `\n\n${message.content}`;
    } else {
      contents.push({ role, parts: [{ text: message.content }] });
    }
  }

  const page = typeof body.page === "string" ? body.page : undefined;
  let lastStatus = 0;
  let lastError: unknown = null;

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: buildSupportSystemPrompt(page) }],
            },
            contents,
            generationConfig: {
              temperature: 0.35,
              topP: 0.9,
              maxOutputTokens: 900,
            },
          }),
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        lastStatus = response.status;
        console.error("Gemini support request failed", model, response.status);
        if ([400, 401, 403].includes(response.status)) break;
        continue;
      }

      const data = (await response.json()) as GeminiResponse;
      const reply = (data.candidates?.[0]?.content?.parts || [])
        .filter((part) => part.thought !== true && typeof part.text === "string")
        .map((part) => part.text?.trim())
        .filter(Boolean)
        .join("\n\n");

      if (reply) {
        return NextResponse.json(
          { reply },
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      console.error("Gemini support returned an empty reply", model);
    } catch (error) {
      lastError = error;
      console.error(
        "Gemini support request error",
        model,
        error instanceof Error ? error.name : "unknown"
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastStatus === 429) {
    return NextResponse.json(
      { error: "The AI service is busy. Please try again in a minute." },
      { status: 429 }
    );
  }
  if (lastError instanceof Error && lastError.name === "AbortError") {
    return NextResponse.json(
      { error: "AI support timed out. Please try again or email tradingflow.demo@gmail.com." },
      { status: 504 }
    );
  }

  return NextResponse.json(
    {
      error:
        "AI support is temporarily unavailable. Please email tradingflow.demo@gmail.com.",
    },
    { status: 502 }
  );
}
