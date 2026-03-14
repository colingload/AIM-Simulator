import { describe, it, expect } from "vitest";
import { checkMessage } from "./moderation";

describe("checkMessage", () => {
  it("returns false for clean messages", () => {
    expect(checkMessage("hey whats up")).toBe(false);
    expect(checkMessage("lol thats funny")).toBe(false);
    expect(checkMessage("wanna go to the mall")).toBe(false);
    expect(checkMessage("do u like dashboard confessional")).toBe(false);
  });

  it("catches profanity", () => {
    expect(checkMessage("fuck")).toBe(true);
    expect(checkMessage("shit")).toBe(true);
    // "bullshit" is a compound — the filter checks word boundaries, so standalone words match
    expect(checkMessage("what the fuck dude")).toBe(true);
  });

  it("catches slurs", () => {
    expect(checkMessage("youre a faggot")).toBe(true);
    expect(checkMessage("retarded")).toBe(true);
  });

  it("catches threats", () => {
    expect(checkMessage("kill yourself")).toBe(true);
    expect(checkMessage("kys")).toBe(true);
  });

  it("catches sexual language", () => {
    expect(checkMessage("send nudes")).toBe(true);
    expect(checkMessage("horny")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(checkMessage("FUCK")).toBe(true);
    expect(checkMessage("Shit")).toBe(true);
  });

  it("handles leetspeak", () => {
    expect(checkMessage("fvck")).toBe(false); // not a common swap
    expect(checkMessage("sh1t")).toBe(true); // 1→i
    expect(checkMessage("a$$")).toBe(false); // $ stripped to s, but "ass" isn't in the word list
  });

  it("matches through punctuation stripping", () => {
    // The filter strips non-alphanumeric chars and checks again, so f.u.c.k → fuck matches
    expect(checkMessage("f.u.c.k")).toBe(true);
    expect(checkMessage("fuck!")).toBe(true);
  });
});
