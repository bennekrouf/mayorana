#!/bin/bash
# =============================================================================
# solanize-landing VPS Setup Script
# =============================================================================
# Run this script on your VPS as root:
#   sudo bash setup-solanize-vps.sh
# 
# Assumes the server is already provisioned (Node.js, PM2, Nginx, UFW, fail2ban)
# =============================================================================

set -euo pipefail

# --- Configuration ---
DOMAIN="ribh.io"
DOMAIN_WWW="www.ribh.io"
REPO="git@github.com:bennekrouf/landing-solanize.git"
APP_DIR="/var/www/solanize-landing"
APP_PORT=4002
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
  echo -e "\033[0;31m[X]\033[0m Please run as root: sudo bash setup-solanize-vps.sh"
  exit 1
fi

# =============================================================================
step "1/4 — Ensure App User & Deploy Key"
# =============================================================================
# Ensure app user exists
if ! id "$APP_USER" &>/dev/null; then
  useradd -r -m -d /var/www -s /usr/sbin/nologin "$APP_USER"
  log "Created app user: $APP_USER"
fi

# Use existing deploy key or generate a new one if it lacks one for github
if [ ! -f "/var/www/.ssh/id_ed25519" ]; then
  mkdir -p /var/www/.ssh
  ssh-keygen -t ed25519 -C 'solanize-deploy' -f /var/www/.ssh/id_ed25519 -N ''
  chown -R "$APP_USER:$APP_USER" /var/www/.ssh
  chmod 700 /var/www/.ssh
  chmod 600 /var/www/.ssh/id_ed25519
  log "Generated deploy key for $APP_USER"
else
  log "SSH key /var/www/.ssh/id_ed25519 already exists."
fi

echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}  ENSURE THIS DEPLOY KEY IS ADDED TO GITHUB LANDING-SOLANIZE    ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}  Repository: https://github.com/bennekrouf/landing-solanize    ${NC}"
echo -e "${YELLOW}  Go to: Settings -> Deploy keys -> Add deploy key              ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
cat /var/www/.ssh/id_ed25519.pub
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo ""
read -p "Press Enter once the deploy key is added to landing-solanize..." _

# =============================================================================
step "2/4 — Clone Repository"
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
step "3/4 — Install, Build, and Start App"
# =============================================================================
# Using bash to source node environments properly if needed
sudo -u "$APP_USER" HOME=/var/www bash -c "
  cd $APP_DIR
  npm install -g yarn 2>/dev/null || true
  npm install
  npm run build
  $(which pm2) start ecosystem.config.js
  $(which pm2) save
"
log "solanize-landing built and running via PM2 on port $APP_PORT"

# =============================================================================
step "4/4 — Configure Nginx & SSL"
# =============================================================================
cat > /etc/nginx/sites-available/solanize <<NGINX
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;

    access_log /var/log/nginx/solanize_access.log;
    error_log /var/log/nginx/solanize_error.log;

    location / {
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 50;

        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        client_max_body_size 1m;

        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}
NGINX

# Enable site and reload
ln -sf /etc/nginx/sites-available/solanize /etc/nginx/sites-enabled/solanize
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
step "solanize-landing Deployment Complete!"
# =============================================================================
echo -e "${GREEN}Website: https://$DOMAIN${NC}"
echo -e "${GREEN}App is running locally on port $APP_PORT${NC}"
echo ""
