import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { v0 } from 'v0-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

// Load root .env if present.
dotenv.config({ path: path.join(repoRoot, '.env') });

const PATHS = {
  aiDir: path.join(repoRoot, 'ai'),
  designDir: path.join(repoRoot, 'design'),
  historyDir: path.join(repoRoot, 'design', 'v0-history'),
  chatId: path.join(repoRoot, 'ai', 'v0-chat-id.txt'),
  systemPrompt: path.join(repoRoot, 'ai', 'v0-system-prompt.md'),
  context: path.join(repoRoot, 'ai', 'v0-context.md'),
  lastResponse: path.join(repoRoot, 'design', 'v0-last-response.json'),
};

async function ensureLayout() {
  await fs.mkdir(PATHS.aiDir, { recursive: true });
  await fs.mkdir(PATHS.designDir, { recursive: true });
  await fs.mkdir(PATHS.historyDir, { recursive: true });
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value, 'utf8');
}

async function writeJson(filePath, value) {
  await writeText(filePath, JSON.stringify(value, null, 2));
}

function stripChatIdFile(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#')) || '';
}

async function getStoredChatId() {
  return stripChatIdFile(await readIfExists(PATHS.chatId));
}

async function setStoredChatId(chatId) {
  await writeText(PATHS.chatId, `${chatId}\n`);
}

function flattenText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenText).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    const candidates = [];
    for (const [key, child] of Object.entries(value)) {
      if (['text', 'content', 'message', 'value', 'markdown', 'body', 'title'].includes(key)) {
        candidates.push(flattenText(child));
      } else {
        candidates.push(flattenText(child));
      }
    }
    return candidates.filter(Boolean).join('\n');
  }
  return String(value);
}

function summarizeChat(chat) {
  const messages = Array.isArray(chat?.messages) ? chat.messages : [];
  const assistantMessages = messages.filter((m) => (m?.role || '').toLowerCase() === 'assistant');
  const latestAssistant = assistantMessages.at(-1) || null;
  const latestUser = messages.filter((m) => (m?.role || '').toLowerCase() === 'user').at(-1) || null;
  const assistantText = flattenText(latestAssistant?.content || latestAssistant?.message || latestAssistant?.text || '');
  const userText = flattenText(latestUser?.content || latestUser?.message || latestUser?.text || '');

  const firstLines = assistantText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  return {
    messageCount: messages.length,
    latestUserText: userText.slice(0, 1500),
    latestAssistantText: assistantText.slice(0, 5000),
    previewLines: firstLines,
  };
}

function renderContextMarkdown({ chatId, projectId, summary }) {
  const preview = summary.previewLines.length
    ? summary.previewLines.map((line) => `- ${line}`).join('\n')
    : '- No assistant text could be extracted from the latest chat snapshot.';

  return `# v0 Context\n\n## Active IDs\n- Chat ID: ${chatId || 'unknown'}\n- Project ID: ${projectId || process.env.V0_PROJECT_ID || 'not set'}\n\n## Latest user prompt\n${summary.latestUserText || 'No user message found.'}\n\n## Latest assistant summary\n${preview}\n\n## Raw assistant excerpt\n\n${summary.latestAssistantText || 'No assistant response text found.'}\n`;
}

async function syncChatToRepo(chat) {
  const chatId = chat?.id || chat?.chatId || '';
  const projectId = chat?.projectId || chat?.project?.id || '';
  const summary = summarizeChat(chat);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshot = {
    syncedAt: new Date().toISOString(),
    chatId,
    projectId,
    summary,
    raw: chat,
  };

  await writeJson(PATHS.lastResponse, snapshot);
  await writeJson(path.join(PATHS.historyDir, `${timestamp}.json`), snapshot);
  await writeText(PATHS.context, renderContextMarkdown({ chatId, projectId, summary }));

  return { chatId, projectId, summary };
}

