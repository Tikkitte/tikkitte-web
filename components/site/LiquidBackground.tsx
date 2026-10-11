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
    let from = Number.NaN;

    const paint = () => {
      frame = 0;
      const y = reduced.matches
        ? 0
        : (window.scrollY - rootTop) * 0.4;
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
        // Both ends of a timeline that spans the whole page, chosen so the
        // offset is 0.4 * (scrollY - rootTop) at every scroll position, which
        // matches the fallback below.
        const scroller = document.scrollingElement!;
        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const nextFrom = -rootTop * 0.4;
        const next = (maxScroll - rootTop) * 0.4;
        if (from !== nextFrom) {
          inner.style.setProperty("--tkh-parallax-from", `${nextFrom}px`);
          from = nextFrom;
        }
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
    if (root.parentElement) observer.observe(root.parentElement);
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
