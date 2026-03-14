import { describe, it, expect } from "vitest";
import { rMin, typingMs, thinkMs } from "./typing";

describe("rMin", () => {
  it("returns a value in minutes (ms) between a and b", () => {
    for (let i = 0; i < 20; i++) {
      const val = rMin(1, 2);
      expect(val).toBeGreaterThanOrEqual(1 * 60000);
      expect(val).toBeLessThanOrEqual(2 * 60000);
    }
  });
});

describe("typingMs", () => {
  it("returns a positive number", () => {
    expect(typingMs("hello")).toBeGreaterThan(0);
  });

  it("longer messages take more time", () => {
    // Run multiple times since there's randomness — on average longer should be longer
    const shortTimes = Array.from({ length: 50 }, () => typingMs("hey"));
    const longTimes = Array.from({ length: 50 }, () => typingMs("omg i cant believe what happened at school today it was so crazy"));
    const avgShort = shortTimes.reduce((a, b) => a + b) / shortTimes.length;
    const avgLong = longTimes.reduce((a, b) => a + b) / longTimes.length;
    expect(avgLong).toBeGreaterThan(avgShort);
  });

  it("is capped at 18000ms", () => {
    for (let i = 0; i < 20; i++) {
      expect(typingMs("a ".repeat(200))).toBeLessThanOrEqual(18000);
    }
  });

  it("has a base time even for single word", () => {
    for (let i = 0; i < 20; i++) {
      expect(typingMs("hi")).toBeGreaterThanOrEqual(600);
    }
  });
});

describe("thinkMs", () => {
  it("returns a value between 500 and 5000", () => {
    for (let i = 0; i < 50; i++) {
      const val = thinkMs();
      expect(val).toBeGreaterThanOrEqual(500);
      expect(val).toBeLessThanOrEqual(5000);
    }
  });
});
