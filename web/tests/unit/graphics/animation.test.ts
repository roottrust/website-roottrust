import { describe, expect, it, vi } from "vitest";
import { createAnimation } from "../../../src/features/graphics/animation";

function harness() {
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const draw = vi.fn();
  const animation = createAnimation(draw, callback => { frames.set(++id, callback); return id; }, key => { frames.delete(key); });
  const step = (now: number) => {
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now));
  };
  return { animation, frames, draw, step };
}

describe("graphics animation lifecycle", () => {
  it("draws a single static presentation when paused or reduced, without a recurring frame", () => {
    const h = harness();
    h.animation.setIntersecting(true); h.animation.setGate({ animated: false, pageVisible: true });
    h.animation.invalidate(); h.animation.invalidate();
    expect(h.frames.size).toBe(1);
    h.step(100); expect(h.draw).toHaveBeenCalledWith(0, 0, false); expect(h.frames.size).toBe(0);
  });
  it("cancels pending frames in a hidden tab and offscreen, and excludes the suspended time", () => {
    const h = harness();
    h.animation.setIntersecting(true); h.animation.setGate({ animated: true, pageVisible: true });
    h.step(100); h.step(116);
    h.animation.setGate({ animated: false, pageVisible: false });
    h.animation.invalidate(); expect(h.frames.size).toBe(0); h.step(10000);
    expect(h.draw).toHaveBeenCalledTimes(2);
    h.animation.setGate({ animated: true, pageVisible: true }); h.step(20000);
    expect(h.draw).toHaveBeenLastCalledWith(.016, 0, true);
    h.animation.setIntersecting(false); expect(h.frames.size).toBe(0);
    h.animation.setIntersecting(true); h.step(30000);
    expect(h.draw).toHaveBeenLastCalledWith(.016, 0, true);
  });
  it("cannot resurrect after disposal, including disposal during a frame", () => {
    const h = harness();
    h.draw.mockImplementationOnce(() => h.animation.dispose());
    h.animation.setIntersecting(true); h.animation.setGate({ animated: true, pageVisible: true }); h.step(100);
    h.animation.setGate({ animated: true, pageVisible: true }); h.animation.invalidate(); h.animation.setIntersecting(true);
    expect(h.frames.size).toBe(0); expect(h.draw).toHaveBeenCalledTimes(1);
  });
  it("does not enqueue another frame when visibility changes during drawing", () => {
    const h = harness();
    h.draw.mockImplementationOnce(() => h.animation.setIntersecting(false));
    h.animation.setIntersecting(true); h.animation.setGate({ animated: true, pageVisible: true }); h.step(100);
    expect(h.frames.size).toBe(0);
  });
});
