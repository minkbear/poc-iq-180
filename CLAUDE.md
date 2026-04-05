# CLAUDE.md

## Project

Kids Math Game — a browser-based math practice app for children. Vanilla HTML/CSS/JS, no framework, no bundler.

## Tech Stack

- **HTML5** — single `index.html` entry point
- **CSS** — `src/style.css` (Nunito font via Google Fonts)
- **JavaScript** — `src/app.js` (all game logic, `'use strict'`, no modules in browser)
- **Node 20+** — dev tooling only (ESLint, HTMLHint)
- **Deployment** — GitHub Pages via `.github/workflows/deploy.yml`

## Commands

```bash
npm run lint          # lint HTML + JS
npm run lint:html     # htmlhint index.html
npm run lint:js       # eslint src/
npm run dev           # serve on localhost:3000
npm run start         # same as dev
npm test              # node --test (no test files yet)
```

## Code Conventions

- `'use strict'` at top of every JS file
- Semicolons required (`semi: ['error', 'always']`)
- `const`/`let` only — `no-var: 'error'`
- Browser globals declared explicitly in `eslint.config.js` (add new ones there if needed)
- `sourceType: 'script'` — no ES module `import`/`export` in browser JS
- Cache-busting: update `?v=` query params on `<link>` and `<script>` tags in `index.html` when changing CSS/JS

## Git Conventions

- Direct-to-main workflow (no feature branches)
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`
- Include issue ID in commit message: `feat: add timer warning (MBM-19)`
- Always run `npm run lint` before committing
- Co-author line: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

## Architecture

- All game state lives in top-level variables in `src/app.js`
- Config object (`config`) holds user settings, read from DOM inputs via `readConfig()`
- Three main features: Random Numbers, Math Challenge, Countdown Timer
- Spin animation system: `spinElement()` → `spinAndReveal()` / `spinChallengeOnly()`
- Sound via Web Audio API with mute toggle (persisted in `localStorage`)
- Responsive: mobile-first CSS with tablet/desktop breakpoints
- Settings panel uses `<details>` element with backdrop overlay on mobile

## Important Patterns

- Always call `readConfig()` before generating numbers/challenges to pick up latest settings
- `generateOperand()` respects both `mathDigits` and `mathMaxValue` — use it for all random number generation
- `prefersReducedMotion()` check skips animations for accessibility
- Timer auto-regenerates numbers and challenge on expiry
