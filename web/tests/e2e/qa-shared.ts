import type { Page } from "@playwright/test";
import { sortedEdicoes } from "../../src/features/newsletter/catalog";

const [recente] = sortedEdicoes();

export const ROUTES = [
  { path: "/", h1: "Confiabilidade com profundidade." },
  { path: "/servicos/ciberseguranca", h1: "Pentest e cibersegurança" },
  { path: "/servicos/infraestrutura-em-nuvem", h1: "Continuidade e custos" },
  { path: "/servicos/desenvolvimento-de-software", h1: "Software sob medida" },
  { path: "/ferramentas/rosi", h1: null },
  { path: "/ferramentas/shadow-ai", h1: null },
  { path: "/ferramentas/divida-tecnica", h1: null },
  { path: "/ferramentas/migracao-para-nuvem", h1: null },
  { path: "/newsletter", h1: null },
  { path: "/newsletter/edicoes", h1: null },
  { path: `/newsletter/edicoes/${recente.slug}`, h1: null },
  { path: "/privacidade", h1: null },
] as const;

/** Runtime/hydration problems of one page: uncaught errors, console errors, failed or 4xx/5xx responses. */
export function collectIssues(page: Page) {
  const issues: string[] = [];
  page.on("pageerror", error => issues.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") issues.push(`console.error: ${message.text()}`); });
  page.on("requestfailed", request => {
    const reason = request.failure()?.errorText ?? "";
    // Next cancels in-flight Link prefetches on navigation; engines word it differently (Chromium ERR_ABORTED, Firefox NS_BINDING_ABORTED, WebKit "cancelled"). Only `_rsc` requests are tolerated.
    if (request.url().includes("_rsc=") && /ERR_ABORTED|NS_BINDING_ABORTED|^cancelled$/i.test(reason)) return;
    issues.push(`requestfailed: ${request.url()} ${reason}`);
  });
  page.on("response", response => { if (response.status() >= 400) issues.push(`http ${response.status()}: ${response.url()}`); });
  return issues;
}

/** Test-only instrumentation: counts 2D draw calls per canvas (not WebGL draws nor OffscreenCanvas) and records created WebGL contexts. */
export async function instrument(page: Page) {
  await page.addInitScript(() => {
    const draws = new WeakMap<HTMLCanvasElement, number>();
    const w = window as unknown as { __draws: (el: Element) => number; __gl: WebGLRenderingContext[] };
    for (const name of ["clearRect", "drawImage", "fillRect", "fillText", "strokeText", "fill", "stroke"] as const) {
      const original = CanvasRenderingContext2D.prototype[name] as (...args: unknown[]) => void;
      Object.defineProperty(CanvasRenderingContext2D.prototype, name, {
        configurable: true, writable: true,
        value(this: CanvasRenderingContext2D, ...args: unknown[]) {
          draws.set(this.canvas, (draws.get(this.canvas) ?? 0) + 1);
          return original.apply(this, args);
        },
      });
    }
    w.__draws = el => draws.get(el as HTMLCanvasElement) ?? 0;
    w.__gl = [];
    const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true, writable: true,
      value(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        const context = getContext.call(this, type, ...rest);
        if (/webgl/.test(type) && context) w.__gl.push(context as WebGLRenderingContext);
        return context;
      },
    });
  });
}

/** Draw calls across all canvases currently in the document during one window. */
export function drawsDuring(page: Page, ms: number) {
  return page.evaluate(async duration => {
    const w = window as unknown as { __draws: (el: Element) => number };
    const canvases = [...document.querySelectorAll("canvas")];
    const before = canvases.map(w.__draws);
    await new Promise(resolve => setTimeout(resolve, duration));
    return canvases.reduce((sum, canvas, index) => sum + w.__draws(canvas) - before[index], 0);
  }, ms);
}

/**
 * Relevant content (main/footer) that sticks out of the viewport or is cut by an overflow:hidden/clip ancestor.
 * Complements `scrollWidth <= innerWidth`, which misses content clipped instead of scrolled. Intentional scroll containers
 * (overflow auto/scroll), aria-hidden subtrees, canvases and sr-only boxes are ignored.
 */
export function findClipped(page: Page) {
  return page.evaluate(() => {
    const found: string[] = [];
    const selector = "a[href],button,input,select,textarea,summary,label,h1,h2,h3,h4,h5,h6,p,li,dt,dd,th,td,figcaption";
    for (const el of document.querySelectorAll<HTMLElement>(`main ${selector.split(",").join(", main ")}, footer ${selector.split(",").join(", footer ")}`)) {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (rect.width <= 1 || rect.height <= 1 || style.visibility === "hidden" || style.display === "none" || el.closest("[aria-hidden=true],canvas")) continue;
      let scrollable = false;
      let cut = false;
      for (let anc = el.parentElement; anc && anc !== document.documentElement; anc = anc.parentElement) {
        const overflow = getComputedStyle(anc).overflowX;
        if (overflow === "visible") continue;
        const box = anc.getBoundingClientRect();
        if (overflow === "auto" || overflow === "scroll") { if (anc.scrollWidth > anc.clientWidth) { scrollable = true; break; } continue; }
        if (rect.right > box.right + 1 || rect.left < box.left - 1) cut = true;
      }
      if (scrollable) continue;
      const outside = rect.right > innerWidth + 1 || rect.left < -1;
      if (cut || outside) found.push(`${cut ? "clipped" : "outside"}: ${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 40)}" [${Math.round(rect.left)},${Math.round(rect.right)}] vw=${innerWidth}`);
    }
    return found.slice(0, 20);
  });
}
