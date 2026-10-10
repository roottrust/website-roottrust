"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "@/features/graphics/GraphicsProvider";

/** Desktop scroll tracks retain the export's 0.6 viewport distance per item. */
export function useHomeSequence(count: number) {
  const track = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const trackRef = useCallback((node: HTMLDivElement | null) => { track.current = node; }, []);
  const innerRef = useCallback((node: HTMLDivElement | null) => { inner.current = node; }, []);
  const { reduced, paused, pageVisible } = useGraphicsMotion();
  const [active, setActive] = useState(0);
  const [fraction, setFraction] = useState(0);
  const [geometry, setGeometry] = useState({ enabled: false, height: 0, viewport: 0, top: 0 });
  useEffect(() => {
    const host = track.current, body = inner.current;
    if (!host || !body) return;
    let frame = 0;
    function measure() {
      const height = body!.offsetHeight, viewport = innerHeight;
      const enabled = innerWidth >= 960 && !reduced;
      const top = Math.min(76, viewport - height);
      setGeometry(previous => previous.enabled === enabled && previous.height === height && previous.viewport === viewport && previous.top === top ? previous : { enabled, height, viewport, top });
    }
    function update() {
      frame = 0;
      if (innerWidth < 960 || reduced || paused || !pageVisible) return;
      const top = Math.min(76, innerHeight - body!.offsetHeight);
      const step = innerHeight * 0.6;
      const distance = Math.max(0, Math.min(count * step - 1, top - host!.getBoundingClientRect().top));
      setActive(Math.floor(distance / step));
      setFraction(Math.round((distance % step) / step * 100) / 100);
    }
    function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
    const observer = new ResizeObserver(() => { measure(); onScroll(); });
    observer.observe(body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure(); onScroll();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [count, reduced, paused, pageVisible]);
  const pick = useCallback((index: number) => {
    setActive(index); setFraction(1);
    if (!geometry.enabled || !track.current) return;
    const y = scrollY + track.current.getBoundingClientRect().top - geometry.top + (index + 0.12) * geometry.viewport * 0.6;
    window.scrollTo({ top: y, behavior: reduced || paused ? "instant" : "smooth" });
  }, [geometry, reduced, paused]);
  return {
    active, fraction, pick, trackRef, innerRef, enabled: geometry.enabled,
    trackHeight: geometry.enabled && geometry.height ? `${Math.round(geometry.height + count * 0.6 * geometry.viewport)}px` : "auto",
    position: geometry.enabled ? "sticky" as const : "relative" as const, top: geometry.enabled ? `${geometry.top}px` : "0px",
    padding: geometry.enabled ? "40px 0 56px" : "96px 0 96px",
    artHeight: geometry.enabled ? "clamp(180px, calc(100vh - 640px), 280px)" : "280px",
  };
}
