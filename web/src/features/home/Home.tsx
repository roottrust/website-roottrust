import { Fragment } from "react";
import Image from "next/image";
import { HomeCanvas } from "@/features/graphics/HomeCanvas";
import { PillarArt } from "@/features/graphics/PillarArt";
import { ContactForm } from "@/components/forms/ContactForm";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import type { FormMode } from "@/lib/forms";
import { pillars as pilares, tools as ferramentas } from "./content";
import { Services } from "./Services";
import { Process } from "./Process";
import styles from "./home.module.css";

export function Home({ mode }: {mode: FormMode}) { return <main id="conteudo" data-graphics-root className={styles.root}><HomeCanvas /><div className={styles.content}><section data-sec="hero" data-screen-label="Hero" className={(styles.hero)}>
  <div aria-hidden="true" className={(styles.heroSpacer)}></div>

  <div data-hero-copy="1" className={(styles.heroCopy)}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Tecnologia para operações críticas</span>
      <span className={(styles.eyebrowRule)}></span>
    </div>
    <h1 className={(styles.heroTitle)}>Confiabilidade <span className={(styles.accentLine)}>com profundidade.</span></h1>
    <p className={(styles.heroDescription)}>Cibersegurança, infraestrutura em nuvem e software para operações críticas.</p>
    <div className={(styles.heroActions)}>
      <a href="#contato" className={(styles.primaryCta)}>Solicitar diagnóstico<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
    </div>
  </div>
</section><section data-sec="pilares" data-screen-label="Princípios" className={(styles.principles)}>
  <div className={(styles.inner)}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Nossos princípios</span>
      <span className={(styles.eyebrowRule)}></span>
    </div>
    <h2 className={(styles.principlesTitle)}>Tecnologia que se explica. <span className={(styles.accentLine)}>Presença que permanece.</span></h2>
    <div className={(styles.principleGrid)}>
      {pilares.map((p, index) => <Fragment key={index}>
        <div className={(styles.principleBorder)}>
          <div className={(styles.principleCard)}>
            <h3 className={(styles.principleTitle)}>{p.title}</h3>
            <div className={(styles.dividerTop)}></div>
            <div className={styles.principleArt}><PillarArt kind={p.kind} /></div>
            <div className={(styles.divider)}></div>
            <p className={(styles.principleDescription)}>{p.desc}</p>
            <div className={(styles.practiceRow)}>
              <div className={(styles.practiceText)}>
                <span className={(styles.practiceLabel)}>Na prática</span>
                <span className={(styles.practiceDescription)}>{p.acao}</span>
              </div>
              <a href="#contato" aria-label={(p.aria)} className={(styles.cutCta)}>
                <span className={(styles.cutCtaInner)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
              </a>
            </div>
          </div>
        </div>
      </Fragment>)}
    </div>
  </div>
</section><Services /><Process /><div data-band="lidera" className={(styles.leaderBand)}>
  <div aria-hidden="true" className={(styles.leaderBackdrop)}>
  <Image src="/assets/g2-abrigo-175b4b.png" alt="" width="1400" height="710" unoptimized={(true)} className={(styles.leaderImage)} style={({"width": String("var(--leader-width)")})} />
  </div>
  <section data-sec="lidera" data-screen-label="Para quem lidera" className={(styles.leaderSection)} style={({"padding": String("var(--leader-top)") + " clamp(20px,4vw,60px) 96px", "minHeight": String("var(--leader-height)")})}>
    <div className={(styles.sequenceInner)} style={({"paddingLeft": String("var(--leader-left)")})}>
      <div className={(styles.eyebrowRow)}>
        <span className={(styles.eyebrow)}>Para quem lidera</span>
        <span className={(styles.greenRule)}></span>
      </div>
      <div className={(styles.leaderColumns)}>
        <h2 className={(styles.leaderTitle)}>Operações críticas <span className={(styles.accent)}>pedem mais do que tecnologia.</span></h2>
        <div className={(styles.leaderDescriptionStack)}>
          <p className={(styles.paragraph)}>Ambientes regulados, empresas em crescimento e decisões de liderança exigem uma abordagem integrada, com visão técnica e clareza de negócio.</p>
          <p className={(styles.paragraphMuted)}>Ajudamos sua equipe a transformar complexidade em decisões confiáveis.</p>
        </div>
      </div>
    </div>
  </section>
</div><section id="ferramentas" data-sec="ferramentas" data-screen-label="Ferramentas" className={(styles.tools)}>
  <div className={(styles.inner)}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Ferramentas</span>
      <span className={(styles.eyebrowRule)}></span>
    </div>
    <div className={(styles.sectionHeading)}>
      <h2 className={(styles.sectionTitle)}>Ferramentas <span className={(styles.accentLine)}>para decidir.</span></h2>
      <p className={(styles.toolsIntroduction)}>Recursos práticos para avaliar, priorizar e avançar com mais segurança.</p>
    </div>
    <div className={(styles.toolGrid)}>
      {ferramentas.map((f, index) => <Fragment key={index}>
        <a href={(f.href)} className={(styles.toolCard)}>
          <div className={styles.toolArt}><PillarArt kind={f.kind} /></div>
          <span className={(styles.toolTitle)}>{f.title}</span>
          <span className={(styles.toolDescription)}>{f.desc}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={(styles.toolArrow)}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </a>
      </Fragment>)}
    </div>
    <p className={(styles.toolsNote)}>Resultado inicial sem cadastro.</p>
  </div>
</section><section id="newsletter" data-sec="newsletter" data-screen-label="Newsletter" className={(styles.newsletter)}>
  <div className={(styles.newsletterColumns)}>
    <div>
      <div className={(styles.eyebrowRow)}>
        <span className={(styles.eyebrow)}>Conteúdo</span>
        <span className={(styles.eyebrowRule)}></span>
      </div>
      <h2 className={(styles.newsletterTitle)}>Análise <span className={(styles.accentLine)}>em dias úteis.</span></h2>
    </div>
    <div className={(styles.newsletterText)}>
      <p className={(styles.paragraph)}>Insights práticos sobre segurança, nuvem, software e tecnologia para operações críticas.</p>
      <NewsletterForm mode={mode} variant="home" />
      
      <a href="/newsletter/edicoes" className={(styles.archiveLink)}>Ver edições anteriores<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
    </div>
  </div>
</section><div data-band="cta" className={(styles.greenBand)}>
<section id="contato" data-sec="cta" data-screen-label="Próximo passo" className={(styles.contact)}>
  <div className={(styles.contactInner)}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Próximo passo</span>
      <span className={(styles.greenRule)}></span>
    </div>
    <div className={(styles.contactColumns)}>
      <div>
        <h2 className={(styles.sectionTitle)}>Vamos cuidar <span className={(styles.accentLine)}>da sua base.</span></h2>
        <p className={(styles.contactDescription)}>Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil após recebimento.</p>
        <ContactForm mode={mode} variant="home" />
      </div>
      <div role="img" aria-label="Símbolo roottrust" className={(styles.symbolHost)}>
        <div data-sec="ctasym" aria-hidden="true" className={(styles.symbol)}></div>
      </div>
    </div>
  </div>
</section>
</div><div data-frame-cut="1" /></div></main>; }
