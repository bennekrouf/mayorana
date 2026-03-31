#!/bin/bash
# =============================================================================
# cvenom-landing VPS Setup Script
# =============================================================================
# Run this script on your VPS as root:
#   sudo bash setup-cvenom-vps.sh
# 
# Assumes the server is already provisioned (Node.js, PM2, Nginx, UFW, fail2ban)
# =============================================================================

set -euo pipefail

# --- Configuration ---
DOMAIN="cvenom.com"
DOMAIN_WWW="www.cvenom.com"
REPO="git@github.com:bennekrouf/cvenom-landing.git"
APP_DIR="/var/www/cvenom-landing"
APP_PORT=4004
APP_USER="mayorana"       # Reusing unprivileged app user for Node apps
DEPLOY_USER="debian"      # VPS login user

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

# --- Pre-flight checks ---
if [ "$EUID" -ne 0 ]; then
  echo -e "\033[0;31m[X]\033[0m Please run as root: sudo bash setup-cvenom-vps.sh"
  exit 1
fi

# =============================================================================
step "1/5 — Ensure App User & Deploy Key"
# =============================================================================
# Ensure app user exists
if ! id "$APP_USER" &>/dev/null; then
  useradd -r -m -d /var/www -s /usr/sbin/nologin "$APP_USER"
  log "Created app user: $APP_USER"
fi

# Use existing deploy key or generate a new one if it lacks one for github
if [ ! -f "/var/www/.ssh/id_ed25519" ]; then
  mkdir -p /var/www/.ssh
  ssh-keygen -t ed25519 -C 'cvenom-deploy' -f /var/www/.ssh/id_ed25519 -N ''
  chown -R "$APP_USER:$APP_USER" /var/www/.ssh
  chmod 700 /var/www/.ssh
  chmod 600 /var/www/.ssh/id_ed25519
  log "Generated deploy key for $APP_USER"
else
  log "SSH key /var/www/.ssh/id_ed25519 already exists."
fi

echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}  ENSURE THIS DEPLOY KEY IS ADDED TO GITHUB CVENOM-LANDING      ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}  Repository: https://github.com/bennekrouf/cvenom-landing      ${NC}"
echo -e "${YELLOW}  Go to: Settings -> Deploy keys -> Add deploy key              ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
cat /var/www/.ssh/id_ed25519.pub
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo ""
read -p "Press Enter once the deploy key is added to cvenom-landing..." _

# =============================================================================
step "2/5 — Clone Repository"
# =============================================================================
if [ ! -d "$APP_DIR" ]; then
  ssh-keyscan github.com >> /var/www/.ssh/known_hosts 2>/dev/null
  chown "$APP_USER:$APP_USER" /var/www/.ssh/known_hosts
  sudo -u "$APP_USER" -H git clone "$REPO" "$APP_DIR"
  log "Repository cloned to $APP_DIR"
else
  warn "Directory $APP_DIR already exists, pulling latest..."
  sudo -u "$APP_USER" -H git -C "$APP_DIR" pull
fi

# =============================================================================
step "3/5 — Create .env file"
# =============================================================================
if [ -f "$APP_DIR/.env" ]; then
  warn ".env already exists at $APP_DIR/.env — skipping creation."
else
  echo ""
  read -p "Enter NEXT_PUBLIC_WHATSAPP_NUMBER (or press Enter to skip): " whatsapp_number
  read -p "Enter NEXT_PUBLIC_API_URL [https://gateway.api0.ai/api/contact]: " api_url
  api_url=${api_url:-https://gateway.api0.ai/api/contact}

  cat > "$APP_DIR/.env" <<EOF
NEXT_PUBLIC_WHATSAPP_NUMBER=${whatsapp_number}
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cvenom.com
NEXT_PUBLIC_API_URL=${api_url}
EOF

  chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  log "Created .env with environment variables"
fi

# =============================================================================
step "4/5 — Install, Build, and Start App"
# =============================================================================
# Create logs directory
mkdir -p "$APP_DIR/logs"
chown "$APP_USER:$APP_USER" "$APP_DIR/logs"

# Using bash to source node environments properly if needed
sudo -u "$APP_USER" HOME=/var/www bash -c "
  cd $APP_DIR
  yarn install
  yarn build
  $(which pm2) start ecosystem.config.js
  $(which pm2) save
"
log "cvenom-landing built and running via PM2 on port $APP_PORT"

# =============================================================================
step "5/5 — Configure Nginx & SSL"
# =============================================================================
cat > /etc/nginx/sites-available/cvenom <<NGINX
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;

    access_log /var/log/nginx/cvenom_access.log;
    error_log /var/log/nginx/cvenom_error.log;

    location / {
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 50;

        limit_req_status 429;
        limit_conn_status 429;

        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Anti-slowloris
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 30s;

        client_max_body_size 1m;

        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    }

    # Block common scanner paths
    location ~* ^/(wp-admin|wp-login|phpmyadmin|phpMyAdmin|xmlrpc\.php|\.env|\.git) {
        return 403;
    }
}
NGINX

# Enable site and reload
ln -sf /etc/nginx/sites-available/cvenom /etc/nginx/sites-enabled/cvenom
nginx -t && systemctl reload nginx
log "Nginx configured for $DOMAIN"

# Try SSL
echo ""
read -p "Have you pointed DNS A records for $DOMAIN and $DOMAIN_WWW to this VPS? (y/n) " dns_ready
if [ "$dns_ready" == "y" ]; then
  certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos --register-unsafely-without-email --redirect
  log "SSL certificate installed"
else
  warn "Skipping SSL. Run 'sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW' later."
fi

# =============================================================================
step "cvenom-landing Deployment Complete!"
# =============================================================================
echo -e "${GREEN}Website: https://$DOMAIN${NC}"
echo -e "${GREEN}App is running locally on port $APP_PORT${NC}"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo -e "${GREEN}  sudo -u $APP_USER pm2 status               — app status${NC}"
echo -e "${GREEN}  sudo -u $APP_USER pm2 logs cvenom-landing   — app logs${NC}"
echo -e "${GREEN}  sudo -u $APP_USER pm2 restart cvenom-landing — restart app${NC}"
echo ""
