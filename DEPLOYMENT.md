# Hướng dẫn Deploy Strapi với PM2 trên Ubuntu 20

## 1. Chuẩn bị Server Ubuntu 20

### Cập nhật hệ thống
```bash
sudo apt update
sudo apt upgrade -y
```

### Cài đặt Node.js (v18 hoặc v20 - khuyến nghị cho Strapi 5)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Kiểm tra version
npm -v
```

### Cài đặt PM2 globally
```bash
sudo npm install -g pm2
pm2 -v  # Kiểm tra version
```

### Cài đặt PostgreSQL/MySQL (tùy theo database bạn dùng)
#### PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Tạo database:
```bash
sudo -u postgres psql
CREATE DATABASE alphalink_cms;
CREATE USER alphalink_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE alphalink_cms TO alphalink_user;
\q
```

### Cài đặt Nginx (làm reverse proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 2. Upload Code lên Server

### Tạo thư mục project
```bash
sudo mkdir -p /var/www/alphalink_cms_new
sudo chown -R $USER:$USER /var/www/alphalink_cms_new
cd /var/www/alphalink_cms_new
```

### Upload code (chọn 1 trong các cách sau):

#### Cách 1: Dùng Git
```bash
git clone https://github.com/hungld87/alphalink_cms_new.git .
```

#### Cách 2: Dùng SCP từ máy local
```bash
# Chạy từ máy local
scp -r /Users/hungld7.dna/Documents/HungLD/Alphalink/alphalink_cms_new/* user@your-server-ip:/var/www/alphalink_cms_new/
```

#### Cách 3: Dùng rsync (khuyến nghị)
```bash
# Chạy từ máy local
rsync -avz --exclude 'node_modules' --exclude '.env' --exclude 'dist' \
  /Users/hungld7.dna/Documents/HungLD/Alphalink/alphalink_cms_new/ \
  user@your-server-ip:/var/www/alphalink_cms_new/
```

## 3. Cấu hình Environment Variables

### Tạo file .env trên server
```bash
cd /var/www/alphalink_cms_new
nano .env
```

### Nội dung file .env (điều chỉnh theo project của bạn):
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=alphalink_cms
DATABASE_USERNAME=alphalink_user
DATABASE_PASSWORD=your_strong_password
DATABASE_SSL=false

# Production URL
NODE_ENV=production
```

**Lưu ý:** Copy các keys từ file `.env` local của bạn hoặc generate mới bằng:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Cài đặt Dependencies và Build

```bash
cd /var/www/alphalink_cms_new

# Cài đặt dependencies
npm install --production

# Build admin panel
NODE_ENV=production npm run build

# Tạo thư mục logs cho PM2
mkdir -p logs
```

## 5. Chạy với PM2

### Sửa đường dẫn trong ecosystem.config.js
```bash
nano ecosystem.config.js
# Đảm bảo cwd: '/var/www/alphalink_cms_new'
```

### Start application với PM2
```bash
pm2 start ecosystem.config.js

# Xem status
pm2 status

# Xem logs
pm2 logs alphalink-cms

# Xem logs realtime
pm2 logs alphalink-cms --lines 100
```

### Setup PM2 tự động khởi động khi server restart
```bash
pm2 startup systemd
# Copy và chạy lệnh mà PM2 suggest

pm2 save
```

### Các lệnh PM2 hữu ích:
```bash
pm2 status                    # Xem trạng thái
pm2 restart alphalink-cms     # Restart app
pm2 stop alphalink-cms        # Stop app
pm2 delete alphalink-cms      # Xóa app khỏi PM2
pm2 logs alphalink-cms        # Xem logs
pm2 monit                     # Monitor CPU/Memory
pm2 reload alphalink-cms      # Zero-downtime reload
```

## 6. Cấu hình Nginx Reverse Proxy

### Tạo file config Nginx
```bash
sudo nano /etc/nginx/sites-available/alphalink-cms
```

### Nội dung file:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site và restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/alphalink-cms /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

## 7. Setup SSL với Let's Encrypt (Optional nhưng khuyến nghị)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 8. Cấu hình Firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

## 9. Update Code và Redeploy

Khi cần update code:

```bash
cd /var/www/alphalink_cms_new

# Pull code mới (nếu dùng Git)
git pull origin main

# Hoặc rsync từ local
# rsync -avz --exclude 'node_modules' --exclude '.env' ...

# Install dependencies mới (nếu có)
npm install --production

# Build lại
NODE_ENV=production npm run build

# Restart PM2
pm2 restart alphalink-cms

# Hoặc dùng zero-downtime reload
pm2 reload alphalink-cms
```

## 10. Monitoring và Troubleshooting

### Xem logs
```bash
# PM2 logs
pm2 logs alphalink-cms --lines 200

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Check process
```bash
pm2 status
pm2 monit
htop
```

### Database backup (PostgreSQL)
```bash
# Backup
pg_dump -U alphalink_user alphalink_cms > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U alphalink_user alphalink_cms < backup_20250105_120000.sql
```

## 11. Security Checklist

- [ ] Đổi password database mạnh
- [ ] Cấu hình firewall (UFW)
- [ ] Setup SSL/HTTPS
- [ ] Disable root SSH login
- [ ] Setup SSH key authentication
- [ ] Regular updates: `sudo apt update && sudo apt upgrade`
- [ ] Setup automated backups
- [ ] Monitor logs thường xuyên

## 12. Performance Tuning (Optional)

### Tăng số instances PM2 (nếu cần)
```javascript
// ecosystem.config.js
instances: 2,  // Hoặc 'max' để dùng tất cả CPU cores
exec_mode: 'cluster',
```

### Cấu hình caching với Nginx
```nginx
# Thêm vào nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Liên hệ

Nếu gặp vấn đề, check:
1. PM2 logs: `pm2 logs alphalink-cms`
2. Nginx logs: `/var/log/nginx/error.log`
3. Database connection
4. File permissions: `ls -la /var/www/alphalink_cms_new`
