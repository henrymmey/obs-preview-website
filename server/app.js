const NodeMediaServer = require('node-media-server');
const WebSocket = require('ws');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        vc: 'copy',
        ac: 'copy',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeMediaServer] New stream publishing:', StreamPath);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeMediaServer] Stream stopped:', StreamPath);
});

nms.run();

// WebRTC Signaling (Placeholder for now, actual WebRTC implementation is complex and often requires a dedicated library/service)
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('[WebSocket] Client connected');

  ws.on('message', message => {
    console.log('[WebSocket] Received:', message.toString());
    // In a real WebRTC setup, this would handle SDP offers/answers and ICE candidates
    // For a simple preview, we might just send back the HLS/DASH URL
    ws.send(JSON.stringify({ type: 'stream_url', url: 'http://localhost:8000/live/STREAM_KEY/index.m3u8' }));
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', error => {
    console.error('[WebSocket] Error:', error);
  });
});

console.log('NodeMediaServer and WebSocket server started.');
