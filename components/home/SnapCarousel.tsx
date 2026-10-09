"use client";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
export default function SnapCarousel({
  as: Tag = "div",
  className,
  style,
  children,
}: {
  as?: "ol" | "div";
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLOListElement & HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);
  useEffect(() => {
    const track = ref.current!;
    let holdUntil = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 640px)");
    const index = () => {
      const items = Array.from(track.children) as HTMLElement[];
      if (!items.length || track.scrollWidth <= track.clientWidth + 4) return 0;
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4)
        return items.length - 1;
      return items.reduce(
        (best, item, i) =>
          Math.abs(item.offsetLeft - items[0].offsetLeft - track.scrollLeft) <
          Math.abs(
            items[best].offsetLeft - items[0].offsetLeft - track.scrollLeft,
          )
            ? i
            : best,
        0,
      );
    };
    const update = () =>
      setActive((previous) => {
        const next = index();
        return next === previous ? previous : next;
      });
    const hold = () => {
      holdUntil = Date.now() + 9000;
    };
    const timer = window.setInterval(() => {
      if (
        !phone.matches ||
        document.hidden ||
        reduced.matches ||
        Date.now() < holdUntil ||
        track.scrollWidth <= track.clientWidth + 4
      )
        return;
      const items = Array.from(track.children) as HTMLElement[];
      if (!items.length) return;
      const next = (index() + 1) % items.length;
      track.scrollTo({
        left: Math.min(
          items[next].offsetLeft - items[0].offsetLeft,
          track.scrollWidth - track.clientWidth,
        ),
        behavior: "smooth",
      });
    }, 3800);
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("pointerdown", hold);
    track.addEventListener("touchstart", hold, { passive: true });
    track.addEventListener("wheel", hold, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearInterval(timer);
      track.removeEventListener("scroll", update);
      track.removeEventListener("pointerdown", hold);
      track.removeEventListener("touchstart", hold);
      track.removeEventListener("wheel", hold);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <>
      <Tag ref={ref} className={className} style={style}>
        {children}
      </Tag>
      <div className="tkh-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={i === active ? "tkh-dot tkh-dot--active" : "tkh-dot"}
          />
        ))}
      </div>
    </>
  );
}
