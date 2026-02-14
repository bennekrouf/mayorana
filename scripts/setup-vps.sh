#!/bin/bash
# =============================================================================
# Mayorana VPS Setup Script for Debian 13 (OVH VPS)
# =============================================================================
# SSH in as debian, then run:
#   sudo bash setup-vps.sh
#
# This script will:
#   1. Update the system + fix locale
#   2. Harden the existing 'debian' user (sudo, SSH key-only)
#   3. Install fail2ban (SSH + nginx brute force + scanner + recidive)
#   4. Install Node.js 22 LTS + PM2
#   5. Configure UFW firewall
#   6. Harden SSH (disable root login, disable password auth)
#   7. Create app user, generate deploy key, clone repo
#   8. Generate a strong admin secret and create .env
#   9. Build the project and start it with PM2
#  10. Configure nginx
#  11. Obtain SSL certificate with certbot
# =============================================================================

set -euo pipefail

# --- Configuration ---
DOMAIN="mayorana.ch"
DOMAIN_WWW="www.mayorana.ch"
REPO="git@github.com:bennekrouf/mayorana.git"
APP_DIR="/var/www/mayorana"
APP_PORT=3006
APP_USER="mayorana"       # Unprivileged user that runs the Node.js app only
DEPLOY_USER="debian"      # OVH default SSH user (your login account)
VPS_IP="57.131.31.38"
NODE_VERSION=22

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[X]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

# --- Pre-flight checks ---
if [ "$EUID" -ne 0 ]; then
  err "Please run as root: sudo bash setup-vps.sh"
fi

# =============================================================================
step "1/11 — System update + fix locale"
# =============================================================================
# Fix locale warnings (common on OVH Debian VPS)
apt install -y locales
sed -i 's/# en_GB.UTF-8 UTF-8/en_GB.UTF-8 UTF-8/' /etc/locale.gen 2>/dev/null || true
sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen 2>/dev/null || true
locale-gen
update-locale LANG=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

apt update && apt upgrade -y
apt install -y curl wget git ufw gnupg2 \
  ca-certificates lsb-release sudo fail2ban openssl
log "System updated, locale fixed"

# =============================================================================
step "2/11 — Harden deploy user ($DEPLOY_USER)"
# =============================================================================
# Ensure debian user has sudo
if ! groups "$DEPLOY_USER" | grep -q sudo; then
  usermod -aG sudo "$DEPLOY_USER"
fi

# Allow sudo without password (OVH may already have this)
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
chmod 440 /etc/sudoers.d/$DEPLOY_USER

# Ensure SSH key is set up
if [ ! -f "/home/$DEPLOY_USER/.ssh/authorized_keys" ] || [ ! -s "/home/$DEPLOY_USER/.ssh/authorized_keys" ]; then
  mkdir -p "/home/$DEPLOY_USER/.ssh"
  warn "No SSH key found for '$DEPLOY_USER'."
  warn "In a SEPARATE terminal, run from your local machine:"
  warn "  ssh-copy-id $DEPLOY_USER@$VPS_IP"
  warn ""
  warn "Or manually paste your public key:"
  warn "  echo 'ssh-ed25519 AAAA...' >> /home/$DEPLOY_USER/.ssh/authorized_keys"
  read -p "Press Enter once you've added your SSH key for $DEPLOY_USER..." _
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  chmod 700 "/home/$DEPLOY_USER/.ssh"
  chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

log "Deploy user '$DEPLOY_USER' hardened with sudo access"

# =============================================================================
step "3/11 — Configure fail2ban"
# =============================================================================

