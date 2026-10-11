import Link from "next/link";
import type { EdicaoPublica } from "./catalog";
import { formatData } from "./archive";
import styles from "./newsletter.module.css";

export const DEMO_LABEL = "Edição demonstrativa — conteúdo para avaliação do design.";

export function Eyebrow({ children }: { children: string }) {
  return (
    <div className={styles.eyebrowRow}>
      <span className={styles.eyebrow}>{children}</span>
      <span className={styles.eyebrowRule} aria-hidden="true" />
    </div>
  );
}

export function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {back ? <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></> : <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
    </svg>
  );
}

export function DemoPill({ children = DEMO_LABEL }: { children?: string }) {
  return <p className={styles.pill}><span aria-hidden="true" className={styles.pillDot} />{children}</p>;
}

export function Abertura({ edicao, className = styles.abertura }: { edicao: EdicaoPublica; className?: string }) {
  return (
    <p className={className}>
      {edicao.abertura.map((segmento, index) =>
        segmento.href
          ? <a key={index} href={segmento.href} target="_blank" rel="noopener noreferrer">{segmento.t}</a>
          : segmento.t)}
    </p>
  );
}

export function EdicaoMeta({ edicao, stacked = false }: { edicao: EdicaoPublica; stacked?: boolean }) {
  return (
    <p className={stacked ? styles.metaStack : styles.meta}>
      <time dateTime={edicao.data}>{formatData(edicao.data)}</time>
      <span>{edicao.pilar}</span>
      <span className={stacked ? styles.metaBrand : undefined}>Curadoria Root Trust</span>
    </p>
  );
}

export function ReadLink({ edicao }: { edicao: EdicaoPublica }) {
  return (
    <Link className={styles.outlineBtn} href={`/newsletter/edicoes/${edicao.slug}`} prefetch={false}>
      <span>Ler prévia<span className="srOnly">: {edicao.titulo}</span></span><Arrow />
    </Link>
  );
}

export function EdicaoCard({ edicao }: { edicao: EdicaoPublica }) {
  return (
    <article className={styles.card} aria-labelledby={`card-${edicao.slug}`}>
      <DemoPill />
      <EdicaoMeta edicao={edicao} />
      <h3 id={`card-${edicao.slug}`} className={styles.cardTitle}>{edicao.titulo}</h3>
      <Abertura edicao={edicao} />
      <div><ReadLink edicao={edicao} /></div>
    </article>
  );
}

export function EdicaoRow({ edicao }: { edicao: EdicaoPublica }) {
  return (
    <article className={styles.row} aria-labelledby={`row-${edicao.slug}`}>
      <EdicaoMeta edicao={edicao} stacked />
      <div className={styles.rowBody}>
        <h3 id={`row-${edicao.slug}`} className={styles.rowTitle}>{edicao.titulo}</h3>
        <Abertura edicao={edicao} />
        <div><ReadLink edicao={edicao} /></div>
      </div>
    </article>
  );
}
