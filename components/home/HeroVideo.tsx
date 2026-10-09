"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const HeroVideoContext = createContext<{
  playing: boolean;
  toggle: () => void;
} | null>(null);

export default function HeroVideo({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    video.muted = true;
    video.defaultMuted = true;
    const preference = () => {
      if (reduced.matches || connection?.saveData || manuallyPaused.current) {
        video.autoplay = false;
        video.pause();
      } else {
        video.autoplay = true;
        void video
          .play()
          .catch(() => setPlaying(!video.paused && !video.error));
      }
    };
    reduced.addEventListener("change", preference);
    connection?.addEventListener("change", preference);
    preference();
    return () => {
      reduced.removeEventListener("change", preference);
      connection?.removeEventListener("change", preference);
    };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      manuallyPaused.current = false;
      void video.play().catch(() => setPlaying(!video.paused && !video.error));
    } else {
      manuallyPaused.current = true;
      video.pause();
    }
  };

  const syncPlayback = () => {
    const video = ref.current;
    if (video) setPlaying(!video.paused && !video.error);
  };

  return (
    <HeroVideoContext.Provider value={{ playing, toggle }}>
      <video
        ref={ref}
        id="tkh-hero-background-video"
        className="tkh-hero-video"
        src="/videos/hero-reel-v2-smoothed.mp4"
        poster="/images/site/hero-reel-v2-smoothed-poster.jpg"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlay={syncPlayback}
        onPause={syncPlayback}
        onError={syncPlayback}
      />
      {children}
    </HeroVideoContext.Provider>
  );
}

export function HeroVideoControl() {
  const control = useContext(HeroVideoContext);
  if (!control) throw new Error("HeroVideoControl must be inside HeroVideo");
  return (
    <button
      className="tkh-iconbtn"
      type="button"
      aria-label={
        control.playing ? "Pause background video" : "Play background video"
      }
      aria-controls="tkh-hero-background-video"
      onClick={control.toggle}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {control.playing ? (
          <>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </>
        ) : (
          <path d="M8 5.5v13l11-6.5z" />
        )}
      </svg>
    </button>
  );
}
