// Objetos 3D em halftone de linhas (pilares). three.js r184, render → passe halftone.
import * as THREE from 'https://unpkg.com/three@0.184.0/build/three.module.js';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform sampler2D tScene; uniform vec2 res; uniform float cell; uniform vec3 inkA; uniform vec3 inkB; uniform vec3 sinal; uniform float dis;
varying vec2 vUv;
float h(float n){ return fract(sin(n * 91.345) * 47453.21); }
float tone(vec4 s){ float t = clamp((dot(s.rgb, vec3(0.299, 0.587, 0.114)) - 0.5) * 1.25 + 0.5, 0.0, 1.0); return t < 0.02 ? 0.0 : max(t, 0.34); }
void main(){
  vec2 px = vUv * res;
  float r = floor(px.y / cell), cy = (r + 0.5) * cell;
  float cw = cell * 2.2, off = h(r) * cw;
  float cx = (floor((px.x + off) / cw) + 0.5) * cw - off;
  vec4 sp = texture2D(tScene, vec2(px.x, cy) / res);
  if (sp.a < 0.05) { gl_FragColor = vec4(0.0); return; }
  vec4 sc = texture2D(tScene, vec2(clamp(cx, 0.0, res.x), cy) / res);
  float sg = step(0.35, sp.r - sp.g);
  float tc = mix(tone(sc), 0.95, step(0.35, sc.r - sc.g)), tp = mix(tone(sp), 0.95, sg);
  float len = mix(0.14, 1.03, pow(tc, 1.1)) * cw;
  float th = cell * mix(0.24, 0.5, tp);
  float dx = abs(px.x - cx), dy = abs(px.y - cy);
  float a = (1.0 - smoothstep(len * 0.5 - 0.8, len * 0.5 + 0.8, dx)) * (1.0 - smoothstep(th * 0.5 - 0.6, th * 0.5 + 0.6, dy));
  a *= step(0.035, tp);
  if (dis > 0.0) { float hh = h(r * 17.13 + floor((px.x + off) / cw) * 3.71); a *= step(dis, hh * 0.92 + 0.04); }
  vec3 col = mix(mix(inkA, inkB, smoothstep(0.62, 1.0, tp)), sinal, sg);
  gl_FragColor = vec4(col * a, a);
}`;

// Variante ASCII: cada célula vira um caractere escolhido pelo tom da cena.
const FRAG_ASCII = `
precision highp float;
uniform sampler2D tScene; uniform sampler2D tGlyph; uniform vec2 res; uniform float cell; uniform vec3 inkA; uniform vec3 inkB; uniform vec3 sinal; uniform float dis; uniform float gN;
varying vec2 vUv;
float h(float n){ return fract(sin(n * 91.345) * 47453.21); }
void main(){
  vec2 px = vUv * res, cs = vec2(cell * 0.68, cell), ci = floor(px / cs), cc = (ci + 0.5) * cs;
  vec4 s = texture2D(tScene, cc / res);
  if (s.a < 0.08) { gl_FragColor = vec4(0.0); return; }
  float sg = step(0.35, s.r - s.g);
  float t = clamp((dot(s.rgb, vec3(0.299, 0.587, 0.114)) - 0.5) * 1.8 + 0.45, 0.0, 1.0);
  t = mix(t, 0.85, sg);
  if (t < 0.06) { gl_FragColor = vec4(0.0); return; }
  float idx = min(gN - 1.0, floor(t * (gN - 1.0) + 0.5));
  vec2 l = fract(px / cs);
  float g = texture2D(tGlyph, vec2((idx + l.x) / gN, l.y)).r;
  float a = smoothstep(0.1, 0.5, g) * smoothstep(0.08, 0.25, s.a);
  if (dis > 0.0) { float hh = h(ci.y * 17.13 + ci.x * 3.71); a *= step(dis, hh * 0.92 + 0.04); }
  vec3 col = mix(mix(inkA, inkB, smoothstep(0.3, 0.95, t)), sinal, sg);
  gl_FragColor = vec4(col * a, a);
}`;
const GLYPHS = ['.', '-', '+', '*', '×', 'x', '#', '#'];
let GLYPH_TEX = null;
function glyphTex() {
  if (GLYPH_TEX) return GLYPH_TEX;
  const W = 34, H = 50, c = document.createElement('canvas'); c.width = W * GLYPHS.length; c.height = H;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = "700 46px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  GLYPHS.forEach((g, i) => x.fillText(g, i * W + W / 2, H / 2 + 2));
  GLYPH_TEX = new THREE.CanvasTexture(c); GLYPH_TEX.minFilter = THREE.LinearMipmapLinearFilter; GLYPH_TEX.magFilter = THREE.LinearFilter; GLYPH_TEX.generateMipmaps = true;
  return GLYPH_TEX;
}

function material(extra = {}) {
  return new THREE.MeshStandardMaterial({ name: 'branco', color: 0xffffff, roughness: 0.42, metalness: 0.16, ...extra });
}

function diamond() {
  const pts = [[0.001, -1.08], [1.02, 0.16], [1.02, 0.24], [0.6, 0.6], [0.001, 0.6]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 10);
  const m = new THREE.Mesh(g, material({ flatShading: true, emissive: 0x3a3a3a }));
  m.name = 'diamante';
  const grp = new THREE.Group(); grp.add(m); grp.position.y = 0.2; grp.userData.tilt = 0.05; grp.userData.fill = 2.2;
  return grp;
}

function padlock() {
  const grp = new THREE.Group();
  const w = 1.5, hgt = 1.22, rad = 0.22, s = new THREE.Shape();
  s.moveTo(-w / 2 + rad, -hgt / 2); s.lineTo(w / 2 - rad, -hgt / 2); s.quadraticCurveTo(w / 2, -hgt / 2, w / 2, -hgt / 2 + rad);
  s.lineTo(w / 2, hgt / 2 - rad); s.quadraticCurveTo(w / 2, hgt / 2, w / 2 - rad, hgt / 2); s.lineTo(-w / 2 + rad, hgt / 2);
  s.quadraticCurveTo(-w / 2, hgt / 2, -w / 2, hgt / 2 - rad); s.lineTo(-w / 2, -hgt / 2 + rad); s.quadraticCurveTo(-w / 2, -hgt / 2, -w / 2 + rad, -hgt / 2);
  const k = new THREE.Path(), a0 = Math.atan2(-0.09, 0.055);
  k.moveTo(-0.075, -0.33); k.lineTo(0.075, -0.33); k.lineTo(0.055, 0.03);
  k.absarc(0, 0.12, 0.13, a0, Math.PI - a0, false); k.lineTo(-0.075, -0.33);
  s.holes.push(k);
  const bg = new THREE.ExtrudeGeometry(s, { depth: 0.46, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 28 });
  bg.translate(0, 0, -0.23);
  const mat = material();
  const body = new THREE.Mesh(bg, mat); body.name = 'corpo'; grp.add(body);
  const sm = material({ metalness: 0.3, roughness: 0.35 }); sm.name = 'haste';
  const R = 0.46, tR = 0.1, legH = 0.36, y0 = hgt / 2 + 0.02;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R, tR, 20, 48, Math.PI), sm); arc.name = 'haste-arco'; arc.position.y = y0 + legH; grp.add(arc);
  [-R, R].forEach((x, i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(tR, tR, legH, 20), sm); c.name = 'haste-' + i; c.position.set(x, y0 + legH / 2, 0); grp.add(c); });
  grp.position.y = -0.32; grp.scale.setScalar(1.05); grp.userData.tilt = 0.12;
  return grp;
}

function iceberg() {
  // linha d'água alta: ponta pequena e irregular, massa submersa larga
  const WL = 0.3;
  const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position, v = new THREE.Vector3();
  const n = (x, y, z) => 0.14 * Math.sin(3.1 * x + 1.3) * Math.sin(2.7 * y + 0.4) * Math.sin(3.3 * z + 2.1) + 0.06 * Math.sin(7.3 * x + 2.2 * z + 0.7) * Math.sin(6.1 * y - 1.1);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let { x, y, z } = v; const f = 1 + n(x, y, z);
    x *= f; y *= f; z *= f;
    if (y > WL) {
      const u = (y - WL) / (1 - WL);
      const pk = 0.7 * Math.exp(-((x - 0.25) ** 2 + z * z) * 6) + 0.42 * Math.exp(-((x + 0.35) ** 2 + (z - 0.1) ** 2) * 8);
      x = x * (1 - 0.15 * u) + 0.06; z *= 1 - 0.12 * u;
      y = WL + (y - WL) * 0.45 + pk * u;
    } else { y = WL + (y - WL) * 1.05; x *= 1.32; z *= 1.22; }
    p.setXYZ(i, x * 0.74, y * 0.9 - 0.2, z * 0.74);
  }
  g.computeVertexNormals();
  const m = material({ flatShading: true, emissive: 0x2a2a2a }); m.name = 'gelo';
  m.onBeforeCompile = sh => {
    sh.uniforms.wl = { value: WL * 0.9 - 0.2 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = position.y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vY; uniform float wl;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nif (abs(vY - wl) < 0.03) gl_FragColor.rgb *= 0.0; else if (vY < wl) gl_FragColor.rgb = gl_FragColor.rgb * 0.8 + 0.12;');
  };
  const mesh = new THREE.Mesh(g, m); mesh.name = 'iceberg';
  const grp = new THREE.Group(); grp.add(mesh); grp.position.y = -0.05; grp.userData.tilt = 0.18; grp.userData.fill = 0.8;
  return grp;
}

// Profundidade · candidatos
function prumo() {
  const grp = new THREE.Group(), hang = new THREE.Group();
  const mat = material({ metalness: 0.3, roughness: 0.32 });
  const pts = [[0.001, 0.62], [0.16, 0.62], [0.16, 0.5], [0.42, 0.34], [0.5, 0.12], [0.44, -0.18], [0.001, -1.0]].map(([x, y]) => new THREE.Vector2(x, y));
  const bob = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mat); bob.name = 'prumo';
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 12, 32), mat); ring.name = 'argola'; ring.position.y = 0.74;
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 10), material()); line.name = 'linha'; line.position.y = 0.85 + 0.8;
  hang.add(bob, ring, line); hang.position.y = -1.75;
  const top = new THREE.Group(); top.add(hang); top.position.y = 1.55; grp.add(top);
  grp.userData.tilt = 0.08; grp.userData.fill = 1.2; grp.scale.setScalar(1.25); grp.position.y = 0.25;
  grp.userData.tick = t => { top.rotation.z = Math.sin(t * 1.1) * 0.12; };
  return grp;
}
function ancora() {
  const grp = new THREE.Group(), mat = material({ metalness: 0.28, roughness: 0.36 });
  const add = (geo, name, x, y, z = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.rotation.z = rz; grp.add(m); return m; };
  add(new THREE.CylinderGeometry(0.075, 0.075, 1.7, 24), 'haste', 0, 0.05);
  add(new THREE.TorusGeometry(0.17, 0.055, 14, 40), 'argola', 0, 1.07);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 20), 'cepo', 0, 0.66, 0, Math.PI / 2);
  const arc = add(new THREE.TorusGeometry(0.72, 0.07, 16, 64, Math.PI), 'braco', 0, -0.08); arc.rotation.z = Math.PI;
  [-1, 1].forEach(sd => { const c = add(new THREE.ConeGeometry(0.15, 0.34, 4), 'unha-' + (sd > 0 ? 'd' : 'e'), sd * 0.72, 0.02, 0, sd * 0.55); c.rotation.y = Math.PI / 4; });
  add(new THREE.SphereGeometry(0.1, 20, 14), 'coroa', 0, -0.8);
  grp.position.y = -0.12; grp.userData.tilt = 0.06; grp.userData.fill = 1.1;
  return grp;
}
function camadas() {
  const grp = new THREE.Group(), N = 4, slabs = [];
  const s = new THREE.Shape(), w = 1.5, d = 1.5, r = 0.16;
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12 });
  geo.rotateX(-Math.PI / 2); geo.center();
  for (let i = 0; i < N; i++) { const m = new THREE.Mesh(geo, material()); m.name = 'camada-' + (i + 1); m.scale.setScalar(1 - i * 0.07); grp.add(m); slabs.push(m); }
  const place = gap => slabs.forEach((m, i) => { m.position.y = 0.62 - i * (0.22 + gap); });
  place(0.2);
  grp.userData.tilt = 0.5; grp.userData.fill = 1.0; grp.position.y = 0.05;
  grp.userData.tick = t => place(0.16 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.9)));
  return grp;
}

// Ferramentas
function balanca() {
  const grp = new THREE.Group(), mat = material({ metalness: 0.3, roughness: 0.34 });
  const M = (geo, name, x, y, z = 0) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); return m; };
  grp.add(M(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 40), 'base', 0, -1.0));
  grp.add(M(new THREE.CylinderGeometry(0.11, 0.14, 1.7, 24), 'coluna', 0, -0.12));
  grp.add(M(new THREE.SphereGeometry(0.11, 20, 14), 'topo', 0, 0.78));
  const beam = new THREE.Group(); beam.position.y = 0.66; grp.add(beam);
  beam.add(M(new THREE.BoxGeometry(2.1, 0.13, 0.13), 'travessa', 0, 0));
  const pans = [];
  [-1, 1].forEach(sd => {
    const p = new THREE.Group(); p.position.x = sd * 0.95; beam.add(p);
    [-0.22, 0.22].forEach((dx, i) => { const c = M(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), 'fio', dx, -0.35); c.rotation.z = -dx * 0.55; p.add(c); });
    p.add(M(new THREE.CylinderGeometry(0.46, 0.3, 0.2, 40), 'prato', 0, -0.76));
    pans.push(p);
  });
  grp.userData = { tilt: 0.12, fill: 1.1, tick: t => { const a = Math.sin(t * 0.9) * 0.12; beam.rotation.z = a; pans.forEach(p => { p.rotation.z = -a; }); } };
  grp.position.y = 0.08;
  return grp;
}
function olho() {
  const grp = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-1.15, 0); s.quadraticCurveTo(0, 1.05, 1.15, 0); s.quadraticCurveTo(0, -1.05, -1.15, 0);
  const h = new THREE.Path(); h.moveTo(-0.95, 0); h.quadraticCurveTo(0, 0.82, 0.95, 0); h.quadraticCurveTo(0, -0.82, -0.95, 0); s.holes.push(h);
  const lid = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 32 }), material()); lid.name = 'palpebra'; lid.geometry.center(); grp.add(lid);
  const iris = new THREE.Group(); grp.add(iris);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 16, 48), material()); ring.name = 'iris'; iris.add(ring);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 20), material({ metalness: 0.3 })); pupil.name = 'pupila'; pupil.position.z = 0.05; iris.add(pupil);
  grp.userData = { tilt: 0.05, fill: 1.2, spin: 0, tick: t => { iris.position.x = Math.sin(t * 0.7) * 0.32; iris.position.y = Math.sin(t * 0.43) * 0.06; grp.rotation.y = Math.sin(t * 0.35) * 0.35; } };
  return grp;
}
function engrenagem() {
  const s = new THREE.Shape(), T = 10, Ro = 1.0, Ri = 0.8, miss = new Set([3, 7]);
  for (let i = 0; i < T; i++) {
    const a0 = (i / T) * Math.PI * 2, a1 = a0 + Math.PI * 2 / T, ta = a0 + (a1 - a0) * 0.22, tb = a0 + (a1 - a0) * 0.62;
    const ro = miss.has(i) ? Ri : (i === 5 ? Ro * 0.9 : Ro);
    const P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
    const pts = [P(a0, Ri), P(ta, Ri), P(ta + 0.04, ro), P(tb - 0.04, ro), P(tb, Ri)];
    pts.forEach(([x, y], k) => (i === 0 && k === 0) ? s.moveTo(x, y) : s.lineTo(x, y));
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24 }); geo.center();
  const m = new THREE.Mesh(geo, material({ metalness: 0.32, roughness: 0.4 })); m.name = 'engrenagem';
  const grp = new THREE.Group(); grp.add(m);
  grp.userData = { tilt: 0.25, fill: 1.1, spin: 0, tick: t => { m.rotation.z = t * 0.35; grp.rotation.y = -0.45 + Math.sin(t * 0.3) * 0.2; } };
  return grp;
}
function nuvem() {
  const grp = new THREE.Group(), mat = material();
  [[-0.62, -0.05, 0.42], [-0.15, 0.22, 0.56], [0.42, 0.08, 0.48], [0.05, -0.12, 0.5], [0.8, -0.14, 0.32]].forEach(([x, y, r], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), mat); m.name = 'nuvem-' + i; m.position.set(x, y, 0); m.scale.z = 0.7; grp.add(m); });
  const arrow = new THREE.Group(), am = material({ metalness: 0.3 });
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 16), am); sh.name = 'seta-haste'; arrow.add(sh);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 24), am); hd.name = 'seta-ponta'; hd.position.y = 0.42; arrow.add(hd);
  arrow.position.set(0.05, -0.55, 0.48); grp.add(arrow);
  grp.userData = { tilt: 0.08, fill: 1.1, spin: 0, tick: t => { const u = (t * 0.35) % 1; arrow.position.y = -0.7 + u * 0.55; grp.rotation.y = Math.sin(t * 0.4) * 0.4; } };
  grp.position.y = 0.12;
  return grp;
}

// Serviços
function chave() {
  const grp = new THREE.Group(), body = new THREE.Group(), mat = material({ metalness: 0.32, roughness: 0.34 });
  const M = (geo, name, x, y, z = 0) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); body.add(m); return m; };
  const bow = M(new THREE.TorusGeometry(0.42, 0.16, 20, 56), 'cabeca', -0.78, 0);
  M(new THREE.CylinderGeometry(0.1, 0.1, 1.55, 24), 'haste', 0.3, 0).rotation.z = Math.PI / 2;
  M(new THREE.BoxGeometry(0.14, 0.34, 0.16), 'dente-1', 0.72, -0.2);
  M(new THREE.BoxGeometry(0.14, 0.22, 0.16), 'dente-2', 0.96, -0.14);
  M(new THREE.BoxGeometry(0.1, 0.26, 0.16), 'ponta', 1.04, 0);
  M(new THREE.TorusGeometry(0.12, 0.05, 12, 28), 'anel', -0.25, 0).rotation.y = Math.PI / 2;
  body.rotation.z = 0.5; grp.add(body);
  grp.userData = { tilt: 0.1, fill: 1.1, spin: 0, tick: t => { body.rotation.x = t * 0.6; grp.rotation.y = Math.sin(t * 0.35) * 0.3; } };
  grp.scale.setScalar(1.1);
  return grp;
}
function servidores() {
  const grp = new THREE.Group(), leds = [];
  const s = new THREE.Shape(), w = 1.9, d = 0.42, r = 0.08;
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 }); geo.center();
  for (let i = 0; i < 3; i++) {
    const y = 0.6 - i * 0.58;
    const m = new THREE.Mesh(geo, material()); m.name = 'servidor-' + (i + 1); m.position.y = y; grp.add(m);
    for (let k = 0; k < 4; k++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.02), material()); sl.name = 'grade'; sl.position.set(-0.4, y + 0.09 - k * 0.06, 0.64); grp.add(sl); }
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), material({ emissive: 0xffffff, emissiveIntensity: 0 })); l.name = 'led'; l.position.set(0.66, y, 0.63); grp.add(l); leds.push(l);
  }
  grp.userData = { tilt: 0.32, fill: 1.1, spin: 0, tick: t => { grp.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.25; leds.forEach((l, i) => { l.material.emissiveIntensity = (Math.sin(t * 3 + i * 2.1) > 0.3) ? 1 : 0; }); } };
  return grp;
}
function modulos() {
  const grp = new THREE.Group(), geo = new THREE.BoxGeometry(0.5, 0.5, 0.5), cubes = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const m = new THREE.Mesh(geo, material()); m.name = 'modulo'; m.position.set(x * 0.56, y * 0.56, z * 0.56); grp.add(m); cubes.push(m);
  }
  const mover = cubes.find(c => c.position.x > 0 && c.position.y > 0 && c.position.z > 0);
  grp.userData = { tilt: 0.42, fill: 1.0, spin: 0.22, tick: t => { const u = Math.max(0, Math.sin(t * 0.9)); mover.position.y = 0.56 + u * 0.5; mover.rotation.y = u * Math.PI / 2; } };
  grp.scale.setScalar(0.95);
  return grp;
}

// Próximo passo · Símbolo Raiz: o √ se traça e o círculo acende em Sinal
function simbolo() {
  const grp = new THREE.Group(), S = 0.0128, C = [11, 120], Y = new THREE.Vector3(0, 1, 0);
  const V = ([x, y]) => new THREE.Vector3((x - C[0]) * S, -(y - C[1]) * S, 0);
  const P = [[-92, 103.9], [-61.3, 87.7], [-15.3, 211.3], [34.1, 29], [113.5, 29]].map(V);
  const R = 17 * S, mat = material({ metalness: 0.28, roughness: 0.34 });
  const segs = []; let total = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], len = a.distanceTo(b), dir = b.clone().sub(a).normalize();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1, 28, 1, true), mat); m.name = 'raiz-' + (i + 1);
    m.quaternion.setFromUnitVectors(Y, dir); grp.add(m);
    segs.push({ m, a, dir, len, s: total }); total += len;
  }
  const joints = P.map((p, i) => { const j = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 16), mat); j.name = 'no-' + i; j.position.copy(p); grp.add(j); return j; });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(32 * S, 32 * S, 0.2, 48), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  ring.name = 'circulo-sinal'; ring.rotation.x = Math.PI / 2; ring.position.copy(V([80, 96])); grp.add(ring);
  const set = (p, c) => {
    const d = p * total;
    segs.forEach(g => { const l = Math.max(0, Math.min(g.len, d - g.s)); g.m.visible = l > 0.001; g.m.scale.set(1, Math.max(0.001, l), 1); g.m.position.copy(g.a).addScaledVector(g.dir, l / 2); });
    joints.forEach((j, i) => { j.visible = i === 0 ? p > 0 : (segs[i - 1].s + segs[i - 1].len) <= d + 1e-4; });
    if (p > 0 && p < 1) { const tip = segs.find(g => d >= g.s && d <= g.s + g.len); if (tip) { joints[joints.length - 1].visible = true; joints[joints.length - 1].position.copy(tip.a).addScaledVector(tip.dir, d - tip.s); } }
    else joints[joints.length - 1].position.copy(P[P.length - 1]);
    ring.visible = c > 0.001; ring.scale.setScalar(Math.max(0.001, c));
  };
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, out = x => 1 - Math.pow(1 - x, 3), inn = x => x * x * x;
  let cs = -1, lt = -1, st = '', emit = () => {};
  const say = s => { if (s !== st) { st = s; emit(s); } };
  set(0, 0);
  grp.userData = {
    tilt: 0, fill: 1.1, spin: 0,
    bind(o) { emit = o.onState || emit; if (o.reduce) { set(1, 1); say('ok'); } },
    tick: t => {
      if (lt < 0 || t - lt > 0.3) cs = t; lt = t;
      const u = (t - cs) % 6.6;
      grp.rotation.y = Math.sin(t * 0.4) * 0.32; grp.rotation.x = Math.sin(t * 0.3) * 0.06;
      if (u < 0.4) { set(0, 0); say('idle'); }
      else if (u < 1.9) set(ease((u - 0.4) / 1.5), 0);
      else if (u < 2.35) { set(1, out((u - 1.9) / 0.45)); if (u > 2.0) say('ok'); }
      else if (u < 5.8) set(1, 1);
      else { const k = inn(Math.min(1, (u - 5.8) / 0.6)); set(1 - k, 1 - k); say('idle'); }
    }
  };
  return grp;
}

const BUILD = { diamante: diamond, cadeado: padlock, iceberg, prumo, ancora, camadas, balanca, olho, engrenagem, nuvem, chave, servidores, modulos, simbolo };

// Um único contexto WebGL para a página toda; cada objeto copia seu quadro para um canvas 2D próprio.
let SH = null;
function shared() {
  if (SH && !SH.getContext().isContextLost()) return SH;
  try { SH = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true }); } catch (e) { SH = null; return null; }
  SH.setPixelRatio(1); SH.setClearColor(0x000000, 0); SH.outputColorSpace = THREE.SRGBColorSpace; SH.setSize(2, 2, false);
  SH.domElement.addEventListener('webglcontextlost', e => e.preventDefault());
  return SH;
}

export function mountPillar(el, kind, opts = {}) {
  const reduce = !!opts.reduce;
  const renderer = shared(); if (!renderer) return { dispose() {}, swap() {} };
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = document.createElement('canvas'), c2 = cv.getContext('2d');
  cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab;';
  if (opts.interactive === false) cv.style.pointerEvents = 'none';
  el.appendChild(cv);

  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  cam.position.set(0, 0.15, 5.4); cam.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2.2, 2.4, 3.2); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.9); fill.position.set(-3, -1, 2); scene.add(fill);
  let obj = (BUILD[kind] || diamond)(); const pivot = new THREE.Group(); pivot.add(obj); scene.add(pivot);
  const front = new THREE.DirectionalLight(0xffffff, obj.userData.fill ?? 0.5); front.position.set(0.6, -1.2, 4); scene.add(front);

  const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const hm = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: opts.ascii ? FRAG_ASCII : FRAG, transparent: true, depthTest: false,
    uniforms: { tScene: { value: rt.texture }, res: { value: new THREE.Vector2(2, 2) }, cell: { value: 4 * dpr }, inkA: { value: new THREE.Color(opts.inkA || '#62AF96') }, inkB: { value: new THREE.Color(opts.inkB || '#CCE9DC') }, sinal: { value: new THREE.Color().setRGB(0, 214 / 255, 61 / 255) }, dis: { value: 0 }, tGlyph: { value: opts.ascii ? glyphTex() : null }, gN: { value: GLYPHS.length } }
  });
  if (opts.inkRaw) { hm.uniforms.inkA.value.setStyle(opts.inkA, THREE.LinearSRGBColorSpace); hm.uniforms.inkB.value.setStyle(opts.inkB, THREE.LinearSRGBColorSpace); }
  else { hm.uniforms.inkA.value.convertSRGBToLinear(); hm.uniforms.inkB.value.convertSRGBToLinear(); }
  if (obj.userData.bind) obj.userData.bind(opts);
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hm));

  let pw = 2, ph = 2;
  const size = () => {
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    pw = Math.round(w * dpr); ph = Math.round(h * dpr); cv.width = pw; cv.height = ph; rt.setSize(pw, ph);
    hm.uniforms.res.value.set(pw, ph);
    hm.uniforms.cell.value = (opts.ascii ? Math.max(15, h / 24) : Math.max(3.4, h / 62)) * dpr;
    cam.aspect = w / h; cam.updateProjectionMatrix();
  };
  size();
  const ro = new ResizeObserver(size); ro.observe(el);

  // interação: arrastar com retorno em mola + luz segue o cursor
  let drag = { x: 0, y: 0, vx: 0, vy: 0, on: false, lx: 0, ly: 0 }, lt = { x: 0.5, y: 0.35 }, lc = { x: 0.5, y: 0.35 };
  const down = e => { drag.on = true; drag.lx = e.clientX; drag.ly = e.clientY; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; };
  const move = e => {
    const r = el.getBoundingClientRect();
    lt.x = Math.min(1.5, Math.max(-0.5, (e.clientX - r.left) / r.width)); lt.y = Math.min(1.5, Math.max(-0.5, (e.clientY - r.top) / r.height));
    if (!drag.on) return;
    drag.vx = (e.clientX - drag.lx) * 0.012; drag.vy = (e.clientY - drag.ly) * 0.008;
    drag.x += drag.vx; drag.y = Math.max(-0.6, Math.min(0.6, drag.y + drag.vy)); drag.lx = e.clientX; drag.ly = e.clientY;
  };
  const up = () => { drag.on = false; cv.style.cursor = 'grab'; };
  cv.addEventListener('pointerdown', down); window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerup', up);

  let vis = true, raf = 0, t0 = performance.now(), auto = 0, last = t0;
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '120px' });
  io.observe(el);
  let spin = obj.userData.spin ?? (kind === 'cadeado' ? 0 : 0.28);
  // troca: dissolve em halftone → reconstrói → forma (ease-out)
  let sw = null;
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const rebuild = k => {
    pivot.remove(obj); obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    kind = k; obj = (BUILD[k] || diamond)(); pivot.add(obj); front.intensity = obj.userData.fill ?? 0.5;
    spin = obj.userData.spin ?? 0.28; auto = 0;
  };
  function frame(now) {
    raf = 0;
    if (Math.round(el.clientWidth * dpr) !== pw || Math.round(el.clientHeight * dpr) !== ph) size();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    if (sw) {
      const u = Math.min(1, (now - sw.t) / sw.d);
      if (sw.ph === 0) { hm.uniforms.dis.value = easeOut(u); if (u >= 1) { rebuild(sw.k); sw = { ...sw, ph: 1, t: now }; } }
      else { hm.uniforms.dis.value = 1 - easeOut(u); if (u >= 1) { hm.uniforms.dis.value = 0; const nx = sw.next; sw = null; if (nx && nx !== kind) startSwap(nx); } }
    }
    if (!reduce) auto += spin * dt;
    if (!drag.on) { drag.vx += -drag.x * 0.1; drag.vy += -drag.y * 0.1; drag.vx *= 0.82; drag.vy *= 0.82; drag.x += drag.vx; drag.y += drag.vy; }
    const sway = reduce ? 0 : (kind === 'cadeado' ? Math.sin(t * 0.45) * 0.55 : 0);
    pivot.rotation.set((obj.userData.tilt || 0) + drag.y, auto + sway + drag.x, 0);
    if (!reduce) obj.scale.setScalar((obj.userData.s0 ??= obj.scale.x) * (1 + Math.sin(t * 0.8) * 0.015));
    if (!reduce && obj.userData.tick) obj.userData.tick(t);
    lc.x += (lt.x - lc.x) * 0.08; lc.y += (lt.y - lc.y) * 0.08;
    key.position.set((lc.x - 0.5) * 7, (0.5 - lc.y) * 5 + 1.2, 3.2);
    const sc = renderer.domElement;
    if (sc.width < pw || sc.height < ph) renderer.setSize(Math.max(sc.width, pw), Math.max(sc.height, ph), false);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null); renderer.setViewport(0, 0, pw, ph); renderer.clear(); renderer.render(quadScene, quadCam);
    c2.clearRect(0, 0, pw, ph); c2.drawImage(sc, 0, sc.height - ph, pw, ph, 0, 0, pw, ph);
    if (vis) raf = requestAnimationFrame(frame);
  }
  frame(performance.now());
  const hid = setInterval(() => { if (document.hidden) { cancelAnimationFrame(raf); frame(performance.now()); } }, 120);

  function startSwap(k) { sw = { k, ph: 0, t: performance.now(), d: 200 }; if (!raf) raf = requestAnimationFrame(frame); }
  return {
    swap(k) {
      if (reduce) { sw = null; hm.uniforms.dis.value = 0; if (k !== kind) rebuild(k); if (!raf) frame(performance.now()); return; }
      if (sw) { if (sw.ph === 0) sw.k = k; else sw.next = k; return; }
      if (k !== kind) startSwap(k);
    },
    dispose() {
      cancelAnimationFrame(raf); clearInterval(hid); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      hm.dispose(); rt.dispose(); cv.remove();
    }
  };
}
