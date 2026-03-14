# AIM Simulator — Claude Code Context

## Project Overview
A nostalgic 2003 AIM (AOL Instant Messenger) simulator. Single-page React app where users chat with AI-powered buddies via the Anthropic API. The game's goal: get your crush (xo_Jordan_xo) to say yes.

## Tech Stack
- **React 18** — functional components, hooks only, no classes
- **TypeScript (strict)** — all source files are `.tsx`/`.ts`
- **Vite 6** — dev server with API proxy
- **Anthropic API** — claude-haiku-4-5 for buddy chat responses
- **No CSS framework** — all inline styles, XP/Win2003 aesthetic
- **ESLint + Prettier** — code quality and formatting
- **Vitest** — unit testing framework
- **GitHub Actions CI** — lint, type-check, and test on push/PR

## Key Architecture Decisions
- **Modular structure** — Components, constants, utils, and hooks are in separate files under `src/`. App.tsx is the orchestrator (~480 lines).
- **API proxy** — Vite proxies `/api/anthropic/*` to the real API and injects the key from `.env`, keeping it server-side. On claude.ai, calls go direct.
- **Storage abstraction** — `storageGet`/`storageSet` use `window.storage` on claude.ai or `localStorage` locally. Shared storage (`storageGetShared`/`storageSetShared`) for cross-user feedback.
- **Responsive** — `useIsMobile()` hook (breakpoint 700px). Desktop = draggable XP windows. Mobile = screen-based navigation (buddy list ↔ chat).
- **No routing** — state-based screens: `signin` → `main` (buddy list + chats) → `kicked` → `won` (final screen). `banned` blocks all access.

## Important Patterns

### API & Messaging
- **API queue** — `callClaude()` serializes all API calls. Only 1 in-flight at a time.
- **Message drip** — Buddy responses split on `||` are dripped one at a time with typing indicator. Delays are word-count-based via `typingMs()` (~350ms/word + jitter). A `thinkMs()` delay occurs before typing even starts.
- **typing-stop-typing** — 35% chance buddy pauses mid-type and restarts (second-guessing).

### Buddy Lifecycle
- **schedNext()** — Cycles buddies between online/away/offline with pace-scaled timers.
- **schedIncoming()** — Proactive outreach with per-buddy personality: skip% (waits for you), quickPing% (short "hey"), apiExcited% (multi-part AI message).
- **Departure messages** — 75% of the time buddies say "brb" or "gtg" before going away/offline, then wait 3-8s before actually changing status.
- **Jealous pings** — When you open a chat with one buddy, other online idle buddies have 50% chance of pinging you within 20-60s.
- **sendBuddyMsg()** — Async helper that sends a message from a buddy into their open chat. Uses `openChatsRef` for reliable state reading.

### Pace System
- Three modes: 🐢 Chill (×2.5), 😎 Normal (×1), 🔥 Busy (×0.5)
- Scales ALL timers: lifecycle transitions, incoming message frequency, initial status changes, jealous pings, starting buddy count.
- Selected on sign-on screen, saved to storage, accessed via `paceRef`.

### Day/Session Tracking
- `lastTalkDate` stored per buddy — real calendar date of last interaction.
- `timeCtx` injected into system prompts: "you last talked yesterday", "earlier today", "about a week ago".
- Buddies reference time gaps naturally in conversation.

### Jordan (xo_Jordan_xo) — The Crush
- **Persistent relationship** — Full message history and conv persist across sessions. Messages from past sessions show greyed out.
- **Session boundaries** — `sessionLog` tracks where each session starts in the conv array. `getMarkedConv()` injects separator markers between sessions so Claude knows past vs current. Markers only exist in API calls, not in storage.
- **Session moods** — Random mood each sign-in: reserved, nervous, secretly pleased, open, distracted, playful.
- **Gender lock** — Jordan's gender locks to the FIRST gender ever used. Wrong gender = Jordan stays offline or ghosts.
- **Win detection** — After each Jordan response with 4+ messages, a separate Claude call judges if Jordan reciprocated. Win triggers the final cinematic screen.

