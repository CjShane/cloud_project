# Feature Plan

Use this file to define scope before implementation starts.

## Goals

- Build an EC2-first Next.js app with predictable deployment
- Keep architecture simple and maintainable
- Enforce normalized API data rendering

## Phase 0: Foundation

- [x] Project scaffolding finalized (Next.js App Router + TypeScript + Tailwind)
- [x] Core docs complete (`README`, `AGENTS`, EC2 and architecture docs)
- [x] Skill docs finalized for UI, API normalization, testing, and deployment
- [x] Plugin checks available for preflight and release readiness

## Phase 1: Core Application

- [x] Define initial routes and layouts
- [x] Implement shared UI primitives
- [x] Implement first normalized API integration
- [x] Add loading/error/empty states for core views

## Phase 2: Quality and Hardening

- [x] Add baseline tests for core features
- [x] Ensure all env vars are documented in `.env.example`
- [x] Validate `npm run build` and `npm start` behavior
- [x] Confirm EC2-safe runtime assumptions

## Phase 3: Launch Readiness

- [x] Run preflight plugin checks
- [x] Run release-check plugin checklist
- [x] Smoke-test in EC2-like environment
- [x] Freeze and tag release candidate

## Scope Guardrails

- No database unless explicitly approved
- No Docker/infrastructure expansion unless explicitly approved
- No unnecessary dependencies
