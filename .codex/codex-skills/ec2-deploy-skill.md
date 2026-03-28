# EC2 Deploy Skill

Use this skill whenever features or architecture choices may impact EC2 deployment.

## Core Assumptions

- Runtime target is a single Amazon EC2 Linux instance
- App runs with:
  - `npm run build`
  - `npm start`
- Default app port is `3000`, but always respect `PORT` env var
- Avoid complex infrastructure by default (no Docker unless explicitly asked)
- Prefer simple, repeatable deploy/rollback operations

## Agent Behavior Contract

- Keep dependencies minimal and justify any new package
- Prefer stateless app design
- Do not require managed services unless explicitly requested
- Never hardcode secrets, hostnames, regions, or credentials
- Use environment variables for all deploy-time config
- Keep logs on stdout/stderr for systemd/journal collection

## Code-Level Constraints

- Do not rely on local filesystem persistence for required business data
- Keep API integrations resilient with clear timeout/error handling
- Normalize external API data before rendering
- Keep startup deterministic and fast (avoid heavy boot-time work)
- Ensure production-safe defaults (no dev-only assumptions)

## Deployment Compatibility Checklist

- Build succeeds with `npm run build`
- Start succeeds with `npm start`
- App responds on configured `PORT`
- No required step depends on local interactive tooling
- Environment variables are documented in `.env.example` or docs
- No database requirement unless explicitly approved

## Suggested EC2 Runtime Pattern

- OS: Amazon Linux (systemd available)
- Process manager: `systemd` service for app uptime
- Optional reverse proxy: Nginx forwarding to app port
- SSL termination: usually at ALB or Nginx (project-dependent)

## Non-Goals by Default

- No container orchestration
- No multi-service split unless requested
- No background worker stack unless requested
