import Link from "next/link";
import type { EdicaoPublica } from "./catalog";
import { formatData } from "./archive";
import styles from "./newsletter.module.css";

export const DEMO_LABEL = "Edição demonstrativa — conteúdo para avaliação do design.";

export function Eyebrow({ children }: { children: string }) {
  return (
    <div className={styles.eyebrowRow}>
      <span className={styles.eyebrow}>{children}</span>
      <span className={styles.eyebrowRule} />
    </div>
  );
}

export function Abertura({ edicao }: { edicao: EdicaoPublica }) {
  return (
    <p className={styles.abertura}>
      {edicao.abertura.map((segmento, index) =>
        segmento.href
          ? <a key={index} href={segmento.href} target="_blank" rel="noopener noreferrer">{segmento.t}</a>
          : segmento.t)}
    </p>
  );
}

export function EdicaoMeta({ edicao }: { edicao: EdicaoPublica }) {
  return (
    <p className={styles.meta}>
      <time dateTime={edicao.data}>{formatData(edicao.data)}</time>
      <span className={styles.pilar}>{edicao.pilar}</span>
      <span>Curadoria Root Trust</span>
    </p>
  );
}

export function EdicaoCard({ edicao, headingLevel = 3 }: { edicao: EdicaoPublica; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={styles.card}>
      <p className={styles.demoTag}>{DEMO_LABEL}</p>
      <EdicaoMeta edicao={edicao} />
      <Heading className={styles.cardTitle}>{edicao.titulo}</Heading>
      <Abertura edicao={edicao} />
      <Link className={styles.readLink} href={`/newsletter/edicoes/${edicao.slug}`} prefetch={false}>
        Ler prévia<span className="srOnly">: {edicao.titulo}</span>
      </Link>
    </article>
  );
}
