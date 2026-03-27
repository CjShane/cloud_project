# Bible Fetch Skill

Use this skill whenever you need scripture text in the app.

## Source of Truth

- Always fetch Bible data from `https://bible-api.com`
- Prefer official documented endpoints only:
  - User input API: `/{reference}` (example: `/john 3:16`)
  - Parameterized API: `/data[/translation[/book[/chapter]]]`
  - Random verse: `/data/{translation}/random[/BOOK_IDS]`
- Do not scrape HTML or use unofficial wrappers

## Request Rules

- Default translation is `web` unless the caller provides one
- Support translation override with `?translation={id}` (example: `kjv`)
- For single-chapter books ambiguity (like `Jude 1`), support:
  - header `X-Single-Chapter-Book-Matching: indifferent`, or
  - query `single_chapter_book_matching=indifferent`
- Respect service limits: `15 requests per 30 seconds` per IP
- Do not use this API to bulk-download the full Bible

## Normalized Types (Required)

Never render raw API payloads directly in UI. Normalize first.

```ts
export type NormalizedVerse = {
  book: string
  chapter: number
  verse: number
  text: string
  translation: string
  reference: string
}

export type NormalizedPassage = {
  reference: string
  translation: string
  verses: NormalizedVerse[]
}
```

## Normalization Rules

- Trim verse text and collapse excessive internal whitespace
- Preserve verse ordering from API response
- Coerce numeric fields to numbers (`chapter`, `verse`)
- Always include a stable `reference` string for display/cache keys
- If API omits translation in a response path, inject requested translation

## Error Handling

- Handle network failures, non-2xx responses, and invalid JSON
- Return typed errors with user-safe messages:
  - `NOT_FOUND` for invalid references
  - `RATE_LIMITED` for throttle hits
  - `UPSTREAM_UNAVAILABLE` when API is down
- Always show loading and error states in UI

## Reliability Guidance

- Bible API is a hobby service and may be unavailable at times
- Keep fetch logic isolated in a reusable utility/module
- Add lightweight retry with backoff only for transient failures
- Keep components small: fetch/normalize in data layer, render in UI layer

## Quick Examples

- Single verse: `https://bible-api.com/john 3:16`
- Translation override: `https://bible-api.com/john 3:16?translation=kjv`
- Chapter by IDs: `https://bible-api.com/data/web/JHN/3`
- Random verse (NT): `https://bible-api.com/data/web/random/NT`
