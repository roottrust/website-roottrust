"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canRetryNewsletterAction, performNewsletterAction, tokenFromFragment, type NewsletterActionKind, type NewsletterActionResult } from "@/lib/newsletter-actions";

export type NewsletterActionView =
  | { phase: "reading" | "ready" | "sending" }
  | { phase: "settled"; outcome: NewsletterActionResult };

// The token lives only in a ref (memory) until unmount: never in state, URL, storage, logs or attributes.
// The fragment is read client-side, removed from the address bar immediately and keeps history.state intact.
export function useNewsletterAction(kind: NewsletterActionKind) {
  const [view, setView] = useState<NewsletterActionView>({ phase: "reading" });
  const tokenRef = useRef("");
  const sendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const adopt = () => {
      const token = tokenFromFragment(window.location.hash);
      if (token === null) return false;
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      controllerRef.current?.abort();
      controllerRef.current = null;
      sendingRef.current = false;
      tokenRef.current = token;
      setView(token ? { phase: "ready" } : { phase: "settled", outcome: { result: "invalid" } });
      return true;
    };
    // Strict-mode remounts keep the ref: an already adopted token must not turn into a "missing link".
    if (!adopt() && !tokenRef.current) setView({ phase: "settled", outcome: { result: "invalid" } });
    window.addEventListener("hashchange", adopt);
    return () => {
      window.removeEventListener("hashchange", adopt);
      controllerRef.current?.abort();
      controllerRef.current = null;
      sendingRef.current = false;
    };
  }, []);

  const run = useCallback(() => {
    const token = tokenRef.current;
    if (!token || sendingRef.current) return;
    sendingRef.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    setView({ phase: "sending" });
    const settle = (outcome: NewsletterActionResult) => {
      if (controller.signal.aborted) return;
      sendingRef.current = false;
      controllerRef.current = null;
      if (!canRetryNewsletterAction(outcome.result) && outcome.result !== "forbidden") tokenRef.current = "";
      setView({ phase: "settled", outcome });
    };
    performNewsletterAction(kind, token, controller.signal).then(settle, () => settle({ result: "uncertain" }));
  }, [kind]);

  const canRun = view.phase === "ready" || (view.phase === "settled" && canRetryNewsletterAction(view.outcome.result));
  return { view, run, canRun };
}
