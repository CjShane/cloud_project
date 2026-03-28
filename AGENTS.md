# Project Rules

- Use TypeScript only
- Use Next.js app router
- Use Tailwind CSS for styling
- Keep components small and reusable
- Normalize all API data before rendering
- Do not introduce unnecessary libraries
- Optimize for EC2 deployment simplicity
- No database unless explicitly required

## EC2-First Agent Context

- All implementation decisions should assume deployment on a single Amazon EC2 Linux instance.
- Keep runtime simple: `npm run build` then `npm start` (no Docker unless explicitly requested).
- App must honor `PORT` from environment and be compatible with reverse proxy setups.
- Use environment variables for configuration; never hardcode hostnames, secrets, or region-specific values.
- Do not rely on local persistent disk for critical app data.
- Prefer minimal operational complexity:
  - avoid adding infra-heavy services by default
  - avoid adding new runtime dependencies unless clearly necessary
  - keep deployment and rollback steps straightforward
- Changes should remain compatible with process-manager/systemd style execution.

## Deployment Assumptions

- Target OS: Amazon Linux (systemd available)
- Node.js: active LTS
- Build artifact: standard Next.js production build
- Network: app typically sits behind Nginx/ALB and should run on an internal app port (commonly 3000)

## Codex <-> v0 UI Workflow

### Mission
Use Codex for application logic, integration, refactors, testing, and file edits.
Use v0 for UI direction, component structure, layout exploration, design-system choices, and polished Tailwind/React interface ideas.

### High-Priority Rule
For any task involving UI, layout, styling, responsive behavior, page structure, component design, or visual polish:
1. Call `v0_ui_roundtrip` first.
2. Read the returned summary and the files written into `ai/` and `design/`.
3. Then implement or integrate the result into the real app.
4. Only skip v0 if the task is clearly non-visual or v0 is unavailable.

### Files That Matter
- `ai/v0-chat-id.txt` - current shared v0 chat ID
- `ai/v0-system-prompt.md` - persistent system prompt for v0
- `ai/v0-context.md` - latest human-readable summary from the bridge
- `design/v0-last-response.json` - raw synced chat snapshot for debugging
- `design/v0-history/` - timestamped raw snapshots over time

### Behavior Rules
- Preserve the existing design language unless the user explicitly asks for a redesign.
- Prefer modular React/Next.js + Tailwind output.
- Integrate v0 ideas into the current codebase instead of replacing unrelated files.
- When asking v0 for help, include concrete constraints from the repo.
- After integration, keep `ai/v0-context.md` in sync by calling `v0_sync_chat` if needed.

### Prompting Pattern for v0
When sending a UI request to v0, include:
- the user goal
- the current page or component name
- required tech stack
- visual direction to preserve
- constraints like accessibility, responsiveness, dark mode, or data bindings
