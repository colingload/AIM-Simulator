import { callClaude } from "./api";
import { Buddy } from "../types";

export async function genAway(buddy:Buddy) {
  const theme = buddy.away[Math.floor(Math.random()*buddy.away.length)];
  // 50% of the time just use the theme directly — faster, less load
  if (Math.random() < 0.5) return theme;
  try {
    const t = await callClaude(
      "Write a single 2003 AIM away message. Return ONLY the text. Under 12 words. Use ~*~ or abbreviations.",
      [{role:"user",content:'Vibe: "'+theme+'". Make it very AIM 2003.'}], 40
    );
    return t.trim().replace(/^["\\']+|["\\']+$/g,"");
  } catch(e) { return theme; }
}
