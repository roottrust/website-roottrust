"use client";
import { Fragment } from "react";
import { steps } from "./content";
import { useHomeSequence } from "./useHomeSequence";
import { Terminal } from "./Terminal";
import styles from "./home.module.css";

export function Process() {
const { active, fraction, pick, trackRef, innerRef, enabled, trackHeight, position, top, padding } = useHomeSequence(steps.length);
const current = steps[active];
const etapas = steps.map((e, index) => ({ ...e, cur: active === index ? "step" as const : undefined, onClick: () => pick(index), nColor: active === index ? "var(--rt-folha)" : "#9DB3A8", tColor: active === index ? "var(--rt-superficie)" : "#9DB3A8", arrow: active === index ? "var(--rt-folha)" : "transparent", bar: active === index ? (enabled ? Math.max(.04, fraction) : 1) : 0 }));
const line = (t: string, index: number) => ({ t, c: index === 0 ? "var(--rt-superficie)" : t.includes("[OK]") ? "var(--rt-folha)" : "var(--rt-menta)" });
const etapasStack = steps.map(e => ({ ...e, lines: e.lines.map(line) }));
const etapaSlug = current.slug, etapaPos = current.n + " / 05";
return (<><p className="srOnly" aria-live="polite" aria-atomic="true">Etapa {current.n} de 5: {current.title}. {current.desc}</p><section data-sec="como" data-screen-label="Como trabalhamos" className={(styles.sequenceSection)}>
  <div ref={(trackRef)} style={({"height": String(trackHeight)})}>
  <div ref={(innerRef)} className={(styles.sequenceInner)} style={({position: position, "top": String(top), "padding": String(padding)})}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Como trabalhamos</span>
      <span className={(styles.eyebrowRule)}></span>
    </div>
    <div className={(styles.sectionHeading)}>
      <h2 className={(styles.sectionTitle)}>Da análise <span className={(styles.accentLine)}>à evolução.</span></h2>
      <p className={(styles.processIntroduction)}>Um processo claro, colaborativo e adaptado a cada realidade.</p>
    </div>
    <div className={styles.desktop}>
    <div className={(styles.processColumns)}>
      <ol className={(styles.processList)}>
        {etapas.map((e, index) => <Fragment key={index}>
          <li className={(styles.processItem)}>
            <button type="button" onClick={(e.onClick)} aria-current={(e.cur)} className={(styles.processButton)}>
              <span className={(styles.processNumber)} style={({"color": String(e.nColor)})}>{e.n}</span>
              <span className={(styles.processText)}>
                <span className={(styles.processTitle)} style={({"color": String(e.tColor)})}>{e.title}</span>
                <span className={(styles.processDescription)}>{e.desc}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(e.arrow)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
            <span className={(styles.progressBar)} style={({"transform": "scaleX(" + String(e.bar) + ")", "transition": "transform " + String("90ms linear")})}></span>
          </li>
        </Fragment>)}
      </ol>
      <div className={(styles.terminal)}>
        <div className={(styles.terminalHeader)}>
          <span className={(styles.terminalPath)}>roottrust ~ processo/{etapaSlug}</span>
          <span className={(styles.terminalPosition)}>{etapaPos}</span>
        </div>
        <Terminal key={current.slug} lines={current.lines} />
      </div>
    </div>
    </div>
    <div className={styles.mobile}>
    <ol className={(styles.processStack)}>
      {etapasStack.map((e, index) => <Fragment key={index}>
        <li className={(styles.mobileStep)}>
          <div className={(styles.mobileStepHeading)}>
            <span className={(styles.mobileStepNumber)}>{e.n}</span>
            <span className={(styles.processText)}><span className={(styles.mobileStepTitle)}>{e.title}</span><span className={(styles.processDescription)}>{e.desc}</span></span>
          </div>
          <div className={(styles.mobileTerminal)}>
            {e.lines.map((l, index) => <Fragment key={index}><span className={(styles.terminalLine)} style={({"color": String(l.c)})}>{l.t}</span></Fragment>)}
          </div>
        </li>
      </Fragment>)}
    </ol>
    </div>
    <p className={(styles.processNote)}>As etapas podem variar conforme o escopo do projeto.</p>
  </div>
  </div>
</section></>);
}
