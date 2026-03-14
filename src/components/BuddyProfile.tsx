import { F, WB, TG, AWAY_STYLES } from "../constants/styles";
import XBtn from "./icons/XBtn";
import { Buddy } from "../types";
import { useMemo } from "react";

interface BuddyProfileProps {
  buddy: Buddy;
  onClose: () => void;
}

const INTERESTS: Record<string, string[]> = {
  claudebot: ["collecting feedback", "squashing bugs", "helping users", "organizing reports", "feature requests"],
  sportz:    ["Madden 2003", "SportsCenter", "Tony Hawk Pro Skater", "Gatorade runs to 7-Eleven", "trading cards"],
  music:     ["burning mix CDs", "Warped Tour", "LiveJournal", "Hot Topic hauls", "writing lyrics"],
  gossip:    ["mall hangouts", "Seventeen magazine quizzes", "away message stalking", "sleepovers", "The OC"],
  angst:     ["Donnie Darko", "black-and-white photography", "Xanga poetry", "Dashboard Confessional", "rainy days"],
  crush:     ["playing guitar", "making playlists", "reading", "walks at night", "drawing in notebooks"],
};

function BuddyProfile({ buddy, onClose }: BuddyProfileProps) {
  const s = AWAY_STYLES[buddy.id] || AWAY_STYLES.claudebot;
  const interests = INTERESTS[buddy.id] || ["chatting on AIM", "away messages", "profiles", "buddy icons"];

  const onlineTime = useMemo(() => {
    const h = Math.floor(Math.random() * 8) + 1;
    const m = Math.floor(Math.random() * 60);
    return `${h}h ${m}m`;
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WB, border: "2px solid", borderColor: "#fff #444 #444 #fff", width: "90%", maxWidth: 320, fontFamily: F, boxShadow: "2px 2px 6px rgba(0,0,0,0.45)" }}>
        {/* Title bar */}
        <div style={{ background: TG, color: "#fff", fontWeight: "bold", fontSize: 12, padding: "3px 7px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Info for {buddy.sn}</span>
          <XBtn onClick={onClose} />
        </div>

        {/* Content */}
        <div style={{ padding: "14px 18px", background: "#fff", borderBottom: "1px solid #808080" }}>
          {/* Emoji + screen name */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 36 }}>{buddy.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: buddy.color, fontFamily: F, marginTop: 4 }}>{buddy.sn}</div>
          </div>

          {/* Member since */}
          <div style={{ fontSize: 11, color: "#666", textAlign: "center", marginBottom: 10, borderTop: "1px solid " + buddy.color + "33", paddingTop: 8 }}>
            Member Since: 2003
          </div>

          {/* Online time */}
          <div style={{ fontSize: 11, color: "#666", textAlign: "center", marginBottom: 12 }}>
            Online Time: {onlineTime}
          </div>

          {/* Interests */}
          <div style={{ borderTop: "1px solid " + buddy.color + "33", paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: "bold", color: buddy.color, marginBottom: 4 }}>Interests:</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#333", lineHeight: 1.8 }}>
              {interests.map((interest, i) => (
                <li key={i}>{interest}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ background: WB, padding: "5px 8px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontFamily: F, fontSize: 11, cursor: "pointer", border: "1px solid", borderColor: "#fff #888 #888 #fff", background: "linear-gradient(180deg,#ece9d8,#d4d0c8)", padding: "2px 16px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuddyProfile;
