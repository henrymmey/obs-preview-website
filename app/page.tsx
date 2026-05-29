import { StreamPlayer } from "../components/stream-player";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.16),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(251,146,60,0.12),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-center gap-6">
        <header className="flex flex-col gap-3 sm:max-w-3xl">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] text-sky-200/90 backdrop-blur">
            Live Preview
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.9)]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            OBS-Stream direkt im Browser anzeigen.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Die Seite lädt die öffentliche HLS-Playlist vom VPS, während OBS nur
            an den RTMP-Ingest von MediaMTX sendet. Der Stream-Key bleibt im
            Media-Server und landet nicht im Frontend.
          </p>
        </header>

        <StreamPlayer />
      </div>
    </main>
  );
}
