import { callClaude } from "./api";
import { Buddy } from "../types";

const JORDAN_AWAY_STAGE: string[][] = [
  // stage 0-1: generic
  ["doing homework i guess","brb","playing music","might be back later idk","*away*"],
  ["doing homework i guess","brb","playing music","might be back later idk","*away*"],
  // stage 2: slightly personal
  ["thinking about stuff","listening to that song again","making a playlist","staring at the ceiling lol","writing something idk"],
  // stage 3+: hints at someone
  ["talking to someone special ~*~","cant stop thinking about last night lol","i wonder if they know","eternal sunshine of the spotless mind.","do they even think about me","*away* ...maybe","leave love. make it ring."],
  // stage 4: same as 3
  ["talking to someone special ~*~","cant stop thinking about last night lol","i wonder if they know","eternal sunshine of the spotless mind.","do they even think about me","*away* ...maybe","leave love. make it ring."],
];

export async function genAway(buddy: Buddy, jordanStage?: number) {
  // For Jordan, use stage-appropriate away messages
  if (buddy.id === "crush" && jordanStage !== undefined) {
    const pool = JORDAN_AWAY_STAGE[Math.min(jordanStage, JORDAN_AWAY_STAGE.length - 1)];
    const theme = pool[Math.floor(Math.random() * pool.length)];
    // At stage 3+, 40% chance to AI-generate something more personal
    if (jordanStage >= 3 && Math.random() < 0.4) {
      try {
        const t = await callClaude(
          "Write a single 2003 AIM away message from a teen who has a secret crush. Subtle, wistful, lowercase. Return ONLY the text. Under 12 words. Use ~*~ or *asterisks* if it fits.",
          [{ role: "user", content: 'Vibe: "' + theme + '". Make it feel like they are thinking about someone.' }], 40
        );
        return t.trim().replace(/^["\\']+|["\\']+$/g, "");
      } catch { return theme; }
    }
    return theme;
  }

  // Non-Jordan buddies: existing logic
  const theme = buddy.away[Math.floor(Math.random() * buddy.away.length)];
  if (Math.random() < 0.5) return theme;
  try {
    const t = await callClaude(
      "Write a single 2003 AIM away message. Return ONLY the text. Under 12 words. Use ~*~ or abbreviations.",
      [{ role: "user", content: 'Vibe: "' + theme + '". Make it very AIM 2003.' }], 40
    );
    return t.trim().replace(/^["\\']+|["\\']+$/g, "");
  } catch { return theme; }
}
