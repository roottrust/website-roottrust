import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { PillarArt } from "@/features/graphics/PillarArt";
import { SymbolAscii } from "@/features/graphics/SymbolAscii";
import { contactAvailability } from "@/app/api/diagnostico/availability";
import type { ServiceContent } from "./content";
import styles from "./services.module.css";

function Eyebrow({ children, accentRule = false }: { children: string; accentRule?: boolean }) {
  return (
    <div className={styles.eyebrowRow}>
      <span className={styles.eyebrow}>{children}</span>
      <span aria-hidden="true" className={accentRule ? styles.eyebrowRuleAccent : styles.eyebrowRule} />
    </div>
  );
}

function Title({ lines, id, variant = "h2" }: { lines: readonly [string, string]; id: string; variant?: "h1" | "h2" | "h2Narrow" | "cta" }) {
  const Tag = variant === "h1" ? "h1" : "h2";
  const cls = variant === "cta" ? styles.ctaTitle : variant === "h2Narrow" ? `${styles.h2} ${styles.h2Narrow}` : styles[variant];
  const accent = variant === "cta" ? styles.accentBlock : styles.accent;
  return (
    <Tag id={id} className={cls}>
      {lines[0]} <span className={accent}>{lines[1]}</span>
    </Tag>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <p className={styles.pill}>
      <span aria-hidden="true" className={styles.pillDot} />
      {children}
    </p>
  );
}

function Check() {
  return <span aria-hidden="true" className={styles.check}>√</span>;
}

export function ServicePage({ service }: { service: ServiceContent }) {
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
        <div className={`${styles.inner} ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <nav aria-label="Trilha de navegação" className={styles.crumbs}>
              <Link href="/">Home</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{service.label}</span>
            </nav>
            <Eyebrow>{service.label}</Eyebrow>
            <Title lines={service.h1} id="titulo" variant="h1" />
            <p className={styles.lead}>{service.intro}</p>
            <div className={styles.actions}>
              <a className={styles.cta} href="#contato">
                Solicitar diagnóstico
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </a>
              <span className={styles.actionNote}>Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.</span>
            </div>
          </div>
          <div className={styles.art}>
            <PillarArt kind={service.kind} />
          </div>
        </div>
      </section>

      <section id="situacoes" data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="situacoes-titulo">
        <div className={styles.inner}>
          <div className={styles.stack48}>
            <Eyebrow>Quando ajuda</Eyebrow>
            <Title lines={service.situationsTitle} id="situacoes-titulo" variant="h2Narrow" />
            <ol className={styles.situations}>
              {service.situations.map((item, index) => (
                <li key={item.title}>
                  <span aria-hidden="true" className={styles.situationNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="frentes" data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="frentes-titulo">
        <div className={styles.inner}>
          <div className={styles.stack40}>
            <Eyebrow>Frentes de atuação</Eyebrow>
            <Title lines={service.frentesTitle} id="frentes-titulo" />
            <ul className={styles.frentes}>
              {service.frentes.map((frente, index) => (
                <li key={frente.title} className={styles.frente}>
                  <div className={styles.frenteTop}>
                    <span aria-hidden="true" className={styles.frenteNumber}>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{frente.title}</h3>
                  <p>{frente.text}</p>
                  {frente.lines ? (
                    <ul className={styles.lines}>
                      {frente.lines.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  ) : null}
                  {frente.deliveries ? (
                    <div className={styles.deliveries}>
                      <span className={styles.label}>Exemplo de entrega</span>
                      <ul>
                        {frente.deliveries.map((delivery) => <li key={delivery}><Check />{delivery}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {frente.detail ? (
                    <details id={frente.detail.id} className={styles.detail}>
                      <summary>
                        {frente.detail.summary}
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                      </summary>
                      <div className={styles.detailBody}>
                        <h4>{frente.detail.title}</h4>
                        <p>{frente.detail.text}</p>
                        <div className={styles.detailBlock}>
                          <h5 className={styles.label}>{frente.detail.listLabel}</h5>
                          <ol className={styles.detailList}>
                            {frente.detail.items.map((item, itemIndex) => (
                              <li key={item}>
                                <span aria-hidden="true" className={styles.detailNumber}>{String(itemIndex + 1).padStart(2, "0")}</span>
                                {item}
                              </li>
                            ))}
                          </ol>
                        </div>
                        {frente.detail.complements ? (
                          <div className={styles.detailBlock}>
                            <h5 className={styles.label}>{frente.detail.complementLabel}</h5>
                            <ul className={styles.complements}>
                              {frente.detail.complements.map((item) => (
                                <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className={styles.detailNotes}>
                          {frente.detail.notes.map((note) => (
                            <p key={note.text} className={note.muted ? styles.muted : undefined}>{note.text}</p>
                          ))}
                        </div>
                      </div>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {service.concepts ? (
            <div className={styles.concepts}>
              {service.concepts.map((concept) => (
                <dl key={concept.term}>
                  <dt>{concept.term}</dt>
                  <dd>{concept.text}</dd>
                </dl>
              ))}
              {service.conceptsNote ? <p className={styles.conceptsNote}>{service.conceptsNote}</p> : null}
            </div>
          ) : null}
          {service.frentesNote ? <div className={styles.noteRow}><Pill>{service.frentesNote}</Pill></div> : null}
        </div>
      </section>

      <section id="como" data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="metodo">
        <div className={styles.inner}>
          <div className={styles.stack48}>
            <Eyebrow>Como trabalhamos</Eyebrow>
            <Title lines={service.methodTitle} id="metodo" />
            <ol className={styles.steps}>
              {service.steps.map((step, index) => (
                <li key={step.title}>
                  <div aria-hidden="true" className={styles.stepRule}>
                    <span>√</span>
                    <span />
                  </div>
                  <h3>
                    <span aria-hidden="true" className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                    {step.title}
                  </h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <div className={styles.closingBlock}>
              <p className={styles.closing}>{service.closing}</p>
              <Pill>{service.stageNote}</Pill>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="faq-titulo">
        <div className={styles.inner}>
          <div className={styles.faqGrid}>
            <div className={styles.faqHead}>
              <Eyebrow>FAQ</Eyebrow>
              <Title lines={["Perguntas", "frequentes."]} id="faq-titulo" />
            </div>
            <div className={styles.faq}>
              {service.faq.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div data-band="cta" className={styles.band}>
        <section id="contato" className={`${styles.wrap} ${styles.contactSection}`} aria-labelledby="contato-titulo">
          <div className={`${styles.inner} ${styles.contactStack}`}>
            <Eyebrow accentRule>Solicitar diagnóstico</Eyebrow>
            <div className={styles.contactColumns}>
              <div className={styles.contactMain}>
                <Title lines={service.ctaTitle} id="contato-titulo" variant="cta" />
                <p className={styles.contactText}>{service.ctaText}</p>
                <ContactForm config={contactAvailability()} variant="home" />
              </div>
              <div role="img" aria-label="Símbolo roottrust" className={styles.symbolHost}>
                <div className={styles.symbol}><SymbolAscii /></div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div data-frame-cut="1" />
    </main>
  );
}
