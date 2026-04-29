param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [Parameter(Mandatory = $true)]
  [string]$KeyPath,

  [Parameter(Mandatory = $true)]
  [string]$EnvFile,

  [string]$GitRef = "main",
  [switch]$RunBootstrap
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $KeyPath)) {
  throw "SSH key not found: $KeyPath"
}

if (-not (Test-Path $EnvFile)) {
  throw "Environment file not found: $EnvFile"
}

$remote = "ec2-user@$HostName"
$remoteEnv = "/tmp/scripture-study.env"
$bootstrapFlag = if ($RunBootstrap) { "1" } else { "0" }

scp -i $KeyPath $EnvFile "${remote}:$remoteEnv"

$remoteScript = @'
set -euo pipefail

APP_DIR="/opt/scripture-study"
REPO_URL="https://github.com/CjShane/cloud_project.git"
GIT_REF="__GIT_REF__"
RUN_BOOTSTRAP="__RUN_BOOTSTRAP__"

sudo mkdir -p "$APP_DIR"
sudo chown ec2-user:ec2-user "$APP_DIR"
sudo mv "__REMOTE_ENV__" /etc/scripture-study.env
sudo chmod 600 /etc/scripture-study.env

if command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y git nginx nodejs22 nodejs22-npm
  sudo alternatives --set node /usr/bin/node-22 || true
else
  sudo yum install -y git nginx nodejs npm
fi

if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab >/dev/null
elif ! swapon --show=NAME | grep -q '^/swapfile$'; then
  sudo swapon /swapfile
fi

node --version
npm --version

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin
git checkout "$GIT_REF"
git pull --ff-only origin "$GIT_REF"

npm ci

set -a
. /etc/scripture-study.env
set +a

if [ "$RUN_BOOTSTRAP" = "1" ]; then
  npm run db:bootstrap:mysql
else
  npm run db:migrate
fi

npm run build

sudo tee /etc/systemd/system/scripture-study.service >/dev/null <<'SERVICE'
[Unit]
Description=Scripture Study Next.js App
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/scripture-study
EnvironmentFile=/etc/scripture-study.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
SERVICE

sudo tee /etc/nginx/conf.d/scripture-study.conf >/dev/null <<'NGINX'
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX

sudo systemctl daemon-reload
sudo systemctl enable scripture-study
sudo systemctl restart scripture-study
sudo systemctl enable nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl --no-pager status scripture-study
'@

$remoteScript = $remoteScript.Replace("__GIT_REF__", $GitRef)
$remoteScript = $remoteScript.Replace("__RUN_BOOTSTRAP__", $bootstrapFlag)
$remoteScript = $remoteScript.Replace("__REMOTE_ENV__", $remoteEnv)

$remoteScript | ssh -i $KeyPath $remote "bash -s"
