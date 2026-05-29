# OBS Preview Website

Self-hosted OBS preview stack for a Linux VPS:

- OBS publishes via RTMP to MediaMTX
- MediaMTX converts the stream to HLS
- Host Nginx terminates TLS and proxies `stream.domain.de`
- Next.js renders a single-page responsive player at `/`

## Files

- `docker-compose.yml` - MediaMTX and the Next.js app
- `mediamtx.yml` - MediaMTX ingest and HLS configuration
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

1. Replace `change-me-now` in `mediamtx.yml` with a strong secret.
2. Replace the domain name and TLS certificate paths in `nginx/stream.domain.de.conf`.
3. Make sure Docker and Docker Compose are installed on the VPS.
4. Start the stack:

   ```bash
   docker compose up -d --build
   ```

5. Enable the Nginx vhost and reload Nginx:

   ```bash
   nginx -t && systemctl reload nginx
   ```

6. Open `https://stream.domain.de/`.

## Notes

- The stream key is only present in the MediaMTX config and OBS configuration.
- The frontend only consumes the public HLS playlist and never sees the RTMP secret.
- If you want a flatter public HLS URL later, add an extra Nginx rewrite and keep the MediaMTX path unchanged.
