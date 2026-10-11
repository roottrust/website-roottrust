import Link from "next/link";
import type { ReactNode } from "react";
import { ReportForm } from "@/components/forms/ReportForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { PillarArt } from "@/features/graphics/PillarArt";
import svc from "@/features/services/services.module.css";
import type { FormMode } from "@/lib/forms";
import type { ToolContent } from "./content";
import { MethodSlot } from "./method-slot";
import { ToolSession } from "./ToolSession";
import styles from "./tools.module.css";

function Eyebrow({ children }: { children: string }) {
  return (
    <div className={svc.eyebrowRow}>
      <span className={svc.eyebrow}>{children}</span>
      <span className={svc.eyebrowRule} />
    </div>
  );
}

function Method({ tool }: { tool: ToolContent }) {
  return (
    <details id="metodo" className={styles.methodBox}>
      <summary>Como chegamos a este resultado</summary>
      <div className={styles.methodBody}>
        <ul className={styles.formulas}>{tool.formulas.map((item) => <li key={item}><span aria-hidden="true">√</span><span>{item}</span></li>)}</ul>
        <div>
          <p><strong>Hipóteses visíveis.</strong></p>
          <ul>{tool.hypotheses.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p><strong>Limites.</strong></p>
          <ul>{tool.limits.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p><strong>Fontes de conceito.</strong></p>
          <ul>{tool.sources.map((s) => <li key={s.href}><a href={s.href} rel="noreferrer noopener" target="_blank">{s.label}</a></li>)}</ul>
          <p className={styles.help}>As fontes sustentam conceitos. Os modelos desta página são escolhas da Root Trust, não modelos certificados por essas instituições.</p>
        </div>
      </div>
    </details>
  );
}

export function ToolPage({ tool, mode, children }: { tool: ToolContent; mode: FormMode; children: ReactNode }) {
  return (
    <main id="conteudo" data-graphics-root className={svc.root}>
      <FrameCanvas />
      <section className={`${svc.wrap} ${styles.hero}`} aria-labelledby="titulo">
        <div className={svc.inner}>
          <nav aria-label="Trilha de navegação">
            <ol className={svc.crumbs}>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/#ferramentas">Ferramentas</Link></li>
              <li aria-current="page">{tool.label}</li>
            </ol>
          </nav>
          <div className={styles.heroRow}>
            <div className={styles.heroText}>
              <Eyebrow>{`Ferramenta · ${tool.label}`}</Eyebrow>
              <h1 id="titulo" className={styles.h1}>{tool.h1[0]} <span className={svc.accent}>{tool.h1[1]}</span></h1>
              <p className={svc.lead}>{tool.lead}</p>
              <p className={styles.badge}>
                <span aria-hidden="true" />
                {mode === "demo"
                  ? "Protótipo — cálculos locais; o pedido de relatório é uma demonstração local e nenhum dado é enviado."
                  : "Protótipo — cálculos locais; envio do pedido de relatório indisponível."}
              </p>
            </div>
            <div className={styles.art}><PillarArt kind={tool.kind} /></div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${svc.wrap} ${styles.section}`} aria-labelledby="ferramenta">
        <div className={svc.inner}>
          <h2 id="ferramenta" className={styles.sr}>Preencha e veja o resultado ao lado</h2>
          <MethodSlot method={<Method tool={tool} />}>
            <ToolSession>{children}</ToolSession>
          </MethodSlot>
        </div>
      </section>

      <section data-frame-cut="1" className={`${svc.wrap} ${styles.reportSection}`} aria-labelledby="relatorio">
        <div className={`${svc.inner} ${styles.reportCard}`}>
          <h2 id="relatorio" className={styles.reportTitle}>Receba o relatório de {tool.reportTopic}</h2>
          <p className={styles.reportText}>Material padrão sobre o tema, conceitos e próximos passos gerais. Não é personalizado a partir das suas respostas.</p>
          <ToolSession><ReportForm mode={mode} toolId={tool.id} topic={tool.reportTopic} variant="inline" /></ToolSession>
        </div>
      </section>

      <div data-band="cta" className={svc.band}>
        <section className={`${svc.wrap} ${styles.cta}`} aria-labelledby="diagnostico">
          <div className={`${svc.inner} ${styles.ctaStack}`}>
            <Eyebrow>Próximo passo</Eyebrow>
            <h2 id="diagnostico" className={svc.ctaTitle}>Quer conversar <span className={svc.accentBlock}>sobre o seu cenário?</span></h2>
            <p className={svc.contactText}>Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.</p>
            <Link className={svc.cta} href="/#contato">
              Solicitar diagnóstico
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </section>
      </div>
      <div data-frame-cut="1" />
    </main>
  );
}
