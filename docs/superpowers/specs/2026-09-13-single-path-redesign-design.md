# Single-Path Redesign — Design

Replaces the app's four-tab catalog with one road, one Continue button, and a
separate parent screen.

Status: approved in brainstorming 2026-09-13, never planned or built. **Superseded** by `2026-09-29-parent-path-design.md`.

---

## 1. The problem

The app presents **16 distinct ways to start answering math questions**, spread
across four tabs and three modals:

| Surface | Entry points |
|---|---|
| Dashboard | diagnostic, mock exam, missed-Qs, 5× domain drill, standard → study guide → drill |
| Curriculum | 17× standard drill, 17× study guide → drill |
| Quizzes | adaptive session (+ size picker), diagnostic, 2× mock, 5× domain drill, 17× standard drill |
| Weak Spots | practice-all-due, inline answer-in-place |
| Results | retake, drill-the-missed-standard |

Standard drills appear in three places, the diagnostic in two, domain drills in
two. `Navbar.tsx` carries seven more controls on top of that.

Two structural gaps underlie the symptom:

- **No session persistence.** `QuizRunner` holds everything in `useState`. The
  only protection is a `beforeunload` warning that `App.tsx:41` itself
  describes as "the only guard." Closing the tab mid-quiz loses the work.
- **No ordering.** Curriculum is domains → standards; `selectSession` picks by
  tier. There is no sequence, so "what's next" has no answer to give.

The app was built as a catalog of everything a student *could* practice. What a
studying student needs is one next thing and a sense of the road.

## 2. Decisions

| Question | Decision |
|---|---|
| Who is at the keyboard | Student practices; parent checks in separately. Two surfaces, two voices. |
| What the road is made of | The grade's standards in the order `standards.ts` already declares them. |
| What the optional eval does | Places the student on the road. |
| What survives the cull | Mock exams, drill-any-stop-on-demand, Weak Spots as a destination. |
| What the grade field means | The grade the student wants to place *into*. |
| How it lands | One pass, engine-first, one branch, one review. |

Cut: the Curriculum tab, the five domain drills, the Quizzes tab, browsable
study guides. Study guides survive but appear only in context — after a missed
question, or from a stop that is going badly.

## 3. Screen model

One union replaces `currentTab`, `activeQuiz`, `completedAttempt`, and three
modal booleans:

```ts
type Screen =
  | { kind: 'setup' }            // no profile yet
  | { kind: 'placement-offer' }  // the optional eval
  | { kind: 'home' }
  | { kind: 'progress' }
  | { kind: 'session' }          // reads profile.activeSession — no payload
  | { kind: 'results'; attemptId: string };
```

`{kind:'session'}` carries no payload by design. The runner is a view onto
persisted state, not onto component state — which is what makes resume fall out
of the architecture instead of being bolted on.

No router. The persisted session already makes a refresh land somewhere sane,
which was the only thing a router would have bought. Navigation is a `useState`
on the `Screen` union in `App.tsx`.

The `beforeunload` guard at `App.tsx:41` is **deleted**. Once every answer
persists, closing the tab costs nothing.

Modals: `StudyGuideModal` and `PrintReportModal` survive. `StudyPaceModal` is
deleted — target date and daily goal become an inline settings block on
Progress. `Navbar` is deleted; each screen carries its own minimal header.

## 4. The spine — `src/engine/spine.ts`

New, pure, curriculum-agnostic.

```ts
export type StopStatus =
  | 'mastered'     // mastery.status === 'acceleration-ready'
  | 'in-progress'  // attempted, not there yet
  | 'placed-past'  // eval says they know it — unverified
  | 'upcoming';

export interface Stop {
  index: number;            // 1-based position on the road
  standard: StandardInfo;
  status: StopStatus;
}

export function buildSpine(
  c: GradeCurriculum,
  mastery: Map<StandardCode, StandardMastery>,
  placedPast: ReadonlySet<StandardCode>,
): Stop[];

export function currentStop(spine: Stop[]): Stop | undefined;
export function spineProgress(spine: Stop[]): { done: number; total: number };
```

**Order** is `standardsOf(curriculum)` — the flattened declared order, which is
already correct — filtered by `curriculum.source.allStandardsWithContent()`.
That filter is load-bearing while grades 1–4 are mid-build: a partially
authored grade yields a shorter road rather than a road with a dead end on it.

**Completion** reuses `masteryStatus` from `engine/mastery.ts`. A stop is done
at `acceleration-ready`, which already encodes both `ssa.passingPercent` and
`MIN_SAMPLE_FOR_MASTERY = 4`. No new threshold is invented and no second tuning
knob is created that could drift from the first.

**`currentStop`** is the first stop that is `in-progress` or `upcoming`.
`placed-past` stops are skipped for *position* but remain eligible for the
composer's coverage tier, so an unverified skip is eventually verified. When no
stop qualifies, `currentStop` is `undefined` and Home switches to offering a
mock exam.

`spineProgress().done` counts `mastered` and `placed-past` stops.

