import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

const repoRoot = path.resolve(process.cwd(), "..", "..", "..");
const aiDir = path.join(repoRoot, "ai");
const designDir = path.join(repoRoot, "design");
const historyDir = path.join(designDir, "v0-history");
const chatIdPath = path.join(aiDir, "v0-chat-id.txt");
const contextPath = path.join(aiDir, "v0-context.md");
const lastResponsePath = path.join(designDir, "v0-last-response.json");

dotenv.config({ path: path.join(repoRoot, ".env") });

const { v0 } = await import("v0-sdk");

const prompt = `Design UI updates for the Next.js (app router) Bible reader page (/bible) using Tailwind only, preserving the existing visual language. We need multi-verse text selection highlights with a compact floating toolbar near the selection (actions: Highlight, Add Note, Cancel), plus a right-side notes panel that lists notes for the current chapter with selected-text previews and edit/delete actions. Keep components small and reusable. Include mobile behavior (panel stacks below on small screens). No new libraries. Provide class names and component structure ideas we can integrate into existing components.`;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function stripChatIdFile(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#")) || "";
}

function flattenText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenText).filter(Boolean).join("\n");
  if (typeof value === "object") {
    const pieces = [];
    for (const child of Object.values(value)) {
      pieces.push(flattenText(child));
    }
    return pieces.filter(Boolean).join("\n");
  }
  return String(value);
}

function latestAssistantText(chat) {
  const messages = Array.isArray(chat?.messages) ? chat.messages : [];
  const assistant = [...messages].reverse().find((m) => (m?.role || "").toLowerCase() === "assistant");
  return flattenText(assistant?.content || assistant?.text || "").trim();
}

async function main() {
  await ensureDir(aiDir);
  await ensureDir(designDir);
  await ensureDir(historyDir);

  const chatIdRaw = await fs.readFile(chatIdPath, "utf8").catch(() => "");
  const storedChatId = stripChatIdFile(chatIdRaw);

  let response;
  if (storedChatId) {
    response = await v0.chats.sendMessage({ chatId: storedChatId, message: prompt });
  } else {
    response = await v0.chats.create({ message: prompt, projectId: process.env.V0_PROJECT_ID || undefined });
  }

  const chatId = response?.id || response?.chatId || storedChatId;
  if (!chatId) throw new Error("Unable to resolve chat id from v0 response.");

  await fs.writeFile(chatIdPath, `${chatId}\n`, "utf8");

  const chat = await v0.chats.getById({ chatId });
  const assistantText = latestAssistantText(chat);
  const previewLines = assistantText.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12);

  const summary = {
    syncedAt: new Date().toISOString(),
    chatId,
    projectId: chat?.projectId || "",
    summary: {
      messageCount: Array.isArray(chat?.messages) ? chat.messages.length : 0,
      latestAssistantText: assistantText.slice(0, 5000),
      previewLines,
    },
    raw: chat,
  };

  await fs.writeFile(lastResponsePath, JSON.stringify(summary, null, 2), "utf8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.writeFile(path.join(historyDir, `${timestamp}.json`), JSON.stringify(summary, null, 2), "utf8");

  const contextMd = `# v0 UI Context\n\n## Active IDs\n- Chat ID: ${chatId}\n- Project ID: ${chat?.projectId || process.env.V0_PROJECT_ID || "not set"}\n\n## Latest assistant summary\n${previewLines.length ? previewLines.map((line) => `- ${line}`).join("\n") : "- No assistant text found."}\n\n## Raw assistant excerpt\n\n${assistantText || "No assistant response text found."}\n`;
  await fs.writeFile(contextPath, contextMd, "utf8");

  console.log("v0 roundtrip complete.");
}

await main();
