import { describe, expect, it } from "vitest";
import { canRetryChallenge, challengeGroupId, challengeMessage, type ChallengeState } from "../../src/components/forms/challenge-state";

const states: ChallengeState[] = ["idle", "loading", "ready", "solved", "expired", "timeout", "failed"];

describe("challenge state", () => {
  it("has a distinct non-empty message per state", () => {
    const messages = states.map(challengeMessage);
    expect(messages.every(Boolean)).toBe(true);
    expect(new Set(messages).size).toBe(states.length);
  });
  it("offers retry only for failed, expired and timeout", () => {
    expect(states.filter(canRetryChallenge).sort()).toEqual(["expired", "failed", "timeout"]);
  });
  it("derives a stable group id so feedback can move focus to the verification", () => {
    expect(challengeGroupId("form-challenge")).toBe("form-challenge-group");
  });
});