## 5. Placement — `src/engine/placement.ts`

```ts
export function placementFromAttempt(
  attempt: QuizAttempt,
  c: GradeCurriculum,
): { placedPast: StandardCode[]; startAt: StandardCode | undefined };
```

The diagnostic is one question per standard, so placement is a **prefix walk**:
descend the spine while the answer for that stop's standard is correct, marking
each `placed-past`; stop at the first miss, which becomes `startAt`.

Prefix rather than "skip every correct standard" because it keeps the road
contiguous — "Stop 6 of 17" stays meaningful, and a student strong everywhere
except fractions lands exactly on fractions. A student who misses stop 1 but
knows 2–17 starts at 1 and moves through it quickly: mildly wasteful, never
confusing.

All correct → `placedPast` is every standard and `startAt` is `undefined`
(Home offers a mock immediately). First answer wrong → `placedPast` is empty and
`startAt` is stop 1.

`placed-past` is deliberately **not** `mastered`. One question is not evidence.
Progress renders the two distinctly.

The offer appears once, on `{kind:'placement-offer'}` immediately after setup.
Skipping it starts the student at stop 1 and the offer does not return — a
student who has begun the road has real evidence accumulating, which is better
than a placement test, and re-offering it would be a second decision to no
purpose. Progress keeps the diagnostic available as a plain quiz for a parent
who wants the baseline number later; taken that way it records an attempt but
does not re-place the student.

## 6. Session lifecycle and resume

`Profile` gains two optional fields:

```ts
export interface ActiveSession {
  kind: 'practice' | 'placement' | 'mock';
  quizId: string;                // synthetic for practice sessions
  title: string;
  anchorStandard?: StandardCode; // the stop this session is walking
  refs: QuestionRef[];           // frozen at start
  answers: Record<string, { selected: string; isCorrect: boolean }>;
  flagged: Record<string, boolean>;
  currentIndex: number;
  startedAt: string;             // ISO
  secondsElapsed: number;
}

interface Profile {
  // ...existing
  activeSession?: ActiveSession;
  placedPast?: StandardCode[];
}
```

**`refs` is frozen at session creation.** The composer's seed is drawn once, at
start, and the resolved refs are stored. Resume therefore replays the identical
questions rather than re-rolling them. `AdaptiveSessionCard.tsx` currently
carries a comment warning about exactly this hazard; persisting the refs makes
that guarantee structural instead of incidental.

**Write cadence:** persist on answer, navigate, flag, and pause/resume, storing
`secondsElapsed` at each. Not on a per-second timer — a crash loses at most the
seconds since the last interaction, and a `localStorage` write per second is not
worth that precision.

**Resume UX:** Home's Continue card reads `activeSession`. Present →
"Resume — 7 of 20 done." Absent → "Start — Stop 6, 20 questions." **No
expiry**: the runner's timer already pauses indefinitely, so an expiry rule
would add a decision without adding a guarantee. A "start something else"
escape hatch on Home discards the session behind a confirm.

Resume applies to mock exams too, for the same reason — `QuizRunner` already
counts up with an unrestricted pause toggle rather than enforcing
`timeLimitMinutes`, so a resumable mock is consistent with what the app already
permits.

## 7. Session composition — `selectSession` changes

`selectSession` gains one input and one tier:

```ts
selectSession({ curriculum, mastery, queue, size, now, seed, anchor })
```

When `anchor` is set, tier order becomes:

1. Due reviews, capped at `MAX_REVIEW_FRACTION` (0.4) — unchanged
2. **The anchor standard** — fills the bulk of the remainder
3. Struggling → untested → coverage — unchanged

A session is then recognizably *about* the current stop while still carrying
spaced review. This is one new input and one new tier, not a rewrite. Ruling
F17's dedup (`used` set keyed by `questionRefId`) must continue to hold across
the new tier.

**Session size** is `profile.dailyQuestionGoal` (already exists, defaults to
20). The 10/20/30 picker is deleted along with `AdaptiveSessionCard`; the parent
sets the goal once on Progress. One less decision for the student.

## 8. Home (student)

Contains, and contains only:

- "Hi *name*"
- One Continue card: resume state, or the next stop named in the standard's
  `title` — never its code
- The road: one marker per stop, current one highlighted, "Stop 6 of 17"
- "Next: *title of stop 7*"
- A quiet "For grown-ups →" link to Progress

When `currentStop` is `undefined`, the Continue card becomes the mock exam
offer instead.

Not on Home: readiness percentage, the 80% bar, days-to-exam, blueprint
weights, CASE/WCPSS framing, profile switcher, test history. All of it moves to
Progress.

**Mock exam offer rule:** Home offers a mock when `currentStop === undefined`
(the road is finished) or `daysUntilExam <= 14` and a target date is set. Mocks
remain always available from Progress.

## 9. Progress (parent)

One screen, sectioned. Most content is salvaged rather than written:

