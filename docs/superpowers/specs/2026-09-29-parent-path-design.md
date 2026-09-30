# Parent Path Redesign — Design

Replaces the four-tab dashboard with a parent home page built around a
readiness tracker, one "Start next step" button, and a distraction-free kid
mode. Practice follows a breadth-first path of three rounds across every
topic.

Status: approved in brainstorming 2026-09-29. Next step: implementation plan.

**Supersedes** `2026-09-13-single-path-redesign-design.md`, which was approved
but never planned or built. Its standard-by-standard road and student-facing
home are replaced. Its session persistence, `Screen` union, drill-factory move,
and `daysUntilExam` fix are carried over below (sections 7–9).

---

## 1. The problem

After entering a name and grade, a parent lands on a dashboard with four tabs,
three modals and roughly sixteen ways to start answering questions. The main
path is full of NC standard codes (`NC.5.NF.1`), blueprint weight bands and
profile controls. Parents, not educators, are the audience. They cannot tell
where to begin or what comes next.

The engine is not the problem. Mastery tracking, spaced review, the
diagnostic, mock tests and the weighted readiness score all exist. The problem
is presentation: the app is a catalog, and a family needs a path.

## 2. Who uses it and how

- A parent sets up the student, looks at progress, and chooses the next step.
- The parent then hands the device to the child for the session.
- At the end the child hands it back and the parent sees a plain-English
  summary.
- Families arrive with anything from about a month (schools often announce
  SSA about a month ahead) to two or three months. The path must serve both.

Success: a parent can always answer "what does my kid do today?" and "how close
are we?" at a glance, with no NC codes on the main path.

## 3. Decisions

| Question | Decision |
|---|---|
| Main screen | Parent home page: tracker, topics, path, one button |
| Structure | Optional check-up, then three breadth-first rounds, then the practice test |
| Round basis | Progress evidence, not question difficulty (content is too thin in `advanced`/`stretch`; see section 5) |
| Feedback in practice | Right after each question |
| Feedback in check-up and practice test | At the end only, like the real test |
| Retry a missed question | No. It returns in a later session through spaced review |
| Parent lock on kid mode | None |
| Stopping early | Keeps every answer given |
| Returning visitors | One student: straight to home. Two or more: "Who's practicing today?" |
| Existing history | Counts. Path position is derived from attempts, never stored separately |
| Old screens | Kept behind a "Detailed view" link, not deleted |

## 4. The parent home page

Top to bottom.

### 4.1 Tracker

```
Alex · Grade 5 math
[■■■■■■■□□□]  62% ready   —   goal: 80%
Test date: Nov 14 · 6 weeks left · ✅ On track
Plan: about 3 sessions a week, ~20 minutes each
```

- **Readiness %** is the existing `overallReadiness` (blueprint-weighted), with
  a marker at the curriculum's `ssa.passingPercent` (80 for every grade today).
  One line of small print: "This is practice readiness, not a prediction of the
  real test."
- **Pace status** (`On track` / `A bit behind` / `Ahead`) compares path
  progress (fraction of topic-rounds finished) with time elapsed between the
  first attempt and the test date. Within ±10 percentage points is "On track."
- **Weekly plan** is estimated remaining sessions ÷ remaining weeks, rounded up
  and clamped to 1–7. Remaining sessions per unfinished topic-round are
  estimated from the round's exit rule and the session size (default 15).
- **No test date:** readiness still shows. The date line becomes "Add a test
  date to get a weekly plan" with an inline date input. Nothing renders "0 days
  left" (carried-over fix for `useReadinessSummary` returning 0 with no date).
- **Short on time** (test date set, 14 days or fewer away): the plan line reads
  "Short on time: focus on the 🔴 topics, then take the practice test," and the
  path switches to short-on-time mode (section 5.5).
- **Test date passed:** the date line reads "Test date passed — update it?" and
  pace status is hidden.

### 4.2 Topics at a glance

One row per domain, using a new plain-English `parentName` on `DomainInfo`
(for example "Fractions", "Decimals & place value"). Each row shows one of:

- ✅ Strong — domain mastery ≥ passing percent with enough answers
- 🟡 Getting there — 60% to below passing
- 🔴 Needs work — below 60%
- Not checked yet — no answers

Domain status rolls up the existing per-standard `masteryStatus`, using the
same answer-weighted average the existing `domainStatsFor` helper uses.

### 4.3 The path

```
✔ Check-up → ● Round 1: Try every topic (3 of 5) → ○ Round 2 → ○ Round 3 → ○ Practice test
                         [ Start next step ▶ ]
```

The button label names the next step: "Start the check-up", "Start today's
practice (Round 1)", "Start the practice test". Pressing it enters kid mode. A
secondary link, "Try a practice test now", is always present.

If a session is in progress (saved, section 7), the button reads "Continue —
7 of 15 done" and a small "Start fresh instead" link discards it behind a
confirm.

### 4.4 Footer

Small links: "Detailed view", "Print report", "Switch student",
"Add another student", "Settings" (test date, session length, clear history,
delete student).

"Detailed view" opens today's screens (Dashboard, Curriculum, Quizzes, Weak
Spots) unchanged apart from being reached from here. The NC codes, study
guides and per-standard drills stay available there.

## 5. The path

### 5.1 Topics

A topic is a curriculum domain (`GradeCurriculum.domains`), filtered to domains
with at least one standard that has content
(`curriculum.source.allStandardsWithContent()`), so a partially authored grade
shows a shorter path, never a dead end.

### 5.2 Check-up

The grade's existing diagnostic (`diagnostic-01`, `g{n}-diagnostic-01`),
renamed "Check-up" in the UI. It is offered as the first step and can be
skipped ("Skip and start practicing"). Skipping is remembered so the offer does
not reappear as the next step. It stays available from the footer's Detailed
view.

After the check-up, a domain that scores at or above the passing percent is
marked ✅ Strong and **starts at Round 2** (it is considered finished with
Round 1). Every other domain starts at Round 1. If the check-up is skipped,
every domain starts at Round 1.

### 5.3 Rounds

Each round runs across all topics at once. Sessions mix every topic that has
not finished the current round, weighted toward the weakest.

| Round | Parent label | Questions drawn | A topic finishes the round when |
|---|---|---|---|
| 1 | Try every topic | mostly `mastery` | it has at least 8 answered questions in total |
| 2 | Get every topic to 80% | all difficulties, weakest topics first | its last 8 answers score ≥ passing percent |
| 3 | Test-ready | mixed, `stretch` included | its last 8 answers in Round 3 test-style sessions score ≥ passing percent |

- The whole path moves to the next round when every topic has finished the
  current one. A topic that finishes early drops out of the round's sessions
  except for spaced review.
- Up to 40% of every session is due review (`MAX_REVIEW_FRACTION`, unchanged).
- **Round 3 sessions are test-style** (timer shown, feedback at the end;
  section 6.1).
- **Content shortfall:** if a topic has no unseen questions left that a round
  can draw, the composer may reuse seen ones, preferring generated templates
  (fresh instances). If a topic has fewer than 8 distinct questions available
  in total, its exit rule uses what exists ("all available answers") so it can
  never stall the path.

Round and topic progress are **derived** on every render from
`profile.attempts` plus the check-up result. No path position is persisted.

### 5.4 Practice test

- The path's finish line after Round 3. Also always available from the home
  page's "Try a practice test now" link.
- Uses the grade's mock (`mock-ssa-01` / `g{n}-mock-ssa-01`). Grade 5 also has
  `mock-ssa-02`; a retake uses the form the child has taken least recently.
  Grades with one form reuse it.
- Scoring at or above the passing percent shows "Ready to try for SSA 🎉" on
  the tracker, dated.

### 5.5 Short-on-time mode

When a test date is set and 14 days or fewer away:

- After the check-up (or immediately, if skipped), Round 1 is skipped.
- Round 2 includes only 🔴 and 🟡 topics.
- Then the practice test. Round 3 is shown as "Optional".

