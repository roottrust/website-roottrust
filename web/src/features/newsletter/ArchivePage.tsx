import Link from "next/link";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { archiveHref, FILTROS, type ArchiveView } from "./archive";
import { Arrow, DemoPill, EdicaoMeta, EdicaoRow, Eyebrow, ReadLink } from "./NewsletterParts";
import styles from "./newsletter.module.css";

function Pager({ view }: { view: ArchiveView }) {
  const anterior = view.pagina > 1;
  const proxima = view.pagina < view.totalPaginas;
  return (
    <nav className={styles.pager} aria-label="Paginação das prévias">
      {anterior
        ? <Link className={styles.pagerBtn} href={archiveHref(view.filtro, view.pagina - 1)} prefetch={false} rel="prev"><Arrow back />Anterior</Link>
        : <span className={styles.pagerBtn} aria-disabled="true"><Arrow back />Anterior</span>}
      <span className={styles.pagerInfo}>Página {view.pagina} de {view.totalPaginas}</span>
      {proxima
        ? <Link className={styles.pagerBtn} href={archiveHref(view.filtro, view.pagina + 1)} prefetch={false} rel="next">Próxima<Arrow /></Link>
        : <span className={styles.pagerBtn} aria-disabled="true">Próxima<Arrow /></span>}
    </nav>
  );
}

export function ArchivePage({ view }: { view: ArchiveView }) {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.compactHero}`} aria-labelledby="titulo">
        <div className={styles.inner}>
         <div className={styles.heroText}>
          <Eyebrow>Newsletter</Eyebrow>
          <h1 id="titulo" className={styles.h1}>Prévias <span className={styles.accent}>das edições.</span></h1>
          <p className={styles.lead}>Conheça os temas da curadoria da Root Trust. Escolha uma prévia e solicite aquela edição completa por e-mail.</p>
          <div className={styles.actions}>
            <Link className={styles.outlineBtn} href="/newsletter" prefetch={false}>Conhecer a newsletter<Arrow /></Link>
            <DemoPill>Edições demonstrativas — conteúdo para avaliação do design.</DemoPill>
          </div>
         </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.archiveSection}`} aria-label="Prévias">
        <div className={`${styles.inner} ${styles.stack}`}>
          {view.destaque ? (
            <section aria-labelledby="destaque" className={styles.highlight}>
              <div className={styles.highlightText}>
                <span className={styles.highlightLabel}>Mais recente</span>
                <h2 id="destaque" className={styles.highlightTitle}>{view.destaque.titulo}</h2>
                <EdicaoMeta edicao={view.destaque} />
              </div>
              <ReadLink edicao={view.destaque} />
            </section>
          ) : view.filtro === "todos" ? (
            <div className={styles.panel}>
              <div>
                <h2 className={styles.panelTitle}>Ainda não há edições publicadas.</h2>
                <p className={styles.panelText}>Volte para conhecer as próximas prévias.</p>
              </div>
              <Link className={styles.outlineBtn} href="/newsletter" prefetch={false}>Conhecer a newsletter<Arrow /></Link>
            </div>
          ) : null}

          <div className={styles.filterBar}>
            <nav aria-label="Filtrar por pilar">
              <ul className={styles.filters}>
                {FILTROS.map((f) => (
                  <li key={f.key}>
                    <Link href={archiveHref(f.key)} prefetch={false} aria-current={f.key === view.filtro ? "page" : undefined}>{f.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className={styles.count}>{view.total} {view.total === 1 ? "edição" : "edições"}</p>
          </div>

          {view.total > 0 ? (
            <section aria-labelledby="lista">
              <h2 id="lista" className="srOnly">Todas as prévias</h2>
              <ol className={styles.list}>
                {view.itens.map((edicao) => <li key={edicao.id}><EdicaoRow edicao={edicao} /></li>)}
              </ol>
              <Pager view={view} />
            </section>
          ) : view.filtro !== "todos" ? (
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Nenhuma edição neste pilar por enquanto.</h2>
              <Link className={styles.outlineBtn} href={archiveHref("todos")} prefetch={false}>Ver todos os pilares</Link>
            </div>
          ) : null}
        </div>
      </section>
      <div data-frame-cut="1" />
    </main>
  );
}
