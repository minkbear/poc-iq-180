# MVP Scope Document

**Project:** MB-MVP
**Date:** 2026-04-04
**Status:** Draft — pending board sign-off

---

## What We're Building

A web-based math game for kids. The player sees random numbers and math problems on screen, races against a countdown timer, and hears sound feedback. Simple, visual, fun.

---

## Core User Journey

1. Player opens the web page.
2. Game displays random 1-digit numbers and a random math calculation.
3. Player presses Start — countdown timer begins.
4. Timer counts down with a visual display.
5. Sound plays when timer ends (and optionally during countdown).
6. Player can restart or reconfigure and play again.

---

## Features (MVP)

### Feature 1 — Random Number Display
- Generate and display **5 random 1-digit numbers** (0-9).
- Count of numbers is configurable (default: 5).
- Numbers are shown large and clear — kid-friendly typography.

### Feature 2 — Random Math Calculation
- Generate a random math problem using numbers **less than 100**.
- Display the calculation clearly (operands and result visible).
- Max digits configurable (default: 3-digit display, meaning values < 100).

### Feature 3 — Countdown Timer
- A button starts a countdown timer.
- Timer duration is configurable (default: a few minutes).
- Timer displays remaining time prominently.
- Sound effect plays when timer expires.

---

## Non-Goals (Explicitly Out of Scope)

- **No login or accounts.** Anyone with the URL can play.
- **No score tracking or leaderboards.** This is a practice tool, not a competition.
- **No backend or database.** Pure client-side. No server-side logic.
- **No mobile-native app.** Web only (responsive design is fine).
- **No multiplayer or real-time sync.** Single player, single device.
- **No internationalization.** Thai UI is fine for now. English labels acceptable.
- **No answer validation.** The game shows problems and a timer — it does not check if the kid's answer is correct (mental math / oral practice).

---

## Tech Stack (Recommended)

- **Frontend:** Vanilla HTML/CSS/JS or lightweight framework (no heavy build tooling).
- **Hosting:** Static file hosting (GitHub Pages, Vercel, or Netlify).
- **Sound:** Web Audio API or simple `<audio>` element with bundled sound files.
- **No backend required.** All config is client-side.

---

## Configuration

All configurable values should have sensible defaults and be adjustable in the UI or via URL parameters:

| Setting | Default | Range |
|:--------|:--------|:------|
| Number count | 5 | 1-20 |
| Max calculation value | 99 | 1-999 |
| Timer duration (minutes) | 3 | 1-60 |

---

## Acceptance Criteria

- [ ] Page loads and displays random numbers clearly.
- [ ] Page displays a random math calculation clearly.
- [ ] Start button begins countdown timer.
- [ ] Timer displays remaining time and updates every second.
- [ ] Sound plays when timer expires.
- [ ] Configuration (number count, max value, timer duration) can be changed.
- [ ] Works in modern browsers (Chrome, Safari, Firefox).
- [ ] Kid-friendly: large text, clear layout, minimal distractions.

---

## Open Questions

1. What math operations? Addition only, or also subtraction/multiplication? (Defaulting to addition for MVP.)
2. Should numbers regenerate automatically after each timer cycle, or only on manual refresh?
3. Any specific sound preference, or any royalty-free beep/chime is fine?
