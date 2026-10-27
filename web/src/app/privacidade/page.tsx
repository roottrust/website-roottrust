import type { Metadata } from "next";
import Link from "next/link";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: { absolute: "Privacidade — Root Trust" },
  description: "Informações provisórias sobre o uso de dados no piloto do website.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function Page() {
  const pilot = process.env.BACKEND_MODE === "pilot" && process.env.FORM_MODE !== "demo";
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.eyebrowRow}><span className={styles.eyebrow}>Privacidade</span><span className={styles.rule} aria-hidden="true" /></div>
          <h1 className={styles.h1}>Privacidade e uso de dados.</h1>
          <p className={styles.lead}>Como os dados são tratados nesta versão de avaliação.</p>
          <p className={styles.status} role="note"><strong>Informações provisórias para o piloto restrito.</strong> A política de privacidade completa ainda exige revisão antes de publicação aberta.</p>

          <section aria-labelledby="versao" className={styles.block}>
            <h2 id="versao">O que esta versão faz</h2>
            <ul>
              <li>Esta versão é destinada a avaliação interna e piloto restrito.</li>
              {pilot ? <>
                <li>Quando habilitado, o diagnóstico envia Nome, Empresa e WhatsApp à Root Trust para retorno, registra o pedido em banco e notifica um canal privado da equipe.</li>
                <li>Quando habilitada, a newsletter usa seu e-mail para confirmação, envio da edição escolhida e próximas edições aprovadas. O cancelamento interrompe próximos envios; não altera uma autorização comercial separada.</li>
                <li>Quando habilitado, o pedido de relatório envia somente e-mail, ID da ferramenta e, se marcado, consentimento comercial. O PDF padrão é enviado por e-mail; respostas e resultados da ferramenta não acompanham o pedido.</li>
                <li>Os dados operacionais são mantidos no Firestore; Resend processa e-mails e Discord recebe os avisos privados de diagnóstico e revisão editorial. Leads sem interação e registros locais de newsletter cancelada são apagados após seis meses. O prazo de exclusão de dados nos serviços externos ainda precisa ser definido antes da publicação aberta.</li>
              </> : <>
                <li>Os formulários estão indisponíveis ou em demonstração local; pedidos demonstrativos não enviam nem guardam dados.</li>
                <li>A interface de demonstração não confirma inscrição, entrega ou recebimento real.</li>
              </>}
              <li>O website não usa analytics nesta fase.</li>
            </ul>
          </section>

          <section aria-labelledby="ferramentas" className={styles.block}>
            <h2 id="ferramentas">Ferramentas de cálculo</h2>
            <p>As respostas e os resultados das ferramentas ficam apenas na memória do navegador e são descartados quando você sai da página ou volta a ela. Não são gravados em armazenamento do navegador, no endereço da página, em logs, em relatórios nem associados a um e-mail.</p>
          </section>

          <section aria-labelledby="futuro" className={styles.block}>
            <h2 id="futuro">O que ainda não está definido</h2>
            <p>Antes da publicação aberta, esta página precisa de revisão jurídica e operacional: identificação do responsável, bases legais, direitos e canal específico de atendimento, retenção de backups e mensagens em sistemas terceiros, e uso de cookies, se houver.</p>
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
