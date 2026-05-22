# OBS Preview Website

A Docker-based application that receives an OBS stream and provides a low-latency live preview in the browser. Ideal for streamers who want to check their stream before going live or for production environments that require an internal preview.

## Features

-   **RTMP Server:** Receives streams from OBS Studio.
-   **HLS/DASH Transcoding:** Converts the RTMP stream to HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP) for web playback.
-   **Web Frontend:** A simple React application that displays the HLS stream in the browser.
-   **Docker Support:** Easy deployment and scaling with Docker and Docker Compose.
-   **Low Latency:** Optimized for the lowest possible delay (Note: WebRTC integration is a future feature for extremely low latency).

## Architecture

The project consists of two main components:

1.  **Server (Node.js with `node-media-server`):**
    *   Receives RTMP streams on port `1935`.
    *   Transcodes the stream to HLS and DASH.
    *   Provides HTTP endpoints for HLS/DASH on port `8000`.
    *   Includes a WebSocket server on port `8080` for future WebRTC signaling.

2.  **Frontend (React with Nginx):**
    *   A Single-Page Application (SPA) that plays the HLS stream via a `<video>` element and the `hls.js` library.
    *   Served by an Nginx web server.
    *   Accesses the server's HLS stream.

## Prerequisites

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [OBS Studio](https://obsproject.com/)

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/obs-preview-website.git
    cd obs-preview-website
    ```

2.  **Start the application:**

    ```bash
    docker-compose up --build -d
    ```

    This builds the Docker images and starts the services in the background. The server will then be available on port `1935` (RTMP), `8000` (HTTP), and `8080` (WebSocket). The frontend will be available on port `3000`.

3.  **Access the Frontend:**

    Open your web browser and navigate to `http://localhost:3000`.

## OBS Studio Configuration

1.  Open OBS Studio.
2.  Go to **Settings** -> **Stream**.
3.  Select `Custom...` as the **Service**.
4.  Enter the following under **Server**:

    ```
    rtmp://localhost:1935/live
    ```

    *Note: If you are running Docker on a remote server, replace `localhost` with the IP address or domain name of your server.*

5.  Enter any key under **Stream Key**, e.g., `my_stream_key`.

    *Important: This stream key must be adjusted in the frontend in `frontend/src/App.js` for the correct stream to be displayed. Search for `STREAM_KEY` and replace it with your chosen key. **Don't forget to do this before building the frontend image!***

6.  Click **Apply** and then **OK**.
7.  Start streaming in OBS Studio (`Start Streaming`).

You should now see a live preview of your stream at `http://localhost:3000`.

## WebRTC (Future Development)

Currently, the application uses HLS for playback, which offers low latency but does not achieve the extremely low latency of WebRTC. The server's `app.js` already includes a WebSocket server that can serve as a basis for future WebRTC signaling.

Integrating WebRTC is more complex and requires a STUN/TURN server as well as a more detailed implementation of SDP negotiation and ICE candidates in the frontend and backend. This is a planned feature to further minimize latency.

## Development

### Server

The server is based on `node-media-server`. Changes to `app.js` or `package.json` require a restart of the Docker container.

### Frontend

The frontend is a React application. For development, you can:

```bash
cd frontend
npm install
npm start
```

This starts the React development server, which supports hot-reloading. Note that the `server` Docker Compose service must be running for the frontend to access the stream.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
