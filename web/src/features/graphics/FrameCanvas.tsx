"use client";

import { useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "./GraphicsProvider";
import { createAnimation, type Animation } from "./animation";
import { HomeAscii } from "./home-ascii";
import styles from "./graphics.module.css";

// Moldura (colunas G3, cortes e cantoneiras) event-driven: um quadro por invalidação, sem loop contínuo.
export function FrameCanvas() {
  const frame = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ animation: Animation; engine: HomeAscii } | null>(null);
  const { animated, pageVisible } = useGraphicsMotion();
  const latest = useRef({ animated, pageVisible });
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  useEffect(() => {
    latest.current = { animated, pageVisible };
    const current = controller.current;
    if (!current) return;
    current.engine.animated = animated; current.engine.invalidate();
    current.animation.setGate({ animated: false, pageVisible });
  }, [animated, pageVisible]);
  useEffect(() => {
    const fv = frame.current, root = fv?.closest<HTMLElement>("[data-graphics-root]");
    if (!fv || !root) throw new Error("FrameCanvas requires a data-graphics-root ancestor.");
    const engine = new HomeAscii(root, document.createElement("canvas"), fv, true);
    let disposed = false;
    const fail = () => { animation.dispose(); if (!disposed) setStatus("failed"); };
    const animation = createAnimation(() => {
      try { engine.animated = latest.current.animated; engine.drawFrame(performance.now()); if (!disposed) setStatus(s => (s === "loading" ? "ready" : s)); } catch { fail(); }
    });
    controller.current = { animation, engine };
    engine.animated = latest.current.animated; animation.setGate({ animated: false, pageVisible: latest.current.pageVisible });
    const invalidate = () => { engine.invalidate(); animation.invalidate(); };
    const resize = new ResizeObserver(invalidate); resize.observe(root);
    const intersection = new IntersectionObserver(entries => animation.setIntersecting(entries[0].isIntersecting)); intersection.observe(root);
    const move = (event: PointerEvent) => {
      if (!latest.current.animated || document.documentElement.clientWidth < 960) return;
      const rect = root.getBoundingClientRect(); engine.mx = event.clientX - rect.left; engine.my = event.clientY - rect.top; invalidate();
    };
    const leave = () => { if (engine.mx < -1e4) return; engine.mx = engine.my = -1e5; invalidate(); };
    window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate); document.documentElement.addEventListener("pointerleave", leave); fv.addEventListener("contextlost", fail);
    document.fonts.ready.then(() => { if (!disposed) invalidate(); }).catch(fail);
    return () => {
      disposed = true; animation.dispose(); resize.disconnect(); intersection.disconnect();
      window.removeEventListener("pointermove", move); window.removeEventListener("scroll", invalidate); window.removeEventListener("resize", invalidate);
      document.documentElement.removeEventListener("pointerleave", leave); fv.removeEventListener("contextlost", fail);
      engine.fsp = null; engine.g = null; controller.current = null;
    };
  }, []);
  return <canvas ref={frame} className={styles.frame} aria-hidden="true" data-graphic="frame" data-graphic-status={status} style={{ visibility: status === "failed" ? "hidden" : "visible" }} />;
}
