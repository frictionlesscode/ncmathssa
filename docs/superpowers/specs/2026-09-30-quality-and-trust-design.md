# Quality and Trust — Design

Fixes everything the 2026-09-30 adversarial audit found, and adds gates so the same classes of error cannot
reach families again. A parent must be able to trust every answer key and every progress number.

Status: approved in brainstorming 2026-09-30. Next step: three implementation plans (A, B, C), built in order.

**Inputs (binding):**
- Audit reports: `docs/superpowers/audits/2026-09-30/` — `content-g1.md` … `content-g5.md`, `logic-scoring.md`
  (findings F1–F15), `logic-flows.md`.
- NC rules table: `docs/superpowers/audits/2026-09-30/nc-rules.md` (rules `NC-R*`, each verified against an NC DPI
  source). Where a rule is marked REFUTED or unverified, content following it stays as is.

---

## 1. Decisions

| Question | Decision |
|---|---|
| Grade 5 content beyond NC's standard | Rewrite to NC scope, keeping every question id |
| Thin evidence in readiness | Scale by evidence: a standard contributes accuracy × min(1, answers ÷ 4) |
| Two tabs open | Sync via `storage` events and merge by id before every write |
| End-to-end tests | Playwright, 8 core scenarios, Chromium + mobile WebKit; deploy gated on CI |
| Order | Plan A (trust fixes) → Plan B (content) → Plan C (quality gates) |

## 2. Plan A — Readiness, progress and saved data

### 2.1 One source of truth for thresholds

- `mastery.ts` exports the only functions that decide pass/ready/strong: `isPassing(correct, total, passing)`
  (compares `correct * 100 >= passing * total`, no floating-point or rounding), `masteryStatus` (unchanged
  semantics: ≥ passing with ≥ `MIN_SAMPLE_FOR_MASTERY` = 4 answers), and `readinessStatus(readiness, passing)`.
- No `Math.round` before a threshold compare anywhere (F3, F5). `domainStatsFor` derives status from the unrounded
  ratio; the rounded percent is for display only.
- Display rule: readiness shows as `Math.floor(readiness)` so a value below the goal never displays as the goal
  (79.6 → "79%"). Every screen (ParentHome, Dashboard, Navbar, SessionSummary) uses one formatter `formatPercent`.

### 2.2 Readiness scaled by evidence (F2)

`overallReadiness` = Σ over domains of weight × mean over the domain's standards of
`percent × min(1, total ÷ MIN_SAMPLE_FOR_MASTERY)`. Untested standards stay 0. A perfect one-per-standard check-up
yields 25%. The weights and the blueprint mean are otherwise unchanged.

### 2.3 Labels and badges

- Dashboard domain card "Ready" uses `status === 'acceleration-ready'` (F4).
- Session summary "Strong today" requires ≥ 3 answers in that topic in the session and `isPassing` (F9). Topics
  with 1–2 answers appear under a neutral "Also practiced" line.
- SSA pass banner and confetti in `QuizResults` only for full practice-test forms (`isMock`); drills show
  "Nice work" with the score (F10). No "Wake County SSA benchmark" copy outside mocks.
- "Ready to try for SSA" on ParentHome reflects the most recent practice-test attempt only (F6). When a grade has one
  form and it has been taken before, the practice-test step shows "You've seen this test before — the score may be
  higher than on a new test."
- "Quizzes taken" counts only current-grade attempts (F14).

### 2.4 Path and pace

- Short-on-time mode no longer credits skipped rounds as finished for pace or for path markers: skipped Round 1 is
  shown as "Skipped", and pace progress counts only rounds actually finished (F1). With 0–1 attempts, pace status is
  never "Ahead".
- Pace's start date uses the earliest current-grade attempt (F12).
- Round exit windows (Round 2 last-8, Round 3 last-8) exclude answers that came from due review (F8). Session refs
  carry an `origin: 'new' | 'review'` flag set by the composer; attempts record it per answer.
- Day-dependent memos include a local day key so values refresh after midnight (F11).
- Weeks-left copy: `Math.round(days / 7)` weeks when ≥ 14 days (F13).
- Early-submitted test-style sessions keep recording unanswered as wrong (matches the real test) but the summary
  says "N not answered" separately from "N missed" (F15).

### 2.5 Saved data safety

