import Link from "next/link";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { archiveHref, FILTROS, type ArchiveView } from "./archive";
import { EdicaoCard, Eyebrow } from "./NewsletterParts";
import styles from "./newsletter.module.css";

function Pager({ view }: { view: ArchiveView }) {
  const anterior = view.pagina > 1;
  const proxima = view.pagina < view.totalPaginas;
  return (
    <nav className={styles.pager} aria-label="Paginação das prévias">
      {anterior
        ? <Link className={styles.pagerBtn} href={archiveHref(view.filtro, view.pagina - 1)} prefetch={false} rel="prev">Anterior</Link>
        : <span className={styles.pagerBtn} aria-disabled="true">Anterior</span>}
      <span>Página {view.pagina} de {view.totalPaginas}</span>
      {proxima
        ? <Link className={styles.pagerBtn} href={archiveHref(view.filtro, view.pagina + 1)} prefetch={false} rel="next">Próxima</Link>
        : <span className={styles.pagerBtn} aria-disabled="true">Próxima</span>}
    </nav>
  );
}

export function ArchivePage({ view }: { view: ArchiveView }) {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.compactHero}`} aria-labelledby="titulo">
        <div className={styles.inner}>
          <Eyebrow>Newsletter</Eyebrow>
          <h1 id="titulo" className={styles.h1}>Prévias das edições.</h1>
          <p className={styles.lead}>Conheça os temas da curadoria da Root Trust. Escolha uma prévia e solicite aquela edição completa por e-mail.</p>
          <p className={styles.aux}><Link className={styles.ghostLink} href="/newsletter" prefetch={false}>Conhecer a newsletter</Link></p>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-label="Prévias">
        <div className={styles.inner}>
          <nav aria-label="Filtrar por pilar">
            <ul className={styles.filters}>
              {FILTROS.map((f) => (
                <li key={f.key}>
                  <Link href={archiveHref(f.key)} prefetch={false} aria-current={f.key === view.filtro ? "page" : undefined}>{f.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {view.destaque ? (
            <section aria-labelledby="destaque" className={styles.empty}>
              <h2 id="destaque" className={styles.eyebrow}>Edição mais recente</h2>
              <EdicaoCard edicao={view.destaque} />
            </section>
          ) : view.filtro === "todos" ? (
            <p className={styles.empty}>Ainda não há edições publicadas. Volte para conhecer as próximas prévias.</p>
          ) : (
            <div className={styles.empty}>
              <p>Nenhuma edição neste pilar por enquanto.</p>
              <Link className={styles.readLink} href={archiveHref("todos")} prefetch={false}>Ver todos os pilares</Link>
            </div>
          )}

          {view.total > 0 ? (
            <section aria-labelledby="lista" className={styles.empty}>
              <h2 id="lista" className={styles.eyebrow}>Todas as prévias</h2>
              <ol className={styles.list}>
                {view.itens.map((edicao) => <li key={edicao.id}><EdicaoCard edicao={edicao} /></li>)}
              </ol>
              <Pager view={view} />
            </section>
          ) : null}
        </div>
      </section>
      <div data-frame-cut="1" />
    </main>
  );
}
