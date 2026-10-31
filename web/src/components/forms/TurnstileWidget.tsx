"use client";

import { useEffect, useRef, useState } from "react";
import { canRetryChallenge, challengeGroupId, challengeMessage, type ChallengeState } from "./challenge-state";
import styles from "./forms.module.css";

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing ?? Object.assign(document.createElement("script"), { id: SCRIPT_ID, src: SCRIPT_SRC, async: true });
    script.addEventListener("load", () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile_missing"))), { once: true });
    script.addEventListener("error", () => { script.remove(); reject(new Error("turnstile_load_failed")); }, { once: true });
    if (!existing) document.head.append(script);
  });
}

type WidgetTheme = "dark" | "light";

// Read the form outside the widget surface: bands can override the page color-scheme.
const surfaceTheme = (element: HTMLElement): WidgetTheme => {
  const scheme = getComputedStyle(element).colorScheme;
  return scheme.includes("light") && !scheme.includes("dark") ? "light" : "dark";
};

// The script loads only once `active` turns true (form near the viewport or focused). Tokens are single-use: the parent
// bumps `resetKey` after every submission attempt so the next one gets a fresh challenge.
export function TurnstileWidget({ siteKey, action, active, resetKey, statusId, onToken }: {
  siteKey: string; action: string; active: boolean; resetKey: number; statusId: string; onToken: (token: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [state, setState] = useState<ChallengeState>("idle");
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState<"compact" | "flexible" | null>(null);
  const sizeRef = useRef<typeof size>(null);
  const generation = useRef(0);
  const targetTheme = useRef<WidgetTheme | null>(null);
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme | null>(null);
  useEffect(() => { onTokenRef.current = onToken; });

  useEffect(() => {
    const element = container.current;
    if (!active || !element) return;
    const measure = (width: number) => {
      if (width <= 0) return;
      const next = width >= 300 ? "flexible" : "compact";
      if (sizeRef.current === next) return;
      if (sizeRef.current !== null) {
        generation.current += 1;
        onTokenRef.current(null);
        setState("idle");
        // React can batch crossings back to the same size; the revision still recreates the invalidated widget.
        setAttempt((current) => current + 1);
      }
      sizeRef.current = next;
      setSize(next);
    };
    const observer = new ResizeObserver((entries) => measure(entries[0].contentRect.width));
    observer.observe(element);
    measure(element.clientWidth);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const form = container.current?.closest("form");
    if (!active || !form) return;
    const update = () => {
      const next = surfaceTheme(form);
      if (targetTheme.current === next) return;
      if (targetTheme.current !== null) {
        generation.current += 1;
        onTokenRef.current(null);
        setState("idle");
        setAttempt((current) => current + 1);
      }
      targetTheme.current = next;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-pref"] });
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", update);
    return () => { observer.disconnect(); media.removeEventListener("change", update); };
  }, [active]);

  useEffect(() => {
    if (!active || !size) return;
    let cancelled = false;
    const currentGeneration = generation.current;
    const live = () => !cancelled && generation.current === currentGeneration;
    loadScript().then((api) => {
      if (!live() || !container.current) return;
      const form = container.current.closest("form");
      if (!form) return;
      const theme = targetTheme.current ?? surfaceTheme(form);
      widgetId.current = api.render(container.current, {
        sitekey: siteKey,
        action,
        theme,
        size,
        language: "pt-br",
        callback: (token: string) => { if (!live()) return; setState("solved"); onTokenRef.current(token); },
        "expired-callback": () => { if (!live()) return; setState("expired"); onTokenRef.current(null); },
        "timeout-callback": () => { if (!live()) return; setState("timeout"); onTokenRef.current(null); },
        "error-callback": () => { if (!live()) return; setState("failed"); onTokenRef.current(null); },
      });
      setWidgetTheme(theme);
      setState((current) => (current === "idle" ? "ready" : current));
    }).catch(() => { if (live()) setState("failed"); });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action, active, attempt, size]);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      setState("ready");
    }
  }, [resetKey]);

  function retry() {
    onTokenRef.current(null);
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      setState("ready");
    } else {
      setState("idle");
      setAttempt((current) => current + 1);
    }
  }

  const shown: ChallengeState = active && state === "idle" ? "loading" : state;

  return (
    <div className={styles.challenge} data-widget-theme={widgetTheme ?? undefined} id={challengeGroupId(statusId)} tabIndex={-1} role="group" aria-label="Verificação de segurança">
      <div ref={container} className={styles.challengeWidget} />
      <p className={styles.notice} id={statusId} role="status" aria-live={shown === "ready" && resetKey > 0 ? "off" : "polite"}>{challengeMessage(shown)}</p>
      {canRetryChallenge(shown) ? <button className={styles.retry} type="button" onClick={retry}>Tentar novamente</button> : null}
      <p className={styles.notice}>Verificação protegida por Cloudflare Turnstile.</p>
    </div>
  );
}
