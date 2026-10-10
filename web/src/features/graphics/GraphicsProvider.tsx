"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./graphics.module.css";

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(callback: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const getReduced = () => window.matchMedia(QUERY).matches;
const getVisible = () => !document.hidden;
const serverReduced = () => true;
const serverVisible = () => false;
type Motion = { reduced: boolean; paused: boolean; pageVisible: boolean; animated: boolean; togglePause: () => void };
const MotionContext = createContext<Motion | null>(null);

export function GraphicsProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverReduced);
  const pageVisible = useSyncExternalStore(subscribeVisibility, getVisible, serverVisible);
  const value = useMemo(() => ({ reduced, paused, pageVisible, animated: !reduced && !paused && pageVisible, togglePause: () => setPaused(p => !p) }), [reduced, paused, pageVisible]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useGraphicsMotion() {
  const motion = useContext(MotionContext);
  if (!motion) throw new Error("GraphicsProvider is required for graphics and motion controls.");
  return motion;
}

export function PauseMotionButton() {
  const { paused, togglePause } = useGraphicsMotion();
  return <button className={styles.pause} type="button" aria-pressed={paused} onClick={togglePause}>
    {paused ? "Retomar animações" : "Pausar animações"}
  </button>;
}
