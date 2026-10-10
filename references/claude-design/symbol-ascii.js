// Motor ASCII do símbolo Raiz — extraído da Home (build/draw), restrito ao símbolo.
// Grade Grossa, animação, seiva, sinal e cursor sempre ativos; estático com movimento reduzido.
const STROKE = '.·:;+*x#▪', THREAD = '.·:+';
const lerp = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
const ramp = (stops, f) => { for (let i = 1; i < stops.length; i++) if (f <= stops[i][0]) return lerp(stops[i - 1][1], stops[i][1], (f - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1]; };
const GS = [[0, [20, 38, 32]], [0.2, [0, 52, 40]], [0.42, [23, 91, 75]], [0.6, [76, 107, 88]], [0.82, [98, 175, 150]], [1, [204, 233, 220]]];
const SG = [[0, [0, 52, 40]], [0.5, [0, 150, 45]], [0.8, [0, 214, 61]], [1, [150, 250, 180]]];
const COLORS = [];
for (let l = 0; l < 24; l++) COLORS.push('rgb(' + ramp(GS, l / 23).join(',') + ')');
for (let l = 0; l < 24; l++) COLORS.push('rgb(' + ramp(SG, l / 23).join(',') + ')');
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

export function mountSymbol(host) {
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;display:block;pointer-events:none;';
  host.style.position = 'relative'; host.appendChild(cv);
  const mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = !!(mq && mq.matches), g = null, raf = 0, visible = true, t0 = 0, last = 0, lastKey = '', cx = -1e5, cy = -1e5, ro = null, io = null, rt = 0, disposed = false;

  function build() {
    const r = host.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
    if (W < 40 || H < 40) return;
    const cw = 7, ch = 10, fs = 10, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), N = cols * rows;
    let seed = 2026;
    const rand = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const val = new Float32Array(N), hgt = new Float32Array(N).fill(-1), kind = new Uint8Array(N), dist = new Float32Array(N);
    const STK = 1, SIG = 3;
    const hs = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7 + 7.3) * 43758.5453; return v - Math.floor(v); };
    const vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), a = hs(i, j), b = hs(i + 1, j), c = hs(i, j + 1), d = hs(i + 1, j + 1); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; };
    const Lx = -0.55, Ly = -0.83;
    const put = (id, h, v, k, d) => { if (h > hgt[id]) { hgt[id] = h; val[id] = v; kind[id] = k; dist[id] = d; } };
    const disc = (x, y, rr, k, v, d, nx, ny, z0) => {
      const rx = Math.max(rr, cw * 0.55), ry = Math.max(rr, ch * 0.55), thin = rr < 3.2, nl = nx * Lx + ny * Ly;
      const i0 = Math.max(0, Math.floor((x - rx) / cw)), i1 = Math.min(cols - 1, Math.floor((x + rx) / cw)), j0 = Math.max(0, Math.floor((y - ry) / ch)), j1 = Math.min(rows - 1, Math.floor((y + ry) / ch));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px0 = (i + 0.5) * cw, py0 = (j + 0.5) * ch, px = px0 - x, py = py0 - y, qx = px / rx, qy = py / ry, q = qx * qx + qy * qy;
        if (q > 1) continue;
        const z = Math.sqrt(1 - q), id = j * cols + i, h = z0 + rr * z;
        if (h <= hgt[id]) continue;
        let s;
        if (thin) s = v * (0.42 + 0.3 * z) * (0.7 + 0.5 * vn(px0 * 0.05, py0 * 0.05));
        else {
          const p = px * nx + py * ny, u = p / rr, lam = Math.min(1, Math.max(0, z * 0.5 + u * nl * 0.75 + 0.2)), nz = vn(px0 * 0.035, py0 * 0.035);
          s = v * (0.3 + 0.7 * lam) * (0.8 + 0.2 * Math.sin(p * 0.35 + nz * 4)) * (0.85 + 0.3 * nz);
        }
        put(id, h, s, k, d);
      }
    };
    const seg = (ax, ay, bx, by, w, k, v, d0, z0) => {
      const L = Math.hypot(bx - ax, by - ay) || 1, n = Math.max(1, Math.ceil(L / 2)), nx = -(by - ay) / L, ny = (bx - ax) / L;
      for (let i = 0; i <= n; i++) { const t = i / n; disc(ax + (bx - ax) * t, ay + (by - ay) * t, w / 2, k, v, d0 + L * t, nx, ny, z0); }
      return d0 + L;
    };
    const poly = (pts, w, k, v, d0, z0) => { let d = d0; for (let i = 1; i < pts.length; i++) d = seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w, k, v, d, z0); return d; };
    const SYM = [[156, 416], [211, 388], [305, 608], [423, 186], [644, 186]];
    const k = W / 566, m = p => [(p[0] - 117) * k, (p[1] - 147) * k], d0 = 200;
    const pts = SYM.map(m), d = poly(pts, 56.7 * k, STK, 1, d0, 20);
    const c = m([536.8, 361.6]); disc(c[0], c[1], 78.4 * k, STK, 1, d + 40, 0, -1, 20);
    const node = pts[4], ni = Math.floor(node[0] / cw), nj = Math.floor(node[1] / ch);
    if (ni >= 0 && nj >= 0 && ni < cols && nj < rows) put(nj * cols + ni, 1e4, 0.9, SIG, d);

    let cnt = 0; for (let id = 0; id < N; id++) if (val[id] > 0.04) cnt++;
    const ci = new Uint16Array(cnt), cj = new Uint16Array(cnt), cd = new Float32Array(cnt), ck = new Uint8Array(cnt), cdi = new Float32Array(cnt), cs = new Float32Array(cnt), rowOff = new Int32Array(rows + 1);
    let p = 0;
    for (let j = 0; j < rows; j++) { rowOff[j] = p; for (let i = 0; i < cols; i++) { const id = j * cols + i; if (val[id] > 0.04) { ci[p] = i; cj[p] = j; cd[p] = Math.min(1, Math.pow(val[id], 0.5) * 1.08); ck[p] = kind[id]; cdi[p] = dist[id]; cs[p] = rand(); p++; } } }
    rowOff[rows] = p;
    const dpr = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const CHS = [...new Set(STROKE + THREAD + '√')];
    const RI = [STROKE, THREAD, '√'].map(s => [...s].map(c => CHS.indexOf(c)));
    const sw = Math.ceil(cw * dpr), sh = Math.ceil(ch * dpr), A = document.createElement('canvas');
    A.width = sw * CHS.length; A.height = sh * COLORS.length;
    const ax = A.getContext('2d'); ax.textAlign = 'center'; ax.textBaseline = 'middle';
    COLORS.forEach((col, r) => { ax.fillStyle = col; CHS.forEach((chr, kk) => { ax.font = ((chr === '√' ? fs * 1.45 : fs) * dpr) + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; ax.fillText(chr, kk * sw + sw / 2, r * sh + sh / 2); }); });
    g = { W, H, dpr, cw, ch, rows, ci, cj, cd, ck, cdi, cs, rowOff, ctx: cv.getContext('2d'), A, sw, sh, RI };
    lastKey = ''; last = 0; if (!t0) t0 = performance.now();
    draw(performance.now());
  }

  function draw(now) {
    if (!g) return;
    const anim = !reduce && !document.hidden;
    if (anim && now - last < 33) return;
    const r = host.getBoundingClientRect(), mx = cx - r.left, my = cy - r.top;
    if (!anim) { const key = Math.round(mx) + ':' + Math.round(my) + ':' + (reduce ? 1 : 0); if (key === lastKey) return; lastKey = key; }
    last = now;
    const t = anim ? (now - t0) / 1000 : 0, ctx = g.ctx;
    ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0); ctx.clearRect(0, 0, g.W, g.H);
    const A = g.A, sw = g.sw, sh = g.sh, hw = g.cw / 2, hh = g.ch / 2, R = 110, R2 = R * R, cur = !reduce;
    for (let p = g.rowOff[0], pe = g.rowOff[g.rows]; p < pe; p++) {
      const d = g.cdi[p]; let rv = 1;
      if (anim) { rv = (t - d / 1100) / 0.6; if (rv <= 0) continue; if (rv > 1) rv = 1; }
      const k = g.ck[p], s = g.cs[p], x = (g.ci[p] + 0.5) * g.cw, y = (g.cj[p] + 0.5) * g.ch, dn = g.cd[p] * rv;
      let b = dn;
      if (k === 3) {
        b = anim ? (0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 1.1 + s * 37)), 6)) * rv : 0.85;
        if (cur) { const dx = x - mx, dy = y - my; if (dx * dx + dy * dy < R2) b = 1; }
        ctx.drawImage(A, g.RI[2][0] * sw, (24 + Math.min(23, Math.max(0, Math.floor(b * 24)))) * sh, sw, sh, x - hw, y - hh, g.cw, g.ch);
        continue;
      }
      if (anim) { const w = Math.sin(d * 0.006 - t * 1.8); if (w > 0.6) b += Math.pow((w - 0.6) / 0.4, 3) * 0.3 * (0.4 + dn); }
      let scr = false;
      if (cur) { const dx = x - mx, dy = y - my, m2 = dx * dx + dy * dy; if (m2 < R2) { const f = 1 - Math.sqrt(m2) / R; b += f * 0.6; scr = f > 0.15; } }
      const ramp = g.RI[0], L = ramp.length; let gi;
      if (scr) gi = Math.floor(Math.random() * L);
      else { const tick = anim ? Math.floor(t * (0.3 + s * 1.2)) : 0; gi = Math.floor(Math.pow(dn, 1.15) * (L - 1) + (hash(s * 97.1, tick) - 0.5) * 1.1 + 0.5); }
      gi = gi < 0 ? 0 : gi >= L ? L - 1 : gi;
      ctx.drawImage(A, ramp[gi] * sw, Math.min(23, Math.max(0, Math.floor(b * 24))) * sh, sw, sh, x - hw, y - hh, g.cw, g.ch);
    }
  }

  const onMove = e => { cx = e.clientX; cy = e.clientY; };
  const onLeave = () => { cx = cy = -1e5; };
  const onMq = e => { reduce = e.matches; lastKey = ''; last = 0; };
  const loop = now => { raf = requestAnimationFrame(loop); if (visible && !document.hidden) draw(now); };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  if (mq && mq.addEventListener) mq.addEventListener('change', onMq);
  if (window.ResizeObserver) { ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); }); ro.observe(host); }
  if (window.IntersectionObserver) { io = new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !visible || !t0) { t0 = performance.now(); last = 0; } visible = v; if (v && g) { lastKey = ''; draw(performance.now()); } }); io.observe(host); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!disposed) build(); });
  build(); raf = requestAnimationFrame(loop);
  return {
    dispose() { disposed = true; cancelAnimationFrame(raf); clearTimeout(rt); if (ro) ro.disconnect(); if (io) io.disconnect(); window.removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('pointerleave', onLeave); if (mq && mq.removeEventListener) mq.removeEventListener('change', onMq); cv.remove(); }
  };
}
