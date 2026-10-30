"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./graphics.module.css";
import { THEME_ATTRIBUTE } from "@/components/theme/theme";

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
const getTheme = (): "light" | "dark" => {
  const manual = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return manual === "light" || manual === "dark" ? manual : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};
const serverTheme = () => "dark" as const;
function subscribeTheme(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: light)");
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  query.addEventListener("change", callback);
  return () => { observer.disconnect(); query.removeEventListener("change", callback); };
}
type Motion = { reduced: boolean; paused: boolean; pageVisible: boolean; animated: boolean; theme: "light" | "dark"; togglePause: () => void };
const MotionContext = createContext<Motion | null>(null);

export function GraphicsProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverReduced);
  const pageVisible = useSyncExternalStore(subscribeVisibility, getVisible, serverVisible);
  const theme = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);
  const value = useMemo(() => ({ reduced, paused, pageVisible, theme, animated: !reduced && !paused && pageVisible, togglePause: () => setPaused(p => !p) }), [reduced, paused, pageVisible, theme]);
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
