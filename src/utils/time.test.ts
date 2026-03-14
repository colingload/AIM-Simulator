import { describe, it, expect } from "vitest";
import { getDateStr, daysBetween, timeAgoText } from "./time";

describe("getDateStr", () => {
  it("returns ISO date string format YYYY-MM-DD", () => {
    const result = getDateStr(new Date("2026-03-14T12:00:00Z"));
    expect(result).toBe("2026-03-14");
  });

  it("defaults to today", () => {
    const result = getDateStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("daysBetween", () => {
  it("returns 0 for same day", () => {
    expect(daysBetween("2026-03-14", "2026-03-14")).toBe(0);
  });

  it("returns positive for later date", () => {
    expect(daysBetween("2026-03-10", "2026-03-14")).toBe(4);
  });

  it("returns negative for earlier date", () => {
    expect(daysBetween("2026-03-14", "2026-03-10")).toBe(-4);
  });

  it("returns null if either arg is empty", () => {
    expect(daysBetween("", "2026-03-14")).toBeNull();
    expect(daysBetween("2026-03-14", "")).toBeNull();
  });
});

describe("timeAgoText", () => {
  it('returns "earlier today" for 0 days', () => {
    expect(timeAgoText(0)).toBe("earlier today");
  });

  it('returns "yesterday" for 1 day', () => {
    expect(timeAgoText(1)).toBe("yesterday");
  });

  it("returns days for 2-6", () => {
    expect(timeAgoText(3)).toBe("3 days ago");
    expect(timeAgoText(6)).toBe("6 days ago");
  });

  it('returns "about a week ago" for 7-13', () => {
    expect(timeAgoText(7)).toBe("about a week ago");
    expect(timeAgoText(13)).toBe("about a week ago");
  });

  it("returns weeks for 14+", () => {
    expect(timeAgoText(14)).toBe("2 weeks ago");
    expect(timeAgoText(21)).toBe("3 weeks ago");
  });

  it("returns null for null/undefined", () => {
    expect(timeAgoText(null as unknown as number)).toBeNull();
    expect(timeAgoText(undefined as unknown as number)).toBeNull();
  });
});
