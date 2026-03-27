# EC2 Agent Context

This project is EC2-first. All agents should assume the app will be deployed to a Linux-based Amazon EC2 instance with minimal operational overhead.

## Required Deployment Shape

- Build command: `npm run build`
- Start command: `npm start`
- App router: Next.js App Router
- Language: TypeScript only
- Styling: Tailwind CSS
- Default app port: `3000` (must support `PORT` env override)

## Rules Every Agent Should Follow

- Optimize for simple EC2 deployment and rollback
- Keep components small and reusable
- Normalize all API data before rendering
- Do not introduce unnecessary libraries
- Do not add a database unless explicitly required
- Do not introduce Docker or complex infra unless explicitly requested

## Environment and Config

- Put deploy-time values in environment variables
- Never hardcode:
  - secrets
  - domains/hostnames
  - AWS account/region-specific values
- Keep configuration explicit and documented

## Runtime Expectations on EC2

- Linux environment (Amazon Linux style assumptions)
- Process management compatible with `systemd`
- Logs emitted to stdout/stderr
- Works behind reverse proxy or load balancer

## Implementation Guardrails

- Prefer stateless request handling
- Avoid local disk persistence for critical application state
- Keep server startup predictable and lightweight
- Handle API/network errors with clear user-safe fallbacks

## Definition of Done for EC2-Safe Changes

- `npm run build` passes
- `npm start` works in production mode
- Feature does not require extra infra by default
- Any required env vars are documented
