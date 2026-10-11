"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

type CloneProps = { className?: string; "aria-hidden"?: boolean; inert?: boolean };

// On phones the cards loop forever: the track holds a copy of every card
// before and after the real ones, and whenever scrolling comes to rest inside a
// copy it jumps (invisibly) to the same card in the real set. Copies are hidden
// above 640px, where these sections are grids, and are always inert so screen
// readers and keyboards only ever meet the real cards.
function copies(children: React.ReactNode, prefix: string) {
  return Children.toArray(children).map((child, i) =>
    isValidElement<CloneProps>(child)
      ? cloneElement(child as ReactElement<CloneProps>, {
          key: `${prefix}-${i}`,
          className: `${child.props.className ?? ""} tkh-loop-copy`.trim(),
          "aria-hidden": true,
          inert: true,
        })
      : child,
  );
}

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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 640px)");
    let holdUntil = 0;
    let touching = false;
    let settleTimer = 0;
    const items = () => Array.from(track.children) as HTMLElement[];
    const scrollable = () => phone.matches && track.scrollWidth > track.clientWidth + 4;
    // Track position of item i, measured from the first item.
    const offset = (list: HTMLElement[], i: number) => list[i].offsetLeft - list[0].offsetLeft;
    const nearest = () => {
      const list = items();
      let best = 0;
      for (let i = 1; i < list.length; i++) {
        if (Math.abs(offset(list, i) - track.scrollLeft) < Math.abs(offset(list, best) - track.scrollLeft)) best = i;
      }
      return best;
    };
    const update = () => {
      const next = scrollable() ? nearest() % count : 0;
      setActive((previous) => (next === previous ? previous : next));
    };
    // Put the track on the real card with logical index `logical`, without animating.
    const jumpTo = (logical: number) => {
      const list = items();
      if (list.length < count * 3) return;
      track.scrollLeft = offset(list, count + logical);
    };
    // Once scrolling has settled inside a copy, move to the same card in the real set.
    const settle = () => {
      if (!scrollable() || touching) return;
      const i = nearest();
      if (i < count || i >= count * 2) jumpTo(i % count);
      update();
    };
    const onScroll = () => {
      update();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 140);
    };
    const hold = () => {
      holdUntil = Date.now() + 9000;
    };
    const touchStart = () => {
      touching = true;
      hold();
    };
    const touchEnd = () => {
      touching = false;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 140);
    };
    const layout = () => {
      if (scrollable()) jumpTo(nearest() % count);
      update();
    };
    const timer = window.setInterval(() => {
      if (!scrollable() || document.hidden || reduced.matches || touching || Date.now() < holdUntil) return;
      const list = items();
      const next = Math.min(nearest() + 1, list.length - 1);
      track.scrollTo({ left: offset(list, next), behavior: "smooth" });
    }, 3800);
    if (scrollable()) jumpTo(0);
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("pointerdown", hold);
    track.addEventListener("touchstart", touchStart, { passive: true });
    track.addEventListener("touchend", touchEnd, { passive: true });
    track.addEventListener("touchcancel", touchEnd, { passive: true });
    track.addEventListener("wheel", hold, { passive: true });
    window.addEventListener("resize", layout);
    phone.addEventListener("change", layout);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(settleTimer);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("pointerdown", hold);
      track.removeEventListener("touchstart", touchStart);
      track.removeEventListener("touchend", touchEnd);
      track.removeEventListener("touchcancel", touchEnd);
      track.removeEventListener("wheel", hold);
      window.removeEventListener("resize", layout);
      phone.removeEventListener("change", layout);
    };
  }, [count]);
  return (
    <>
      <Tag ref={ref} className={className} style={style}>
        {copies(children, "before")}
        {children}
        {copies(children, "after")}
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
