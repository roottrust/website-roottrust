const INTERRUPTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
const SETTLE_FRAMES = 3;
const SETTLE_LIMIT = 30;

/** Same offset the browser applies to a hash target: root scroll-padding plus the target's scroll-margin. */
function targetTop(element: HTMLElement) {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  return Math.max(0, Math.min(max, element.getBoundingClientRect().top + scrollY - padding - margin));
}

/**
 * Scrolls to `#id`, recomputing the destination every frame so pinned/late layout changes cannot leave it stale.
 * Any user input cancels it. Returns a canceller; it is safe to call after completion.
 */
export function scrollToAnchor(id: string, instant: boolean): () => void {
  const element = document.getElementById(id);
  if (!element) return () => {};
  if (instant) {
    scrollTo({ top: targetTop(element), behavior: "instant" });
    return () => {};
  }
  const from = scrollY;
  const duration = Math.min(900, 350 + Math.abs(targetTop(element) - from) * 0.25);
  let frame = 0;
  let begin = -1;
  let stable = 0;
  let settling = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of INTERRUPTS) removeEventListener(type, stop);
  };
  const step = (now: number) => {
    if (begin < 0) begin = now;
    const progress = Math.min(1, (now - begin) / duration);
    const to = targetTop(element);
    scrollTo({ top: from + (to - from) * (1 - (1 - progress) ** 3), behavior: "instant" });
    if (progress < 1) { frame = requestAnimationFrame(step); return; }
    stable = Math.abs(to - scrollY) < 1 ? stable + 1 : 0;
    if (stable >= SETTLE_FRAMES || ++settling >= SETTLE_LIMIT) { stop(); return; }
    frame = requestAnimationFrame(step);
  };
  for (const type of INTERRUPTS) addEventListener(type, stop, { passive: true });
  frame = requestAnimationFrame(step);
  return stop;
}

/** Moves keyboard context to the destination without scrolling or showing a focus ring on the section. */
export function focusAnchor(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  if (!element.hasAttribute("tabindex")) element.tabIndex = -1;
  element.focus({ preventScroll: true });
}
