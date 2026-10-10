import { afterEach, expect, it, vi } from "vitest";
import { mountPillar } from "../../../src/features/graphics/pillar-runtime";
import { BUILD } from "../../../src/features/graphics/pillar-scene";

const { contexts } = vi.hoisted(() => ({ contexts: [] as EventTarget[] }));
vi.mock("three", async importOriginal => {
  const actual = await importOriginal<typeof import("three")>();
  return { ...actual, WebGLRenderer: class {
    domElement = new EventTarget();
    debug = {};
    constructor() { contexts.push(this.domElement); }
    setPixelRatio() {} setClearColor() {} setSize() {} dispose() {} forceContextLoss() {}
  } };
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); contexts.length = 0; });

it("never rebuilds a failed instance when motion changes after context loss during a swap", () => {
  vi.stubGlobal("window", { devicePixelRatio: 1, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1)); vi.stubGlobal("cancelAnimationFrame", vi.fn());
  class Observer { observe() {} disconnect() {} }
  vi.stubGlobal("ResizeObserver", Observer); vi.stubGlobal("IntersectionObserver", Observer);
  const host = { clientWidth: 200, clientHeight: 200 } as HTMLElement;
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}), style: {} }) as unknown as HTMLCanvasElement;
  const build = vi.spyOn(BUILD, "camadas"), failed = vi.fn();
  const instance = mountPillar(host, canvas, "diamante", false, failed);
  instance.setGate({ animated: true, pageVisible: true }); instance.swap("camadas");
  contexts[0].dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  expect(failed).toHaveBeenCalledTimes(1);
  instance.setGate({ animated: false, pageVisible: false }); instance.swap("camadas"); instance.dispose();
  expect(build).not.toHaveBeenCalled();
});
