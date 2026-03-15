import { describe, it, expect } from "vitest";
import { PACE } from "./pace";

describe("PACE", () => {
  it("has a single balanced pace config", () => {
    expect(PACE).toHaveProperty("m");
    expect(PACE).toHaveProperty("startOnline");
  });

  it("has a moderate multiplier between 1 and 2.5", () => {
    expect(PACE.m).toBeGreaterThan(1);
    expect(PACE.m).toBeLessThan(2.5);
  });

  it("starts 2 buddies online", () => {
    expect(PACE.startOnline).toBe(2);
  });
});
