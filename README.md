# Cloud Project

EC2-first Next.js application with TypeScript, Tailwind CSS, and reusable component patterns.

## Project Principles

- TypeScript only
- Next.js App Router only
- Tailwind CSS for styling
- Small reusable components
- Normalize all API data before rendering
- Keep dependencies minimal
- No database unless explicitly required
- Optimize for deployment simplicity on Amazon EC2

## Start Here

- Agent rules: `AGENTS.md`
- EC2 context: `docs/EC2_AGENT_CONTEXT.md`
- Architecture guardrails: `docs/ARCHITECTURE.md`
- Release process: `docs/RELEASE_PROCESS.md`
- Feature roadmap: `feature-plan.md`
- Skills: `codex-skills/`
- Plugins marketplace: `.agents/plugins/marketplace.json`

## Development Workflow

1. Align feature scope in `feature-plan.md`.
2. Implement with App Router and normalization-first data flow.
3. Run preflight checks before merge/release.
4. Validate EC2 readiness (build/start/env/docs).

## Commands

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `powershell -ExecutionPolicy Bypass -File .\plugins\preflight-checks\scripts\run.ps1`
- `powershell -ExecutionPolicy Bypass -File .\plugins\release-check\scripts\run.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\ec2-smoke-test.ps1`

## Environment Variables

- Copy `.env.example` to `.env` for local development.
- Use environment variables for all deploy-time configuration.
- Never commit secrets.

## Deployment Baseline (EC2)

- Build: `npm run build`
- Start: `npm start`
- Runtime: Linux EC2 instance (typically behind Nginx or ALB)
- Port: app must honor `PORT` environment variable

## Pre-Development Checklist

- Core docs are in place and linked
- Required env vars are documented
- Feature scope is documented before implementation
- API data contracts and normalization strategy are defined
- EC2 deployment assumptions are preserved

## Skills Included

- `codex-skills/bible-fetch-skill.md`
- `codex-skills/ec2-deploy-skill.md`
- `codex-skills/ui-component-skill.md`
- `codex-skills/nextjs-app-router-skill.md`
- `codex-skills/api-normalization-skill.md`
- `codex-skills/testing-skill.md`

## Plugins Included

- `plugins/preflight-checks`
- `plugins/release-check`

## Current Feature

- Bible reader route: `/bible?book=GEN&chapter=1&translation=web`
- Bible lookup route: `/lookup`
- Internal API route: `/api/bible?reference=John%203:16&translation=web`
- Daily verse route: `/daily`
- Daily API route: `/api/daily?translation=web`
- Translation compare route: `/compare`
- Compare API route: `/api/compare?reference=John%203:16&primary=web&secondary=kjv`
