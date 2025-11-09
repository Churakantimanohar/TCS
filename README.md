

# TCS iON NQT Practice — Mock

This is a lightweight React + Tailwind mock that visually and behaviorally mimics the TCS iON test window. It runs entirely on the frontend; Firestore integration is optional.

Features

- Exact TCS NQT pattern via `public/examConfig.json` (5 sections: Verbal 25/25m, Reasoning 20/25m, Numerical 20/25m, Advanced Quant+Reasoning 15/25m, Advanced Coding 3/90m)
- Fullscreen exam mode (locks scroll, warns & pauses optionally if you exit or switch tabs)
- Centered fixed-size (1200x700) exam window with dimmed backdrop
- Dual timers: per-section countdown + global elapsed time (HH:MM:SS)
- Auto section advance when its timer expires; final auto-submit after last section
- Randomized question selection per section (shuffles pools and slices count)
- Question palette with states: Not Visited (gray), Current (blue outline), Answered (purple), Marked (orange), Answered+Marked (green)
- Floating keyboard-enabled calculator (0–9 + - \* / . Enter evaluate, Backspace delete, Alt+C toggle)
- Keyboard shortcuts: Alt+N Next, Alt+P Previous, Alt+M Mark, Alt+C Calculator
- Exam locking: fullscreen exit + tab visibility detection (configurable allowed tab switches), disabled right-click & paste, beforeunload warning
- Autosave: on change + fail-safe every 10s to localStorage (restores session), mock attempt saving API placeholder
- Modular config-driven architecture (change section pattern/timers without code changes)
- Result summary stub (current section) — extendable to full multi-section aggregation

Getting started

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Build

```bash
npm run build
```

Firebase (optional)

- Open `src/firebase.js` and provide Firebase project config + uncomment imports; implement Firestore collection structure:
  - `questions/{section}` (if you prefer Firestore over local JSON)
  - `users/{uid}/attempts/{autoId}` for attempt summaries
- Replace the mock `saveAttempt` to actually `setDoc` the summary.

Deploy to GitHub Pages

- Configure `package.json` `homepage` (optional) and run:

```bash
npm run deploy
```

Configuration

- `public/examConfig.json`: sections array with keys, counts, durations (seconds), plus settings: `pauseTimerOnFullscreenExit`, `allowedTabSwitches`, `paletteCols`.
- `public/sample-data/questions.json`: pools per section. Add/expand easily; the app shuffles & slices to the required count each run.

Autosave & Resume

- State persisted under key `tcs-nqt-exam-state-v2` every change and every 10s. Closing/reloading restores progress, timers (approx), section index, answers, statuses.
- Global & section elapsed times reconstructed on resume (approximation; not crypto-precise, acceptable for practice use).

Next Enhancements (suggested)

- Aggregate full multi-section results (store each section summary in an array rather than overwriting).
- Add scoring & correctness evaluation (currently `correct` field present in sample data for potential scoring).
- Implement Authentication UI and attempt history retrieval.
- Add per-section review navigation on results page.
- GitHub Actions workflow for auto-deploy on push.

Notes

- Tailwind `@apply` warnings are expected until PostCSS build runs.
- All math evaluation in calculator is sanitized (basic arithmetic only).
- For production exam conditions, further hardening (disabling additional shortcuts / dev tools detection) would be needed.
