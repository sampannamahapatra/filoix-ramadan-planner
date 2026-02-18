#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "Checking for root privileges..."
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit
fi

echo "Updating system..."
apt update && apt upgrade -y

echo "Installing essential packages..."
apt install -y curl gnupg git build-essential

echo " Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "Verifying Node.js and NPM..."
node -v
npm -v

echo "Installing PM2..."
npm install -g pm2
pm2 startup

echo "Installing Nginx..."
apt install -y nginx

echo "Configuring Firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo "Server setup complete!"
