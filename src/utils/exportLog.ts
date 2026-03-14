import { Message } from "../types";

/**
 * Export a chat conversation as a .txt file formatted like real AIM chat logs.
 */
export function exportChatLog(buddySn: string, messages: Message[], mySn: string): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

  const lines: string[] = [
    `---- Conversation with ${buddySn} on ${dateStr} ----`,
    "",
  ];

  for (const msg of messages) {
    const d = new Date(msg.ts);
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    const sender = msg.from === mySn ? mySn : buddySn;
    lines.push(`(${time}) ${sender}: ${msg.text}`);
  }

  lines.push("");
  lines.push(`---- End of conversation ----`);

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aim-log-${buddySn}-${now.toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
