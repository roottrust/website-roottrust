"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "./GraphicsProvider";
import { createAnimation, type Animation } from "./animation";
import { HomeAscii } from "./home-ascii";
import styles from "./graphics.module.css";

export function HomeCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null), frame = useRef<HTMLCanvasElement>(null);
  const controllers = useRef<{ art: Animation; frame: Animation; engine: HomeAscii } | null>(null);
  const { animated, pageVisible } = useGraphicsMotion();
  const latest = useRef({ animated, pageVisible });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = { animated, pageVisible };
    const current = controllers.current;
    if (!current) return;
    current.engine.animated = animated; current.engine.invalidate();
    current.art.setGate({ animated, pageVisible }); current.frame.setGate({ animated: false, pageVisible });
  }, [animated, pageVisible]);
  useEffect(() => {
    const cv = canvas.current, fv = frame.current, root = cv?.closest<HTMLElement>("[data-graphics-root]");
    if (!cv || !fv || !root) throw new Error("HomeCanvas requires a data-graphics-root ancestor.");
    const engine = new HomeAscii(root, cv, fv);
    let disposed = false, dirty = true;
    const fail = () => { art.dispose(); border.dispose(); if (!disposed) setFailed(true); };
    const art = createAnimation((elapsed, _delta, animated) => {
      try { if (dirty) { engine.build(); dirty = false; setReady(true); } engine.animated = animated; engine.draw(elapsed * 1000); } catch { fail(); }
    });
    const border = createAnimation(() => { try { engine.drawFrame(performance.now()); } catch { fail(); } });
    controllers.current = { art, frame: border, engine };
    engine.animated = latest.current.animated; art.setGate(latest.current); border.setGate({ animated: false, pageVisible: latest.current.pageVisible });
    const invalidate = () => { engine.invalidate(); art.invalidate(); border.invalidate(); };
    const resize = new ResizeObserver(() => { dirty = true; invalidate(); }); resize.observe(root);
    const relevant = new Set<Element>();
    const intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) relevant.add(entry.target); else relevant.delete(entry.target); });
      art.setIntersecting(relevant.size > 0);
    });
    root.querySelectorAll('[data-sec="hero"],[data-sec="newsletter"],[data-sec="ctasym"]').forEach(element => intersection.observe(element));
    const rootIntersection = new IntersectionObserver(entries => border.setIntersecting(entries[0].isIntersecting)); rootIntersection.observe(root);
    const move = (event: PointerEvent) => {
      if (!engine.animated) return;
      const rect = root.getBoundingClientRect(); engine.mx = event.clientX - rect.left; engine.my = event.clientY - rect.top; invalidate();
    };
    const leave = () => { engine.mx = engine.my = -1e5; invalidate(); };
    window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("scroll", invalidate, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", leave); cv.addEventListener("contextlost", fail); fv.addEventListener("contextlost", fail);
    document.fonts.ready.then(() => { if (!disposed) { dirty = true; invalidate(); } }).catch(fail);
    return () => {
      disposed = true; art.dispose(); border.dispose(); resize.disconnect(); intersection.disconnect(); rootIntersection.disconnect();
      window.removeEventListener("pointermove", move); window.removeEventListener("scroll", invalidate, { capture: true }); document.documentElement.removeEventListener("pointerleave", leave);
      cv.removeEventListener("contextlost", fail); fv.removeEventListener("contextlost", fail); engine.g = null; engine.fsp = null; controllers.current = null;
    };
  }, []);
  return <>
    <canvas ref={canvas} className={styles.home} aria-hidden="true" style={{ visibility: failed ? "hidden" : "visible" }} />
    <canvas ref={frame} className={styles.frame} aria-hidden="true" style={{ visibility: failed ? "hidden" : "visible" }} />
    {(!ready || failed) && <Image data-graphic-fallback="true" src="/assets/g4-rocha.svg" alt="" width={3000} height={2284} className={styles.heroFallback} unoptimized />}
  </>;
}
