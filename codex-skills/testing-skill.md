# Testing Skill

Use this skill to define minimum testing expectations before merge or release.

## Minimum Verification Gates

- `npm run build` passes
- Type checking passes
- Critical feature tests pass

## What to Test

- Normalization logic for API responses
- Error mapping and fallback behavior
- Route-level rendering for loading/error/empty states
- Key user flows for primary feature paths

## Test Design Rules

- Prefer small focused tests over broad brittle tests
- Keep test data deterministic and readable
- Cover happy path plus at least one failure path
- Do not rely on external live API calls in automated tests

## Release Readiness

- Ensure env var requirements are documented
- Ensure EC2 assumptions remain valid (`build`, `start`, `PORT`)
- Flag missing tests as explicit risks if shipping anyway
