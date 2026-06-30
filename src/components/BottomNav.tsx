/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bottom nav (bottom-nav-spec.md + the agreed press-and-hold prototype). One
 * shared component, every screen. Idle, it's the original flex bar: the active
 * tab is an expanding violet pill (icon + label), the others are quiet icons
 * with an under-label. Tapping switches as before.
 *
 * Press and hold and you grab that pill. As you drag, the bar reflows live — the
 * tab you're over opens up to receive the pill and the others make room, exactly
 * the rearrange a tap does, but tracking your finger. The pill enlarges (1.14×)
 * as the "you've grabbed it" signal and glides under your thumb; release and it
 * settles into whichever tab you're over.
 *
 * 60fps: per drag-frame only the indicator's translateX changes, written
 * straight to the DOM via a ref (no React render per frame) — a compositor-only
 * transform. Which tab is "active" (the reflow) updates as state only when you
 * cross into a new tab; the enlarge, the label/width morph, and the settle are
 * one-shot eased tweens. The scrub runs on non-passive touch events, not pointer
 * capture (the WebView reclaims that mid-drag). The indicator is clamped by its
 * ENLARGED width so it never spills off the Workout/Login edges.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface NavTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  tabs: NavTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

const HOLD_DELAY = 130; // ms before a still press becomes a hold-scrub
const MOVE_THRESH = 6; // px of travel that also engages the scrub
const SCALE = 1.14; // grab enlarge — must match the CSS .dragging .bpill scale
const SETTLE_MS = 160; // how long the pill lingers (shrinking) before it fades

export default function BottomNav({ tabs, activeKey, onSelect }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const lblRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const widthsRef = useRef<number[]>([]);

  const [dragNearest, setDragNearest] = useState<number | null>(null);
  const dragging = dragNearest !== null;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeKey));
  const shownIndex = dragging ? (dragNearest as number) : activeIndex;

  const stateRef = useRef({ tabs, activeKey, onSelect });
  stateRef.current = { tabs, activeKey, onSelect };
  const nearestRef = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const hideTimer = useRef<number | undefined>(undefined);

  const measure = () => {
    widthsRef.current = lblRefs.current.map((el) => 36 + 27 + 9 + (el ? el.scrollWidth : 40));
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  // Per-frame indicator position — written straight to the DOM, clamped by the
  // ENLARGED width so the edge pills stay fully on screen.
  const writeX = (lx: number) => {
    const nav = navRef.current, blob = blobRef.current;
    if (!nav || !blob) return;
    const w = widthsRef.current[nearestRef.current ?? 0] || 0;
    const half = (w * SCALE) / 2 + 4;
    const c = Math.max(half, Math.min(nav.clientWidth - half, lx));
    blob.style.transform = `translateX(${c - w / 2}px)`;
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let press: { sx: number; held: boolean; timer: number } | null = null;

    const localX = (clientX: number) => clientX - nav.getBoundingClientRect().left;
    const zone = (lx: number) => {
      const n = stateRef.current.tabs.length;
      return Math.max(0, Math.min(n - 1, Math.floor(lx / (nav.clientWidth / n))));
    };
    const showBlob = () => { const b = blobRef.current; if (b) { window.clearTimeout(hideTimer.current); b.style.opacity = "1"; } };
    const engage = (lx: number) => { press!.held = true; const z = zone(lx); nearestRef.current = z; setDragNearest(z); showBlob(); writeX(lx); };
    const end = (commit: boolean) => {
      if (!press) return;
      window.clearTimeout(press.timer);
      const held = press.held;
      press = null;
      if (held) {
        suppressClick.current = true;
        if (commit) {
          const { tabs: ts, activeKey: ak, onSelect: sel } = stateRef.current;
          const t = ts[nearestRef.current ?? 0];
          if (t && t.key !== ak) sel(t.key);
        }
        window.setTimeout(() => { suppressClick.current = false; }, 80);
        // Let the chosen tab's pill expand under the indicator, then fade it out.
        hideTimer.current = window.setTimeout(() => { const b = blobRef.current; if (b) b.style.opacity = "0"; }, SETTLE_MS);
      }
      setDragNearest(null);
    };
    const start = (clientX: number) => {
      measure();
      press = { sx: clientX, held: false, timer: window.setTimeout(() => { if (press && !press.held) engage(localX(clientX)); }, HOLD_DELAY) };
    };
    const move = (clientX: number, e?: Event) => {
      if (!press) return;
      if (!press.held) {
        if (Math.abs(clientX - press.sx) > MOVE_THRESH) { window.clearTimeout(press.timer); engage(localX(clientX)); }
        else return;
      }
      e?.preventDefault();
      const lx = localX(clientX);
      const z = zone(lx);
      if (z !== nearestRef.current) { nearestRef.current = z; setDragNearest(z); } // reflow only on crossing
      writeX(lx); // every frame
    };

    const onTStart = (e: TouchEvent) => { if (e.touches.length === 1) start(e.touches[0].clientX); };
    const onTMove = (e: TouchEvent) => { if (press && e.touches.length) move(e.touches[0].clientX, e); };
    const onTEnd = () => { if (press) end(true); };
    const onTCancel = () => { if (press) end(false); };
    const onPDown = (e: PointerEvent) => { if (e.pointerType === "mouse" && e.button === 0) start(e.clientX); };
    const onPMove = (e: PointerEvent) => { if (press && e.pointerType === "mouse") move(e.clientX, e); };
    const onPUp = (e: PointerEvent) => { if (press && e.pointerType === "mouse") end(true); };

    nav.addEventListener("touchstart", onTStart, { passive: false });
    nav.addEventListener("touchmove", onTMove, { passive: false });
    nav.addEventListener("touchend", onTEnd);
    nav.addEventListener("touchcancel", onTCancel);
    nav.addEventListener("pointerdown", onPDown);
    nav.addEventListener("pointermove", onPMove);
    nav.addEventListener("pointerup", onPUp);
    return () => {
      if (press) window.clearTimeout(press.timer);
      window.clearTimeout(hideTimer.current);
      nav.removeEventListener("touchstart", onTStart);
      nav.removeEventListener("touchmove", onTMove);
      nav.removeEventListener("touchend", onTEnd);
      nav.removeEventListener("touchcancel", onTCancel);
      nav.removeEventListener("pointerdown", onPDown);
      nav.removeEventListener("pointermove", onPMove);
      nav.removeEventListener("pointerup", onPUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blobW = widthsRef.current[shownIndex] || 0;

  return (
    <nav ref={navRef} className={`pbw-enav${dragging ? " dragging" : ""}`}>
      <span ref={blobRef} className="navblob" aria-hidden>
        <span className="bpill" style={{ width: blobW }}>
          <span className="ic">{tabs[shownIndex].icon}</span>
          <span className="lbl">{tabs[shownIndex].label}</span>
        </span>
      </span>
      {tabs.map((t, i) => (
        <a
          key={t.key}
          className={`item${i === shownIndex ? " active" : ""}`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          onClick={() => { if (suppressClick.current) return; onSelect(t.key); }}
        >
          <span className="pill"><span className="ic">{t.icon}</span><span className="lbl" ref={(el) => { lblRefs.current[i] = el; }}>{t.label}</span></span>
          <span className="sub">{t.label}</span>
        </a>
      ))}
    </nav>
  );
}
