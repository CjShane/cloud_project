# Release Process

Use this process for every release candidate.

## Versioning

- Semantic Versioning (`MAJOR.MINOR.PATCH`)
- Current baseline: `0.1.0`
- Use:
  - `PATCH` for fixes
  - `MINOR` for backward-compatible features
  - `MAJOR` for breaking changes

## Pre-Release Checks

1. `powershell -ExecutionPolicy Bypass -File .\plugins\preflight-checks\scripts\run.ps1`
2. `powershell -ExecutionPolicy Bypass -File .\plugins\release-check\scripts\run.ps1`
3. `powershell -ExecutionPolicy Bypass -File .\scripts\ec2-smoke-test.ps1`

## Release Steps

1. Update `CHANGELOG.md`
2. Confirm `package.json` version
3. Commit release changes
4. Create annotated tag: `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
5. Push branch and tags

## Rollback

1. Checkout previous tag
2. Redeploy previous build artifact
3. Open incident note and follow-up issue
