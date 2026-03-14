import { describe, it, expect } from "vitest";
import { PACE } from "./pace";

describe("PACE", () => {
  it("has chill, normal, and busy modes", () => {
    expect(PACE).toHaveProperty("chill");
    expect(PACE).toHaveProperty("normal");
    expect(PACE).toHaveProperty("busy");
  });

  it("chill is slower than normal", () => {
    expect(PACE.chill.m).toBeGreaterThan(PACE.normal.m);
  });

  it("busy is faster than normal", () => {
    expect(PACE.busy.m).toBeLessThan(PACE.normal.m);
  });

  it("normal has multiplier of 1", () => {
    expect(PACE.normal.m).toBe(1);
  });

  it("busy starts more buddies online than chill", () => {
    expect(PACE.busy.startOnline).toBeGreaterThan(PACE.chill.startOnline);
  });
});
