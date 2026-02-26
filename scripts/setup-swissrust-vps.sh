#!/bin/bash
# =============================================================================
# swissrust.ch Nginx Setup Script
# =============================================================================
# Run this script on your VPS as root:
#   sudo bash setup-swissrust-vps.sh
# 
# This configures Nginx to point swissrust.ch to the mayorana frontend
# =============================================================================

set -euo pipefail

DOMAIN="swissrust.ch"
DOMAIN_WWW="www.swissrust.ch"
APP_PORT=3006

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

if [ "$EUID" -ne 0 ]; then
  echo -e "\033[0;31m[X]\033[0m Please run as root: sudo bash setup-swissrust-vps.sh"
  exit 1
fi

step "1/2 — Configure Nginx"
cat > /etc/nginx/sites-available/swissrust <<NGINX
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;

    access_log /var/log/nginx/swissrust_access.log;
    error_log /var/log/nginx/swissrust_error.log;

    location / {
        limit_req zone=general burst=100 nodelay;
        limit_conn addr 150;

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

ln -sf /etc/nginx/sites-available/swissrust /etc/nginx/sites-enabled/swissrust
nginx -t && systemctl reload nginx
log "Nginx configured for $DOMAIN pointing to mayorana port $APP_PORT"

step "2/2 — Enable SSL (Certbot)"
echo ""
read -p "Have you pointed DNS A records for $DOMAIN and $DOMAIN_WWW to this VPS? (y/n) " dns_ready
if [ "$dns_ready" == "y" ]; then
  certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos --register-unsafely-without-email --redirect
  log "SSL certificate installed"
else
  warn "Skipping SSL. Run 'sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW' later."
fi

echo -e "\n${GREEN}swissrust.ch is now mapped to mayorana!${NC}"
