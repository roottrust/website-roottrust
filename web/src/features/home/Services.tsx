"use client";
import { Fragment, type KeyboardEvent } from "react";
import { PillarArt } from "@/features/graphics/PillarArt";
import { services } from "./content";
import { useHomeSequence } from "./useHomeSequence";
import styles from "./home.module.css";

export function Services() {
const { active, fraction, pick, trackRef, innerRef, enabled, trackHeight, position, top, padding, artHeight } = useHomeSequence(services.length);
const selected = services[active];
const servicos = services.map((s, index) => ({ ...s, n: "0" + (index + 1), sel: active === index, aria: "Abrir a página de " + s.title, onClick: () => pick(index), onHover: undefined, nColor: active === index ? "var(--rt-folha)" : "#9DB3A8", tColor: active === index ? "var(--rt-superficie)" : "#9DB3A8", arrow: active === index ? "var(--rt-folha)" : "transparent", bar: active === index ? (enabled ? Math.max(.04, fraction) : 1) : 0 }));
const svc = { ...selected, pos: "0" + (active + 1) + " / 03" };
const svcStack = services.map((s, index) => ({ ...s, n: "0" + (index + 1) }));
function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
  const keys: Record<string, number> = { ArrowDown: (active + 1) % services.length, ArrowUp: (active + services.length - 1) % services.length, Home: 0, End: services.length - 1 };
  const index = keys[event.key];
  if (index === undefined) return;
  event.preventDefault(); pick(index); document.getElementById("service-tab-" + index)?.focus({ preventScroll: true });
}
return (<section id="servicos" data-sec="servicos" data-screen-label="Serviços" className={(styles.sequenceSection)}>
  <div ref={(trackRef)} style={({"height": String(trackHeight)})}>
  <div ref={(innerRef)} className={(styles.sequenceInner)} style={({position: position, "top": String(top), "padding": String(padding)})}>
    <div className={(styles.eyebrowRow)}>
      <span className={(styles.eyebrow)}>Nossos serviços</span>
      <span className={(styles.eyebrowRule)}></span>
    </div>
    <div className={(styles.sectionHeading)}>
      <h2 className={(styles.sectionTitle)}>Três frentes. <span className={(styles.accentLine)}>Uma base.</span></h2>
      <p className={(styles.servicesIntroduction)}>Segurança, infraestrutura e software integrados para ambientes complexos, com foco em resiliência, continuidade e controle.</p>
    </div>
    <div className={styles.desktop}>
    <div className={(styles.servicesColumns)}>
      <div role="tablist" aria-label="Serviços" onKeyDown={(onTabKey)} aria-orientation="vertical" className={(styles.serviceTabs)}>
        {servicos.map((s, index) => <Fragment key={index}>
          <div className={(styles.relative)}>
          <button type="button" role="tab" aria-selected={(s.sel)} onClick={(s.onClick)} onMouseEnter={(s.onHover)} id={("service-tab-" + index)} aria-controls="service-panel" tabIndex={(s.sel ? 0 : -1)} className={(styles.serviceTab)}>
            <span className={(styles.serviceNumber)} style={({"color": String(s.nColor)})}>{s.n}</span>
            <span className={(styles.serviceTabText)}>
              <span className={(styles.serviceTitle)} style={({"color": String(s.tColor)})}>{s.title}</span>
              <span className={(styles.serviceSummary)}>{s.resumo}</span>
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(s.arrow)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={(styles.serviceArrow)}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            <span className={(styles.progressBar)} style={({"transform": "scaleX(" + String(s.bar) + ")", "transition": "transform " + String("90ms linear")})}></span>
          </button>
          <a href={(s.href)} aria-label={(s.aria)} className={(styles.serviceRoute)}></a>
          </div>
        </Fragment>)}
      </div>
      <div role="tabpanel" id="service-panel" aria-labelledby={("service-tab-" + active)} tabIndex={(0)} className={(styles.servicePanel)}>
        <div className={(styles.servicePanelHeading)}>
          <span className={(styles.serviceCode)} style={({"opacity": String(1)})}>{svc.code}</span>
          <span className={(styles.servicePosition)}>{svc.pos}</span>
        </div>
        <div className={styles.relative} style={({"height": String(artHeight)})}><PillarArt kind={selected.kind} /></div>
        <div className={(styles.servicePanelBody)} style={({"opacity": String(1), "transform": "translateY(" + String("0px") + ")"})}>
          <p className={(styles.serviceDescription)}>{svc.desc}</p>
          <ul className={(styles.deliverables)}>
            {svc.entregas.map((x, index) => <Fragment key={index}>
              <li className={(styles.deliverable)}><span className={(styles.check)}>√</span>{x}</li>
            </Fragment>)}
          </ul>
          <a href={(svc.href)} className={(styles.secondaryCta)}>Conhecer {svc.title}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
        </div>
      </div>
    </div>
    </div>
    <div className={styles.mobile}>
    <div className={(styles.serviceStack)}>
      {svcStack.map((s, index) => <Fragment key={index}>
        <div className={(styles.mobileService)}>
          <div className={(styles.mobileServiceHeading)}>
            <span className={(styles.numberAccent)}>{s.n}</span>
            <span className={(styles.mobileServiceText)}>
              <span className={(styles.mobileServiceTitle)}>{s.title}</span>
              <span className={(styles.serviceSummary)}>{s.resumo}</span>
            </span>
          </div>
          <div className={styles.mobileServiceArt}><PillarArt kind={s.kind} /></div>
          <div className={(styles.mobileServiceBody)}>
            <p className={(styles.mobileServiceDescription)}>{s.desc}</p>
            <ul className={(styles.mobileDeliverables)}>
              {s.entregas.map((x, index) => <Fragment key={index}>
                <li className={(styles.deliverable)}><span className={(styles.check)}>√</span>{x}</li>
              </Fragment>)}
            </ul>
            <a href={(s.href)} className={(styles.secondaryCta)}>Conhecer {s.title}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
          </div>
        </div>
      </Fragment>)}
    </div>
    </div>
  </div>
  </div>
</section>);
}
