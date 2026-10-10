import * as THREE from "three";

// Geometry, camera and shader values ported from references/claude-design/pillars3d.js.
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


function material(extra: THREE.MeshStandardMaterialParameters = {}) {
 return new THREE.MeshStandardMaterial({ name: "branco", color: 0xffffff, roughness: 0.42, metalness: 0.16, ...extra });
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

function camadas() {
  const grp = new THREE.Group(), N = 4, slabs: THREE.Mesh[] = [];
  const s = new THREE.Shape(), w = 1.5, d = 1.5, r = 0.16;
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12 });
  geo.rotateX(-Math.PI / 2); geo.center();
  for (let i = 0; i < N; i++) { const m = new THREE.Mesh(geo, material()); m.name = 'camada-' + (i + 1); m.scale.setScalar(1 - i * 0.07); grp.add(m); slabs.push(m); }
  const place = (gap: number) => slabs.forEach((m, i) => { m.position.y = 0.62 - i * (0.22 + gap); });
  place(0.2);
  grp.userData.tilt = 0.5; grp.userData.fill = 1.0; grp.position.y = 0.05;
  grp.userData.tick = (t: number) => place(0.16 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.9)));
  return grp;
}

function balanca() {
  const grp = new THREE.Group(), mat = material({ metalness: 0.3, roughness: 0.34 });
  const M = (geo: THREE.BufferGeometry, name: string, x: number, y: number, z = 0) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); return m; };
  grp.add(M(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 40), 'base', 0, -1.0));
  grp.add(M(new THREE.CylinderGeometry(0.11, 0.14, 1.7, 24), 'coluna', 0, -0.12));
  grp.add(M(new THREE.SphereGeometry(0.11, 20, 14), 'topo', 0, 0.78));
  const beam = new THREE.Group(); beam.position.y = 0.66; grp.add(beam);
  beam.add(M(new THREE.BoxGeometry(2.1, 0.13, 0.13), 'travessa', 0, 0));
  const pans: THREE.Group[] = [];
  [-1, 1].forEach(sd => {
    const p = new THREE.Group(); p.position.x = sd * 0.95; beam.add(p);
    [-0.22, 0.22].forEach((dx) => { const c = M(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), 'fio', dx, -0.35); c.rotation.z = -dx * 0.55; p.add(c); });
    p.add(M(new THREE.CylinderGeometry(0.46, 0.3, 0.2, 40), 'prato', 0, -0.76));
    pans.push(p);
  });
  grp.userData = { tilt: 0.12, fill: 1.1, tick: (t: number) => { const a = Math.sin(t * 0.9) * 0.12; beam.rotation.z = a; pans.forEach(p => { p.rotation.z = -a; }); } };
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
  grp.userData = { tilt: 0.05, fill: 1.2, spin: 0, tick: (t: number) => { iris.position.x = Math.sin(t * 0.7) * 0.32; iris.position.y = Math.sin(t * 0.43) * 0.06; grp.rotation.y = Math.sin(t * 0.35) * 0.35; } };
  return grp;
}

function engrenagem() {
  const s = new THREE.Shape(), T = 10, Ro = 1.0, Ri = 0.8, miss = new Set([3, 7]);
  for (let i = 0; i < T; i++) {
    const a0 = (i / T) * Math.PI * 2, a1 = a0 + Math.PI * 2 / T, ta = a0 + (a1 - a0) * 0.22, tb = a0 + (a1 - a0) * 0.62;
    const ro = miss.has(i) ? Ri : (i === 5 ? Ro * 0.9 : Ro);
    const P = (a: number, r: number) => [Math.cos(a) * r, Math.sin(a) * r];
    const pts = [P(a0, Ri), P(ta, Ri), P(ta + 0.04, ro), P(tb - 0.04, ro), P(tb, Ri)];
    pts.forEach(([x, y], k) => (i === 0 && k === 0) ? s.moveTo(x, y) : s.lineTo(x, y));
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24 }); geo.center();
  const m = new THREE.Mesh(geo, material({ metalness: 0.32, roughness: 0.4 })); m.name = 'engrenagem';
  const grp = new THREE.Group(); grp.add(m);
  grp.userData = { tilt: 0.25, fill: 1.1, spin: 0, tick: (t: number) => { m.rotation.z = t * 0.35; grp.rotation.y = -0.45 + Math.sin(t * 0.3) * 0.2; } };
  return grp;
}

