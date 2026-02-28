# Deployment Guide — MenuCraft on EC2 (alongside existing Santase)

## Architecture Overview

Santase stays exactly where it is (`/home/ubuntu/app/`). We only **stop its nginx container**
and replace it with a shared proxy that handles both domains. Santase frontend + backend
containers keep running untouched on their existing `app_santase_network`.

```
/home/ubuntu/
├── app/                       # Existing Santase — NOT MODIFIED
│   ├── docker-compose.yml     # (untouched)
│   ├── .env
│   └── ...
├── proxy/                     # NEW — shared nginx reverse proxy + certbot
│   ├── docker-compose.yml
│   ├── nginx.conf             # Routes deck.bg + menucraft.online
│   └── cloudflare-certs/      # Copied from /home/ubuntu/app/
│       ├── origin.pem
│       └── private.key
└── menucraft/                 # NEW — MenuCraft service
    ├── docker-compose.yml     # (deployed by GitHub Actions)
    ├── .env
    └── backend_logs/
```

The proxy joins two networks:
- **`app_santase_network`** — to reach `santase_frontend` and `santase_backend`
- **`web`** — shared with MenuCraft containers

---

## Prerequisites

- DNS for `menucraft.online` and `www.menucraft.online` pointed to the EC2 public IP
- Docker and Docker Compose installed on the server

---

## One-Time Setup Steps

### 1. Create the shared Docker network

```bash
docker network create web
```

### 2. Stop only the Santase nginx container

The Santase frontend and backend keep running. We only remove the nginx
container because the new shared proxy will take over ports 80/443.

```bash
docker stop nginx_proxy && docker rm nginx_proxy
```

### 3. Set up the proxy directory

```bash
mkdir -p /home/ubuntu/proxy

# Copy Cloudflare certs from the existing Santase setup
cp -r /home/ubuntu/app/cloudflare-certs /home/ubuntu/proxy/cloudflare-certs
```

Upload (or SCP) the files from this `deploy/` folder to the server:
- `proxy-docker-compose.yml` → `/home/ubuntu/proxy/docker-compose.yml`
- `proxy-nginx.conf` → `/home/ubuntu/proxy/nginx.conf`

### 4. Create a temporary nginx.conf for certbot initialization

Before Let's Encrypt certs exist, the full nginx.conf would fail (missing cert files).
Use this temporary HTTP-only config first:

```bash
cat > /home/ubuntu/proxy/nginx-temp.conf << 'TMPEOF'
worker_processes auto;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name menucraft.online www.menucraft.online;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 "Setting up SSL...";
        }
    }

    server {
        listen 80;
        server_name deck.bg www.deck.bg;
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Keep deck.bg HTTPS working during setup
    server {
        listen 443 ssl;
        server_name deck.bg www.deck.bg;
        ssl_certificate /etc/ssl/cloudflare/origin.pem;
        ssl_certificate_key /etc/ssl/cloudflare/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;

        location / {
            proxy_pass http://santase_frontend:80;
            proxy_set_header Host $host;
        }
        location /api/auth/ {
            proxy_pass http://santase_backend:8080/auth/;
        }
        location /api/game/ {
            proxy_pass http://santase_backend:8080/game/;
        }
        location /api/user/ {
            proxy_pass http://santase_backend:8080/user/;
        }
        location /api/ws-game/ {
            proxy_pass http://santase_backend:8080/ws-game/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
        }
    }
}
TMPEOF

# Use the temp config
cp /home/ubuntu/proxy/nginx-temp.conf /home/ubuntu/proxy/nginx.conf
```

### 5. Start the proxy with temporary config

```bash
cd /home/ubuntu/proxy
docker compose up -d
```

At this point `deck.bg` should work again (via the proxy). Verify:
```bash
curl -I https://deck.bg
```

### 6. Obtain Let's Encrypt certificate

```bash
docker run --rm \
  -v proxy_certbot-webroot:/var/www/certbot \
  -v proxy_certbot-certs:/etc/letsencrypt \
  certbot/certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d menucraft.online \
    -d www.menucraft.online \
    --email YOUR_EMAIL@example.com \
    --agree-tos \
    --no-eff-email
```

> **Note**: Volume names are prefixed with `proxy_` (the compose project directory name).
> Check with `docker volume ls` if the names differ.

### 7. Switch to the full nginx.conf

Upload the full `proxy-nginx.conf` to replace the temporary one:

```bash
# Copy the full config (SCP it, or paste it)
cp /path/to/proxy-nginx.conf /home/ubuntu/proxy/nginx.conf

# Reload nginx
docker exec nginx_proxy nginx -s reload
```

### 8. Set up the MenuCraft directory

```bash
mkdir -p /home/ubuntu/menucraft
```

The GitHub Actions workflow will handle the rest on the first push to `master`.

### 9. Verify everything

```bash
docker ps

# deck.bg should work as before
curl -I https://deck.bg

# menucraft.online (after first GitHub Actions deploy)
curl -I https://menucraft.online
```

---

## GitHub Secrets Required

Add these secrets to the MenuCraft GitHub repository:

| Secret | Description |
|---|---|
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_KEY` | SSH private key for `ubuntu` user |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `DB_URL_MENU_CRAFT` | JDBC connection string |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DIALECT` | Hibernate dialect |
| `JWT_SECRET` | JWT signing key |
| `JWT_EXPIRATION` | JWT token expiration |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration |
| `FACEBOOK_APP_ID` | Facebook app ID |
| `FACEBOOK_APP_SECRET` | Facebook app secret |
| `FACEBOOK_REDIRECT_URI` | Facebook OAuth redirect URI |
| `GRAPH_API_URL` | Facebook Graph API base URL |
| `AES_ENCRYPTION_SECRET` | AES encryption key |

---

## Ongoing Deployments

After the initial setup, pushing to `master` triggers the GitHub Actions workflow which:

1. Builds and pushes backend + frontend Docker images to Docker Hub
2. Copies `docker-compose.yml` to `/home/ubuntu/menucraft/`
3. SSH to EC2: creates `.env`, pulls images, restarts **only** MenuCraft containers
4. Reloads the shared nginx proxy

Santase is completely unaffected by MenuCraft deployments.

---

## SSL Certificate Renewal

The certbot container auto-renews every 12 hours. Add a cron job to reload nginx after renewal:

```bash
# crontab -e
0 3 * * * docker exec nginx_proxy nginx -s reload
```

---

## Important Note About Santase CI/CD

When Santase's own CI/CD pipeline runs, it will try to recreate its `nginx_proxy` container
(defined in its docker-compose.yml). Since the shared proxy now owns that container name
and ports 80/443, you should **remove the nginx service from Santase's docker-compose.yml
on the server only** (not in the Santase repo):

```bash
# On the server, edit /home/ubuntu/app/docker-compose.yml
# Remove the entire 'nginx:' service block and its 'depends_on' references
# Keep only frontend + backend services
# Add the external web network so the proxy can still reach them if needed
```

Alternatively, update Santase's GitHub Actions to skip the nginx service.