If the date later moves beyond 14 days, the normal path resumes. Because
progress is derived, nothing is lost.

## 6. Kid mode

### 6.1 Session types

| | Practice (Rounds 1–2) | Check-up, Round 3, practice test |
|---|---|---|
| Feedback | Right after each question | At the end only |
| Timer | Hidden | Shown |
| Calculator | Only where `calculatorAllowed` | Same |
| Scratchpad | Always | Always |
| Length | Session size (default 15) | Check-up and practice test: the quiz's own length. Round 3: session size |

### 6.2 Practice screen

```
Alex's practice                ●●●●●●○○○○○○○○○  6 of 15   [✏ Scratchpad]

   What is 3/4 + 1/8?

   ( A ) 4/12     ( B ) 7/8     ( C ) 4/8     ( D ) 1

                    [ Check my answer ]
```

- **Right:** "Nice!", a star fills, "Next".
- **Wrong:** "Not quite. The answer is B." then `explanation.stepByStep`, and
  `explanation.commonMisconception` when present. "Got it" moves on. No retry.
- No navigator, flagging, tabs or links. One small "Stop for today" button,
  which confirms "Stop and save your progress?" and goes to the summary.
- Test-style sessions keep today's `QuizRunner` layout (navigator, flagging,
  timer) with the same "Stop for today" behaviour.

### 6.3 End of session

1. **Child screen:** "You did it! 12 out of 15 ⭐", one encouraging line
   (picked from a short fixed list, varied by score band), and
   "Hand back to your grown-up".
2. **Parent summary:**
   - "Strong today:" topics at ≥ passing percent in this session
   - "Tricky:" topics with misses, with the count, and "These will come back
     next time."
   - "Readiness: 58% → 62%"
   - Round progress if it changed ("Round 1 finished! 🎉")
   - "Back to home"

A session stopped early shows the same two screens over the answered questions.
A session stopped with zero answers goes straight home and records nothing.

## 7. Session persistence (carried over)

Every answer is saved as it is given, so "Stop for today", a closed tab, or a
refresh loses nothing.

```ts
export interface ActiveSession {
  kind: 'checkup' | 'practice' | 'round3' | 'practice-test';
  quizId: string;                 // real id, or synthetic for composed sessions
  refs: QuestionRef[];            // frozen at start; resume replays the same questions
  answers: Record<string, { selected: string; isCorrect: boolean }>;
  flagged: Record<string, boolean>;
  currentIndex: number;
  startedAt: string;              // ISO
  secondsElapsed: number;
}

interface Profile {
  // ...existing
  activeSession?: ActiveSession;
  checkupSkipped?: boolean;
  sessionSize?: number;           // default 15
}
```

- Written on answer, navigate, flag and pause, not on a per-second timer.
- Finishing or stopping converts the session to a `QuizAttempt` through the
  existing `recordAttempt`, then clears `activeSession`.
- No expiry. The `beforeunload` guard in `App.tsx` is deleted.
- One active session per profile. Starting another from Detailed view while one
  exists prompts to continue or discard it.

## 8. Screens and navigation (carried over, adapted)

One union replaces `currentTab`, `activeQuiz`, `completedAttempt` and the
modal booleans in `App.tsx`:

```ts
type Screen =
  | { kind: 'who' }                        // 2+ students
  | { kind: 'setup' }                      // new student: name + grade
  | { kind: 'home' }
  | { kind: 'session' }                    // reads profile.activeSession
  | { kind: 'kid-done'; attemptId: string }
  | { kind: 'summary'; attemptId: string; readinessBefore: number }
  | { kind: 'detailed' };                  // today's Navbar + tabs, unchanged
```

No router.

Startup order: `DisclaimerGate` → (no named student → `setup`) →
(2+ students → `who`) → `home`. If `activeSession` exists, home shows
"Continue"; it does not jump straight into kid mode.

`FirstRunScreen` stays the setup screen, with its text trimmed. Its grade
picker is unchanged ("Grade N" means the curriculum practiced).

