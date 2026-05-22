# OBS Preview Website

Eine Docker-basierte Anwendung, die einen OBS-Stream empfängt und eine verzögerungsarme Live-Vorschau im Browser bereitstellt. Ideal für Streamer, die ihren Stream vor dem Go-Live überprüfen möchten oder für Produktionsumgebungen, die eine interne Vorschau benötigen.

## Funktionen

- **RTMP-Server:** Empfängt Streams von OBS Studio.
- **HLS/DASH-Transkodierung:** Konvertiert den RTMP-Stream in HLS (HTTP Live Streaming) und DASH (Dynamic Adaptive Streaming over HTTP) für die Web-Wiedergabe.
- **Web-Frontend:** Eine einfache React-Anwendung, die den HLS-Stream im Browser anzeigt.
- **Docker-Unterstützung:** Einfache Bereitstellung und Skalierung mit Docker und Docker Compose.
- **Geringe Latenz:** Optimiert für eine möglichst geringe Verzögerung (Hinweis: WebRTC-Integration ist ein zukünftiges Feature für extrem niedrige Latenz).

## Architektur

Das Projekt besteht aus zwei Hauptkomponenten:

1.  **Server (Node.js mit `node-media-server`):**
    *   Empfängt RTMP-Streams auf Port `1935`.
    *   Transkodiert den Stream in HLS und DASH.
    *   Stellt HTTP-Endpunkte für HLS/DASH auf Port `8000` bereit.
    *   Enthält einen WebSocket-Server auf Port `8080` für zukünftige WebRTC-Signalisierung.

2.  **Frontend (React mit Nginx):**
    *   Eine Single-Page-Anwendung (SPA), die den HLS-Stream über ein `<video>`-Element und die `hls.js`-Bibliothek wiedergibt.
    *   Wird von einem Nginx-Webserver bereitgestellt.
    *   Greift auf den HLS-Stream des Servers zu.

## Voraussetzungen

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [OBS Studio](https://obsproject.com/)

## Installation und Einrichtung

1.  **Repository klonen:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/obs-preview-website.git
    cd obs-preview-website
    ```

2.  **Anwendung starten:**

    ```bash
    docker-compose up --build -d
    ```

    Dies baut die Docker-Images und startet die Dienste im Hintergrund. Der Server ist dann auf Port `1935` (RTMP), `8000` (HTTP) und `8080` (WebSocket) verfügbar. Das Frontend ist auf Port `3000` verfügbar.

3.  **Zugriff auf das Frontend:**

    Öffnen Sie Ihren Webbrowser und navigieren Sie zu `http://localhost:3000`.

## OBS Studio Konfiguration

1.  Öffnen Sie OBS Studio.
2.  Gehen Sie zu **Einstellungen** -> **Stream**.
3.  Wählen Sie als **Dienst** `Benutzerdefiniert...`.
4.  Geben Sie unter **Server** folgendes ein:

    ```
    rtmp://localhost:1935/live
    ```

    *Hinweis: Wenn Sie Docker auf einem Remote-Server ausführen, ersetzen Sie `localhost` durch die IP-Adresse oder den Domainnamen Ihres Servers.*

5.  Geben Sie unter **Stream-Schlüssel** einen beliebigen Schlüssel ein, z.B. `my_stream_key`.

    *Wichtig: Dieser Stream-Schlüssel muss im Frontend in `frontend/src/App.js` angepasst werden, damit der richtige Stream angezeigt wird. Suchen Sie nach `STREAM_KEY` und ersetzen Sie es durch Ihren gewählten Schlüssel. **Vergessen Sie nicht, dies zu tun, bevor Sie das Frontend-Image bauen!***

6.  Klicken Sie auf **Anwenden** und dann auf **OK**.
7.  Starten Sie das Streaming in OBS Studio (`Streaming starten`).

Sie sollten nun eine Live-Vorschau Ihres Streams unter `http://localhost:3000` sehen.

## WebRTC (Zukünftige Entwicklung)

Aktuell verwendet die Anwendung HLS für die Wiedergabe, was eine geringe Latenz bietet, aber nicht 
die extrem niedrige Latenz von WebRTC erreicht. Die `app.js` des Servers enthält bereits einen WebSocket-Server, der als Grundlage für eine zukünftige WebRTC-Signalisierung dienen kann.

Die Integration von WebRTC ist komplexer und erfordert einen STUN/TURN-Server sowie eine detailliertere Implementierung der SDP-Aushandlung und ICE-Kandidaten im Frontend und Backend. Dies ist ein geplantes Feature, um die Latenz weiter zu minimieren.

## Entwicklung

### Server

Der Server basiert auf `node-media-server`. Änderungen an der `app.js` oder `package.json` erfordern einen Neustart des Docker-Containers.

### Frontend

Das Frontend ist eine React-Anwendung. Für die Entwicklung können Sie:

```bash
cd frontend
npm install
npm start
```

Dies startet den React-Entwicklungsserver, der Hot-Reloading unterstützt. Beachten Sie, dass der `server`-Dienst von Docker Compose laufen muss, damit das Frontend auf den Stream zugreifen kann.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die `LICENSE`-Datei für weitere Details.
