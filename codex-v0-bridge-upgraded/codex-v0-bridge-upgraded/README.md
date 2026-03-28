# Upgraded Codex ↔ v0 bridge

This repo drop-in gives Codex a persistent MCP bridge to v0 for UI work.

## What changed from the starter
- stronger `AGENTS.md` rules so Codex actually uses v0 for UI tasks
- persistent repo files for chat memory and sync history
- one tool to do the common loop: `v0_ui_roundtrip`
- sync and repair tools: `v0_sync_chat`, `v0_get_chat_state`, `v0_set_chat_id`, `v0_reset_chat`
- timestamped raw snapshots in `design/v0-history/`
- automatic `.env` loading from the repo root

## Why this pattern works
Codex supports project-scoped MCP configuration in `.codex/config.toml`, and launches configured MCP servers when a session starts. It also reads repo instructions from `AGENTS.md`. citeturn408251search0turn408251search4

v0's Platform API supports creating chats, sending follow-up messages to existing chats, and retrieving a full chat by ID, which is exactly what this bridge uses. citeturn704878search11turn704878search0turn704878search3

## Install
From your project root:

```bash
cd tools/v0-bridge
npm install
cd ../..
cp .env.example .env
```

Add your key to `.env`:

```env
V0_API_KEY=your_real_key_here
```

Optional:

```env
V0_PROJECT_ID=proj_1234567890
```

Then start Codex from the project root.

## Recommended first run
If you already have an existing v0 chat, either:
- paste that chat ID into `ai/v0-chat-id.txt`, or
- ask Codex to call `v0_set_chat_id`

Then ask Codex to do a UI task.

Example:

```txt
Refine the scripture reader page. Follow AGENTS.md and use the v0 bridge first.
```

## MCP tools
### `v0_ui_roundtrip`
The main tool. It creates a new v0 chat or continues the stored one, then syncs the latest state into the repo.

Inputs:
- `prompt` — required
- `forceNewChat` — optional
- `projectId` — optional

Writes:
- `ai/v0-chat-id.txt`
- `ai/v0-context.md`
- `design/v0-last-response.json`
- `design/v0-history/*.json`

### `v0_sync_chat`
Re-pulls a chat and refreshes the local files.

### `v0_get_chat_state`
Returns the currently bound chat info and a synced summary.

### `v0_set_chat_id`
Pins this repo to an existing v0 chat.

### `v0_reset_chat`
Clears the current binding so the next roundtrip starts fresh.

## How to use it well
- Keep `ai/v0-system-prompt.md` aligned with your product's visual direction.
- Let v0 handle design direction and layout.
- Let Codex handle integration, state wiring, routing, and refactors.
- Reuse one shared chat for a feature area so v0 accumulates context.

## Notes
This package is set up against the current public Codex MCP and v0 Platform API docs. If either SDK changes a minor API shape, you may need a small version bump or import-path tweak locally. citeturn408251search6turn704878search2
