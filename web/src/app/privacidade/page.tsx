import type { Metadata } from "next";
import Link from "next/link";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: { absolute: "Privacidade — Root Trust" },
  description: "Informações sobre o uso de dados nas jornadas do website, disponíveis após revisão da política.",
};

export default function Page() {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.eyebrowRow}><span className={styles.eyebrow}>Privacidade</span><span className={styles.rule} aria-hidden="true" /></div>
          <h1 className={styles.h1}>Privacidade e uso de dados.</h1>
          <p className={styles.lead}>Este espaço apresentará como a Root Trust trata os dados nas jornadas do website.</p>
          <p className={styles.status} role="note"><strong>Conteúdo de privacidade em preparação para revisão.</strong> Esta página é provisória e descreve apenas o que esta versão do website faz hoje. Não é uma política de privacidade válida para publicação.</p>

          <section aria-labelledby="versao" className={styles.block}>
            <h2 id="versao">O que esta versão faz</h2>
            <ul>
              <li>É uma versão local de avaliação do website, sem operação publicada.</li>
              <li>Os formulários de diagnóstico, newsletter e relatório validam os campos no navegador. Nenhum dado é enviado, recebido, armazenado ou associado a você nesta versão.</li>
              <li>Quando uma demonstração está ativa, o aviso informa que nenhum dado foi enviado. Um pedido aceito na demonstração não confirma inscrição, entrega ou recebimento.</li>
              <li>Este website não usa analytics nem criou endpoint ou banco de dados para receber informações.</li>
            </ul>
          </section>

          <section aria-labelledby="ferramentas" className={styles.block}>
            <h2 id="ferramentas">Ferramentas de cálculo</h2>
            <p>As respostas e os resultados das ferramentas ficam apenas na memória do navegador e são descartados quando você sai da página ou volta a ela. Não são gravados em armazenamento do navegador, no endereço da página, em logs, em relatórios nem associados a um e-mail.</p>
          </section>

          <section aria-labelledby="futuro" className={styles.block}>
            <h2 id="futuro">O que ainda não está definido</h2>
            <p>Antes de uma publicação, esta política precisa ser revisada e completada com informações que ainda não existem nesta versão: identificação do responsável, finalidades e bases aplicáveis, operadores e terceiros, prazos de retenção, direitos e canal de atendimento, e o uso de cookies, se houver. Nenhuma dessas informações foi definida aqui.</p>
          </section>

          <section aria-labelledby="contato" className={styles.block}>
            <h2 id="contato">Contato comercial</h2>
            <p>Para falar sobre serviços, use o canal comercial: <a href="mailto:contato@roottrust.com.br">contato@roottrust.com.br</a> ou <a href="tel:+5511940084692">11 94008-4692</a>. Este é um canal comercial; não foi definido como canal de direitos de titulares.</p>
          </section>

          <p className={styles.back}><Link className="button" href="/" prefetch={false}>Voltar à Home</Link></p>
        </div>
      </div>
    </main>
  );
}
