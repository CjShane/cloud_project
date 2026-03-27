# API Normalization Skill

Use this skill whenever consuming external API data.

## Non-Negotiables

- Never render raw API responses directly in UI
- Normalize all external payloads into typed app models
- Keep normalization logic in a dedicated layer (for example `lib/normalize`)

## Recommended Pattern

1. Fetch raw payload in `lib/api/*`.
2. Validate and normalize in `lib/normalize/*`.
3. Return typed normalized model to page/component layer.

## Type and Error Standards

- Use explicit TypeScript types for normalized models
- Coerce and sanitize primitives (numbers, strings, nullable fields)
- Define typed error categories:
  - `NOT_FOUND`
  - `RATE_LIMITED`
  - `UPSTREAM_UNAVAILABLE`
  - `NETWORK_ERROR`
  - `INVALID_RESPONSE`

## Reliability Rules

- Handle non-2xx, network failures, and malformed payloads
- Add lightweight retry only for transient failures
- Keep user-facing errors clear and safe
- Always support loading/error/empty UI states
