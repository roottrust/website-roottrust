import type { Metadata } from "next";
import Link from "next/link";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { contactAvailability } from "@/app/api/diagnostico/availability";
import { newsletterAvailability } from "@/app/api/newsletter/inscricao/availability";
import { reportAvailability } from "@/app/api/relatorios/availability";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: { absolute: "Privacidade — Root Trust" },
  description: "Como a Root Trust trata os dados enviados pelos formulários e usados no website.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function Page() {
  const pilot = [contactAvailability(), newsletterAvailability(), reportAvailability()].some(config => config.mode === "pilot");
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.eyebrowRow}><span className={styles.eyebrow}>Privacidade</span><span className={styles.rule} aria-hidden="true" /></div>
          <h1 className={styles.h1}>Privacidade e uso de dados.</h1>
          <p className={styles.lead}>Quais dados coletamos, para quê, por quanto tempo e como falar com a gente.</p>
          <p className={styles.status} role="note"><strong>Informações provisórias para o piloto restrito.</strong> A política de privacidade completa ainda exige revisão antes de publicação aberta.</p>

          <section aria-labelledby="versao" className={styles.block}>
            <h2 id="versao">O que esta versão faz</h2>
            <ul>
              <li>Esta versão é destinada a avaliação interna e piloto restrito.</li>
              {pilot ? <>
                <li>Os formulários habilitados só funcionam para identidades previamente autorizadas no piloto e passam por verificação anti-abuso.</li>
              </> : <>
                <li>Os formulários estão indisponíveis ou em demonstração local; pedidos demonstrativos não enviam nem guardam dados.</li>
                <li>A interface de demonstração não confirma inscrição, entrega ou recebimento real.</li>
              </>}
              <li>O website não usa analytics nesta fase.</li>
            </ul>
          </section>

            <section aria-labelledby="dados" className={styles.block}>
              <h2 id="dados">Dados e finalidades</h2>
              <p>Quando os formulários estão habilitados, usamos os dados para estas finalidades:</p>
              <ul>
                <li><strong>Diagnóstico:</strong> Nome, Empresa e WhatsApp, usados para retorno por ligação ou WhatsApp. O pedido é registrado em banco de dados e avisado a um canal privado da equipe.</li>
                <li><strong>Newsletter:</strong> e-mail, usado para confirmar a inscrição, enviar a edição escolhida e as próximas edições publicadas. O cancelamento interrompe os próximos envios da newsletter e não retira uma autorização comercial separada.</li>
                <li><strong>Pedido de relatório:</strong> e-mail e a ferramenta escolhida, usados para enviar o PDF por e-mail. As respostas e os resultados da ferramenta não acompanham o pedido.</li>
                <li><strong>Contato comercial:</strong> a caixa opcional do pedido de relatório é um consentimento separado e não inscreve você na newsletter. A newsletter também é independente do relatório.</li>
              </ul>
            </section>

            <section aria-labelledby="servicos" className={styles.block}>
              <h2 id="servicos">Serviços que processam os dados</h2>
              <p>Nos envios operacionais habilitados, usamos estes serviços:</p>
              <ul>
                <li>Cloudflare Turnstile ajuda a verificar a segurança dos envios.</li>
                <li>Firestore guarda os dados operacionais.</li>
                <li>Resend envia os e-mails.</li>
                <li>Discord recebe os avisos privados de diagnóstico e de revisão editorial.</li>
                <li>A hospedagem do website recebe as requisições dos formulários.</li>
              </ul>
              <p>Para proteger os envios e limitar tentativas, usamos dados técnicos da conexão, como o endereço IP. O IP também é encaminhado à Cloudflare na verificação de segurança.</p>
              <p>Esta versão provisória não detalha países de processamento nem transferências internacionais.</p>
            </section>

            <section aria-labelledby="retencao" className={styles.block}>
              <h2 id="retencao">Por quanto tempo guardamos</h2>
              <p>Estes prazos se referem aos registros dos envios operacionais; pedidos demonstrativos não criam esses registros.</p>
              <p>Contatos sem interação há seis meses entram na rotina de exclusão, junto com os registros associados, como eventos, diagnósticos, entregas de relatórios e tarefas. Outra rotina trata assinaturas locais canceladas após seis meses do cancelamento. A limpeza ocorre em lotes e depende da execução da manutenção; falhas podem deixar pendências para as próximas execuções. Esse prazo não se aplica a assinaturas confirmadas ainda ativas.</p>
              <p>A limpeza do banco não apaga automaticamente mensagens no Discord, contatos nos provedores, CSVs ou cópias de segurança. Essas cópias externas têm descarte próprio, sob responsabilidade operacional de Renato, e ainda não há prazo universal definido para elas.</p>
            </section>

          <section aria-labelledby="ferramentas" className={styles.block}>
            <h2 id="ferramentas">Ferramentas de cálculo</h2>
            <p>As respostas e os resultados das ferramentas ficam apenas na memória do navegador e são descartados quando você sai da página ou volta a ela. Não são gravados em armazenamento do navegador, no endereço da página, em logs, em relatórios nem associados a um e-mail.</p>
          </section>

          <section aria-labelledby="aparencia" className={styles.block}>
            <h2 id="aparencia">Preferência de aparência</h2>
            <p>O seletor “Tema” oferece Sistema, Claro e Escuro. Ao fazer uma escolha, a preferência fica no armazenamento local do navegador, se ele permitir. Ela serve só para lembrar a aparência e não é enviada a nenhum servidor nem associada a formulários.</p>
          </section>

          <section aria-labelledby="contato" className={styles.block}>
            <h2 id="contato">Contato e seus direitos</h2>
            <p>Renato é o responsável operacional por estes dados no piloto. Para pedir acesso, correção, exclusão, retirada do consentimento comercial ou tirar dúvidas, escreva para <a href="mailto:contato@roottrust.com.br">contato@roottrust.com.br</a>. Podemos pedir confirmação de identidade para proteger seus dados. Para falar sobre serviços, use o mesmo e-mail ou <a href="tel:+5511940084692">11 94008-4692</a>. Não há prazo de resposta formalmente definido nesta versão provisória.</p>
          </section>

          <section aria-labelledby="futuro" className={styles.block}>
            <h2 id="futuro">O que ainda não está definido</h2>
            <p>Antes da publicação aberta, esta página precisa de revisão jurídica e operacional. Ainda não constam aqui a razão social, o endereço, as bases legais, os prazos de atendimento, os países de processamento e a política de cópias externas.</p>
          </section>

          <p className={styles.back}><Link className="button" href="/" prefetch={false}>Voltar à Home</Link></p>
        </div>
      </div>
    </main>
  );
}
