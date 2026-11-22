#!/bin/bash
# ONE-TIME setup. Run this manually on a fresh EC2 instance (Ubuntu 22.04)
# before the pipeline ever deploys to it:
#
#   scp -i your-key.pem infra/ec2-bootstrap.sh ubuntu@<EC2_PUBLIC_IP>:~/
#   ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
#   chmod +x ec2-bootstrap.sh && sudo ./ec2-bootstrap.sh <YOUR_S3_BUCKET_NAME>
set -euo pipefail

BUCKET="${1:?Usage: sudo ./ec2-bootstrap.sh <s3-bucket-name>}"

echo ">> Updating packages"
apt-get update -y

echo ">> Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx unzip

echo ">> Installing pm2 and AWS CLI"
npm install -g pm2
if ! command -v aws >/dev/null; then
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip -q awscliv2.zip
  ./aws/install
  rm -rf awscliv2.zip aws
fi

echo ">> Creating app directories"
mkdir -p /opt/farm-marketplace
mkdir -p /var/www/farm-marketplace
echo "$BUCKET" > /opt/farm-marketplace/s3-bucket.txt

echo ">> Installing nginx site config"
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/farm-marketplace
ln -sf /etc/nginx/sites-available/farm-marketplace /etc/nginx/sites-enabled/farm-marketplace
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ">> Copying deploy script into place so the pipeline can call it"
mkdir -p /opt/farm-marketplace/infra
cp "$(dirname "$0")/deploy.sh" /opt/farm-marketplace/infra/deploy.sh
chmod +x /opt/farm-marketplace/infra/deploy.sh

echo ""
echo "Bootstrap complete."
echo "Next: attach an IAM role with S3 read access on '$BUCKET' to this EC2"
echo "instance (EC2 console -> Actions -> Security -> Modify IAM role),"
echo "then trigger the GitHub Actions pipeline to run the first real deploy."
