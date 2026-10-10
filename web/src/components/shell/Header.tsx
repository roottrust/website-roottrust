"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./shell.module.css";

const links = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#ferramentas", label: "Ferramentas" },
  { href: "/#newsletter", label: "Newsletter" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
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
        <Link href="/" onClick={() => setOpen(false)} aria-label="Root Trust — página inicial"><Image src="/assets/roottrust-horizontal-negativo.svg" width={158} height={34} alt="roottrust" priority /></Link>
        <nav className={styles.desktopNav} aria-label="Navegação principal">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className={`button ${styles.headerCta}`} href="/#contato">Solicitar diagnóstico<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg></Link>
        <button ref={toggle} className={styles.menuToggle} type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 17h16"} /></svg></button>
      </div>
      <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Navegação móvel" hidden={!open}>
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/#contato" onClick={() => setOpen(false)}>Solicitar diagnóstico</Link>
      </nav>
    </header>
  );
}