- `loadState` repairs instead of rejecting (`normaliseState`, pure and unit-tested):
  dangling `activeProfileId` → first profile; profiles without `id`/`studentName` get defaults; non-object attempts,
  attempts without `answers` array, and `activeSession` without `refs` are dropped; unsupported grade → nearest
  supported grade; missing `reviewQueue` → `{}`.
- An unparseable stored blob is copied to `ncmathssa_corrupt_<ISO time>` before anything else is written.
- The provider does not write until the first user-initiated change (no save-on-mount).
- A root `ErrorBoundary` shows "Something went wrong" with "Export my data" (downloads the raw stored JSON) and
  "Start over" (after a confirm; keeps the corrupt copy).
- Multi-tab: `ProgressProvider` listens for `storage` events on its key and reloads state. Every save re-reads the
  stored state and merges: profiles by id (the current tab's version of the active profile wins for scalar fields),
  attempts unioned by id, `activeSession` from the tab that last wrote it. Attempt ids gain a random suffix.
- `saveState` returns `{ ok: boolean }`. On failure, or when `localStorage` access itself throws, the app keeps
  running in memory and shows a persistent banner: "Progress isn't being saved on this device" with "Export".
- `StudyPaceModal` mounts only while open everywhere, including Detailed view.

### 2.6 Kid mode display and accessibility

- `KidPractice` renders `promptDetails` with `font-mono whitespace-pre-wrap`, like `QuizRunner` (text diagrams
  keep their spacing). Long diagram lines scroll horizontally inside their box instead of wrapping.
- After "Check my answer", focus moves to the feedback heading, which sits in `role="status"`.
- Options expose selection (`aria-pressed`), icon-only buttons get `aria-label`, and QuizRunner overlays get
  `role="dialog"` with Escape to close.
- "Stop for today" confirm copy for practice: "Stop now? Your answers so far are saved and counted."

### 2.7 CI

`deploy.yml` runs only after `ci.yml` succeeds on `master` (`workflow_run`), so red CI never publishes.

## 3. Plan B — Content

### 3.1 Rules

The NC rules table (`nc-rules.md`) is the source of truth. Each rule has an id (`NC-R1` …). Plan B rewrites every
item that breaks a CONFIRMED rule; Plan C encodes the rules as automated checks.

Summary of the confirmed rules (full wording, quotes and sources in `nc-rules.md`):

| Rule | Grade | Rule in short |
|---|---|---|
| NC-R1 | 5 | OA.2: parentheses only; at most two operations per expression (e.g. `5 + (3 × 2)`). This also covers `oa2-01` and `oa2-03` as rewritten on 2026-09-30. |
| NC-R2 | 1–5 | Trapezoid = exactly one pair of parallel sides; parallelograms, rectangles, rhombi and squares are not trapezoids |
| NC-R3 | 5 | NBT.7 division: whole ÷ decimal or decimal ÷ whole only; hundredths; dividends ≤ 4 digits |
| NC-R4 | 5 | NBT.1: × 1,000/100/10/0.1/0.01 and ÷ 10/100 only; no exponent notation (PARTLY: exponents absent, not banned; we treat as out) |
| NC-R5 | 5 | MD.2: line graphs, data over time, categorical vs numerical; no fractional line plots |
| NC-R6 | 5 | NF.1: unlike denominators only within {2,4,8}, {3,6,12}, {5,10,100}, one a multiple of the other |
| NC-R7 | 5 | NF.4: fraction × fraction uses denominators 2, 3, 4 only; fraction × whole may use 2–12 |
| NC-R8 | 5 | NF.7: one step; unit fraction ÷ whole or whole ÷ unit fraction only |
| NC-R9 | 5 | MD.1: one conversion step from a given chart, within one system |
| NC-R10 | 5 | MD.5: composed solids are two prisms with one-digit dimensions |
| NC-R11 | 5 | G.3: classify by sides, angles, symmetry; no diagonals or kites (PARTLY: absent, not banned; we treat as out) |
| NC-R12a/b | 4 | Fractions denominators 2, 3, 4, 5, 6, 8, 10, 12, 100 (decimals 10, 100); whole numbers ≤ 100,000 |
| NC-R13a/b/c | 3 | Fraction denominators 2, 3, 4, 6, 8; equivalence/comparison within {2,4,8} and {3,6}; no rounding standard (the "rounding" domain name is renamed) |
| NC-R14 | 1 | NBT.4: sums ≤ 100 |

Sources are the 2019 unpacking text; the June 2025 revision could not be downloaded. A parent or teacher check of
the June 2025 documents is a manual step before Plan B ships.

### 3.2 Rewrites

- Every rewrite keeps its question id; options, key, explanation and misconception tags are rewritten together, and
  every distractor's value must be reproducible from its stated misconception.
- Generators that break a rule are constrained at the source (e.g., NF.1 draws denominators only from NC's allowed
  families), not filtered after generation.
- All Critical, High and Medium content findings in `content-g1.md` … `content-g5.md` are fixed. Low findings are
  fixed where the fix is a one-line wording change; others are listed as deferred in the plan.
- Check-up and practice-test forms are rebalanced to the blueprint bands where the audit found them off, using only
  existing in-scope ids.

### 3.3 Answers recorded against old content

- Each authored question gains an optional `contentVersion` (default 1). Any rewrite that changes the key, the
  options or the math bumps it.
- Attempts record the `contentVersion` of each answered question. `masteryByStandard` ignores answers whose recorded
  version differs from the current one; history screens still list them.
- Saved in-progress sessions record the version too; a session whose question changed shows the existing
  "can't continue" discard screen for that session.

## 4. Plan C — Quality gates

### 4.1 Independent answer checks

For every generator, a test re-derives the correct answer from the generated instance's inputs with a separate
reference function written in the test, and checks: exactly one correct option; option texts unique; no two
options numerically equal (fractions compared by cross-multiplication, decimals as exact rationals); each
distractor tagged with a misconception equals what that misconception produces; no unresolved tokens, `NaN`,
`undefined` or `Infinity` in any text. 500 seeds per generator in CI.

### 4.2 NC rule checks

A test iterates every authored question and 200 instances per generator per grade and asserts every CONFIRMED rule
in `nc-rules.md` that can be checked from text or parameters (e.g., no `[`, `]`, `{`, `}` in Grade 5 expressions;
trapezoid wording; NF.1 denominator families). Readability limits apply to `promptDetails` as well as `prompt`.

### 4.3 Answer-key snapshot

`src/curriculum/answerKey.snapshot.json` lists, for every authored question and 20 fixed-seed instances per
generator: id/seed, standard, prompt, promptDetails, options, marked answer, contentVersion. A test regenerates it
and fails on any difference; updating it is an explicit command (`npm run answer-key:update`), so every content
change appears in the PR diff for review. A teacher sign-off is a manual process step, recorded in the PR.

### 4.4 End-to-end tests

Playwright (`@playwright/test`), projects `desktop-chromium` and `iphone-webkit`, against `npm run preview`
serving the production build at `http://localhost:4173/ncmathssa/`. Scenarios:

1. Fresh visit: disclaimer → setup → home shows "Start the check-up"; no console errors or 404s.
2. Skip check-up → Round 1 practice: feedback after each answer, no retry, no NC codes; number-line item renders
   aligned.
3. Reload mid-session → "Continue — N of M done" → same question.
4. Practice test: answer two, Stop → home shows Continue → resume keeps answers and timer.
5. Finish a practice session → kid-done → summary "X% → Y%" → home readiness matches summary.
6. Set a test date 7 days out → short-on-time copy; pace is not "Ahead".
7. Add a second student → reload → picker; the other student shows no Continue.
8. Detailed view → tabs → Settings shows the active student's name → Back to home.

CI: an `e2e` job in `ci.yml` after unit tests (install browsers, build, run; upload the report on failure; one retry
in CI). A post-deploy smoke job runs scenario 1 against `https://frictionlesscode.github.io/ncmathssa/`.

## 5. Testing (all plans)

Test-driven. Every finding fixed gets a regression test named after it (e.g., `F1: short-on-time pace is never
ahead with no work`, `G5 oa2-01: NC-R1 two-step`). Cross-screen fixture test: for one seeded profile, ParentHome,
Dashboard and Navbar show the same readiness number and the same ready/not-ready state.

## 6. Out of scope

- New questions beyond rewrites.
- The remaining four E2E scenarios from `logic-flows.md` (two-tab, timers over time, print, stale deploy).
- Drawn figures (clocks, graphs, rulers stay text).
- Any server, account or cross-device sync.
