"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FeedbackPanel } from "@/components/forms/FormStatus";
import { useNewsletterAction } from "@/components/forms/useNewsletterAction";
import formStyles from "@/components/forms/forms.module.css";
import { newsletterActionFeedback, type NewsletterActionKind } from "@/lib/newsletter-actions";
import styles from "@/features/newsletter/newsletter.module.css";

export function NewsletterAction({ kind, title, intro, actionLabel, sendingLabel }: {
  kind: NewsletterActionKind; title: string; intro: string; actionLabel: string; sendingLabel: string;
}) {
  const { view, run, canRun } = useNewsletterAction(kind);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLAnchorElement>(null);
  const attempted = useRef(false);
  const settled = view.phase === "settled";
  const feedback = view.phase === "sending" ? newsletterActionFeedback(kind, "sending") : settled ? newsletterActionFeedback(kind, view.outcome) : null;

  // After a user-triggered attempt the activated button may be disabled or removed: keep focus on a useful control.
  useEffect(() => {
    if (!settled || !attempted.current) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== buttonRef.current) return;
    (canRun ? buttonRef : backRef).current?.focus();
  }, [settled, view, canRun]);

  return <main id="conteudo" className={styles.root}>
    <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
      <div className={styles.inner}><div className={styles.requestCard}><div className={formStyles.actionStack}>
        <h1 id="titulo" className={styles.h1}>{title}</h1>
        {settled && !canRun ? null : <p className={styles.body}>{intro}</p>}
        <noscript><p className={styles.body}>Ative JavaScript para usar este link. Para pedir ajuda, escreva para <a href="mailto:contato@roottrust.com.br">contato@roottrust.com.br</a>.</p></noscript>
        <FeedbackPanel feedback={feedback} renewHref="/newsletter" />
        {canRun || view.phase === "sending"
          ? <button ref={buttonRef} className="button" type="button" disabled={view.phase === "sending"} onClick={() => { attempted.current = true; run(); }}>
            {view.phase === "sending" ? sendingLabel : settled ? "Tentar novamente" : actionLabel}
          </button>
          : null}
        <Link ref={backRef} href="/newsletter" className={styles.back}>Voltar à newsletter</Link>
      </div></div></div>
    </section>
  </main>;
}
