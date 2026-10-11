import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import type { FormMode } from "@/lib/forms";
import type { EdicaoPublica } from "./catalog";
import { Abertura, Arrow, DemoPill, EdicaoMeta } from "./NewsletterParts";
import styles from "./newsletter.module.css";

function BackLink() {
  return (
    <Link className={styles.back} href="/newsletter/edicoes" prefetch={false}><Arrow back />Voltar para todas as edições</Link>
  );
}

export function PreviewPage({ edicao, mode }: { edicao: EdicaoPublica; mode: FormMode }) {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.previewHero}`}>
        <div className={styles.inner}>
          <article className={styles.reading} aria-labelledby="titulo">
            <BackLink />
            <DemoPill />
            <EdicaoMeta edicao={edicao} />
            <h1 id="titulo" className={styles.previewTitle}>{edicao.titulo}</h1>
            <Abertura edicao={edicao} className={styles.readingText} />
          </article>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.requestSection}`} aria-labelledby="receba">
        <div className={styles.inner}>
          <div className={styles.reading}>
            <div className={styles.requestCard}>
              <h2 id="receba" className={styles.requestTitle}>Receba esta <span className={styles.accent}>edição completa.</span></h2>
              <p className={styles.body}>Receba esta edição completa e as próximas análises em dias úteis. Confirme seu endereço pelo e-mail que enviaremos.</p>
              <p className={styles.requested}>Edição solicitada: {edicao.titulo}</p>
              <NewsletterForm
                mode={mode}
                variant="inline"
                editionSlug={edicao.slug}
                support="Você pode cancelar os próximos envios. Newsletter e relatório são escolhas independentes."
                help="Já assina? Você também pode solicitar esta edição aqui."
              />
            </div>
            <BackLink />
          </div>
        </div>
      </section>
      <div data-frame-cut="1" />
    </main>
  );
}