# SSH jail — ban after 3 failed attempts for 1 hour
cat > /etc/fail2ban/jail.d/sshd.conf <<'F2B_SSH'
[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
findtime = 600
bantime  = 3600
F2B_SSH

# nginx rate limit jail — ban IPs that hit 429 too often
cat > /etc/fail2ban/jail.d/nginx-limit-req.conf <<'F2B_NGINX'
[nginx-limit-req]
enabled  = true
port     = http,https
filter   = nginx-limit-req
logpath  = /var/log/nginx/mayorana_error.log
maxretry = 10
findtime = 60
bantime  = 3600
F2B_NGINX

# nginx scanner/bot jail — ban IPs scanning for common attack paths
cat > /etc/fail2ban/filter.d/nginx-scanner.conf <<'F2B_SCANNER_FILTER'
[Definition]
failregex = ^<HOST> .* "(GET|POST|HEAD) /(wp-admin|wp-login|phpmyadmin|phpMyAdmin|\.env|\.git|admin|xmlrpc\.php).* HTTP/.*" (403|404)
ignoreregex =
F2B_SCANNER_FILTER

cat > /etc/fail2ban/jail.d/nginx-scanner.conf <<'F2B_SCANNER_JAIL'
[nginx-scanner]
enabled  = true
port     = http,https
filter   = nginx-scanner
logpath  = /var/log/nginx/mayorana_access.log
maxretry = 5
findtime = 300
bantime  = 86400
F2B_SCANNER_JAIL

# Recidive jail — ban repeat offenders for 1 week
cat > /etc/fail2ban/jail.d/recidive.conf <<'F2B_RECIDIVE'
[recidive]
enabled  = true
filter   = recidive
logpath  = /var/log/fail2ban.log
maxretry = 3
findtime = 86400
bantime  = 604800
F2B_RECIDIVE

systemctl enable fail2ban
systemctl restart fail2ban
log "fail2ban configured with 4 jails: SSH, nginx-limit-req, nginx-scanner, recidive"

# =============================================================================
step "4/11 — Install Node.js $NODE_VERSION LTS"
# =============================================================================
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt install -y nodejs
  log "Node.js $(node -v) installed"
else
  log "Node.js $(node -v) already installed"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  log "PM2 installed"
else
  log "PM2 already installed"
fi

# =============================================================================
step "5/11 — Configure UFW firewall"
# =============================================================================
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (critical — don't lock yourself out!)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Block direct access to app port from outside
ufw deny 3006/tcp comment 'Block direct Node.js access'

# Enable firewall
echo "y" | ufw enable
ufw status verbose
log "UFW firewall configured"

# =============================================================================
step "6/11 — Harden SSH"
# =============================================================================
# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Disable root login and password authentication
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*UsePAM.*/UsePAM no/' /etc/ssh/sshd_config

# Only allow the debian user to SSH in
if ! grep -q "^AllowUsers" /etc/ssh/sshd_config; then
  echo "AllowUsers $DEPLOY_USER" >> /etc/ssh/sshd_config
fi

# Test config before restarting (don't lock yourself out!)
sshd -t || err "SSH config test failed! Check /etc/ssh/sshd_config"
systemctl restart sshd
log "SSH hardened: root disabled, password disabled, only '$DEPLOY_USER' allowed"

# =============================================================================
step "7/11 — Create app user and clone repo"
# =============================================================================
# Create an unprivileged user for the app (no login shell, no SSH)
if ! id "$APP_USER" &>/dev/null; then
  useradd -r -m -d /var/www -s /usr/sbin/nologin "$APP_USER"
  log "Created app user: $APP_USER (nologin shell, runs Node.js only)"
else
  log "App user $APP_USER already exists"
fi

# Generate deploy key automatically (no manual step needed)
if [ ! -f "/var/www/.ssh/id_ed25519" ]; then
  mkdir -p /var/www/.ssh
  ssh-keygen -t ed25519 -C 'mayorana-deploy' -f /var/www/.ssh/id_ed25519 -N ''
  chown "$APP_USER:$APP_USER" /var/www/.ssh
  chown "$APP_USER:$APP_USER" /var/www/.ssh/id_ed25519
  chown "$APP_USER:$APP_USER" /var/www/.ssh/id_ed25519.pub
  chmod 700 /var/www/.ssh
  chmod 600 /var/www/.ssh/id_ed25519
  log "Generated deploy key for $APP_USER"
fi

echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}  ADD THIS DEPLOY KEY TO GITHUB                                 ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}  Go to: https://github.com/bennekrouf/mayorana/settings/keys   ${NC}"
echo -e "${YELLOW}  Click 'Add deploy key', paste this key:                       ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
cat /var/www/.ssh/id_ed25519.pub
echo ""
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo ""
read -p "Press Enter once the deploy key is added to GitHub..." _

# Clone the repo
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
step "8/11 — Generate secret key and create .env"
# =============================================================================
ADMIN_SECRET=$(openssl rand -hex 32)

cat > "$APP_DIR/.env" <<EOF
ADMIN_SECRET_KEY=$ADMIN_SECRET
EOF

chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

log "Generated strong admin secret key (64 chars)"
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}  SAVE THIS — your admin secret key:                            ${NC}"
echo -e "${YELLOW}  $ADMIN_SECRET${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo ""

# =============================================================================
step "9/11 — Install dependencies, build, and start with PM2"
# =============================================================================
# npm/pm2 need a writable HOME and a shell — use bash explicitly
sudo -u "$APP_USER" HOME=/var/www bash -c "
  cd $APP_DIR
  npm install
  npm run build
  $(which pm2) start ecosystem.config.js
  $(which pm2) save
"

# Set PM2 to start on boot
env PATH=$PATH:/usr/bin $(which pm2) startup systemd -u "$APP_USER" --hp /var/www
sudo -u "$APP_USER" HOME=/var/www bash -c "$(which pm2) save"
log "App built and running on PM2 (port $APP_PORT)"

# =============================================================================
step "10/11 — Install and configure nginx"
# =============================================================================
apt install -y nginx

