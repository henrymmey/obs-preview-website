import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const streamUrl = 'http://localhost:8000/live/STREAM_KEY/index.m3u8'; // Replace STREAM_KEY with your actual OBS stream key

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', function() {
        videoRef.current.play();
      });
    }
  }, [streamUrl]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>OBS Live Preview</h1>
        <video ref={videoRef} controls autoPlay muted className="video-player"></video>
        <p>Ensure your OBS stream is sent to rtmp://localhost:1935/live/STREAM_KEY.</p>
        <p>Replace STREAM_KEY with your actual stream key.</p>
      </header>
    </div>
  );
}

export default App;