## 9. Code changes in passing (carried over)

- Move `createStandardDrill`, `createMissedQuestionsDrill` and
  `createAdaptiveSessionDrill` from `curriculum/grade5/quizzes.ts` to
  `src/engine/drills.ts`, removing `App.tsx`'s direct Grade 5 import (the parked
  ruling in `RULINGS.md`).
- `selectSession` gains an optional `plan` input: the set of eligible domains,
  a difficulty preference per round, and the round-3 stretch inclusion. With
  no `plan`, behaviour is unchanged (Detailed view keeps using it as today).
  Ruling F17 dedup and the 0.4 review cap must hold.

## 10. New units

| Unit | Purpose | Depends on |
|---|---|---|
| `engine/path.ts` | Pure: `buildPath(curriculum, attempts, checkupSkipped, now, testDate)` → round per topic, current step, next-step descriptor, short-on-time flag | `mastery.ts`, registry |
| `engine/pace.ts` | Pure: pace status, weekly plan, date states | `path.ts` output |
| `engine/sessionSummary.ts` | Pure: per-topic results for one attempt, readiness delta | `mastery.ts` |
| `components/ParentHome.tsx` | Tracker, topics, path, footer | the three above |
| `components/KidPractice.tsx` | Instant-feedback runner | `ActiveSession` |
| `components/KidDone.tsx`, `SessionSummary.tsx` | End-of-session screens | `sessionSummary.ts` |
| `components/WhoIsPracticing.tsx` | Student picker | `ProgressContext` |

`QuizRunner` stays for test-style sessions, rewired to read and write
`activeSession`.

## 11. State and migration

`AppStateV3`: adds the optional `Profile` fields in section 7. Migration is a
version bump with defaults, extending the pure `migrate()` in
`state/storage.ts` the way v1 → v2 was done. A v2 blob must load with its
`attempts` and `reviewQueue` intact and immediately show derived path progress.

`DomainInfo.parentName` is added for every domain in grades 1–5; the
integrity test asserts it is present and non-empty.

## 12. Testing

Engine first, test-driven:

- `path.test.ts`: no attempts → check-up is next; check-up skipped → Round 1;
  ✅ domain from check-up starts at Round 2; Round 1 exit at 8 answers; Round 2
  exit uses last 8 at ≥ passing; path advances only when every topic finishes;
  thin-content topic cannot stall; short-on-time skips Round 1 and limits Round
  2 to 🔴/🟡; existing v2 history yields the right round.
- `pace.test.ts`: on track / behind / ahead bands; no date; date passed; ≤ 14
  days; weekly plan clamped 1–7.
- `sessionSummary.test.ts`: strong/tricky split, readiness delta, early stop.
- `sessionComposer.test.ts` additions: `plan` limits domains; review cap holds;
  F17 dedup holds; no `plan` → identical output to today for a fixed seed.
- `storage` / `migrate.test.ts`: v2 → v3 preserves history, defaults new fields.

Screens:

- `ParentHome.test.tsx`: no date shows the add-date prompt, never "0 days";
  button label follows the next step; Continue shown for a saved session; no NC
  codes rendered.
- `KidPractice.test.tsx`: wrong answer shows the explanation and no retry;
  "Stop for today" saves and routes to the summary.
- `App` flow: fresh visitor → disclaimer → setup → home; two students → who
  screen; resume after reload replays identical refs and answers.

## 13. Calls made without asking

Listed so they can be overridden in the plan.

- Default session size 15 (between "15–20 questions"); adjustable in Settings.
- "On track" band ±10 points.
- Round 1 exit at 8 answers per topic; Round 2 and 3 exits at 80% over the last
  8.
- Short-on-time threshold 14 days.
- Encouragement lines are a fixed list, not generated.
- Detailed view keeps today's screens verbatim rather than trimming them.

## 14. Out of scope

- Writing more `advanced` and `stretch` questions. Round 3 improves
  automatically when they exist.
- Changing the disclaimer or its storage.
- Any server, account, or sharing between devices.
