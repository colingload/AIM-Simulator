# AIM Simulator — 2003

A nostalgic AIM (AOL Instant Messenger) simulator powered by Claude AI. Chat with AI buddies who have distinct 2003 teen personalities, and try to win the heart of your secret crush xo_Jordan_xo.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and paste your key from https://console.anthropic.com/settings/keys
npm run dev
```

Open http://localhost:3000

## How to Play

- **Sign in** with any screen name, pick your gender, and choose a vibe (Chill/Normal/Busy)
- **Buddy list** shows AI buddies who come online, go away, and sign off dynamically
- **Chat** with anyone online — each has a unique personality and remembers past conversations
- **Jordan (xo_Jordan_xo)** has a secret crush on you. Their relationship persists across sessions. Ask them out and win the game!
- **FeedbackBot** is always online — share bugs, ideas, or suggestions

## Features

- **Realistic typing** — Word-count-based delays, think pauses, typing-stop-typing patterns
- **Day tracking** — Buddies know if you talked yesterday vs a week ago and reference it naturally
- **Session awareness** — Jordan knows the difference between "we were just talking" and "new day"
- **Departure messages** — Buddies say "brb" or "gtg" before going away/offline
- **Jealous pings** — Chat with one buddy and others notice you're online
- **Pace modes** — 🐢 Chill (background play), 😎 Normal, 🔥 Busy (lots of action)
- **Content moderation** — 3-strike system with buddy reactions, kick, and ban
- **Mobile-friendly** — Responsive layout for phone screens
- **Persistent memory** — Buddies remember past conversations even across sessions

## Buddies

| Screen Name       | Personality                          |
|--------------------|--------------------------------------|
| FeedbackBot        | Feedback collector, always online    |
| SportzDude2003     | Sports fanatic, Madden, ESPN         |
| RockOut_Alicia     | Emo/alt girl, mix CDs, Warped Tour   |
| DramaQueen_Tiff    | Gossip queen, mall hangouts, The OC  |
| xX_DarkSoul_Xx     | Brooding emo, Xanga, Dashboard       |
| xo_Jordan_xo       | Your crush 💘 — moods vary per session |

## Architecture

The Vite dev server proxies API calls and injects your key server-side. On claude.ai, calls go direct and storage uses the artifact persistence API. Locally, storage falls back to `localStorage`.

See `CLAUDE.md` for full technical documentation.

## License

For personal/educational use. Sounds sourced from archive.org AIM sound effects collection.
