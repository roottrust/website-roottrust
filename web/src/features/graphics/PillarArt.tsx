"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useGraphicsMotion } from "./GraphicsProvider";
import type { PillarKind } from "./pillar-scene";
import type { mountPillar } from "./pillar-runtime";
import styles from "./graphics.module.css";

export type { PillarKind } from "./pillar-scene";
export function PillarArt({ kind, className = "", interactive = true, style }: { kind: PillarKind; className?: string; interactive?: boolean; style?: CSSProperties }) {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const instance = useRef<ReturnType<typeof mountPillar> | null>(null);
  const motion = useGraphicsMotion();
  const latest = useRef({ kind, animated: motion.animated, pageVisible: motion.pageVisible });
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  useEffect(() => {
    latest.current = { kind, animated: motion.animated, pageVisible: motion.pageVisible };
    instance.current?.swap(kind);
    instance.current?.setGate(latest.current);
  }, [kind, motion.animated, motion.pageVisible]);
  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    const load = () => {
      import("./pillar-runtime").then(({ mountPillar }) => {
        if (cancelled || !host.current || !canvas.current) return;
        instance.current = mountPillar(host.current, canvas.current, latest.current.kind, interactive, () => { if (!cancelled) setStatus("failed"); });
        instance.current.setGate(latest.current);
        setStatus("ready");
      }).catch(() => { if (!cancelled) setStatus("failed"); });
    };
    let observer: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        observer = null;
        load();
      });
      observer.observe(el);
    } else load();
    return () => { cancelled = true; observer?.disconnect(); instance.current?.dispose(); instance.current = null; };
  }, [interactive]);
  return <div ref={host} className={`${styles.art} ${className}`} style={style} aria-hidden="true" data-graphic={kind} data-graphic-status={status}>
    <canvas ref={canvas} className={styles.canvas} style={{ visibility: status === "ready" ? "visible" : "hidden" }} />
    {status !== "ready" && <Image data-graphic-fallback="true" src="/assets/simbolo-negativo.svg" alt="" width={566} height={506} className={styles.fallback} unoptimized />}
  </div>;
}
