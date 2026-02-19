#!/bin/bash
HOST="root@89.167.59.65"
DIR="/var/www/ramadan-planner"

echo "Deploying to $HOST..."

# Create directory
ssh $HOST "mkdir -p $DIR"

# Clone/Pull repo
ssh $HOST "if [ -d $DIR/.git ]; then cd $DIR && git reset --hard && git pull; else git clone https://github.com/sampannamahapatra/filoix-ramadan-planner.git $DIR; fi"

# Upload configs
scp .env.production $HOST:$DIR/.env
scp nginx.conf $HOST:/etc/nginx/sites-available/ramadan-planner

# Install dependencies and build
ssh $HOST "cd $DIR && npm install && npx prisma generate && npm run build"

# Configure Nginx
ssh $HOST "ln -sf /etc/nginx/sites-available/ramadan-planner /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx"

# Restart PM2
ssh $HOST "cd $DIR && pm2 delete ramadan-planner || true && pm2 start 'npm start -- -p 3001' --name 'ramadan-planner'"

echo "Deployment complete!"
