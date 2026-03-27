# Architecture Guide

This project follows a simple EC2-first architecture with clear separation between data normalization and UI rendering.

## Architecture Principles

- Keep runtime simple for EC2 deployment
- Separate data fetching/normalization from presentation
- Prefer server components by default in App Router
- Keep components small and composable
- Treat external APIs as untrusted inputs

## Recommended Structure

```txt
app/
  (routes)/
components/
  ui/
  feature/
lib/
  api/
  normalize/
  errors/
```

## Data Flow Contract

1. Fetch raw API response in `lib/api/*`.
2. Normalize response in `lib/normalize/*`.
3. Return typed normalized models to route/page components.
4. Render normalized models only; never render raw API payloads.

## Error Strategy

- Use typed app errors for upstream/network/rate-limit/not-found cases
- Map low-level errors to user-safe messages
- Always define loading, error, and empty states in UI

## EC2 Runtime Constraints

- `npm run build` and `npm start` must be sufficient
- App must respect `PORT` env var
- No reliance on persistent local disk for critical state
- No hardcoded secrets or hostnames

## Dependency Policy

- Add dependencies only when clearly justified
- Prefer built-in Next.js/TypeScript/Tailwind capabilities first
- Avoid infrastructure-heavy additions unless explicitly requested
