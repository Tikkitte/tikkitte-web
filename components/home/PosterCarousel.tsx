"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";

const PIXELS_PER_SECOND = 28;

export default function PosterCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wall = ref.current!;
    const inner = innerRef.current!;
    const group = groupRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let span = 0;

    const updateRunning = () => {
      wall.dataset.running = String(
        visible && !document.hidden && !reduced.matches,
      );
    };
    const measure = () => {
      const animation = inner.getAnimations()[0];
      const progress = animation?.effect?.getComputedTiming().progress ?? 0;
      span = group.getBoundingClientRect().width;
      if (!span) return;
      const duration = span / PIXELS_PER_SECOND;
      inner.style.setProperty("--tkh-wall-duration", `${duration}s`);
      const resizedAnimation = inner.getAnimations()[0];
      if (resizedAnimation) resizedAnimation.currentTime = progress * duration * 1000;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateRunning();
    }, { threshold: 0.1 });
    const resize = new ResizeObserver(measure);
    measure();
    observer.observe(wall);
    resize.observe(group);
    document.addEventListener("visibilitychange", updateRunning);
    reduced.addEventListener("change", updateRunning);
    return () => {
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", updateRunning);
      reduced.removeEventListener("change", updateRunning);
    };
  }, []);

  return (
    <div ref={ref} id="tkh-lineup-posters" className="tkh-wall" data-running="false"
      role="region" aria-label="Nights we're behind posters">
      <div ref={innerRef} className="tkh-wall-track">
        <div ref={groupRef} className="tkh-wall-group">{children}</div>
        <div className="tkh-wall-group" aria-hidden="true">
          {Children.map(children, (child) =>
            isValidElement<{ tabIndex?: number }>(child)
              ? cloneElement(child, { tabIndex: -1 })
              : child,
          )}
        </div>
      </div>
    </div>
  );
}