function nuvem() {
  const grp = new THREE.Group(), mat = material();
  [[-0.62, -0.05, 0.42], [-0.15, 0.22, 0.56], [0.42, 0.08, 0.48], [0.05, -0.12, 0.5], [0.8, -0.14, 0.32]].forEach(([x, y, r], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), mat); m.name = 'nuvem-' + i; m.position.set(x, y, 0); m.scale.z = 0.7; grp.add(m); });
  const arrow = new THREE.Group(), am = material({ metalness: 0.3 });
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 16), am); sh.name = 'seta-haste'; arrow.add(sh);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 24), am); hd.name = 'seta-ponta'; hd.position.y = 0.42; arrow.add(hd);
  arrow.position.set(0.05, -0.55, 0.48); grp.add(arrow);
  grp.userData = { tilt: 0.08, fill: 1.1, spin: 0, tick: (t: number) => { const u = (t * 0.35) % 1; arrow.position.y = -0.7 + u * 0.55; grp.rotation.y = Math.sin(t * 0.4) * 0.4; } };
  grp.position.y = 0.12;
  return grp;
}

function chave() {
  const grp = new THREE.Group(), body = new THREE.Group(), mat = material({ metalness: 0.32, roughness: 0.34 });
  const M = (geo: THREE.BufferGeometry, name: string, x: number, y: number, z = 0) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); body.add(m); return m; };
  M(new THREE.TorusGeometry(0.42, 0.16, 20, 56), 'cabeca', -0.78, 0);
  M(new THREE.CylinderGeometry(0.1, 0.1, 1.55, 24), 'haste', 0.3, 0).rotation.z = Math.PI / 2;
  M(new THREE.BoxGeometry(0.14, 0.34, 0.16), 'dente-1', 0.72, -0.2);
  M(new THREE.BoxGeometry(0.14, 0.22, 0.16), 'dente-2', 0.96, -0.14);
  M(new THREE.BoxGeometry(0.1, 0.26, 0.16), 'ponta', 1.04, 0);
  M(new THREE.TorusGeometry(0.12, 0.05, 12, 28), 'anel', -0.25, 0).rotation.y = Math.PI / 2;
  body.rotation.z = 0.5; grp.add(body);
  grp.userData = { tilt: 0.1, fill: 1.1, spin: 0, tick: (t: number) => { body.rotation.x = t * 0.6; grp.rotation.y = Math.sin(t * 0.35) * 0.3; } };
  grp.scale.setScalar(1.1);
  return grp;
}

function servidores() {
  const grp = new THREE.Group(), leds: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = [];
  const s = new THREE.Shape(), w = 1.9, d = 0.42, r = 0.08;
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 }); geo.center();
  for (let i = 0; i < 3; i++) {
    const y = 0.6 - i * 0.58;
    const m = new THREE.Mesh(geo, material()); m.name = 'servidor-' + (i + 1); m.position.y = y; grp.add(m);
    for (let k = 0; k < 4; k++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.02), material()); sl.name = 'grade'; sl.position.set(-0.4, y + 0.09 - k * 0.06, 0.64); grp.add(sl); }
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), material({ emissive: 0xffffff, emissiveIntensity: 0 })); l.name = 'led'; l.position.set(0.66, y, 0.63); grp.add(l); leds.push(l);
  }
  grp.userData = { tilt: 0.32, fill: 1.1, spin: 0, tick: (t: number) => { grp.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.25; leds.forEach((l, i) => { l.material.emissiveIntensity = (Math.sin(t * 3 + i * 2.1) > 0.3) ? 1 : 0; }); } };
  return grp;
}

function modulos() {
  const grp = new THREE.Group(), geo = new THREE.BoxGeometry(0.5, 0.5, 0.5), cubes: THREE.Mesh[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const m = new THREE.Mesh(geo, material()); m.name = 'modulo'; m.position.set(x * 0.56, y * 0.56, z * 0.56); grp.add(m); cubes.push(m);
  }
  const mover = cubes.find(c => c.position.x > 0 && c.position.y > 0 && c.position.z > 0);
  if (!mover) throw new Error("Missing moving module.");
  grp.userData = { tilt: 0.42, fill: 1.0, spin: 0.22, tick: (t: number) => { const u = Math.max(0, Math.sin(t * 0.9)); mover.position.y = 0.56 + u * 0.5; mover.rotation.y = u * Math.PI / 2; } };
  grp.scale.setScalar(0.95);
  return grp;
}

export const BUILD = { diamante: diamond, cadeado: padlock, camadas, balanca, olho, engrenagem, nuvem, chave, servidores, modulos };
export type PillarKind = keyof typeof BUILD;
export { VERT, FRAG };
