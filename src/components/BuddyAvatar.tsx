import { BUDDIES } from "../constants/buddies";

interface BuddyAvatarProps {
  buddyId: string;
  size?: number;
}

// Color map for avatar backgrounds (softer tones based on buddy color)
const AVATAR_BG: Record<string, string> = {
  claudebot: "#ffe0d0",
  sportz: "#d0f0d0",
  music: "#e8d0f0",
  gossip: "#ffe0cc",
  angst: "#d8d8ee",
  crush: "#ffd0e8",
};

function BuddyAvatar({ buddyId, size = 28 }: BuddyAvatarProps) {
  const buddy = BUDDIES.find(b => b.id === buddyId);
  if (!buddy) return null;
  const bg = AVATAR_BG[buddyId] || "#e0e0e0";
  const borderColor = buddy.color;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      border: `2px solid ${borderColor}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    }}>
      {buddy.emoji}
    </div>
  );
}

export default BuddyAvatar;
