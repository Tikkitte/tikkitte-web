"use client";
import { useEffect, useRef } from "react";

export default function LiquidBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = ref.current!;
    const root = inner.parentElement!.parentElement!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nativeTimeline = CSS.supports(
      "animation-timeline",
      "scroll(root block)",
    );
    let frame = 0;
    let rootTop = 0;
    let previous = -1;
    let distance = -1;

    const paint = () => {
      frame = 0;
      const y = reduced.matches
        ? 0
        : Math.max(0, window.scrollY - rootTop) * 0.4;
      if (previous !== y) {
        inner.style.transform = `translate3d(0,${y}px,0)`;
        previous = y;
      }
    };
    const schedulePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      // Read layout only when dimensions change, never during a scroll frame.
      rootTop = root.getBoundingClientRect().top + window.scrollY;
      if (nativeTimeline) {
        const scroller = document.scrollingElement!;
        const next =
          Math.max(0, scroller.scrollHeight - scroller.clientHeight) * 0.4;
        if (distance !== next) {
          inner.style.setProperty("--tkh-parallax-distance", `${next}px`);
          distance = next;
        }
        inner.dataset.parallax = "native";
      } else {
        schedulePaint();
      }
    };
    const scroll = (event: Event) => {
      // Horizontal strips and any nested scrollers do not drive page parallax.
      if (
        event.target instanceof Element &&
        event.target !== document.documentElement &&
        event.target !== document.body
      )
        return;
      schedulePaint();
    };
    const preferenceChanged = () => {
      if (!nativeTimeline) schedulePaint();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure, { passive: true });
    reduced.addEventListener("change", preferenceChanged);
    if (!nativeTimeline) {
      window.addEventListener("scroll", scroll, {
        passive: true,
        capture: true,
      });
    }
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", preferenceChanged);
      if (!nativeTimeline)
        window.removeEventListener("scroll", scroll, { capture: true });
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="tkh-liquid" aria-hidden="true">
      <div ref={ref} className="tkh-liquid-inner" />
    </div>
  );
}
