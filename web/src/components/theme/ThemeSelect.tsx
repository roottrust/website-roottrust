"use client";

import { useSyncExternalStore } from "react";
import { THEME_ATTRIBUTE, THEME_PREFERENCE_ATTRIBUTE, THEME_STORAGE_KEY, parseThemePreference } from "./theme";
import styles from "./theme.module.css";

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  listeners.add(listener);
  media.addEventListener("change", listener);
  return () => { listeners.delete(listener); media.removeEventListener("change", listener); };
}
const getSnapshot = (): "light" | "dark" => {
  const preference = parseThemePreference(document.documentElement.getAttribute(THEME_PREFERENCE_ATTRIBUTE));
  return preference === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : preference;
};
const getServerSnapshot = () => "dark" as const;
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

function chooseTheme(preference: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute(THEME_PREFERENCE_ATTRIBUTE, preference);
  root.setAttribute(THEME_ATTRIBUTE, preference);
  try { localStorage.setItem(THEME_STORAGE_KEY, preference); } catch { /* A escolha permanece na sessão SPA. */ }
  for (const listener of listeners) listener();
}

export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const next = theme === "light" ? "dark" : "light";
  return (
    <div className={styles.field}>
      <button className={styles.button} type="button" disabled={!ready} aria-label={`Tema atual: ${theme === "light" ? "claro" : "escuro"}. Mudar para ${next === "light" ? "claro" : "escuro"}`} onClick={() => chooseTheme(next)}>
        <svg className={styles.sun} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42M6.35 17.65l-1.42 1.42"/></svg>
        <svg className={styles.moon} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>
      </button>
    </div>
  );
}
