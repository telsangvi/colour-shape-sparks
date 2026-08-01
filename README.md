# 🎨 Colour & Shape Sparks

An interactive shapes and colours learning game for young children — 6 game modes covering recognition, challenge, patterns, and counting — built with React, TypeScript, and Framer Motion.

**Live:** https://colour-shape-sparks.vercel.app

---

## What it does

Players choose a mode from the home screen. Every mode tracks streaks, triggers confetti on milestones, and uses the Web Speech API to read questions and praise aloud.

| Mode | Questions | Description |
|---|---|---|
| 🔷 Shapes | 10 | See a coloured shape, pick its name from 4 options |
| 🌈 Colours | 10 | See a named shape, tap the correct colour |
| 🔥 Challenge | 10 | Mixed shapes + colours — both must be identified |
| 🧠 Pattern | 8 | Complete an A-B or A-B-C colour/shape sequence |
| 🔍 Spotter | 6 | Count a specific shape inside a scene illustration |
| ✏️ Trace | — | Trace shape outlines with a finger (launched from Shapes mode) |

After each session a Summary screen shows score, accuracy %, max streak, and a confetti celebration.

---

## Spotter scenes

The Spotter mode draws 10 hand-crafted SVG scenes; each session randomly picks 6:

| Scene | Shapes counted |
|---|---|
| Snowman | circles |
| Traffic Light | circles, rectangles |
| House | rectangles, triangles |
| Mountains | triangles |
| Ice Cream | circles, triangles |
| Robot | rectangles, circles |
| Caterpillar | circles |
| Night Sky | stars |
| Flower | circles |
| Beehive | hexagons |

---

## Pattern types

| Type | Sequence shown | Correct answer |
|---|---|---|
| colorAB | 🔴🔵🔴🔵 ❓ | 🔴 (same shape, colour A) |
| shapeAB | 🔴● 🔴■ 🔴● 🔴■ ❓ | 🔴● (shape A) |
| colorABC | 🔴🔵🟢🔴 ❓ | 🔵 (colour B) |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| TTS | Web Speech API (`SpeechSynthesisUtterance`) |
| Confetti | canvas-confetti |
| Audio | HTML `<audio>` element (ambient `.m4a` loop) |
| Deployment | Vercel (CLI, no Git integration) |
| Linting | Oxlint |

---

## Project structure

```
src/
├── App.tsx                  # Mode select, splash screen, phase routing
├── components/
│   ├── ShapeQuiz.tsx        # Shapes mode — pick shape name
│   ├── ColourQuiz.tsx       # Colours mode — pick colour
│   ├── ChallengeQuiz.tsx    # Challenge mode — pick both
│   ├── PatternQuiz.tsx      # Pattern mode — complete the sequence
│   ├── ShapeSpotter.tsx     # Spotter mode — count shapes in a scene
│   ├── ShapeTrace.tsx       # Trace mode — finger-trace shape outlines
│   ├── ShapeDisplay.tsx     # Renders a named shape as an SVG
│   ├── QuizExtras.tsx       # TimerBar, StreakBadge, ComboFlash, getMilestone
│   └── Summary.tsx          # Session end: score ring, accuracy %, streak
├── data/
│   ├── shapes.ts            # Shape definitions (id, name, SVG path data)
│   └── colours.ts           # Colour definitions (id, name, hex)
├── store/
│   └── gameStore.ts         # Zustand store: session lifecycle, scoring, streaks
└── utils/
    ├── ambientMusic.ts      # HTMLAudioElement singleton (looping)
    ├── sounds.ts            # Tap, correct, wrong sound effects
    └── speech.ts            # Web Speech API wrapper with null-guard
```

---

## Scoring and streaks

- A question is marked **correct** only if answered right on the first attempt. A wrong answer followed by a correct one scores 0.
- **Streak** increments on each first-attempt correct answer; resets on wrong, skip, or timer expiry.
- **Milestones** at streak 3, 5, and 10 trigger a `ComboFlash` banner and heavier confetti.
- A **15-second timer** per question advances automatically on expiry (resets streak).

---

## Session sizes

| Mode | Questions per session |
|---|---|
| Shapes / Colours / Challenge | 10 |
| Pattern | 8 |
| Spotter | 6 |

---

## Built with Claude Code

This project was built entirely through [Claude Code](https://claude.ai/code) — Anthropic's CLI coding agent — across multiple sessions.

### How Claude Code operates

- **Filesystem access** — Claude reads, creates, and edits files directly. No copy-paste; every change lands at the right line.
- **Terminal execution** — `npm run build`, `vercel --prod`, `git commit && git push` all ran inside the Claude Code session.
- **Multi-session continuity** — Claude Code's memory system stored deployed URLs, architectural decisions, and known bugs across sessions so each new session resumed instantly.

### Specific bugs caught and fixed

| Bug | Root cause | Fix |
|---|---|---|
| Infinity% on summary screen | PatternQuiz/Spotter set `session: []` so `session.length = 0` | Added `total` field to Zustand store, set per mode on `startSession` |
| Wrong answers still scoring | No guard before `recordCorrect()` — correcting a wrong attempt still counted | `wasWrong` state flag; `recordCorrect()` skipped if first attempt was wrong |
| Blank screen after timer | `onExpire` in `useTimer` deps array re-fired on every store update when `timeLeft === 0` | `useRef` for the callback + `expiredRef` guard to fire exactly once |
| Score showing 3/0 | `total` initialised to `SESSION_SIZE` regardless of mode | `startSession` now sets `total` from the mode-specific constant |

---

## Local development

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # TypeScript check + Vite production build
```

## Deploy

```bash
vercel --prod
```
