import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const V0_API_KEY = process.env.V0_API_KEY;
const V0_PROJECT_ID = process.env.V0_PROJECT_ID || undefined;
const STATE_DIR = process.env.V0_STATE_DIR || "ai";

if (!V0_API_KEY) {
  console.error("Missing V0_API_KEY environment variable.");
}

const repoRoot = process.cwd();
const stateDir = path.join(repoRoot, STATE_DIR);
const designDir = path.join(repoRoot, "design");
const chatIdFile = path.join(stateDir, "v0-chat-id.txt");
const contextFile = path.join(stateDir, "v0-context.md");
const rawFile = path.join(designDir, "v0-last-response.json");

async function ensureDirs() {
  await fs.mkdir(stateDir, { recursive: true });
  await fs.mkdir(designDir, { recursive: true });
}

async function readChatId() {
  try {
    const raw = await fs.readFile(chatIdFile, "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("#")) || null;
  } catch {
    return null;
  }
}

async function writeChatId(chatId) {
  await ensureDirs();
  await fs.writeFile(chatIdFile, `${chatId}\n`, "utf8");
}

async function writeRaw(payload) {
  await ensureDirs();
  await fs.writeFile(rawFile, JSON.stringify(payload, null, 2), "utf8");
}

function extractTextFromMessageContent(content) {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.text) return part.text;
        if (part?.content) return extractTextFromMessageContent(part.content);
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof content === "object") {
    if (typeof content.text === "string") return content.text;
    if (content.content) return extractTextFromMessageContent(content.content);
  }

  return "";
}

function normalizeMessages(payload) {
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.messages)) return payload.messages;
  if (Array.isArray(payload.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload.chat?.messages)) return payload.chat.messages;

  return [];
}

function latestAssistantMessage(payload) {
  const messages = normalizeMessages(payload);
  const reversed = [...messages].reverse();
  return reversed.find((message) => {
    const role = message?.role || message?.author || message?.type;
    return String(role).toLowerCase().includes("assistant");
  }) || null;
}

function summarizeAssistantMessage(message, chatId) {
  const text = extractTextFromMessageContent(message?.content || message?.parts || message?.text).trim();
  const compact = text.replace(/\r/g, "").trim();

  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletCandidates = lines
    .filter((line) => /^[-*•]/.test(line) || /^\d+[.)]/.test(line))
    .slice(0, 12)
    .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "- "));

  const preview = compact.slice(0, 4000) || "No assistant text found in the latest message.";

  const bullets = bulletCandidates.length
    ? bulletCandidates.map((line) => (line.startsWith("-") ? line : `- ${line}`)).join("\n")
    : "- No structured bullet points were detected in the latest assistant message.";

  return `# v0 UI Context\n\n## Active chat\n- chat_id: ${chatId}\n\n## Latest assistant summary\n${bullets}\n\n## Latest assistant preview\n\n${preview}\n`;
}

async function writeContextFromPayload(payload, chatId) {
  const assistant = latestAssistantMessage(payload);
  const markdown = summarizeAssistantMessage(assistant, chatId);
  await ensureDirs();
  await fs.writeFile(contextFile, markdown, "utf8");
  return markdown;
}

async function v0Request(url, init = {}) {
  if (!V0_API_KEY) {
    throw new Error("V0_API_KEY is not set.");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${V0_API_KEY}`,
      ...(init.headers || {})
    }
  });

  const text = await response.text();
  let json;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const message = json?.error?.message || json?.message || `v0 request failed: ${response.status}`;
    throw new Error(message);
  }

  return json;
}

async function createChat({ message, system }) {
  const body = {
    message,
    ...(system ? { system } : {}),
    ...(V0_PROJECT_ID ? { projectId: V0_PROJECT_ID } : {})
  };

  return v0Request("https://api.v0.dev/v1/chats", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

async function sendMessage({ chatId, message }) {
  return v0Request(`https://api.v0.dev/v1/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ message })
  });
}

async function getChat(chatId) {
  return v0Request(`https://api.v0.dev/v1/chats/${encodeURIComponent(chatId)}`, {
    method: "GET"
  });
}

const server = new McpServer({
  name: "v0-bridge",
  version: "0.1.0"
});

server.tool(
  "v0_create_chat",
  "Create a new persistent v0 chat for UI collaboration, persist its chat ID, and sync the latest summary to ai/v0-context.md.",
  {
    message: z.string().min(1),
    system: z.string().optional()
  },
  async ({ message, system }) => {
    const created = await createChat({ message, system });
    const chatId = created?.id || created?.chatId || created?.data?.id;

    if (!chatId) {
      throw new Error("Could not find chat ID in v0 create chat response.");
    }

    await writeChatId(chatId);
    await writeRaw(created);

    const chat = await getChat(chatId);
    const markdown = await writeContextFromPayload(chat, chatId);

    return {
      content: [
        {
          type: "text",
          text: [
            `Created v0 chat: ${chatId}`,
            `Saved chat id to: ${path.relative(repoRoot, chatIdFile)}`,
            `Updated summary file: ${path.relative(repoRoot, contextFile)}`,
            "",
            markdown
          ].join("\n")
        }
      ]
    };
  }
);

server.tool(
  "v0_continue_chat",
  "Continue the existing v0 chat (or the provided chat ID), persist the latest raw response, and refresh ai/v0-context.md.",
  {
    message: z.string().min(1),
    chat_id: z.string().optional()
  },
  async ({ message, chat_id }) => {
    const chatId = chat_id || (await readChatId());

    if (!chatId) {
      throw new Error("No v0 chat ID found. Create one first or pass chat_id explicitly.");
    }

    const result = await sendMessage({ chatId, message });
    await writeChatId(chatId);
    await writeRaw(result);

    const chat = await getChat(chatId);
    const markdown = await writeContextFromPayload(chat, chatId);

    return {
      content: [
        {
          type: "text",
          text: [
            `Continued v0 chat: ${chatId}`,
            `Updated raw response: ${path.relative(repoRoot, rawFile)}`,
            `Updated summary file: ${path.relative(repoRoot, contextFile)}`,
            "",
            markdown
          ].join("\n")
        }
      ]
    };
  }
);

server.tool(
  "v0_get_chat_summary",
  "Fetch the current v0 chat, refresh ai/v0-context.md, and return the synced summary.",
  {
    chat_id: z.string().optional()
  },
  async ({ chat_id }) => {
    const chatId = chat_id || (await readChatId());

    if (!chatId) {
      throw new Error("No v0 chat ID found. Put it in ai/v0-chat-id.txt or pass chat_id explicitly.");
    }

    const chat = await getChat(chatId);
    await writeRaw(chat);
    const markdown = await writeContextFromPayload(chat, chatId);

    return {
      content: [
        {
          type: "text",
          text: [
            `Synced v0 chat: ${chatId}`,
            `Updated raw response: ${path.relative(repoRoot, rawFile)}`,
            `Updated summary file: ${path.relative(repoRoot, contextFile)}`,
            "",
            markdown
          ].join("\n")
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
