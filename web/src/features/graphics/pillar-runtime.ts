import * as THREE from "three";
import { BUILD, FRAG, VERT, type PillarKind } from "./pillar-scene";
import { createAnimation, type Animation, type MotionGate } from "./animation";

export function disposeScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse(object => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
}

let shared: { renderer: THREE.WebGLRenderer; failures: Set<() => void>; lost: (event: Event) => void } | null = null;
function acquireRenderer(onFailure: () => void) {
  if (!shared) {
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    try {
      renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setSize(2, 2, false);
    } catch (error) {
      renderer.dispose(); renderer.forceContextLoss(); throw error;
    }
    const failures = new Set<() => void>();
    const lost = (event: Event) => { event.preventDefault(); [...failures].forEach(fail => fail()); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    renderer.debug.onShaderError = () => [...failures].forEach(fail => fail());
    shared = { renderer, failures, lost };
  }
  const owned = shared;
  owned.failures.add(onFailure);
  let released = false;
  return {
    renderer: owned.renderer,
    release() {
      if (released) return;
      released = true; owned.failures.delete(onFailure);
      if (!owned.failures.size) {
        owned.renderer.domElement.removeEventListener("webglcontextlost", owned.lost);
        owned.renderer.dispose(); owned.renderer.forceContextLoss();
        if (shared === owned) shared = null;
      }
    },
  };
}

export function mountPillar(host: HTMLElement, canvas: HTMLCanvasElement, initialKind: PillarKind, interactive: boolean, onFailure: () => void, onFirstFrame?: () => void) {
  const scene = new THREE.Scene(), quadScene = new THREE.Scene();
  let lease: ReturnType<typeof acquireRenderer> | undefined;
  let target: THREE.WebGLRenderTarget | undefined, animation: Animation | undefined;
  let observer: ResizeObserver | undefined, intersection: IntersectionObserver | undefined;
  let disposed = false, firstFrame = onFirstFrame;
  let swap: { next: PillarKind; phase: 0 | 1; elapsed: number; queued?: PillarKind } | null = null;
  const dispose = () => {
    if (disposed) return;
    disposed = true; firstFrame = undefined; allowed = false; swap = null; drag.on = false;
    animation?.dispose(); observer?.disconnect(); intersection?.disconnect();
    canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointercancel", up);
    canvas.removeEventListener("lostpointercapture", up); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
    canvas.removeEventListener("contextlost", fail);
    disposeScene(scene); disposeScene(quadScene); target?.dispose(); lease?.release();
  };
  const fail = () => { dispose(); onFailure(); };
  let allowed = false;
  const drag = { x: 0, y: 0, vx: 0, vy: 0, on: false, lx: 0, ly: 0 };
  const lightTarget = { x: .5, y: .35 }, light = { ...lightTarget };
  function down(event: PointerEvent) {
    if (!allowed || !interactive) return;
    drag.on = true; drag.lx = event.clientX; drag.ly = event.clientY;
    canvas.setPointerCapture(event.pointerId); canvas.style.cursor = "grabbing";
  }
  function move(event: PointerEvent) {
    if (!allowed) return;
    const rect = host.getBoundingClientRect();
    lightTarget.x = Math.min(1.5, Math.max(-.5, (event.clientX - rect.left) / rect.width));
    lightTarget.y = Math.min(1.5, Math.max(-.5, (event.clientY - rect.top) / rect.height));
    if (!drag.on) return;
    drag.vx = (event.clientX - drag.lx) * .012; drag.vy = (event.clientY - drag.ly) * .008;
    drag.x += drag.vx; drag.y = Math.max(-.6, Math.min(.6, drag.y + drag.vy)); drag.lx = event.clientX; drag.ly = event.clientY;
  }
  function up() { drag.on = false; canvas.style.cursor = allowed && interactive ? "grab" : "default"; }
  try {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D unavailable.");
    lease = acquireRenderer(fail);
    const renderer = lease.renderer;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
    camera.position.set(0, .15, 5.4); camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, .6));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2.2, 2.4, 3.2); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, .9); fill.position.set(-3, -1, 2); scene.add(fill);
    let kind = initialKind, object = BUILD[kind]();
    const pivot = new THREE.Group(); pivot.add(object); scene.add(pivot);
    const front = new THREE.DirectionalLight(0xffffff, object.userData.fill ?? .5); front.position.set(.6, -1.2, 4); scene.add(front);
    target = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true });
    const renderTarget = target;
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false,
      uniforms: { tScene: { value: renderTarget.texture }, res: { value: new THREE.Vector2(2, 2) }, cell: { value: 4 * dpr }, inkA: { value: new THREE.Color("#62AF96").convertSRGBToLinear() }, inkB: { value: new THREE.Color("#CCE9DC").convertSRGBToLinear() }, sinal: { value: new THREE.Color().setRGB(0, 214 / 255, 61 / 255) }, dis: { value: 0 } },
    });
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    let width = 2, height = 2, auto = 0;
    const size = () => {
      if (disposed) return;
      const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      width = Math.round(w * dpr); height = Math.round(h * dpr);
      canvas.width = width; canvas.height = height; renderTarget.setSize(width, height);
      material.uniforms.res.value.set(width, height); material.uniforms.cell.value = Math.max(3.4, h / 62) * dpr;
      camera.aspect = w / h; camera.updateProjectionMatrix(); animation?.invalidate();
    };
    const rebuild = (next: PillarKind) => {
      pivot.remove(object); disposeScene(object); kind = next; object = BUILD[kind](); pivot.add(object);
      front.intensity = object.userData.fill ?? .5; auto = 0;
    };
    animation = createAnimation((time, delta, animated) => {
      try {
        if (swap) {
          swap.elapsed += delta;
          const u = Math.min(1, swap.elapsed / .2), ease = 1 - (1 - u) ** 3;
          material.uniforms.dis.value = swap.phase === 0 ? ease : 1 - ease;
          if (u === 1 && swap.phase === 0) { rebuild(swap.next); swap.phase = 1; swap.elapsed = 0; }
          else if (u === 1) { const next = swap.queued; material.uniforms.dis.value = 0; swap = next && next !== kind ? { next, phase: 0, elapsed: 0 } : null; }
        }
        if (animated) {
          auto += (object.userData.spin ?? (kind === "cadeado" ? 0 : .28)) * delta;
          if (!drag.on) { drag.vx += -drag.x * .1; drag.vy += -drag.y * .1; drag.vx *= .82; drag.vy *= .82; drag.x += drag.vx; drag.y += drag.vy; }
          object.scale.setScalar((object.userData.s0 ??= object.scale.x) * (1 + Math.sin(time * .8) * .015));
          object.userData.tick?.(time);
          light.x += (lightTarget.x - light.x) * .08; light.y += (lightTarget.y - light.y) * .08;
        }
        pivot.rotation.set((object.userData.tilt || 0) + drag.y, auto + (kind === "cadeado" ? Math.sin(time * .45) * .55 : 0) + drag.x, 0);
        key.position.set((light.x - .5) * 7, (.5 - light.y) * 5 + 1.2, 3.2);
        const source = renderer.domElement;
        if (source.width < width || source.height < height) renderer.setSize(Math.max(source.width, width), Math.max(source.height, height), false);
        renderer.setRenderTarget(renderTarget); renderer.clear(); renderer.render(scene, camera);
        if (disposed) return;
        renderer.setRenderTarget(null); renderer.setViewport(0, 0, width, height); renderer.clear(); renderer.render(quadScene, quadCamera);
        if (disposed) return;
        context.clearRect(0, 0, width, height); context.drawImage(source, 0, source.height - height, width, height, 0, 0, width, height);
        const notify = firstFrame; firstFrame = undefined; notify?.();
      } catch { fail(); }
    });
    size();
    observer = new ResizeObserver(size); observer.observe(host);
    intersection = new IntersectionObserver(entries => animation?.setIntersecting(entries[0].isIntersecting)); intersection.observe(host);
    canvas.addEventListener("contextlost", fail);
    window.addEventListener("pointermove", move, { passive: true });
    if (interactive) {
      canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointercancel", up); canvas.addEventListener("lostpointercapture", up);
      window.addEventListener("pointerup", up);
    }
    return {
      dispose,
      setGate(gate: MotionGate) {
        if (disposed) return;
        allowed = gate.animated;
        if (!allowed) {
          up();
          if (swap) { rebuild(swap.queued ?? swap.next); swap = null; material.uniforms.dis.value = 0; }
        }
        animation?.setGate(gate);
      },
      swap(next: PillarKind) {
        if (disposed || next === kind && !swap) return;
        if (!allowed) { swap = null; material.uniforms.dis.value = 0; rebuild(next); animation?.invalidate(); }
        else if (swap) { if (swap.phase === 0) swap.next = next; else swap.queued = next; }
        else { swap = { next, phase: 0, elapsed: 0 }; animation?.invalidate(); }
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
