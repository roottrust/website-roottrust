// Canvas coordinates and drawing values ported from approved Home.dc.html.
type Point = [number, number];
type Section = { top: number; bottom: number; h: number; left?: number; w?: number };
type Clip = { x0: number; y0: number; x1: number; y1: number };
type Grid = { full: boolean; W: number; H: number; VH: number; dpr: number; cw: number; ch: number; rows: number; ci: Uint16Array; cj: Uint16Array; cd: Float32Array; ck: Uint8Array; cdi: Float32Array; cs: Float32Array; rowOff: Int32Array; ctx: CanvasRenderingContext2D; A: HTMLCanvasElement; sw: number; sh: number };
const mix = (a: number[], b: number[], f: number) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
const ramp = (stops: [number, number[]][], f: number): number[] => { for (let i = 1; i < stops.length; i++) if (f <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (f - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1]; };
export class HomeAscii {
  STROKE = '.·:;+*x#▪'; THREAD = '.·:+';
  COLORS: string[] = []; RI: number[][] = [];
  g: Grid | null = null; fsp: { dpr: number; S: number; L: number; out: HTMLCanvasElement[][][] } | null = null;
  mx = -1e5; my = -1e5; lastKey: string | null = null; last = 0; t0 = 0; cvTop = -1; fKey = ''; fT = 0; animated = false;
  constructor(public rootEl: HTMLElement, public cv: HTMLCanvasElement, public fcv: HTMLCanvasElement, private symbolsOnly = false) {
    const GS: [number, number[]][] = [[0,[20,38,32]],[.2,[0,52,40]],[.42,[23,91,75]],[.6,[76,107,88]],[.82,[98,175,150]],[1,[204,233,220]]];
    const SG: [number, number[]][] = [[0,[0,52,40]],[.5,[0,150,45]],[.8,[0,214,61]],[1,[150,250,180]]];
    for (let l = 0; l < 24; l++) this.COLORS.push('rgb('+ramp(GS,l/23).join(',')+')');
    for (let l = 0; l < 24; l++) this.COLORS.push('rgb('+ramp(SG,l/23).join(',')+')');
  }
  invalidate() { this.lastKey = null; this.last = 0; this.fKey = ''; }
  render(elapsed: number, animated: boolean) { this.animated = animated; this.draw(elapsed*1000); this.drawFrame(elapsed*1000); }
  frameSprites(dpr: number) {
    if (this.fsp && this.fsp.dpr === dpr) return this.fsp;
    const S = 12, L = 8, k = 8 / 1630, px = S * dpr;
    const P = [[85, 780], [250, 690], [548, 1360], [905, 85], [1545, 85]];
    const mix = (a: string, b: string, f: number) => '#' + [0, 2, 4].map(i => Math.round(parseInt(a.substr(1 + i, 2), 16) * (1 - f) + parseInt(b.substr(1 + i, 2), 16) * f).toString(16).padStart(2, '0')).join('');
    const TH = [{ base: '#262626', hi: '#4C6B58', ring: '#62AF96' }, { base: '#0E4A3A', hi: '#62AF96', ring: '#CCE9DC' }];
    const out = TH.map(t => Array.from({ length: L }, (_, l) => [0, 1].map(ringOn => {
      const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d'); if (!x) throw new Error('Canvas 2D unavailable.');
      x.setTransform(dpr, 0, 0, dpr, (S - 1630 * k) / 2 * dpr, (S - 1450 * k) / 2 * dpr);
      const col = mix(t.base, t.hi, l / (L - 1));
      x.strokeStyle = col; x.lineWidth = Math.max(0.9, 170 * k); x.lineCap = 'round'; x.lineJoin = 'round';
      x.beginPath(); P.forEach(([a, b], i) => i ? x.lineTo(a * k, b * k) : x.moveTo(a * k, b * k)); x.stroke();
      x.fillStyle = ringOn ? mix(col, t.ring, l / (L - 1)) : col; x.beginPath(); x.arc(1225 * k, 610 * k, Math.max(1.1, 235 * k), 0, Math.PI * 2); x.fill();
      return c;
    })));
    this.fsp = { dpr, S, L, out };
    return this.fsp;
  }
  drawFrame(now: number) {
    const c = this.fcv, root = this.rootEl; if (!c || !root) return;
    const vw = document.documentElement.clientWidth, vh = innerHeight, sy = scrollY, on = vw >= 960;
    const mx = this.mx | 0, my = this.my | 0, key = [vw, vh, sy, on ? mx : 0, on ? my : 0].join(':');
    if (key === this.fKey && now - (this.fT || 0) < 600) return;
    this.fKey = key; this.fT = now;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(vw * dpr) || c.height !== Math.round(vh * dpr)) { c.width = Math.round(vw * dpr); c.height = Math.round(vh * dpr); c.style.width = vw + 'px'; }
    const x = c.getContext('2d'); if (!x) throw new Error('Canvas 2D unavailable.'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, vw, vh);
    if (!on) return;
    const rt = root.getBoundingClientRect().top;
    const bands = [...root.querySelectorAll('[data-band]')].map(e => { const r = e.getBoundingClientRect(); return [r.top - rt, r.bottom - rt]; });
    const cuts = new Set<number>();
    root.querySelectorAll('[data-sec="pilares"],[data-sec="servicos"],[data-sec="como"],[data-sec="ferramentas"],[data-sec="newsletter"],[data-frame-cut]').forEach(e => { const r = e.getBoundingClientRect(); cuts.add(Math.round(r.top - rt)); });
    const top = -rt; // root-relative y at viewport top
    const theme = (y: number) => bands.some(([a, b]) => y >= a && y < b) ? 1 : 0;
    const F = Math.min(vw - 48, 1360), fl = Math.round((vw - F) / 2) + 0.5, fr = Math.round((vw + F) / 2) - 0.5;
    // G3 nas laterais
    const sp = this.frameSprites(dpr), S = sp.S, P = 20, Rr = 120, reveal = this.animated && mx > -1e4;
    const j0 = Math.floor(top / P), j1 = Math.ceil((top + vh) / P);
    const cols: number[] = [];
    const nC = Math.max(0, Math.min(6, Math.floor((fl - 24) / P) + 1));
    for (let k = 0; k < nC; k++) cols.push(fl - 12 - k * P, fr + 12 + k * P);
    const ol = nC ? Math.round(fl - 24 - (nC - 1) * P) + 0.5 : fl, orr = nC ? Math.round(fr + 24 + (nC - 1) * P) - 0.5 : fr;
    const hash = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    for (let j = j0; j <= j1; j++) {
      const y = j * P + P / 2, th = theme(y), row = sp.out[th], vy = y - top;
      if (th) continue;
      for (const cx of cols) {
        let l = 0, ring = 0;
        if (reveal) { const dx = cx - mx, dy = y - my, d2 = dx * dx + dy * dy; if (d2 < Rr * Rr) { const f = 1 - Math.sqrt(d2) / Rr; l = Math.round(f * f * (sp.L - 1)); ring = f > 0.35 && hash(Math.round(cx / P), j) < 0.4 ? 1 : 0; } }
        x.drawImage(row[l][ring], cx - S / 2, vy - S / 2, S, S);
      }
    }
    // linhas verticais da coluna
    const LC = ['#2E2E2E', '#175B4B'], BG = ['#171717', '#003428'];
    x.lineWidth = 1;
    x.save(); x.beginPath(); x.rect(0, 0, vw, vh); bands.forEach(([a, b]) => x.rect(0, a - top, vw, b - a)); x.clip('evenodd');
    const vseg = (X: number) => { x.strokeStyle = LC[0]; x.beginPath(); x.moveTo(X, 0); x.lineTo(X, vh); x.stroke(); };
    vseg(fl); vseg(fr); if (nC) { vseg(ol); vseg(orr); }
    // cortes horizontais + cantoneiras
    cuts.forEach(y => {
      const vy = y - top; if (vy < -8 || vy > vh + 8) return;
      const th = theme(y + 1), Y = Math.round(vy) + 0.5; if (th) return;
      x.strokeStyle = LC[th]; x.beginPath(); x.moveTo(ol, Y); x.lineTo(orr, Y); x.stroke();
      (nC ? [ol, fl, fr, orr] : [fl, fr]).forEach(X => { x.fillStyle = BG[th]; x.fillRect(X - 3.5, Y - 3.5, 7, 7); x.strokeStyle = th ? '#4C6B58' : '#3C3C3C'; x.strokeRect(X - 3.5, Y - 3.5, 7, 7); });
    });
    x.restore();
  }
  build() {
    const root = this.rootEl, cv = this.cv;
    if (!root || !cv) return;
    const W = root.clientWidth, H = root.offsetHeight;
    if (!W || !H) return;
    const [cw, ch, fs] = [7, 10, 10];
    const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), N = cols * rows;
    const rr = root.getBoundingClientRect();
    const S: Record<string, Section> = {};
    root.querySelectorAll<HTMLElement>('[data-sec]').forEach(el => { const r = el.getBoundingClientRect(); S[el.dataset.sec!] = { top: r.top - rr.top, bottom: r.bottom - rr.top, h: r.height, left: r.left - rr.left, w: r.width }; });
    let seed = 2026;
    const rand = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const val = new Float32Array(N), hgt = new Float32Array(N).fill(-1), kind = new Uint8Array(N), dist = new Float32Array(N);
    const STK = 1, SIG = 3;
    const hs = (i: number, j: number) => { const v = Math.sin(i * 127.1 + j * 311.7 + 7.3) * 43758.5453; return v - Math.floor(v); };
    const vn = (x: number, y: number) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), a = hs(i, j), b = hs(i + 1, j), c = hs(i, j + 1), d = hs(i + 1, j + 1); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; };
    const Lx = -0.55, Ly = -0.83;
    let clip: Clip | null = null, dMode: ((x: number, y: number) => number) | null = null, fadeFn: ((x: number, y: number) => number) | null = null;
    const put = (id: number, h: number, v: number, k: number, d: number) => { if (h > hgt[id]) { hgt[id] = h; val[id] = v; kind[id] = k; dist[id] = d; } };
    const disc = (x: number, y: number, r: number, k: number, v: number, d: number, nx: number, ny: number, z0: number) => {
      const rx = Math.max(r, cw * 0.55), ry = Math.max(r, ch * 0.55), thin = r < 3.2, nl = nx * Lx + ny * Ly;
      if (clip && (x + rx < clip.x0 || x - rx > clip.x1 || y + ry < clip.y0 || y - ry > clip.y1)) return;
      const i0 = Math.max(0, Math.floor((x - rx) / cw)), i1 = Math.min(cols - 1, Math.floor((x + rx) / cw)), j0 = Math.max(0, Math.floor((y - ry) / ch)), j1 = Math.min(rows - 1, Math.floor((y + ry) / ch));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const cx = (i + 0.5) * cw, cy = (j + 0.5) * ch;
        if (clip && (cx < clip.x0 || cx > clip.x1 || cy < clip.y0 || cy > clip.y1)) continue;
        const px = cx - x, py = cy - y, qx = px / rx, qy = py / ry, q = qx * qx + qy * qy;
        if (q > 1) continue;
        const z = Math.sqrt(1 - q), id = j * cols + i, h = z0 + r * z;
        if (h <= hgt[id]) continue;
        let s;
        if (thin) s = v * (0.42 + 0.3 * z) * (0.7 + 0.5 * vn(cx * 0.05, cy * 0.05));
        else {
          const p = px * nx + py * ny, u = p / r, lam = Math.min(1, Math.max(0, z * 0.5 + u * nl * 0.75 + 0.2)), nz = vn(cx * 0.035, cy * 0.035);
          s = v * (0.3 + 0.7 * lam) * (0.8 + 0.2 * Math.sin(p * 0.35 + nz * 4)) * (0.85 + 0.3 * nz);
        }
        if (fadeFn) s *= fadeFn(cx, cy);
        put(id, h, s, k, dMode ? dMode(cx, cy) : d);
      }
    };
    const seg = (ax: number, ay: number, bx: number, by: number, w: number, k: number, v: number, d0: number, z0: number) => {
      const L = Math.hypot(bx - ax, by - ay) || 1, n = Math.max(1, Math.ceil(L / 2)), nx = -(by - ay) / L, ny = (bx - ax) / L;
      for (let i = 0; i <= n; i++) { const t = i / n; disc(ax + (bx - ax) * t, ay + (by - ay) * t, w / 2, k, v, d0 + L * t, nx, ny, z0); }
      return d0 + L;
    };
    const poly = (pts: Point[], w: number, k: number, v: number, d0: number, z0: number) => { let d = d0; for (let i = 1; i < pts.length; i++) d = seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w, k, v, d, z0); return d; };
    const nodes: number[][] = [];
    const node = (x: number, y: number, d: number) => nodes.push([x, y, d]);
    // unidade G4 (Cadeia de confiança): descida curta, subida longa, barra
    const unit = (pts: Point[], s: number) => { const p = pts[pts.length - 1]; const a: Point = [p[0] + 7.905 * s, p[1] + 18.536 * s], b: Point = [a[0] + 9.268 * s, a[1] - 34.892 * s], c: Point = [b[0] + 17.991 * s, b[1]]; pts.push(a, b, c); return c; };
    const UW = 35.164, UH = 16.356;
    // Símbolo Raiz (√ + círculo), linha central derivada do SVG oficial (566×506)
    const SYM = [[156, 416], [211, 388], [305, 608], [423, 186], [644, 186]];
    const symbol = (x: number, y: number, size: number, d0: number) => {
      const k = size / 566, m = (p: number[]): Point => [x + (p[0] - 117) * k, y + (p[1] - 147) * k];
      const pts = SYM.map(m), d = poly(pts, 56.7 * k, STK, 1, d0, 20);
      const c = m([536.8, 361.6]); disc(c[0], c[1], 78.4 * k, STK, 1, d + 40, 0, -1, 20);
      node(pts[4][0], pts[4][1], d);
      return { start: pts[0], end: pts[4], d };
    };

    const pad0 = Math.min(60, Math.max(20, W * 0.04)), inner = Math.min(1200, Math.min(1320, W) - 2 * pad0), cL = (W - inner) / 2, cR = W - cL, mob = W < 900;
    const hero = S.hero || { top: 0, bottom: 760, h: 760 };
    const hc = root.querySelector<HTMLElement>('[data-hero-copy]'), hcr = hc ? hc.getBoundingClientRect() : null;
    const tb = hcr && hc ? (() => { let b = 0; hc.querySelectorAll('a,p,h1').forEach(e => { b = Math.max(b, e.getBoundingClientRect().bottom - rr.top); }); return b; })() : 520;

    // HERO — campo G4 em ASCII, recortado pela borda
    if (!this.symbolsOnly) {
    let s0;
    if (!mob) { clip = { x0: Math.max(cL + 540, cL + inner * 0.44), y0: 104, x1: cR, y1: hero.bottom - 1 }; s0 = Math.min(4.4, Math.max(2.7, 3.5 * inner / 1440)); }
    else { clip = { x0: cL, y0: tb + 24, x1: cR, y1: hero.bottom - 1 }; s0 = 1.9; }
    const C0 = clip;
    fadeFn = mob ? ((x, y) => Math.min(1, Math.max(0, (y - C0.y0) / 90))) : ((x) => { const f = Math.min(1, Math.max(0, (x - C0.x0) / 160)); return f * f * (3 - 2 * f); });
    dMode = mob ? ((x, y) => x * 0.4 + (y - C0.y0) * 0.3) : ((x, y) => (x - C0.x0) * 0.5 + (C0.y1 - y) * 0.3);
    {
      const ux = UW * s0, uy = -UH * s0, rx = -3.271 * s0, ry = 49.067 * s0, w = 4.634 * s0 * 2.1;
      for (let k = -26; k <= 26; k++) {
        let px = C0.x0 + k * rx, py = C0.y1 + k * ry;
        while (px > C0.x0 - 80) { px -= ux; py -= uy; }
        const yA = py + (C0.x0 - px) * uy / ux, yB = py + (C0.x1 - px) * uy / ux;
        if (Math.min(yA, yB) > C0.y1 + 80 || Math.max(yA, yB) < C0.y0 - 80) continue;
        const v = 0.66 + 0.34 * hs(k, 3), pts: Point[] = [[px, py]];
        let guard = 0;
        while (px < C0.x1 + 80 && py > C0.y0 - 100 && guard++ < 200) {
          const e = unit(pts, s0); px = e[0]; py = e[1];
          if (px > C0.x0 + 140 && px < C0.x1 - 10 && py > C0.y0 + 10 && py < C0.y1 - 10 && rand() < 0.09) node(px, py, (px - C0.x0) * 0.5 + (C0.y1 - py) * 0.3);
        }
        poly(pts, w, STK, v, 0, k * 2);
      }
    }
    clip = null; fadeFn = null; dMode = null;
    }

    // FIO — cada seção ganha um √ menor, ligado ao anterior
    const d = this.symbolsOnly ? 200 : 560;
    const Nw = S.newsletter;
    if (Nw) {
      const colW = Math.min(360, Math.max(0, (window.innerWidth - 640) * 0.45));
      if (!mob && colW > 250) {
        const size = Math.min(230, colW - 90), sh = size * 506 / 566, sx = cL + (colW - size) / 2 - 10, sy = Nw.top + (Nw.h - sh) / 2;
        symbol(sx, sy, size, d);
      } else {
        const size = mob ? 84 : 110, sx = (mob ? W - 26 : cR) - size, sy = Nw.top + 40;
        symbol(sx, sy, size, d);
      }
    }
    const Cs = S.ctasym; if (Cs && Cs.w && Cs.w > 40 && Cs.left !== undefined) symbol(Cs.left, Cs.top, Cs.w, d);
    // nós de verificação (Sinal)
    for (const [x, y, dd] of nodes) { const i = Math.floor(x / cw), j = Math.floor(y / ch); if (i >= 0 && j >= 0 && i < cols && j < rows) put(j * cols + i, 1e4, 0.9, SIG, dd); }

    // atenuar atrás do texto e dos cartões
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), rg = document.createRange(), rects: DOMRect[] = [];
    for (let nd = tw.nextNode(); nd; nd = tw.nextNode()) { if (!nd.textContent?.trim()) continue; rg.selectNodeContents(nd); for (const r of rg.getClientRects()) rects.push(r); }
    const boxes = [...root.querySelectorAll('form, img:not([data-graphic-fallback]), a[style*="border-radius:999px"]')].map(el => el.getBoundingClientRect());
    const att = (list: DOMRect[], px: number, py: number, f: number) => { for (const r of list) {
      const x0 = r.left - rr.left - px, x1 = r.right - rr.left + px, yA = r.top - rr.top - py, yB = r.bottom - rr.top + py;
      for (let j = Math.max(0, Math.floor(yA / ch)); j <= Math.min(rows - 1, Math.floor(yB / ch)); j++)
        for (let i = Math.max(0, Math.floor(x0 / cw)); i <= Math.min(cols - 1, Math.floor(x1 / cw)); i++) { const id = j * cols + i; if (kind[id] !== SIG) val[id] *= f; else val[id] *= Math.max(f, 0.5); }
    } };
    att(boxes, 10, 8, 0.25); att(rects, 30, 18, 0.55); att(rects, 10, 6, 0.2);

    let cnt = 0;
    for (let id = 0; id < N; id++) if (val[id] > 0.04) cnt++;
    const ci = new Uint16Array(cnt), cj = new Uint16Array(cnt), cd = new Float32Array(cnt), ck = new Uint8Array(cnt), cdi = new Float32Array(cnt), cs = new Float32Array(cnt), rowOff = new Int32Array(rows + 1);
    let p = 0;
    for (let j = 0; j < rows; j++) {
      rowOff[j] = p;
      for (let i = 0; i < cols; i++) { const id = j * cols + i; if (val[id] > 0.04) { ci[p] = i; cj[p] = j; cd[p] = Math.min(1, Math.pow(val[id], 0.5) * 1.08); ck[p] = kind[id]; cdi[p] = dist[id]; cs[p] = rand(); p++; } }
    }
    rowOff[rows] = p;
    const full = false, dpr = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1, VH = Math.min(H, window.innerHeight + 600);
    cv.width = W * dpr; cv.height = VH * dpr;
    cv.style.width = W + 'px'; cv.style.height = VH + 'px';
    const ctx = cv.getContext('2d'); if (!ctx) throw new Error("Canvas 2D unavailable.");
    const CHS = [...new Set(this.STROKE + this.THREAD + '√')];
    this.RI = [this.STROKE, this.THREAD, '√'].map(s => [...s].map(c => CHS.indexOf(c)));
    const sw = Math.ceil(cw * dpr), shh = Math.ceil(ch * dpr), Aa = document.createElement('canvas');
    Aa.width = sw * CHS.length; Aa.height = shh * this.COLORS.length;
    const ax = Aa.getContext('2d'); if (!ax) throw new Error("Canvas 2D unavailable.");
    ax.textAlign = 'center'; ax.textBaseline = 'middle';
    this.COLORS.forEach((c, r) => { ax.fillStyle = c; CHS.forEach((chr, k) => { ax.font = ((chr === '√' ? fs * 1.45 : fs) * dpr) + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; ax.fillText(chr, k * sw + sw / 2, r * shh + shh / 2); }); });
    this.g = { full, W, H, VH, dpr, cw, ch, rows, ci, cj, cd, ck, cdi, cs, rowOff, ctx, A: Aa, sw, sh: shh };
    this.lastKey = null; this.last = 0;

  }

  hash(a: number, b: number) { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); }

  draw(now: number) {
    const g = this.g;
    if (!g || !this.rootEl) return;
    const anim = this.animated;
    if (g.full && this.lastKey === 'full') return;
    if (g.full) this.lastKey = 'full';
    const cur = this.animated, seiva = true;
    if (anim && now - (this.last || 0) < 33) return;
    const rr = this.rootEl.getBoundingClientRect();
    const top = Math.max(0, Math.min(g.H - g.VH, Math.floor(-rr.top - 300)));
    const j0 = Math.max(0, Math.floor(top / g.ch)), j1 = Math.min(g.rows, Math.floor((top + g.VH) / g.ch) + 1);
    if (j1 <= j0) return;
    if (!anim) { const key = j0 + ':' + j1 + (cur ? ':' + (this.mx | 0) + ':' + (this.my | 0) : ''); if (key === this.lastKey) return; this.lastKey = key; }
    this.last = now;
    const t = anim ? (now - this.t0) / 1000 : 0;
    const ctx = g.ctx;
    if (this.cvTop !== top) { this.cv.style.top = top + 'px'; this.cvTop = top; }
    ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, -top * g.dpr);
    ctx.clearRect(0, top, g.W, g.VH);
    const A = g.A, sw = g.sw, sh = g.sh, hw = g.cw / 2, hh = g.ch / 2;
    const R = 110, R2 = R * R, mx = this.mx, my = this.my;
    for (let p = g.rowOff[j0], pe = g.rowOff[j1]; p < pe; p++) {
      const d = g.cdi[p];
      let rv = 1;
      if (anim) { rv = (t - d / 1100) / 0.6; if (rv <= 0) continue; if (rv > 1) rv = 1; }
      const k = g.ck[p], s = g.cs[p], x = (g.ci[p] + 0.5) * g.cw, y = (g.cj[p] + 0.5) * g.ch;
      const dn = g.cd[p] * rv;
      let b = dn;
      if (k === 3) {
        b = anim ? (0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 1.1 + s * 37)), 6)) * rv : 0.85;
        if (cur) { const dx = x - mx, dy = y - my; if (dx * dx + dy * dy < R2) b = 1; }
        const lv = Math.min(23, Math.max(0, Math.floor(b * 24)));
        ctx.drawImage(A, this.RI[2][0] * sw, (24 + lv) * sh, sw, sh, x - hw, y - hh, g.cw, g.ch);
        continue;
      }
      if (anim && seiva) { const w = Math.sin(d * 0.006 - t * 1.8); if (w > 0.6) b += Math.pow((w - 0.6) / 0.4, 3) * 0.3 * (0.4 + dn); }
      let scr = false;
      if (cur) { const dx = x - mx, dy = y - my, m2 = dx * dx + dy * dy; if (m2 < R2) { const f = 1 - Math.sqrt(m2) / R; b += f * 0.6; scr = f > 0.15; } }
      const ramp = this.RI[k === 2 ? 1 : 0], L = ramp.length;
      let gi;
      if (scr) gi = Math.floor(Math.random() * L);
      else { const tick = anim ? Math.floor(t * (0.3 + s * 1.2)) : 0; gi = Math.floor(Math.pow(dn, 1.15) * (L - 1) + (this.hash(s * 97.1, tick) - 0.5) * 1.1 + 0.5); }
      if (gi < 0) gi = 0; else if (gi >= L) gi = L - 1;
      const lv = Math.min(23, Math.max(0, Math.floor(b * 24)));
      ctx.drawImage(A, ramp[gi] * sw, lv * sh, sw, sh, x - hw, y - hh, g.cw, g.ch);
    }
  }


}
