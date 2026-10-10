"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "./GraphicsProvider";
import { createAnimation, type Animation } from "./animation";
import { HomeAscii } from "./home-ascii";
import styles from "./graphics.module.css";

export function SymbolAscii({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ animation: Animation; engine: HomeAscii } | null>(null);
  const { animated, pageVisible } = useGraphicsMotion();
  const latest = useRef({ animated, pageVisible });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = { animated, pageVisible };
    controller.current?.engine.invalidate(); controller.current?.animation.setGate(latest.current);
  }, [animated, pageVisible]);
  useEffect(() => {
    const root = host.current, cv = canvas.current;
    if (!root || !cv) return;
    const engine = new HomeAscii(root, cv, document.createElement("canvas"), true);
    let disposed = false, dirty = true;
    const fail = () => { animation.dispose(); if (!disposed) setFailed(true); };
    const animation = createAnimation((elapsed, _delta, active) => {
      try { if (dirty) { engine.build(); dirty = false; setReady(true); } engine.animated = active; engine.draw(elapsed * 1000); } catch { fail(); }
    });
    controller.current = { animation, engine }; animation.setGate(latest.current);
    const resize = new ResizeObserver(() => { dirty = true; engine.invalidate(); animation.invalidate(); }); resize.observe(root);
    const intersection = new IntersectionObserver(entries => animation.setIntersecting(entries[0].isIntersecting)); intersection.observe(root);
    const move = (event: PointerEvent) => {
      if (!latest.current.animated) return;
      const rect = root.getBoundingClientRect(); engine.mx = event.clientX - rect.left; engine.my = event.clientY - rect.top; engine.invalidate(); animation.invalidate();
    };
    const leave = () => { engine.mx = engine.my = -1e5; engine.invalidate(); animation.invalidate(); };
    root.addEventListener("pointermove", move, { passive: true }); root.addEventListener("pointerleave", leave); cv.addEventListener("contextlost", fail);
    document.fonts.ready.then(() => { if (!disposed) { dirty = true; animation.invalidate(); } }).catch(fail);
    return () => {
      disposed = true; animation.dispose(); resize.disconnect(); intersection.disconnect(); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave); cv.removeEventListener("contextlost", fail);
      engine.g = null; engine.fsp = null; controller.current = null;
    };
  }, []);
  return <div ref={host} className={`${styles.art} ${className}`} aria-hidden="true" data-graphic="symbol" data-graphic-status={failed ? "failed" : ready ? "ready" : "loading"}>
    <div data-sec="ctasym" style={{ position: "absolute", inset: 0 }} />
    <canvas ref={canvas} className={styles.home} style={{ visibility: failed ? "hidden" : "visible" }} />
    {(!ready || failed) && <Image data-graphic-fallback="true" src="/assets/simbolo-negativo.svg" alt="" width={566} height={506} className={styles.fallback} unoptimized />}
  </div>;
}
