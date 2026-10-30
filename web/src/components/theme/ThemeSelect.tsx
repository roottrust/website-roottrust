"use client";

import { useId, useSyncExternalStore, type ChangeEvent } from "react";
import { THEME_ATTRIBUTE, THEME_PREFERENCE_ATTRIBUTE, THEME_STORAGE_KEY, parseThemePreference, type ThemePreference } from "./theme";
import styles from "./theme.module.css";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const getSnapshot = (): ThemePreference => parseThemePreference(document.documentElement.getAttribute(THEME_PREFERENCE_ATTRIBUTE));
const getServerSnapshot = (): ThemePreference => "system";
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

function chooseTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute(THEME_PREFERENCE_ATTRIBUTE, preference);
  if (preference === "system") root.removeAttribute(THEME_ATTRIBUTE); else root.setAttribute(THEME_ATTRIBUTE, preference);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage negado/cheio: a escolha permanece nos atributos de <html> durante a sessão SPA, sem log nem dados.
  }
  for (const listener of listeners) listener();
}

export function ThemeSelect() {
  const id = useId();
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>Tema</label>
      <div className={styles.select}>
        <select id={id} value={preference} disabled={!ready} onChange={(event: ChangeEvent<HTMLSelectElement>) => chooseTheme(parseThemePreference(event.target.value))}>
          <option value="system">Sistema</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
    </div>
  );
}
