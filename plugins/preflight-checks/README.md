# Preflight Checks Plugin

Runs baseline verification before merge or release prep.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File .\plugins\preflight-checks\scripts\run.ps1
```

## Checks

- Detects if `package.json` exists
- Runs `npm run build` when available
- Runs `npm run typecheck` when available
- Runs `npm test` when available
- Fails fast on command errors
