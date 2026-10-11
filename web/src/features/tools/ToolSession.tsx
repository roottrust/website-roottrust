"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";

/** Reinicia o conteúdo restaurado do cache de navegação (BFcache): respostas nunca são recuperadas. */
export function ToolSession({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(0);
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) setSession((n) => n + 1); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  return <Fragment key={session}>{children}</Fragment>;
}
