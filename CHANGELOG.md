# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-26

### Added

- Next.js App Router + TypeScript + Tailwind project scaffold
- EC2-first architecture and deployment documentation
- Bible lookup feature route (`/bible`) with loading/error/empty states
- Internal API route (`/api/bible`) with normalized response mapping
- Reusable UI primitives and baseline utility layers (`lib/api`, `lib/normalize`, `lib/errors`)
- Vitest setup and baseline tests for normalization and API error handling
- Local plugins for preflight and release checks
- EC2-like smoke test script (`scripts/ec2-smoke-test.ps1`)
- GitHub Actions CI workflow for typecheck/lint/test/build
