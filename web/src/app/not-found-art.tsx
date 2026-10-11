"use client";

import { useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "@/features/graphics/GraphicsProvider";
import { createAnimation, type Animation } from "@/features/graphics/animation";
import styles from "./not-found.module.css";

type Grid = { COLS: number; ROWS: number; dens: Float32Array; kind: Uint8Array; seed: Float32Array };
const W = 1200, H = 380, RAMP = ".:-=+*#%@";
const mix = (p: string, q: string, f: number) => "#" + [0, 2, 4].map(k => Math.round(parseInt(p.slice(1 + k, 3 + k), 16) * (1 - f) + parseInt(q.slice(1 + k, 3 + k), 16) * f).toString(16).padStart(2, "0")).join("");
const PAL_G = Array.from({ length: 8 }, (_, k) => mix("#2A2A2A", "#4A4A4A", k / 7));
const PAL_V = Array.from({ length: 12 }, (_, k) => k < 8 ? mix("#2A4A3E", "#62AF96", k / 7) : mix("#62AF96", "#CCE9DC", (k - 7) / 4));

// Grid and drawing values ported from approved 404.dc.html.
function buildGrid(width: number, family: string): Grid {
  const COLS = width >= 760 ? 120 : width >= 480 ? 80 : 56, ROWS = Math.round(COLS * H / W / 1.9);
  const cw = W / COLS, ch = H / ROWS, o = document.createElement("canvas"); o.width = W; o.height = H;
  const x = o.getContext("2d"); if (!x) throw new Error("Canvas 2D unavailable.");
  x.fillStyle = "#ff0000"; x.font = `700 410px ${family}`; x.textAlign = "center"; x.textBaseline = "alphabetic";
  x.fillText("4", 215, 345); x.fillText("4", 985, 345);
  x.save(); x.translate(437, 48); x.scale(0.2, 0.2); x.strokeStyle = "#00ff00"; x.fillStyle = "#00ff00"; x.lineWidth = 170; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); [[85, 780], [250, 690], [548, 1360], [905, 85], [1545, 85]].forEach(([a, b], k) => k ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
  x.beginPath(); x.arc(1225, 610, 235, 0, Math.PI * 2); x.fill(); x.restore();
  const d = x.getImageData(0, 0, W, H).data, dens = new Float32Array(COLS * ROWS), kind = new Uint8Array(COLS * ROWS), seed = new Float32Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    let sr = 0, sg = 0, n = 0;
    for (let y = Math.floor(r * ch); y < Math.floor((r + 1) * ch); y += 2) for (let xx = Math.floor(c * cw); xx < Math.floor((c + 1) * cw); xx += 2) { const k = (y * W + xx) * 4; sr += d[k] * d[k + 3] / 255; sg += d[k + 1] * d[k + 3] / 255; n++; }
    const i = r * COLS + c, a = sr / (n * 255), b = sg / (n * 255);
    dens[i] = Math.max(a, b); kind[i] = b > a ? 1 : 0; seed[i] = Math.abs((Math.sin((r * 97 + c * 57) * 12.9898) * 43758.5453) % 1);
  }
  return { COLS, ROWS, dens, kind, seed };
}

export function NotFoundArt() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<Animation | null>(null);
  const { animated, pageVisible } = useGraphicsMotion();
  const latest = useRef({ animated, pageVisible });
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  useEffect(() => { latest.current = { animated, pageVisible }; controller.current?.setGate(latest.current); }, [animated, pageVisible]);
  useEffect(() => {
    const cv = canvas.current; if (!cv) return;
    let disposed = false, grid: Grid | null = null, builtWidth = 0, mx = -1e5, my = -1e5, shown = false;
    const family = getComputedStyle(document.body).getPropertyValue("--font-baloo").trim() || "sans-serif";
    const fail = () => { animation.dispose(); if (!disposed) setStatus("failed"); };
    const animation = createAnimation((elapsed, _delta, active) => {
      try {
        const r = cv.getBoundingClientRect(); if (r.width < 2) return;
        if (!grid || Math.abs(builtWidth - r.width) > 1) { grid = buildGrid(r.width, family); builtWidth = r.width; }
        const g = grid, dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        const x = cv.getContext("2d"); if (!x) throw new Error("Canvas 2D unavailable.");
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, r.width, r.height);
        const prog = active ? elapsed / 1.5 : 2, now = elapsed * 1000, cw = r.width / g.COLS, ch = r.height / g.ROWS, rad = Math.max(48, r.width * 0.06);
        x.font = `500 ${Math.max(7, ch * 0.95).toFixed(1)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`; x.textAlign = "center"; x.textBaseline = "middle";
        const tick = Math.floor(now / 140);
        for (let rr = 0; rr < g.ROWS; rr++) for (let cc = 0; cc < g.COLS; cc++) {
          const i = rr * g.COLS + cc, dn = g.dens[i]; if (dn < 0.1) continue;
          if (prog < (cc / g.COLS) * 0.7 + g.seed[i] * 0.3) continue;
          const px = (cc + 0.5) * cw, py = (rr + 0.5) * ch, pulse = active ? 0.16 * Math.sin(now / 1500 - (cc + rr) * 0.28) : 0;
          const boost = active ? Math.max(0, 1 - Math.hypot(px - mx, py - my) / rad) : 0, lvl = Math.max(0, Math.min(1, dn + pulse));
          let col = g.kind[i] === 1 ? PAL_V[Math.min(7, Math.round(lvl * 7))] : PAL_G[Math.min(7, Math.round(lvl * 7))];
          if (boost > 0.05) col = PAL_V[Math.min(11, 8 + Math.floor(boost * 4))];
          let k = Math.min(RAMP.length - 1, Math.floor(lvl * RAMP.length)); if (boost > 0.3) k = (Math.abs((Math.sin(i * 12.9898 + tick * 7.13) * 43758.5453) % 1) * RAMP.length) | 0;
          x.fillStyle = col; x.fillText(RAMP[k], px, py);
        }
        if (!shown && !disposed) { shown = true; setStatus("ready"); }
      } catch { fail(); }
    });
    controller.current = animation; animation.setGate(latest.current);
    const resize = new ResizeObserver(() => animation.invalidate()); resize.observe(cv);
    const intersection = new IntersectionObserver(entries => animation.setIntersecting(entries[0].isIntersecting)); intersection.observe(cv);
    const move = (event: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = event.clientX - r.left; my = event.clientY - r.top; };
    const leave = () => { mx = my = -1e5; };
    window.addEventListener("pointermove", move, { passive: true }); document.documentElement.addEventListener("pointerleave", leave); cv.addEventListener("contextlost", fail);
    document.fonts.load(`700 410px ${family}`).then(() => { if (!disposed) { grid = null; animation.invalidate(); } }).catch(fail);
    return () => {
      disposed = true; animation.dispose(); resize.disconnect(); intersection.disconnect();
      window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); cv.removeEventListener("contextlost", fail); controller.current = null;
    };
  }, []);
  return <canvas ref={canvas} className={styles.art} aria-hidden="true" data-graphic="not-found" data-graphic-status={status} style={{ visibility: status === "failed" ? "hidden" : "visible" }} />;
}