# Write nginx config
cat > /etc/nginx/sites-available/mayorana <<'NGINX'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    listen 80;
    server_name mayorana.ch www.mayorana.ch;

    access_log /var/log/nginx/mayorana_access.log;
    error_log /var/log/nginx/mayorana_error.log;

    # Block /admin entirely from the public internet
    location /admin {
        return 403;
    }

    location /api/admin {
        return 403;
    }

    # Main proxy
    location / {
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 50;

        limit_req_status 429;
        limit_conn_status 429;

        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

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

# Enable the site
ln -sf /etc/nginx/sites-available/mayorana /etc/nginx/sites-enabled/mayorana
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t || err "nginx config test failed!"
systemctl enable nginx
systemctl restart nginx
log "nginx installed and configured"

# =============================================================================
step "11/11 — SSL with Certbot"
# =============================================================================
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}  DNS CONFIGURATION REQUIRED                                    ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}  Add these DNS records at your domain registrar:               ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}  Type   Name   Value              TTL                          ${NC}"
echo -e "${YELLOW}  ----   ----   -----              ---                          ${NC}"
echo -e "${YELLOW}  A      @      $VPS_IP            300                          ${NC}"
echo -e "${YELLOW}  A      www    $VPS_IP            300                          ${NC}"
echo -e "${YELLOW}                                                                ${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo ""

read -p "Have you configured DNS A records for $DOMAIN and $DOMAIN_WWW? (y/n) " dns_ready

if [ "$dns_ready" != "y" ]; then
  warn "Skipping certbot. Run this later when DNS is ready:"
  warn "  sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW --non-interactive --agree-tos -m your@email.com"
  echo ""
else
  read -p "Enter your email for Let's Encrypt notifications: " le_email

  apt install -y certbot python3-certbot-nginx

  certbot --nginx \
    -d "$DOMAIN" \
    -d "$DOMAIN_WWW" \
    --non-interactive \
    --agree-tos \
    -m "$le_email" \
    --redirect

  # Enable auto-renewal
  systemctl enable certbot.timer
  systemctl start certbot.timer

  log "SSL certificate installed and auto-renewal enabled"
fi

# =============================================================================
step "Setup complete!"
# =============================================================================
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}  SETUP COMPLETE                                                ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}                                                                ${NC}"
echo -e "${GREEN}  Website:     https://$DOMAIN                                  ${NC}"
echo -e "${GREEN}  SSH login:   ssh $DEPLOY_USER@$VPS_IP                         ${NC}"
echo -e "${GREEN}  Root login:  DISABLED                                         ${NC}"
echo -e "${GREEN}  App port:    $APP_PORT (blocked externally by UFW)             ${NC}"
echo -e "${GREEN}  /admin:      blocked by nginx + middleware                     ${NC}"
echo -e "${GREEN}                                                                ${NC}"
echo -e "${GREEN}  Security:                                                     ${NC}"
echo -e "${GREEN}    - UFW:       SSH + HTTP + HTTPS only                        ${NC}"
echo -e "${GREEN}    - fail2ban:  SSH + nginx rate limit + scanner + recidive     ${NC}"
echo -e "${GREEN}    - SSH:       key-only, no root, no password                 ${NC}"
echo -e "${GREEN}    - App:       runs as unprivileged '$APP_USER' user          ${NC}"
echo -e "${GREEN}                                                                ${NC}"
echo -e "${GREEN}  To access admin panel, use SSH tunnel:                        ${NC}"
echo -e "${GREEN}    ssh -L $APP_PORT:localhost:$APP_PORT $DEPLOY_USER@$VPS_IP   ${NC}"
echo -e "${GREEN}    Then open: http://localhost:$APP_PORT/admin                 ${NC}"
echo -e "${GREEN}                                                                ${NC}"
echo -e "${GREEN}  Useful commands:                                              ${NC}"
echo -e "${GREEN}    sudo -u $APP_USER pm2 status           — app status         ${NC}"
echo -e "${GREEN}    sudo -u $APP_USER pm2 logs mayorana    — app logs           ${NC}"
echo -e "${GREEN}    sudo -u $APP_USER pm2 restart mayorana — restart app        ${NC}"
echo -e "${GREEN}    sudo ufw status                        — firewall status    ${NC}"
echo -e "${GREEN}    sudo fail2ban-client status             — all jails         ${NC}"
echo -e "${GREEN}    sudo fail2ban-client status sshd        — SSH bans          ${NC}"
echo -e "${GREEN}    sudo fail2ban-client status nginx-scanner — scanner bans    ${NC}"
echo -e "${GREEN}    sudo nginx -t && sudo systemctl reload nginx                ${NC}"
echo -e "${GREEN}    sudo certbot renew --dry-run            — test renewal      ${NC}"
echo -e "${GREEN}                                                                ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
