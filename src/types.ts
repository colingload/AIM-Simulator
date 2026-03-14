export interface Buddy {
  id: string;
  sn: string;
  emoji: string;
  always?: boolean;
  color: string;
  system: string;
  away: string[];
  _origSystem?: string;
}

export interface ChatFormat {
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface Message {
  from: string;
  text: string;
  ts: number;
  isNew?: boolean;
  sid?: string;
  isOld?: boolean;
  fmt?: ChatFormat;
}

export interface ChatData {
  messages: Message[];
  conv: ConvMessage[];
  lastTalkDate?: string;
  sessionLog?: SessionEntry[];
}

export interface ConvMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionEntry {
  sid: string;
  startIdx: number;
}

export type BuddyStatus = "online" | "away" | "offline";

export type Screen = "signin" | "main" | "kicked" | "won" | "banned";

export type PaceMode = "chill" | "normal" | "busy";

export interface PaceConfig {
  m: number;
  startOnline: number;
}

export interface UnsolUpdate {
  msgs: Message[];
  conv: ConvMessage[];
  v: number;
}

export interface Toast {
  id: number;
  msg: string;
}

export interface AwayStyleConfig {
  bg: string;
  bdr: string;
  tg: string;
  tc: string;
  tf: string;
  mc: string;
  mf: string;
  ms: number;
  deco: string;
  dc: string;
}
