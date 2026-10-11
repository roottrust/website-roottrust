"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useGraphicsMotion } from "@/features/graphics/GraphicsProvider";
import { focusAnchor, scrollToAnchor, type AnchorScroll } from "./anchor-scroll";
import styles from "./shell.module.css";

const links = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#ferramentas", label: "Ferramentas" },
  { href: "/newsletter", label: "Newsletter" },
];

type AnchorJob = { id: string; from: string; keyboard: boolean };

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { animated } = useGraphicsMotion();
  const scroll = useRef<AnchorScroll | null>(null);
  const pending = useRef<AnchorJob | null>(null);
  const run = useCallback((id: string, keyboard: boolean, instant: boolean) => {
    scroll.current?.cancel();
    scroll.current = scrollToAnchor(id, instant);
    if (keyboard) focusAnchor(id);
  }, []);
  useEffect(() => {
    const job = pending.current;
    if (!job || pathname === job.from) return;
    pending.current = null;
    if (pathname !== "/" || location.hash !== `#${job.id}`) return;
    scrollTo({ top: 0, behavior: "instant" });
    run(job.id, job.keyboard, !animated);
  }, [pathname, animated, run]);
  useEffect(() => {
    if (!animated) scroll.current?.finish();
  }, [animated]);
  useEffect(() => {
    const drop = () => { pending.current = null; };
    addEventListener("popstate", drop);
    return () => { removeEventListener("popstate", drop); scroll.current?.cancel(); };
  }, []);
  function onNavigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!href.startsWith("/#")) {
      pending.current = null;
      scroll.current?.cancel();
      return;
    }
    event.preventDefault();
    const id = href.slice(2);
    const keyboard = event.detail === 0;
    router.push(href, { scroll: false });
    if (pathname === "/") run(id, keyboard, !animated); else pending.current = { id, from: pathname, keyboard };
  }
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" onClick={(event) => onNavigate(event, "/")} aria-label="Root Trust — página inicial"><Image src="/assets/roottrust-horizontal-negativo.svg" width={158} height={34} alt="roottrust" priority /></Link>
        <nav className={styles.desktopNav} aria-label="Navegação principal">{links.map((link) => <Link key={link.href} href={link.href} onClick={(event) => onNavigate(event, link.href)}>{link.label}</Link>)}</nav>
        <Link className={`button ${styles.headerCta}`} href="/#contato" onClick={(event) => onNavigate(event, "/#contato")}>Solicitar diagnóstico<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg></Link>
        <button ref={toggle} className={styles.menuToggle} type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 17h16"} /></svg></button>
      </div>
      <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Navegação móvel" hidden={!open}>
        {links.map((link) => <Link key={link.href} href={link.href} onClick={(event) => onNavigate(event, link.href)}>{link.label}</Link>)}
        <Link href="/#contato" onClick={(event) => onNavigate(event, "/#contato")}>Solicitar diagnóstico</Link>
      </nav>
    </header>
  );
}
