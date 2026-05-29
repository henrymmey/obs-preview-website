# OBS Preview Website

Self-hosted OBS preview stack for a Linux VPS:

- OBS publishes via RTMP to MediaMTX
- MediaMTX converts the stream to HLS
- Host Nginx terminates TLS and proxies `stream.domain.de`
- Next.js renders a single-page responsive player at `/`

## Files

- `docker-compose.yml` - MediaMTX and the Next.js app
- `mediamtx.yml` - MediaMTX ingest and HLS configuration
- `.env.mediamtx` - local-only MediaMTX stream credentials, ignored by Git
- `nginx/stream.domain.de.conf` - host Nginx vhost for TLS, app proxying, and `/hls`
- `app/` and `components/` - Next.js app router frontend

## Runtime URLs

- App: `https://stream.domain.de/`
- HLS: `https://stream.domain.de/hls/live/stream/index.m3u8`
- OBS ingest: `rtmp://stream.domain.de/live`

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

### 3) Set the local secret file

Edit `.env.mediamtx` and replace the placeholder values with your real OBS credentials:

```bash
MTX_PATHS_LIVE_STREAM_PUBLISHUSER=obs
MTX_PATHS_LIVE_STREAM_PUBLISHPASS=your-strong-stream-key
```

Keep `mediamtx.yml` committed. Only `.env.mediamtx` should stay local and out of Git.

### 4) Adjust the public config

Update the following files if needed:

- `mediamtx.yml` for ports, HLS behavior, or the path name
- `nginx/stream.domain.de.conf` for your actual domain and TLS certificate paths

If you do not have certificates yet, create them first with Certbot after Nginx is enabled:

```bash
sudo certbot --nginx -d stream.domain.de
```

### 5) Start the stack

Bring up MediaMTX and the Next.js frontend:

```bash
docker compose up -d --build
```

### 6) Enable the Nginx vhost

Copy the vhost into your Nginx configuration directory, test it, and reload Nginx:

```bash
sudo cp nginx/stream.domain.de.conf /etc/nginx/sites-available/stream.domain.de.conf
sudo ln -sfn /etc/nginx/sites-available/stream.domain.de.conf /etc/nginx/sites-enabled/stream.domain.de.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 7) Verify the deployment

Check the public site and the HLS playlist:

```bash
curl -I https://stream.domain.de/
curl -I https://stream.domain.de/hls/live/stream/index.m3u8
```

### 8) Configure OBS

Use these OBS values:

- Server: `rtmp://stream.domain.de/live`
- Stream key: `stream?user=obs&pass=your-strong-stream-key`

### 9) Open the site

Visit `https://stream.domain.de/` in the browser. When OBS starts streaming, the player should switch from offline state to live playback.

## Notes

- The stream key is stored in `.env.mediamtx` and OBS configuration only; the main YAML stays versioned.
- The frontend only consumes the public HLS playlist and never sees the RTMP secret.
- If you want a flatter public HLS URL later, add an extra Nginx rewrite and keep the MediaMTX path unchanged.
