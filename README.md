# OBS Preview Website

Self-hosted OBS preview stack for a Linux VPS:

- OBS publishes via RTMP to MediaMTX
- MediaMTX converts the stream to HLS
- Host Nginx terminates TLS and proxies the site
- Next.js renders a single-page responsive player at `/`

## Files

- `docker-compose.yml` - MediaMTX and the Next.js app
- `mediamtx.yml` - MediaMTX ingest and HLS configuration
- `.env.example` - domain used by the Nginx renderer script
- `.env.mediamtx` - local-only MediaMTX stream credentials, ignored by Git
- `.env.mediamtx.example` - example values for the MediaMTX credentials
- `nginx/stream.domain.de.conf` - Nginx template rendered from `.env`
- `scripts/render-nginx-config.sh` - helper that renders the Nginx config from `.env`
- `app/` and `components/` - Next.js app router frontend

## Runtime URLs

- App: `https://stream.domain.de/`
- HLS: `https://stream.domain.de/hls/live/stream/index.m3u8`
- OBS ingest: `rtmp://stream.domain.de/live`

Every occurrence of `stream.domain.de` in this repository is a placeholder. Replace it with your own domain, or change `STREAM_DOMAIN` in `.env` and render the Nginx config again.

## OBS setup

Use the following OBS values:

- Server: `rtmp://stream.domain.de/live`
- Stream key: `stream?user=obs&pass=change-me-now`

That combination publishes to the MediaMTX path `live/stream`, which is protected by the credentials configured in `mediamtx.yml`.

## Deployment

### 1) Prerequisites on the VPS

Install the base tooling first:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo systemctl enable --now docker nginx
```

Make sure these DNS records point to the VPS:

- `stream.domain.de` -> VPS public IP

Open the required ports in your firewall and provider security group:

- `80/tcp`
- `443/tcp`
- `1935/tcp` for OBS publishing

### 2) Get the project onto the server

Clone the repository or copy the files to the VPS, then move into the project folder:

```bash
git clone <your-repo-url> obs-preview-website
cd obs-preview-website
```

### 3) Set the local env files

Copy the example files first:

```bash
cp .env.example .env
cp .env.mediamtx.example .env.mediamtx
```

Edit `.env` and set your domain:

```bash
STREAM_DOMAIN=your-domain.tld
```

Edit `.env.mediamtx` and replace the placeholder values with your real OBS credentials:

```bash
MTX_PATHS_LIVE_STREAM_PUBLISHUSER=obs
MTX_PATHS_LIVE_STREAM_PUBLISHPASS=your-strong-stream-key
```

Keep `mediamtx.yml` committed. Only `.env.mediamtx` should stay local and out of Git.

### 4) Adjust the public config

Update the following files if needed:

- `.env` for your actual domain
- `nginx/stream.domain.de.conf` if you want to change the Nginx template itself

If you do not have certificates yet, run Certbot after the Nginx vhost has been rendered and enabled in the next step.

### 5) Start the stack

Bring up MediaMTX and the Next.js frontend:

```bash
docker compose up -d --build
```

### 6) Enable the Nginx vhost

Render the Nginx config from `.env`, copy it into your Nginx configuration directory, test it, and reload Nginx:

```bash
bash scripts/render-nginx-config.sh /tmp/stream-site.conf
sudo cp /tmp/stream-site.conf /etc/nginx/sites-available/stream-site.conf
sudo ln -sfn /etc/nginx/sites-available/stream-site.conf /etc/nginx/sites-enabled/stream-site.conf
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d "$STREAM_DOMAIN"
```

### 7) Verify the deployment

Check the public site and the HLS playlist:

```bash
curl -I "https://${STREAM_DOMAIN}/"
curl -I "https://${STREAM_DOMAIN}/hls/live/stream/index.m3u8"
```

### 8) Configure OBS

Use these OBS values:

- Server: `rtmp://stream.domain.de/live`
- Stream key: `stream?user=obs&pass=your-strong-stream-key`

### 9) Open the site

Visit `https://${STREAM_DOMAIN}/` in the browser. When OBS starts streaming, the player should switch from offline state to live playback.

## Notes

- The stream key is stored in `.env.mediamtx` and OBS configuration only; the main YAML stays versioned.
- The domain name is stored in `.env`; render the Nginx config again whenever you change it.
- The frontend only consumes the public HLS playlist and never sees the RTMP secret.
- If you want a flatter public HLS URL later, add an extra Nginx rewrite and keep the MediaMTX path unchanged.