async function createOrContinueChat({ prompt, forceNewChat = false, projectId = '' }) {
  if (!process.env.V0_API_KEY) {
    throw new Error('Missing V0_API_KEY in environment.');
  }

  await ensureLayout();

  const system = (await readIfExists(PATHS.systemPrompt)).trim() || undefined;
  let chatId = forceNewChat ? '' : await getStoredChatId();
  let response;

  if (chatId) {
    response = await v0.chats.sendMessage({
      chatId,
      message: prompt,
    });
  } else {
    response = await v0.chats.create({
      message: prompt,
      system,
      projectId: projectId || process.env.V0_PROJECT_ID || undefined,
    });
    chatId = response?.id || response?.chatId || '';
    if (!chatId) {
      throw new Error('v0 did not return a chat ID when creating a new chat.');
    }
    await setStoredChatId(chatId);
  }

  const finalChatId = response?.id || response?.chatId || chatId;
  if (!finalChatId) {
    throw new Error('Unable to determine v0 chat ID after request.');
  }

  await setStoredChatId(finalChatId);
  const fullChat = await v0.chats.getById({ chatId: finalChatId });
  return syncChatToRepo(fullChat);
}

async function getCurrentChatState() {
  const chatId = await getStoredChatId();
  if (!chatId) {
    return {
      chatId: '',
      projectId: process.env.V0_PROJECT_ID || '',
      hasChat: false,
      note: 'No chat ID is stored yet.',
    };
  }

  const chat = await v0.chats.getById({ chatId });
  const synced = await syncChatToRepo(chat);
  return {
    hasChat: true,
    ...synced,
  };
}

const server = new McpServer({
  name: 'v0-bridge',
  version: '2.0.0',
});

server.tool(
  'v0_ui_roundtrip',
  {
    prompt: z.string().min(1).describe('UI/design request to send to v0.'),
    forceNewChat: z.boolean().optional().describe('Start a brand-new v0 chat instead of continuing the stored one.'),
    projectId: z.string().optional().describe('Optional explicit v0 project ID.'),
  },
  async ({ prompt, forceNewChat = false, projectId = '' }) => {
    try {
      const synced = await createOrContinueChat({ prompt, forceNewChat, projectId });
      return {
        content: [
          {
            type: 'text',
            text:
              `Synced v0 chat successfully.\n` +
              `Chat ID: ${synced.chatId || 'unknown'}\n` +
              `Project ID: ${synced.projectId || process.env.V0_PROJECT_ID || 'not set'}\n` +
              `Messages: ${synced.summary.messageCount}\n\n` +
              `Updated files:\n` +
              `- ai/v0-chat-id.txt\n` +
              `- ai/v0-context.md\n` +
              `- design/v0-last-response.json\n` +
              `- design/v0-history/*.json\n\n` +
              `Latest assistant preview:\n${synced.summary.previewLines.map((line) => `- ${line}`).join('\n') || '- No preview available.'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `v0_ui_roundtrip failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'v0_sync_chat',
  {
    chatId: z.string().optional().describe('Optional chat ID. Defaults to ai/v0-chat-id.txt.'),
  },
  async ({ chatId = '' }) => {
    try {
      const resolvedChatId = chatId || (await getStoredChatId());
      if (!resolvedChatId) {
        throw new Error('No chat ID available.');
      }
      const chat = await v0.chats.getById({ chatId: resolvedChatId });
      const synced = await syncChatToRepo(chat);
      return {
        content: [
          {
            type: 'text',
            text: `Synced existing chat ${synced.chatId || resolvedChatId} into ai/v0-context.md and design/v0-last-response.json.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `v0_sync_chat failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'v0_get_chat_state',
  {},
  async () => {
    try {
      const state = await getCurrentChatState();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(state, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `v0_get_chat_state failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'v0_set_chat_id',
  {
    chatId: z.string().min(1).describe('Existing v0 chat ID to bind this repo to.'),
  },
  async ({ chatId }) => {
    try {
      await setStoredChatId(chatId);
      const chat = await v0.chats.getById({ chatId });
      await syncChatToRepo(chat);
      return {
        content: [{ type: 'text', text: `Stored and synced chat ID ${chatId}.` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `v0_set_chat_id failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'v0_reset_chat',
  {},
  async () => {
    try {
      await setStoredChatId('');
      await writeText(PATHS.context, '# v0 Context\n\nChat binding cleared.\n');
      return {
        content: [{ type: 'text', text: 'Cleared stored chat ID. The next v0_ui_roundtrip call will create a new chat.' }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `v0_reset_chat failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
