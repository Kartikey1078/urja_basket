# Urja Basket API — AWS EC2 deployment (PM2 + Nginx)

Deploy the Express API on a single EC2 instance **without Docker**. The app listens on `process.env.PORT` (default `4000`) and is fronted by Nginx.

## Requirements

- Ubuntu 22.04+ (or Amazon Linux 2023 with equivalent packages)
- Node.js **20+**
- MySQL 8 (Amazon RDS or MySQL on the same EC2 instance)
- Nginx
- PM2 (`npm install -g pm2`)

## 1. Server setup

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

Open security group ports:

- **22** — SSH
- **80 / 443** — HTTP(S) via Nginx
- **4000** — optional; keep closed if only Nginx is public-facing

## 2. Application

```bash
cd /var/www
sudo git clone https://github.com/Kartikey1078/urja_basket.git
cd urja_basket/server
sudo chown -R $USER:$USER .
npm ci
npm run build
mkdir -p logs
```

## 3. Environment

```bash
cp .env.example .env
nano .env
```

Required in production:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (Nginx proxies to this) |
| `CORS_ORIGIN` | Comma-separated storefront + admin URLs |
| `ADMIN_API_KEY` | Min 8 chars; must match admin `ADMIN_API_KEY` |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL (or `MYSQL_URL`) |
| `CLERK_SECRET_KEY` | Clerk secret |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay |

## 4. Database migrations

```bash
npm run deploy:migrate
```

On a **fresh** database this runs full init + seed. On an existing DB it applies pending migrations only.

## 5. PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command to enable on boot
```

Useful commands:

```bash
pm2 status
pm2 logs urja-api
pm2 restart urja-api
```

## 6. Nginx

```bash
sudo cp deploy/nginx-api.conf.example /etc/nginx/sites-available/urja-api
sudo nano /etc/nginx/sites-available/urja-api   # set server_name
sudo ln -s /etc/nginx/sites-available/urja-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

TLS (recommended):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## 7. Health checks

- Liveness: `GET /api/v1/health`
- Database: `GET /api/v1/health/db`

## 8. Deploy updates

```bash
cd /var/www/urja_basket
git pull
cd server
npm ci
npm run build
npm run deploy:migrate
pm2 restart urja-api
```

## Local development

```bash
cp .env.example .env
npm run dev          # tsx watch, port 4000
npm run db:migrate   # migrations only
```
