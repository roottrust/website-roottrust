export type MotionGate = { animated: boolean; pageVisible: boolean };

/** One pending frame; elapsed time never advances while suspended. */
export function createAnimation(
  draw: (elapsed: number, delta: number, animated: boolean) => void,
  request: (callback: FrameRequestCallback) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let gate: MotionGate = { animated: false, pageVisible: false };
  let intersecting = false, disposed = false, frame = 0, last = 0, elapsed = 0;
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !gate.pageVisible || !intersecting) return;
    const delta = gate.animated && last ? Math.min(0.05, (now - last) / 1000) : 0;
    elapsed += delta;
    last = gate.animated ? now : 0;
    draw(elapsed, delta, gate.animated);
    if (gate.animated && gate.pageVisible && intersecting && !disposed) frame = request(tick);
  };
  const invalidate = () => {
    if (!disposed && gate.pageVisible && intersecting && !frame) frame = request(tick);
  };
  return {
    invalidate,
    setGate(next: MotionGate) {
      gate = next;
      if (frame) cancel(frame);
      frame = 0; last = 0;
      invalidate();
    },
    setIntersecting(next: boolean) {
      intersecting = next;
      if (!next && frame) cancel(frame);
      if (!next) { frame = 0; last = 0; }
      invalidate();
    },
    dispose() { disposed = true; if (frame) cancel(frame); frame = 0; },
  };
}

export type Animation = ReturnType<typeof createAnimation>;
