"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

type StreamStatus =
  | "checking"
  | "connecting"
  | "live"
  | "offline"
  | "needs-action";

const manifestUrl =
  process.env.NEXT_PUBLIC_HLS_URL ?? "/hls/live/stream/index.m3u8";
const probeIntervalMs = 5000;

function formatLastChecked(timestamp: Date | null) {
  if (!timestamp) {
    return "Noch nicht geprüft";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

export function StreamPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const availabilityRef = useRef<boolean | null>(null);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [status, setStatus] = useState<StreamStatus>("checking");
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const attemptPlay = async (video: HTMLVideoElement) => {
    try {
      await video.play();
      setStatus("live");
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("notallowed")) {
        setStatus("needs-action");
        setLastError("Der Browser blockiert Autoplay. Bitte den Stream manuell starten.");
        return;
      }

      setStatus("offline");
      setLastError("Der Stream konnte nicht gestartet werden.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const updateAvailability = (nextAvailability: boolean) => {
      if (availabilityRef.current !== nextAvailability) {
        availabilityRef.current = nextAvailability;
        setAvailability(nextAvailability);
        setStatus(nextAvailability ? "connecting" : "offline");
        setLastError(
          nextAvailability ? null : "Der Stream ist aktuell nicht verfügbar.",
        );
      }
    };

    const probe = async () => {
      try {
        const response = await fetch(manifestUrl, { cache: "no-store" });
        if (cancelled) {
          return;
        }

        setLastCheckedAt(new Date());
        updateAvailability(response.ok);
      } catch {
        if (cancelled) {
          return;
        }

        setLastCheckedAt(new Date());
        updateAvailability(false);
      }
    };

    void probe();
    const interval = window.setInterval(() => {
      void probe();
    }, probeIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    if (availability !== true) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      video.removeAttribute("src");
      video.load();
      return;
    }

    setStatus("connecting");

    const markOffline = (message: string) => {
      setStatus("offline");
      setLastError(message);
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
      video.load();
      void attemptPlay(video);

      return undefined;
    }

    if (!Hls.isSupported()) {
      markOffline("Dein Browser unterstützt kein HLS-Playback.");
      return undefined;
    }

    const hls = new Hls({
      lowLatencyMode: false,
      enableWorker: true,
      backBufferLength: 30,
      liveSyncDurationCount: 3,
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 2,
      fragLoadingMaxRetry: 2,
    });

    hlsRef.current = hls;
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(manifestUrl);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      void attemptPlay(video);
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        markOffline("Der Stream konnte nicht geladen werden.");
        hls.destroy();
        if (hlsRef.current === hls) {
          hlsRef.current = null;
        }
      }
    });

    return () => {
      hls.destroy();
      if (hlsRef.current === hls) {
        hlsRef.current = null;
      }
    };
  }, [availability]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-glow backdrop-blur-xl">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <div className="relative bg-black/70">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 py-3 text-xs text-slate-300 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.9)]" />
              <span className="uppercase tracking-[0.24em]">OBS Preview</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {status}
              </span>
              <span className="hidden sm:inline">
                Letzter Check: {formatLastChecked(lastCheckedAt)}
              </span>
            </div>
          </div>

          <div className="aspect-video w-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_rgba(2,6,23,1))]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
            />

            {status === "needs-action" ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 text-center backdrop-blur-sm">
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:bg-white/15"
                  onClick={() => {
                    const video = videoRef.current;
                    if (video) {
                      void attemptPlay(video);
                    }
                  }}
                >
                  Stream starten
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-6 border-t border-white/10 bg-slate-950/55 p-5 md:p-6 xl:border-l xl:border-t-0">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/75">
                Stream Status
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {status === "live"
                  ? "Live"
                  : status === "connecting"
                    ? "Verbindung wird aufgebaut"
                    : "Stream offline"}
              </h2>
            </div>

            <p className="text-sm leading-6 text-slate-300">
              {status === "live"
                ? "Der Browser spielt aktuell die HLS-Quelle vom VPS ab."
                : status === "connecting"
                  ? "Die Playlist ist erreichbar, der Player synchronisiert sich gerade mit dem Stream."
                  : (lastError ??
                    "Sobald OBS sendet, erscheint der Stream automatisch hier.")}
            </p>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">HLS-Quelle</span>
                <code className="break-all text-right text-[11px] text-sky-200">
                  {manifestUrl}
                </code>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Technik</span>
                <span>MediaMTX + Nginx + Next.js</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Playback</span>
                <span>HLS via hls.js / native HLS</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-sky-400/10 via-transparent to-orange-400/10 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Offline-Ansicht</p>
            <p className="mt-2 leading-6">
              Wenn kein Publisher verbunden ist, bleibt hier eine saubere
              Statusfläche statt eines kaputten Players. Der Stream wird
              automatisch neu probiert.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
