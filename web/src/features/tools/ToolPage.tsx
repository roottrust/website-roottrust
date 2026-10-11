import Link from "next/link";
import type { ReactNode } from "react";
import { ReportForm } from "@/components/forms/ReportForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { PillarArt } from "@/features/graphics/PillarArt";
import { SymbolAscii } from "@/features/graphics/SymbolAscii";
import svc from "@/features/services/services.module.css";
import type { FormMode } from "@/lib/forms";
import type { ToolContent } from "./content";
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
          <div className={svc.heroGrid}>
            <div>
              <Eyebrow>{`Ferramenta · ${tool.label}`}</Eyebrow>
              <h1 id="titulo" className={svc.h1}>{tool.h1[0]} <span className={svc.accent}>{tool.h1[1]}</span></h1>
              <p className={svc.lead}>{tool.lead}</p>
              <p className={styles.badge}>
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
          <h2 id="ferramenta" className={styles.sectionTitle}>Preencha e veja o resultado abaixo</h2>
          <ToolSession>{children}</ToolSession>
        </div>
      </section>

      <section data-frame-cut="1" className={`${svc.wrap} ${styles.section}`} aria-labelledby="metodo">
        <div className={svc.inner}>
          <h2 id="metodo" className={styles.sectionTitle}>Como chegamos a este resultado</h2>
          <div className={styles.method}>
            <div>
              <h3>Fórmulas e regras</h3>
              <ul>{tool.formulas.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3>Hipóteses</h3>
              <ul>{tool.hypotheses.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3>Limites</h3>
              <ul>{tool.limits.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h3>Fontes</h3>
              <ul>{tool.sources.map((s) => <li key={s.href}><a href={s.href} rel="noreferrer noopener" target="_blank">{s.label}</a></li>)}</ul>
              <p className={styles.help}>As fontes sustentam conceitos. Os modelos desta página são escolhas da Root Trust, não modelos certificados por essas instituições.</p>
            </div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${svc.wrap} ${styles.section}`} aria-labelledby="relatorio">
        <div className={svc.inner}>
          <Eyebrow>Relatório padrão</Eyebrow>
          <h2 id="relatorio" className={styles.sectionTitle}>Receba o relatório de {tool.reportTopic}</h2>
          <p className={svc.note}>Material padrão sobre o tema, conceitos e próximos passos gerais. Não é personalizado a partir das suas respostas.</p>
          <div className={styles.report}>
            <ToolSession><ReportForm mode={mode} toolId={tool.id} topic={tool.reportTopic} /></ToolSession>
          </div>
        </div>
      </section>

      <div data-band="cta" className={svc.band}>
        <section className={`${svc.wrap} ${svc.contactSection}`} aria-labelledby="diagnostico">
          <div className={svc.inner}>
            <Eyebrow>Próximo passo</Eyebrow>
            <div className={svc.contactColumns}>
              <div>
                <h2 id="diagnostico" className={svc.title}>Quer conversar sobre <span className={svc.accent}>o seu cenário?</span></h2>
                <p className={svc.contactText}>Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.</p>
                <div className={svc.actions}><Link className={svc.cta} href="/#contato">Solicitar diagnóstico</Link></div>
              </div>
              <div role="img" aria-label="Símbolo roottrust" className={svc.symbolHost}>
                <div className={svc.symbol}><SymbolAscii /></div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div data-frame-cut="1" />
    </main>
  );
}
