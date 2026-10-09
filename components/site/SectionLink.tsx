"use client";

import { useEffect } from "react";
import Link from "next/link";

let cancelActiveScroll: (() => void) | undefined;

function glideToSection(target: HTMLElement) {
  cancelActiveScroll?.();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const start = window.scrollY;
  const scroller = document.scrollingElement!;
  const destination = Math.min(
    Math.max(0, target.getBoundingClientRect().top + start),
    Math.max(0, scroller.scrollHeight - scroller.clientHeight),
  );
  const distance = destination - start;
  if (reduced.matches || Math.abs(distance) < 1) {
    window.scrollTo({ top: destination, behavior: "instant" });
    return;
  }

  const duration = Math.min(1800, 1200 + Math.abs(distance) * 0.15);
  const started = performance.now();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("pointerdown", stop);
    window.removeEventListener("keydown", stop);
    reduced.removeEventListener("change", motionChanged);
    if (cancelActiveScroll === stop) cancelActiveScroll = undefined;
  };
  const motionChanged = () => {
    if (!reduced.matches) return;
    stop();
    window.scrollTo({ top: destination, behavior: "instant" });
  };
  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    // Smoothstep gives zero velocity and acceleration at both ends of the glide.
    const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
    window.scrollTo({ top: start + distance * eased, behavior: "instant" });
    if (progress < 1) frame = requestAnimationFrame(tick);
    else stop();
  };

  cancelActiveScroll = stop;
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("pointerdown", stop, { passive: true });
  window.addEventListener("keydown", stop, { passive: true });
  reduced.addEventListener("change", motionChanged);
  frame = requestAnimationFrame(tick);
}

export default function SectionLink({
  section,
  children,
}: {
  section: "how" | "features";
  children: React.ReactNode;
}) {
  useEffect(() => () => cancelActiveScroll?.(), []);
  const href = `/#${section}`;
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (window.location.pathname !== "/") return;
        const target = document.getElementById(section);
        if (!target) return;
        event.preventDefault();
        // Repeated clicks must still scroll, even when the URL already has this hash.
        if (window.location.hash !== `#${section}` || window.location.search) {
          window.history.pushState(null, "", href);
        }
        glideToSection(target);
      }}
    >
      {children}
    </Link>
  );
}
