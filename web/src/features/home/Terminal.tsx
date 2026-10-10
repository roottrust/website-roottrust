"use client";

import { useEffect, useRef, useState } from "react";
import { useGraphicsMotion } from "@/features/graphics/GraphicsProvider";
import styles from "./home.module.css";

/** Decorative typing is separate from the single accessible stage announcement. */
export function Terminal({ lines }: { lines: readonly string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const motion = useGraphicsMotion();
  const total = lines.join("").length;
  const [typed, setTyped] = useState(total);
  const progress = useRef(0);
  useEffect(() => {
    const element = host.current;
    if (!element || !motion.animated) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => { clearInterval(timer); timer = undefined; };
    const observer = new IntersectionObserver(([entry]) => {
      stop();
      if (!entry.isIntersecting || progress.current >= total) return;
      timer = setInterval(() => {
        progress.current = Math.min(total, progress.current + 6); setTyped(progress.current);
        if (progress.current === total) stop();
      }, 50);
    });
    observer.observe(element);
    return () => { observer.disconnect(); stop(); };
  }, [motion.animated, total]);
  const count = motion.reduced ? total : typed;
  return <div ref={host} className={styles.terminalBody} aria-hidden="true">{lines.map((text, index) => {
    const preceding = lines.slice(0, index).reduce((sum, line) => sum + line.length, 0);
    const visible = text.slice(0, Math.max(0, count - preceding));
    return <span key={index} className={styles.terminalLine} style={{ color: index === 0 ? "var(--rt-superficie)" : text.includes("[OK]") ? "var(--rt-folha)" : "var(--rt-menta)" }}>{visible || "\u00a0"}</span>;
  })}</div>;
}
