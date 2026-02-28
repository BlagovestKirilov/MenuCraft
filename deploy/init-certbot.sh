#!/bin/bash
# ================================================================
# Initial Certbot Setup for menucraft.online
# Run this ONCE on the EC2 server after the proxy is running.
# ================================================================
set -e

DOMAIN="menucraft.online"
EMAIL="your-email@example.com"  # <-- CHANGE THIS to your real email

echo "=== Step 1: Obtaining Let's Encrypt certificate for $DOMAIN ==="

# Stop nginx temporarily if running (certbot needs port 80 or webroot)
# We use the webroot method since nginx is already serving the challenge path

docker run --rm \
  -v certbot-webroot:/var/www/certbot \
  -v certbot-certs:/etc/letsencrypt \
  certbot/certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal

echo "=== Step 2: Reloading nginx to pick up new certificates ==="
docker exec nginx_proxy nginx -s reload

echo "=== Done! SSL certificate installed for $DOMAIN ==="
echo "Certificate will auto-renew via the certbot container."
