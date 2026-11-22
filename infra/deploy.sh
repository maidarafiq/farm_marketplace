#!/bin/bash
# Runs ON THE EC2 INSTANCE. GitHub Actions SSHes in and calls this.
# It pulls the latest successful build from S3 and brings the live app up to date.
set -euo pipefail

APP_DIR="/opt/farm-marketplace"
BUCKET="$(cat "$APP_DIR/s3-bucket.txt")"
RELEASE_DIR="$APP_DIR/release"
WEB_ROOT="/var/www/farm-marketplace"
DB_PATH="$APP_DIR/marketplace.db"   # lives outside the release dir so it survives every deploy

echo ">> Pulling latest build from s3://$BUCKET/builds/latest.zip"
cd "$APP_DIR"
aws s3 cp "s3://$BUCKET/builds/latest.zip" ./latest.zip

echo ">> Unpacking"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
unzip -q -o ./latest.zip -d "$RELEASE_DIR"

echo ">> Installing backend dependencies (native module built for this host)"
cd "$RELEASE_DIR/backend"
npm ci --omit=dev

echo ">> Restarting backend with pm2"
pm2 delete farm-backend >/dev/null 2>&1 || true
DB_PATH="$DB_PATH" pm2 start server.js --name farm-backend --cwd "$RELEASE_DIR/backend"
pm2 save

echo ">> Publishing frontend build"
sudo rm -rf "${WEB_ROOT:?}"/*
sudo cp -r "$RELEASE_DIR/frontend"/* "$WEB_ROOT"/

echo ">> Reloading nginx"
sudo systemctl reload nginx

echo ">> Deploy complete: $(date)"