| Section | Source |
|---|---|
| Readiness gauge + 80% marker | `Dashboard.tsx` |
| The 17 stops: status, mastery %, questions answered, **tap to drill** | new, over `buildSpine` |
| Domain rollup | `domainStatsFor` in `ProgressContext.tsx` |
| Weak Spots: due count, missed list, practice-all-due | `WeakSpotsView.tsx`, reduced from route to section |
| Test history | `Dashboard.tsx` |
| Mock exams (both, always available) and the diagnostic as a plain quiz | `QuizzesListView.tsx` |
| Settings: target date, daily goal, profile switch/add/delete, clear history, print report | `StudyPaceModal`, `Navbar` |

Study guides open in context from a stop that is `in-progress` with a
`needs-focus` mastery status.

**Tapping a stop to drill it** creates an `ActiveSession` with
`kind: 'practice'` and `anchorStandard` set to that stop's standard — the same
shape Continue produces, just anchored somewhere other than `currentStop`. It
does not move the student's position on the road; position stays derived from
mastery. If a session is already in flight, the tap is refused with a prompt to
finish or discard it first, so a single `activeSession` slot is all the state
that ever exists.

A detail to fix in passing: `useReadinessSummary` returns `daysUntilExam: 0`
when no target date is set, and the current Navbar renders that as "0 days
left" on every fresh profile. Progress must render this conditionally on
`profile.targetExamDate` being set.

## 10. State and migration

`AppStateV3` adds `activeSession?` and `placedPast?` to `Profile`; both
optional, so migration is a version bump plus defaults. Extend the existing pure
`migrate()` in `state/storage.ts` the way v1 → v2 was done, and generalize
`isPopulatedV2` accordingly. A v2 blob must load with empty spine state and
fully intact `attempts` and `reviewQueue`.

## 11. Deletions, and the grade-5 hardcode

Deleted: `Dashboard.tsx` (423), `CurriculumView.tsx` (254),
`QuizzesListView.tsx` (269), `Navbar.tsx` (418), `AdaptiveSessionCard.tsx` (88),
`StudyPaceModal.tsx` (147). Roughly 1,600 lines out; `Home.tsx`, `Progress.tsx`,
and a rewritten `Setup.tsx` in. `WeakSpotsView.tsx` is kept but changes props to
render as a section.

While replacing the shell, close the parked ruling that `App.tsx:23` imports
`curriculum/grade5/quizzes` directly — recorded in `RULINGS.md` as a hard
precondition for shipping any grade 1–4:

- Move `createStandardDrill`, `createMissedQuestionsDrill`, and
  `createAdaptiveSessionDrill` from `curriculum/grade5/quizzes.ts` to
  `src/engine/drills.ts`. Their signatures are already curriculum-agnostic.
- Replace `getQuizById(id)` with `curriculum.quizzes.find(q => q.id === id)`.
  `GradeCurriculum` already exposes `quizzes`; `Dashboard` already reads it that
  way.

`Setup.tsx` presents the grade field as "Aiming to place into", listing
`targetsGrade + 1` for each registered curriculum and mapping the selection back
to that curriculum's grade. Copy names what will actually be practiced:
"We'll build mastery of 5th grade standards."

## 12. Testing

Engine, TDD, before any screen work:

- `spine.test.ts` — order matches the declared order; standards without content
  are excluded; `currentStop` skips `placed-past`; a fully mastered spine
  returns `undefined`; `spineProgress` counts `mastered` + `placed-past`.
- `placement.test.ts` — the prefix rule; all correct → `startAt` undefined;
  first answer wrong → stop 1, empty `placedPast`; a miss in the middle stops
  there.
- `sessionComposer.test.ts` additions — an anchored session is majority anchor
  standard; the 0.4 review cap still holds; Ruling F17 dedup survives the new
  tier.
- `storage.test.ts` — v2 → v3 preserves `attempts` and `reviewQueue` and
  defaults the new fields.

Screens:

- `Home.test.tsx` — renders resume state vs. fresh state; renders the mock offer
  when `currentStop` is undefined.
- `Setup.test.tsx` — selecting "6th grade math" produces a grade-5 profile.
- Resume integration — start a session, answer three, reload state from
  storage, assert identical refs and identical answers.

## 13. Calls made without asking

Each is reversible; listed so they can be overridden in the plan.

- Session size derives from `dailyQuestionGoal`; the 10/20/30 picker dies.
- No resume expiry, mocks included.
- Placement is a prefix walk rather than skip-every-correct.
- Mock offer rule: road finished, or ≤ 14 days to a set target date.
- No router; `Screen` union in `App.tsx`.
- `StudyPaceModal` is absorbed into Progress; `PrintReportModal` stays a modal.
- Drill factories move to `engine/drills.ts` as part of this work rather than a
  follow-on.

## 14. Out of scope

- Grade 1–4 content authoring (in flight separately on
  `feat/multi-grade-adaptive`; this redesign wants its own branch).
- Curated teaching units — considered and rejected in favour of declared
  standard order, which needs no new authored data per grade.
- Any change to `QuizRunner`'s in-quiz tools (calculator, scratchpad,
  navigator) beyond wiring its state to `activeSession`.
