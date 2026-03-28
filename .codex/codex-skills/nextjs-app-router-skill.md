# Next.js App Router Skill

Use this skill when implementing or refactoring routes in this project.

## Core Rules

- Use Next.js App Router patterns only (`app/` directory)
- Prefer Server Components by default
- Use Client Components only when browser interactivity is required
- Keep route files focused and move logic into `lib/` and reusable components

## Routing Conventions

- Use clear route groups and segment naming
- Keep `layout.tsx` shared concerns in layouts, not in every page
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` where appropriate

## Data Fetching

- Fetch on server when possible
- Normalize external API payloads before rendering
- Do not pass raw external responses directly to UI
- Handle timeout/error scenarios with typed boundaries

## Performance and Reliability

- Keep route-level components lean
- Avoid unnecessary client-side data fetching duplication
- Respect EC2 deployment simplicity (no extra infrastructure assumptions)
