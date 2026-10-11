import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { FrameCanvas } from "@/features/graphics/FrameCanvas";
import { PillarArt } from "@/features/graphics/PillarArt";
import { SymbolAscii } from "@/features/graphics/SymbolAscii";
import type { FormMode } from "@/lib/forms";
import { stageNote, stages, type ServiceContent } from "./content";
import styles from "./services.module.css";

function Eyebrow({ children }: { children: string }) {
  return (
    <div className={styles.eyebrowRow}>
      <span className={styles.eyebrow}>{children}</span>
      <span className={styles.eyebrowRule} />
    </div>
  );
}

function Title({ lines, id, as: Tag = "h2" }: { lines: readonly [string, string]; id?: string; as?: "h1" | "h2" }) {
  return (
    <Tag id={id} className={Tag === "h1" ? styles.h1 : styles.title}>
      {lines[0]} <span className={styles.accent}>{lines[1]}</span>
    </Tag>
  );
}

export function ServicePage({ service, mode }: { service: ServiceContent; mode: FormMode }) {
  const { detail } = service;
  return (
    <main id="conteudo" data-graphics-root className={styles.root}>
      <FrameCanvas />
      <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
        <div className={styles.inner}>
          <nav aria-label="Trilha de navegação">
            <ol className={styles.crumbs}>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/#servicos">Serviços</Link></li>
              <li aria-current="page">{service.label}</li>
            </ol>
          </nav>
          <div className={styles.heroGrid}>
            <div>
              <Eyebrow>{service.label}</Eyebrow>
              <Title lines={service.h1} id="titulo" as="h1" />
              <p className={styles.lead}>{service.intro}</p>
              <div className={styles.actions}>
                <a className={styles.cta} href="#contato">Solicitar diagnóstico</a>
              </div>
            </div>
            <div className={styles.art}>
              <PillarArt kind={service.kind} />
            </div>
          </div>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="situacoes">
        <div className={styles.inner}>
          <Eyebrow>Quando faz sentido</Eyebrow>
          <Title lines={service.situationsTitle} id="situacoes" />
          <ul className={styles.cards}>
            {service.situations.map((item) => (
              <li key={item.title} className={styles.card}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="frentes">
        <div className={styles.inner}>
          <Eyebrow>Frentes de atuação</Eyebrow>
          <Title lines={service.frentesTitle} id="frentes" />
          <ul className={styles.cards}>
            {service.frentes.map((frente) => (
              <li key={frente.title} className={styles.card}>
                {frente.badge ? <span className={styles.badge}>{frente.badge}</span> : null}
                <h3>{frente.title}</h3>
                <p>{frente.text}</p>
                {frente.lines ? (
                  <ul className={styles.list}>
                    {frente.lines.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                ) : null}
                {frente.deliveries ? (
                  <ul className={styles.list} aria-label={`Entregas de ${frente.title}`}>
                    {frente.deliveries.map((delivery) => <li key={delivery}>{delivery}</li>)}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {service.concepts ? (
            <>
              <dl className={styles.concepts}>
                {service.concepts.map((concept) => (
                  <div key={concept.term}>
                    <dt>{concept.term}</dt>
                    <dd>{concept.text}</dd>
                  </div>
                ))}
              </dl>
              {service.conceptsNote ? <p className={styles.note}>{service.conceptsNote}</p> : null}
            </>
          ) : null}
          {service.frentesNote ? <p className={styles.note}>{service.frentesNote}</p> : null}

          {detail ? (
            <div id={detail.id} className={styles.panel}>
              <span className={styles.badge}>{detail.label}</span>
              <h3>{detail.title}</h3>
              <p>{detail.text}</p>
              <h4>{detail.listLabel}</h4>
              <ul>{detail.items.map((item) => <li key={item}>{item}</li>)}</ul>
              {detail.complements ? (
                <>
                  <h4>{detail.complementLabel}</h4>
                  <ul>
                    {detail.complements.map((item) => (
                      <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {detail.notes.map((note) => (
                <p key={note.text} className={note.muted ? styles.muted : undefined}>{note.text}</p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="metodo">
        <div className={styles.inner}>
          <Eyebrow>Como trabalhamos</Eyebrow>
          <Title lines={service.methodTitle} id="metodo" />
          <ol className={styles.steps}>
            {service.steps.map((step, index) => (
              <li key={step} className={styles.step}>
                <span className={styles.stage}>{stages[index]}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{stageNote}</p>
          <p className={styles.closing}>{service.closing}</p>
        </div>
      </section>

      <section data-frame-cut="1" className={`${styles.wrap} ${styles.section}`} aria-labelledby="faq">
        <div className={styles.inner}>
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 id="faq" className={styles.title}>Antes de conversar.</h2>
          <div className={styles.faq}>
            {service.faq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div data-band="cta" className={styles.band}>
        <section id="contato" className={`${styles.wrap} ${styles.contactSection}`} aria-labelledby="contato-titulo">
          <div className={styles.inner}>
            <Eyebrow>Próximo passo</Eyebrow>
            <div className={styles.contactColumns}>
              <div>
                <Title lines={service.ctaTitle} id="contato-titulo" />
                <p className={styles.contactText}>{service.ctaText}</p>
                <ContactForm mode={mode} variant="home" />
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
