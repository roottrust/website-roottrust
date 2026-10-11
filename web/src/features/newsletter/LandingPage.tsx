import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { SymbolAscii } from "@/features/graphics/SymbolAscii";
import type { FormMode } from "@/lib/forms";
import { latestEdicao } from "./catalog";
import { Arrow, EdicaoCard, Eyebrow } from "./NewsletterParts";
import styles from "./newsletter.module.css";

const BENEFICIOS = [
  "Assuntos conectados à sua base tecnológica.",
  "Análise com implicações práticas e fontes.",
  "Edição completa na sua caixa de entrada.",
] as const;

const ETAPAS = [
  { etapa: "Seleção", texto: "Assuntos relevantes aos três serviços." },
  { etapa: "Análise", texto: "O impacto para operações críticas." },
  { etapa: "Revisão", texto: "Texto, fontes e afirmações, antes de publicar cada edição." },
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
            <div className={styles.heroText}>
              <Eyebrow>Newsletter</Eyebrow>
              <h1 id="titulo" className={styles.h1}>Análise da Root Trust <span className={styles.accent}>em dias úteis.</span></h1>
              <p className={styles.lead}>Cibersegurança, infraestrutura em nuvem e software para decisões sobre operações críticas. Um tema central por edição, análise própria, implicações práticas e links para as fontes.</p>
              <div className={styles.formBox}>
                <NewsletterForm
                  mode={mode}
                  variant="inline"
                  cta="Receber edições completas"
                  support="Confirme seu endereço para receber a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios."
                />
              </div>
            </div>
            <div role="img" aria-label="Símbolo roottrust" className={styles.symbolHost}>
              <div className={styles.symbol}><SymbolAscii /></div>
            </div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="amostra">
        <div className={styles.inner}>
          <div className={styles.split}>
            <div className={styles.intro}>
              <Eyebrow>Edição recente</Eyebrow>
              <h2 id="amostra" className={styles.title}>Conheça uma edição.</h2>
              <p className={styles.body}>Conheça o assunto pela abertura de cada edição. Receba o conteúdo completo por e-mail, após confirmar seu endereço, e os próximos envios em dias úteis.</p>
            </div>
            {recente ? <EdicaoCard edicao={recente} /> : <p className={styles.panel}>Ainda não há edições publicadas.</p>}
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="beneficios">
        <div className={styles.inner}>
          <h2 id="beneficios" className={styles.title}>Conteúdo para decisões sobre <span className={styles.accent}>a sua operação.</span></h2>
          <ul className={styles.cols}>
            {BENEFICIOS.map((texto, index) => (
              <li key={texto} className={styles.benefit}>
                <span aria-hidden="true" className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="curadoria">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <Eyebrow>Curadoria Root Trust</Eyebrow>
            <h2 id="curadoria" className={styles.title}>Como a curadoria <span className={styles.accent}>é preparada.</span></h2>
            <p className={styles.body}>A Root Trust seleciona assuntos relevantes aos três serviços, analisa o impacto para operações críticas e revisa texto, fontes e afirmações antes de publicar cada edição.</p>
          </div>
          <ol className={styles.cols}>
            {ETAPAS.map((item, index) => (
              <li key={item.etapa} className={styles.step}>
                <div aria-hidden="true" className={styles.stepRule}><span>√</span><span /></div>
                <h3 className={styles.stepTitle}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.etapa}</h3>
                <p>{item.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="faq">
        <div className={styles.inner}>
          <div className={styles.split}>
            <div className={styles.intro}>
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="faq" className={styles.title}>Perguntas <span className={styles.accent}>frequentes.</span></h2>
            </div>
            <div className={styles.faq}>
              {FAQ.map(([pergunta, resposta]) => (
                <details key={pergunta}>
                  <summary>{pergunta}</summary>
                  <p>{resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.closing}`} aria-labelledby="arquivo">
        <div className={styles.inner}>
          <div className={styles.panel}>
            <div>
              <h2 id="arquivo" className={styles.panelTitle}>Veja outras edições</h2>
              <p className={styles.panelText}>Conheça os temas anteriores da curadoria.</p>
            </div>
            <Link className={styles.outlineBtn} href="/newsletter/edicoes" prefetch={false}>Ver prévias anteriores<Arrow /></Link>
          </div>
        </div>
      </section>
      <div data-frame-cut="1" />
    </main>
  );
}
