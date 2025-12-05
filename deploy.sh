#!/bin/bash

# Script tự động deploy Strapi với PM2
# Sử dụng: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/alphalink_cms_new"
APP_NAME="alphalink-cms"

# Check if running on server
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Backup current version
echo -e "${YELLOW}📦 Creating backup...${NC}"
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p backups
cp -r dist $BACKUP_DIR 2>/dev/null || true
echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"

# Pull latest code (if using Git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull origin main
    echo -e "${GREEN}✅ Code updated${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build admin panel
echo -e "${YELLOW}🔨 Building admin panel...${NC}"
NODE_ENV=production npm run build
echo -e "${GREEN}✅ Build completed${NC}"

# Restart PM2
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 reload $APP_NAME
echo -e "${GREEN}✅ Application restarted${NC}"

# Check status
echo -e "${YELLOW}📊 Checking application status...${NC}"
pm2 status $APP_NAME

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 To view logs, run: pm2 logs $APP_NAME${NC}"
