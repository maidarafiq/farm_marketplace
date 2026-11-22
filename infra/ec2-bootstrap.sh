
#!/usr/bin/env bash
set -euo pipefail

BUCKET_NAME="${1:?Provide your S3 bucket name}"
APP_DIR="/opt/farm-marketplace"
WEB_DIR="/var/www/farm-marketplace"
APP_USER="ubuntu"

# Install system packages
apt-get update
apt-get install -y curl ca-certificates nginx unzip awscli build-essential

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create application directories
mkdir -p "$APP_DIR/infra"
mkdir -p "$APP_DIR/data"
mkdir -p "$WEB_DIR"

# Store the S3 bucket name
printf '%s\n' "$BUCKET_NAME" > "$APP_DIR/s3-bucket.txt"

# Preserve the deployment scripts on EC2
cp /home/ubuntu/infra/deploy.sh "$APP_DIR/infra/deploy.sh"
cp /home/ubuntu/infra/nginx.conf /etc/nginx/sites-available/farm-marketplace

# Set permissions
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$WEB_DIR"
chmod +x "$APP_DIR/infra/deploy.sh"

# Enable Nginx configuration
ln -sfn /etc/nginx/sites-available/farm-marketplace \
  /etc/nginx/sites-enabled/farm-marketplace

rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "EC2 bootstrap completed successfully!"
