# Release Check Plugin

Validates EC2 release readiness before deployment.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File .\plugins\release-check\scripts\run.ps1
```

## Checks

- Required docs exist (`README`, `AGENTS`, EC2 context, architecture)
- `.env.example` exists
- `PORT` is documented in `.env.example`
- `npm run build`/`npm start` expectations are documented in README
