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

// Cloudflare documents no in-place theme switch that keeps the token, so the theme is read once, when the widget is created
// (band scopes and the page theme both set color-scheme), and the surrounding surface stays pinned to it while the widget lives.
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
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme | null>(null);
  useEffect(() => { onTokenRef.current = onToken; });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadScript().then((api) => {
      if (cancelled || !container.current) return;
      const theme = surfaceTheme(container.current);
      widgetId.current = api.render(container.current, {
        sitekey: siteKey,
        action,
        theme,
        // Compact stays within reflow widths without recreating a solved widget on resize.
        size: "compact",
        language: "pt-br",
        callback: (token: string) => { setState("solved"); onTokenRef.current(token); },
        "expired-callback": () => { setState("expired"); onTokenRef.current(null); },
        "timeout-callback": () => { setState("timeout"); onTokenRef.current(null); },
        "error-callback": () => { setState("failed"); onTokenRef.current(null); },
      });
      setWidgetTheme(theme);
      setState((current) => (current === "idle" ? "ready" : current));
    }).catch(() => { if (!cancelled) setState("failed"); });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action, active, attempt]);

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
