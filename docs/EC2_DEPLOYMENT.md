# EC2 Deployment

This app deploys as a standard Next.js production build on a single Amazon Linux EC2 instance.

## Required Inputs

- EC2 SSH host or public DNS
- EC2 PEM key path
- RDS MySQL admin username/password for one-time bootstrap
- Strong `MYSQL_APP_PASSWORD`
- Strong `AUTH_SECRET` with at least 32 characters

## Environment File

Create a local env file from `.env.example`, fill in real values, and keep it out of Git:

```bash
cp .env.example .env.production.ec2
```

The deploy script uploads this file to `/etc/scripture-study.env`.

## Deploy

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ec2-deploy.ps1 `
  -HostName "ec2-public-hostname" `
  -KeyPath "C:\path\to\key.pem" `
  -EnvFile ".\.env.production.ec2"
```

The script installs system packages, pulls from GitHub, runs migrations, builds the app, creates a `systemd` service, and configures Nginx to proxy port `80` to `127.0.0.1:3000`.

## One-Time MySQL Bootstrap

The first deployment can run the bootstrap by passing `-RunBootstrap`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ec2-deploy.ps1 `
  -HostName "ec2-public-hostname" `
  -KeyPath "C:\path\to\key.pem" `
  -EnvFile ".\.env.production.ec2" `
  -RunBootstrap
```

After bootstrap succeeds, remove `MYSQL_ADMIN_URL` from `/etc/scripture-study.env` and redeploy without `-RunBootstrap`.
