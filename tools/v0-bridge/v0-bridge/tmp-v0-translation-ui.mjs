import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "..", "..", "..", ".env") });

const { v0 } = await import("v0-sdk");

const response = await v0.chats.create({
  message: "Design a compact, searchable translation dropdown (combobox) for a Next.js + Tailwind Bible app. Provide component structure and classes only.",
  projectId: process.env.V0_PROJECT_ID || undefined,
});

console.log(JSON.stringify({ id: response?.id || response?.chatId, projectId: response?.projectId || null }, null, 2));
