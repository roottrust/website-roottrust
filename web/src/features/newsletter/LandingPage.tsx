import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { SymbolAscii } from "@/features/graphics/SymbolAscii";
import type { FormMode } from "@/lib/forms";
import { latestEdicao } from "./catalog";
import { EdicaoCard, Eyebrow } from "./NewsletterParts";
import styles from "./newsletter.module.css";

const BENEFICIOS = [
  "Assuntos conectados à sua base tecnológica.",
  "Análise com implicações práticas e fontes.",
  "Edição completa na sua caixa de entrada.",
] as const;

const ETAPAS = [
  { etapa: "Seleção", texto: "A Root Trust seleciona assuntos relevantes aos três serviços." },
  { etapa: "Análise", texto: "Analisa o impacto para operações críticas." },
  { etapa: "Revisão", texto: "Revisa texto, fontes e afirmações antes de publicar cada edição." },
] as const;

const FAQ = [
  ["Com que frequência recebo?", "Em dias úteis."],
  ["Posso ler tudo no site?", "O site apresenta o primeiro parágrafo de cada edição. O conteúdo completo é enviado por e-mail após confirmação do endereço."],
  ["O que recebo ao me inscrever por esta página?", "A edição aprovada mais recente, quando disponível, e os próximos envios."],
  ["Posso pedir uma edição anterior?", "Sim. Abra a prévia desejada e solicite aquela edição pelo formulário. Quem já assina também pode usar esse caminho."],
  ["Como cancelo?", "Pelo caminho de cancelamento indicado nos e-mails."],
] as const;

export function LandingPage({ mode }: { mode: FormMode }) {
  const recente = latestEdicao();
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
        <div className={styles.inner}>
          <div className={styles.heroGrid}>
            <div>
              <Eyebrow>Newsletter</Eyebrow>
              <h1 id="titulo" className={styles.h1}>Análise da Root Trust em dias úteis.</h1>
              <p className={styles.lead}>Cibersegurança, infraestrutura em nuvem e software para decisões sobre operações críticas. Um tema central por edição, análise própria, implicações práticas e links para as fontes.</p>
              <div className={styles.formBox}>
                <NewsletterForm
                  mode={mode}
                  cta="Receber edições completas"
                  support="Confirme seu endereço para receber a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios."
                />
              </div>
              <p className={styles.aux}><Link className={styles.ghostLink} href="/newsletter/edicoes" prefetch={false}>Ver prévias anteriores</Link></p>
            </div>
            <div role="img" aria-label="Símbolo roottrust" className={styles.symbolHost}>
              <div className={styles.symbol}><SymbolAscii /></div>
            </div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="amostra">
        <div className={styles.inner}>
          <Eyebrow>Prévia</Eyebrow>
          <h2 id="amostra" className={styles.title}>Conheça uma edição.</h2>
          {recente ? <EdicaoCard edicao={recente} /> : <p className={styles.empty}>Ainda não há edições publicadas.</p>}
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="beneficios">
        <div className={styles.inner}>
          <Eyebrow>Benefícios</Eyebrow>
          <h2 id="beneficios" className={styles.title}>Conteúdo para decisões sobre a sua operação.</h2>
          <ul className={styles.cols}>
            {BENEFICIOS.map((texto) => <li key={texto} className={styles.col}><p>{texto}</p></li>)}
          </ul>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="curadoria">
        <div className={styles.inner}>
          <Eyebrow>Curadoria Root Trust</Eyebrow>
          <h2 id="curadoria" className={styles.title}>Como a curadoria é preparada.</h2>
          <ol className={styles.cols}>
            {ETAPAS.map((item) => (
              <li key={item.etapa} className={styles.col}>
                <span className={styles.stage}>{item.etapa}</span>
                <p>{item.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="faq">
        <div className={styles.inner}>
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 id="faq" className={styles.title}>Antes de assinar.</h2>
          <div className={styles.faq}>
            {FAQ.map(([pergunta, resposta]) => (
              <details key={pergunta}>
                <summary>{pergunta}</summary>
                <p>{resposta}</p>
              </details>
            ))}
          </div>
          <p className={styles.aux}><Link className={styles.readLink} href="/newsletter/edicoes" prefetch={false}>Ver todas as prévias</Link></p>
        </div>
      </section>
      <div data-frame-cut="1" />
    </main>
  );
}