### Content Moderation (3-strike system)
- **Word filter** — `checkMessage()` catches profanity, sexual language, slurs, threats. Handles leetspeak (0→o, 3→e, etc).
- **Strike 1** — Buddy reacts uncomfortably ("dude what", "eww stop"), system warning shown in chat.
- **Strike 2** — Forced sign-off to "kicked" screen with warning message.
- **Strike 3** — Permanent ban screen, saved to storage.
- **Per-buddy reactions** — Each buddy has personality-matched discomfort responses.

### FeedbackBot
- Replaces ClaudeBot69. Always online, rarely reaches out first (60% skip).
- Collects bug reports, feature requests, suggestions via conversation.
- All user messages + bot responses saved to shared storage (`feedback_log`) visible across all users.

### Unsol/ExtUpdate System
- `unsol` state passes incoming messages from App to ChatWin components.
- Each update has a version counter (`unsolV`) for dedup.
- `extUpdate` handler gates behind `ready` state to prevent race conditions with initial load.
- `shownCount` and `lastExtV` refs reset when switching chats.

## File Structure
```
aim-simulator/
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── eslint.config.js
├── .prettierrc
├── .github/workflows/ci.yml
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx              ← Game orchestrator (~480 lines)
    ├── types.ts             ← Shared TypeScript interfaces
    ├── constants/
    │   ├── buddies.ts       ← BUDDIES array, MY_SN, AIM_STYLE
    │   ├── sounds.ts        ← Base64 audio, playSound, mute toggle
    │   ├── styles.ts        ← F, TG, WB, BS, AWAY_STYLES
    │   ├── moderation.ts    ← Word filter, checkMessage()
    │   └── pace.ts          ← PACE config
    ├── hooks/
    │   └── useIsMobile.ts   ← Mobile breakpoint hook
    ├── utils/
    │   ├── api.ts           ← callClaude(), API queue
    │   ├── storage.ts       ← storageGet/Set abstraction
    │   ├── typing.ts        ← typingMs, thinkMs, rMin
    │   ├── time.ts          ← getDateStr, daysBetween, timeAgoText
    │   ├── genAway.ts       ← AI away message generation
    │   └── exportLog.ts     ← Chat log export (.txt)
    └── components/
        ├── SignOn.tsx
        ├── BuddyList.tsx
        ├── ChatWin.tsx
        ├── BuddyProfile.tsx ← Buddy info popup (NEW)
        ├── Taskbar.tsx
        ├── Toasts.tsx
        ├── AwayPopup.tsx
        ├── FinalScreen.tsx
        ├── KickedScreen.tsx
        ├── BannedScreen.tsx
        ├── Drag.tsx
        └── icons/
            ├── Man.tsx
            └── XBtn.tsx
```

## Commands
```bash
npm install        # Install deps
npm run dev        # Start dev server on :3000
npm run build      # Production build to /dist
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler (no emit)
npm run test       # Run Vitest tests
npm run format     # Run Prettier formatting
```

## Environment
Requires `ANTHROPIC_API_KEY` in `.env` file. Copy from `.env.example`.

## New Features (Post-Modularization)
- **Chat log export** — Save button in chat toolbar exports the conversation as a `.txt` file.
- **Buddy profiles** — Click a buddy's name in the chat header to view their info popup.
- **Sound mute toggle** — Mute/unmute button in the buddy list header controls all sound effects.

## Testing Tips
- To test mobile layout on desktop: resize browser below 700px width
- To reset Jordan relationship: clear localStorage keys starting with `aim_`
- To trigger win screen faster: be direct with Jordan ("will you go out with me")
- To test moderation: type a flagged word — buddy reacts, system warns
- To test pace: try 🔥 Busy mode for rapid-fire action or 🐢 Chill for background play
- To view feedback log: `JSON.parse(localStorage.getItem('aim_shared_feedback_log'))`
