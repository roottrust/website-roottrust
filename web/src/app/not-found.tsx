import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundArt } from "./not-found-art";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: { absolute: "Página não encontrada — Root Trust" },
  description: "O endereço solicitado não foi encontrado.",
};

export default function NotFound() {
  return (
    <main id="conteudo" className={styles.root}>
      <section className={styles.wrap} aria-labelledby="titulo">
        <div className={styles.inner}>
          <div className={styles.eyebrowRow}><span className={styles.eyebrow}>Erro 404</span><span className={styles.rule} aria-hidden="true" /></div>
          <h1 id="titulo" className={styles.h1}>Página <span className={styles.accent}>não encontrada.</span></h1>
          <p className={styles.lead}>O endereço pode estar incorreto ou a página pode não estar disponível.</p>
          <p className={styles.actions}>
            <Link className="button" href="/" prefetch={false}>Voltar à Home</Link>
            <Link className={styles.ghost} href="/#servicos" prefetch={false}>Conhecer os serviços</Link>
            <Link className={styles.ghost} href="/#contato" prefetch={false}>Solicitar diagnóstico</Link>
          </p>
          <NotFoundArt />
        </div>
      </section>
    </main>
  );
}
