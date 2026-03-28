# Codex ↔ v0 UI workflow

## Mission
Use Codex for application logic, integration, refactors, testing, and file edits.
Use v0 for UI direction, component structure, layout exploration, design-system choices, and polished Tailwind/React interface ideas.

## High-priority rule
For any task involving UI, layout, styling, responsive behavior, page structure, component design, or visual polish:
1. Call `v0_ui_roundtrip` first.
2. Read the returned summary and the files written into `ai/` and `design/`.
3. Then implement or integrate the result into the real app.
4. Only skip v0 if the task is clearly non-visual or v0 is unavailable.

## Files that matter
- `ai/v0-chat-id.txt` — current shared v0 chat ID
- `ai/v0-system-prompt.md` — persistent system prompt for v0
- `ai/v0-context.md` — latest human-readable summary from the bridge
- `design/v0-last-response.json` — raw synced chat snapshot for debugging
- `design/v0-history/` — timestamped raw snapshots over time

## Behavior rules
- Preserve the existing design language unless the user explicitly asks for a redesign.
- Prefer modular React/Next.js + Tailwind output.
- Integrate v0 ideas into the current codebase instead of replacing unrelated files.
- When asking v0 for help, include concrete constraints from the repo.
- After integration, keep `ai/v0-context.md` in sync by calling `v0_sync_chat` if needed.

## Prompting pattern for v0
When sending a UI request to v0, include:
- the user goal
- the current page or component name
- required tech stack
- visual direction to preserve
- constraints like accessibility, responsiveness, dark mode, or data bindings

## Example
Use `v0_ui_roundtrip` with a prompt like:
"Refine the scripture reader screen. Keep the warm contemplative design, preserve dark mode, improve mobile verse actions, and return a component structure Codex can integrate into a Next.js + Tailwind app."
