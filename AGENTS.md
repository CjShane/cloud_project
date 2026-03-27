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
