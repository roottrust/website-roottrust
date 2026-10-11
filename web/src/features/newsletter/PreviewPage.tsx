import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import type { FormMode } from "@/lib/forms";
import type { EdicaoPublica } from "./catalog";
import { Abertura, DEMO_LABEL, EdicaoMeta, Eyebrow } from "./NewsletterParts";
import styles from "./newsletter.module.css";

export function PreviewPage({ edicao, mode }: { edicao: EdicaoPublica; mode: FormMode }) {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <article className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
        <div className={styles.inner}>
          <Eyebrow>Prévia da edição</Eyebrow>
          <p className={`${styles.demoTag} ${styles.aux}`}>{DEMO_LABEL}</p>
          <EdicaoMeta edicao={edicao} />
          <h1 id="titulo" className={styles.h1}>{edicao.titulo}</h1>
          <div className={styles.reading}><Abertura edicao={edicao} /></div>
        </div>
      </article>

      <div data-band="cta" className={styles.band}>
        <section className={`${styles.wrap} ${styles.ctaSection}`} aria-labelledby="receba">
          <div className={styles.inner}>
            <Eyebrow>Edição completa</Eyebrow>
            <h2 id="receba" className={styles.title}>Receba esta edição completa.</h2>
            <p className={styles.lead}>Receba esta edição completa e as próximas análises em dias úteis. Confirme seu endereço pelo e-mail que enviaremos.</p>
            <div className={styles.formBox}>
              <NewsletterForm
                mode={mode}
                editionSlug={edicao.slug}
                support="Você pode cancelar os próximos envios. Newsletter e relatório são escolhas independentes."
                help="Já assina? Você também pode solicitar esta edição aqui."
              />
            </div>
            <Link className={`${styles.ghostLink} ${styles.back}`} href="/newsletter/edicoes" prefetch={false}>Voltar para todas as edições</Link>
          </div>
        </section>
      </div>
      <div data-frame-cut="1" />
    </main>
  );
}
