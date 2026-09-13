# Multi-Grade Adaptive Math Practice — Design

**Date:** 2026-09-11
**Status:** Approved design, pending implementation plan
**Repo:** `frictionlesscode/ncmathssa`

---

## 1. Context

The app today is a single-grade study tool: NC Grade 5 mathematics, built to prepare a
4th grader for Wake County Single Subject Acceleration (SSA). It is a React 19 + Vite +
Tailwind SPA, ~6,400 lines, all state in `localStorage`, no backend.

It is feature-rich and structurally sound. The features are built and working: a
blueprint-weighted readiness gauge, a timed quiz runner with flagging and a question
navigator, calculator-active/inactive sections, a drawing scratchpad, post-quiz
diagnostics with worked solutions, a weak-spots error bank, a printable parent report,
and a study-pace planner.

Three things limit it:

1. **The question bank is thin.** 49 authored questions across 17 standards — between
   one and four per standard. Every static quiz, including both "full simulation"
   assessments, draws from that same pool. A student memorizes it within a few passes.
2. **Quizzes are static.** The app tracks weak spots but cannot build a session from
   them. Question selection is a fixed list of IDs per quiz.
3. **It is hardwired to Grade 5.** `DomainId` is the union `'OA' | 'NBT' | 'NF' | 'MD' |
   'G'`, blueprint weights are literals in `ncStandards.ts`, and the 80% WCPSS cutoff is
   a constant. No other grade can be expressed.

## 2. Goals

- Expand the question bank enough that repetition does not become memorization.
- Replace static-only practice with adaptive sessions driven by demonstrated weakness.
- Support NC Grades 1 through 5, not Grade 5 alone.
- Publish publicly: an explanatory landing page at `frictionlesscode.com/math/`, with the
  app itself at `frictionlesscode.com/math/app/`.

## 3. Non-goals

- **No backend, no accounts, no network persistence.** The users are children. Storing a
  child's name and performance data server-side incurs COPPA obligations that a free
  study tool should not carry. All state stays in the browser.
- **No Grades 6–8.** Middle school uses different domains entirely (RP, NS, EE, SP). The
  data model designed here does not preclude them; the content is out of scope.
- **No reproduction of secure CASE items.** Unchanged from the current README: the CASE
  item bank is confidential. All content is built against the published NCSCOS standards.
- **No routing library.** Tab state stays in `useState`.

## 4. Decisions

| Decision | Choice |
|---|---|
| Grade range | NC Grades 1–5 |
| Content strategy | Hybrid — parameterized generators plus hand-authored items |
| Adaptive model | Mastery-targeted selection + spaced repetition |
| Architecture | Curriculum-as-data with seeded generators |
| Question format | 100% multiple choice with engineered distractors |
| Hosting | Own public repo, served at a path on `frictionlesscode.com` |
| Landing page | Astro page in the site repo, not inside the SPA |

### 4.1 Why all multiple choice

NC EOG mathematics is administered as multiple choice, corroborated by firsthand student
report. The current bank is inverted: 34 of 49 items are open-response. All content
becomes multiple choice, and the 34 open-response items are converted.

Multiple choice has a known weakness for practice: a student can back-solve or eliminate
and post a score that overstates mastery. The mitigation is **engineered distractors** —
every wrong option is the answer produced by one specific, named misconception. See §6.3.

## 5. Curriculum data model

`DomainId` becomes a plain `string`, validated at test time rather than constrained by a
union. Each grade is one module under `src/curriculum/`.

```ts
type DomainId = string;         // 'NF'
type StandardCode = string;     // 'NC.3.NF.1'
type Grade = 1 | 2 | 3 | 4 | 5;

interface GradeCurriculum {
  grade: Grade;
  label: string;                        // 'Grade 3 Mathematics'
  ssa: {
    passingPercent: number;             // 80 for WCPSS
    targetsGrade: number;               // mastering G3 standards skips G3
  };
  weighting:
    | { kind: 'ncdpi-blueprint'; source: string }
    | { kind: 'even-by-standard-count' };
  contentComplete: boolean;             // gates the coverage assertion in §6.4
  domains: DomainInfo[];
}
```

`DomainInfo` and `StandardInfo` keep their existing shape, minus the union constraint on
`domainId`. Grade 5's existing curriculum content moves to `src/curriculum/grade5/`
substantially unchanged.

### 5.1 Two accuracy constraints

**Grade 1–4 standards must be sourced, not recalled.** The existing Grade 5 list is
correctly trimmed to NC's revised standards (only `NC.5.OA.2` and `NC.5.OA.3`; only
`NC.5.NBT.1/3/5/6/7`), which indicates it came from a real document rather than model
recall. Grades 1–4 must be transcribed from the published NCSCOS documents with the same
rigor. Inventing plausible-looking standard codes would corrupt every downstream
feature — mastery tracking, blueprint weighting, and the parent report all key off these
codes. The implementation plan must treat sourcing as an explicit, verifiable step.

**Grades 1–2 have no official blueprint.** NCDPI publishes EOG blueprints for Grades 3–8
only; Grades 1–2 have no state assessment and therefore no published domain weights. For
those grades, `weighting` is `even-by-standard-count`, and the UI must label the readiness
gauge accordingly rather than implying an official blueprint exists. The 80% figure is
WCPSS SSA policy, so it is per-grade config, not a global constant.

### 5.2 Domain coverage by grade

Grades 1–2 have four domains (OA, NBT, MD, G) — the Fractions domain begins at Grade 3.
Grades 3–5 have five (OA, NBT, NF, MD, G). This is why domains must be per-grade data:
a fixed five-member union cannot represent Grades 1–2.

### 5.3 Blueprint bands are not always per-domain

NCDPI weights Measurement & Data together with Geometry as a **single band** at
grades 3–5 (23–27%, 23–27%, 19–23%). No member of a combined band has a published
weight of its own, so none may cite one.

This was found only after the first plan shipped: the Grade 5 module claimed MD at
12–15% and G at 7–10%, figures that appear in no NCDPI document, under the display
label "NC Blueprint Weight" and in the printed parent report. Their midpoints summed
to the correct combined midpoint, so the sum-to-100 test passed.

Two rules follow. `DomainInfo` carries an optional `weightGroup`; `domainWeight()`
divides a shared band among its members rather than giving each the whole band, and
any total must be computed through `domainWeight()`, never by adding raw midpoints.
And **verifying a grade's standard codes does not verify the grade.** Codes, weights,
and `ssa` policy figures are three separate claims against three documents. Grade 5's
codes were correct while its weights were invented.

## 6. Question sources

One interface, two implementations. The quiz engine never knows which source produced an
item.

```ts
type QuestionRef =
  | { kind: 'authored';  id: string }
  | { kind: 'generated'; templateId: string; seed: number };

interface QuestionSource {
  itemsFor(standardCode: StandardCode, opts: SelectOpts): QuestionRef[];
  resolve(ref: QuestionRef): Question;   // pure
}
```

### 6.1 Generators are deterministic in their seed

```ts
interface QuestionTemplate {
  id: string;
  standardCode: StandardCode;
  difficulty: Difficulty;
  calculatorAllowed: boolean;
  generate(rng: Rng): GeneratedQuestion;
}
```

`generate` is a pure function of a seeded RNG. This yields three properties at once:

- **The worked solution cannot drift from the question.** Both are derived from the same
  parameters. This is the failure mode that makes most auto-generated math practice
  untrustworthy.
- **Attempt history stays small and replayable.** History stores `{templateId, seed}`,
  not question text. A year of practice remains well within `localStorage` limits, and
  the parent report can reproduce any missed question exactly.
- **Tests are deterministic without mocking.**

### 6.2 Division of labor

Generators cover computational fluency standards, where fresh numbers are the point.
Hand-authored items cover reasoning and multi-step word problems, where the wording
carries the mathematics and templating produces formulaic results.

### 6.3 Engineered distractors

```ts
interface AnswerOption {
  label: string;          // 'A'
  text: string;           // '5/9'
  isCorrect: boolean;
  misconception?: string; // 'added-denominators'
}
```

Every incorrect option is the result of one named error. For `2/3 + 1/6`: `3/9` (added
across), `1/2` (found the common denominator, failed to scale the numerator). Generators
derive distractors from the same parameters as the answer, so they are wrong in the
intended way by construction.

This makes the diagnostic substantially stronger than free-text. A blank wrong answer
says nothing about cause; a consistently chosen distractor names the misconception. The
app tallies misconception selections per standard and surfaces them in the weak-spots
view and the parent report.

### 6.4 Curriculum integrity test

A test walks every curriculum module and asserts: every authored question and every
template references a `standardCode` present in that grade; no duplicate IDs across
authored items and templates.

Coverage — that every standard has at least one source — is asserted only for grades
marked `contentComplete: true` in their curriculum module. Otherwise the test would fail
from the moment Grade 1 exists as a standards list until its last template is written,
and a permanently red suite teaches the team to ignore it. Flipping `contentComplete` is
the definition of done for a grade's content.

## 7. Adaptive engine

Three pieces, kept separate so each is testable in isolation. All are pure functions with
no React and no storage access.

### 7.1 Mastery tracking

Extends the existing `StandardMastery`: attempts, correct count, rolling mastery percent,
plus a per-misconception tally. Status tiers unchanged (`acceleration-ready`,
`approaching`, `needs-focus`, `untested`).

### 7.2 Review scheduler

A Leitner queue. A missed item enters box 1, due the next day. A correct answer promotes
it; intervals are 1, 3, 7, 16, and 35 days. A miss at any box returns the item to box 1.

The queue is **not** keyed by `QuestionRef`, because a generated ref includes its seed:

```ts
type ReviewKey =
  | { kind: 'authored';  id: string }
  | { kind: 'generated'; templateId: string };   // no seed
```

Review defaults to serving a **fresh instance** of the same template — re-serving
identical numbers teaches the answer rather than the method. Keying on the seed would
mean a fresh instance never matched its own queue entry, and the item would be scheduled
forever. The missed seed is still recorded on the attempt for the parent report; it just
plays no part in scheduling.

### 7.3 Session composer

```ts
function selectSession(
  state: ProgressState,
  curriculum: GradeCurriculum,
  opts: { size: number; now: Date }
): QuestionRef[]
```

Fill order:

1. Due reviews, capped at 40% of the session so a bad week does not turn every session
   into remediation.
2. Weakest standards, weighted by the grade's blueprint weighting.
3. Untested standards.
4. Coverage spread across remaining standards.

### 7.4 Static quizzes are retained

The baseline diagnostic, the five module drills, and both full simulations remain
unchanged. They are the right tool for sitting down to take a realistic test. Adaptive
sessions are an additional mode for daily practice, not a replacement.

## 8. App shell, profiles, and migration

### 8.1 Profiles

A `profiles` array; each profile has a name, a chosen grade, and its own progress state.
A picker in the navbar. One device, several students. No accounts — separate entries in
the same `localStorage`.

### 8.2 Curriculum from context

The active profile's grade selects the `GradeCurriculum`, which supplies domains,
standards, weights, question sources, and the passing cutoff. Dashboard, curriculum view,
quiz list, weak spots, and the print report currently import Grade 5 constants directly;
all move to reading the active curriculum from context.

**Scope note:** nine components read Grade 5 data or the 80% constant directly. The
rewiring is mechanical but broad, and is the largest single block of component work.

### 8.3 Migration

Existing state lives under `nc_math_ssa_prep_state_v1` and may contain real attempt
history. The new shape is `_v2`.

```ts
function migrate(raw: unknown): AppStateV2
```

A pure function. V1 state becomes profile #1, named from the existing
`settings.studentName`, grade 5, with attempts and missed-question IDs carried across
intact. Unrecognized or corrupt input yields a clean initial state rather than throwing.

The current loader catches load errors and logs them, but then silently discards the
payload — under the new schema that would destroy existing history. Migration is
therefore explicit and tested against a captured real v1 payload as a fixture. The v1 key
is left in place, not deleted, until v2 has been written successfully.

### 8.4 First run

A stranger arriving at the app needs, in one screen: what SSA is, that this is
NC-specific, that nothing entered leaves their browser, and a grade picker. The privacy
claim must be accurate and plainly stated, since the users are children.

### 8.5 Two small changes

- `vite.config.ts` gains `base: '/math/app/'`.
- A `beforeunload` guard while a quiz is in progress. With no router, the browser back
  button would otherwise discard an in-progress quiz silently.

## 9. Landing page

An Astro page in the `frictionlesscode.com` repo at `/math/`, not a screen inside the SPA.
A statically rendered page is indexable by search engines; an SPA shell is largely opaque
to them, and discoverability is the point of publishing.

- `frictionlesscode.com/math/` — Astro: what SSA is, how the app works, who it is for,
  the privacy position, and a link into the app.
- `frictionlesscode.com/math/app/` — the SPA.

Accepted cost: explanatory copy lives in the site repo while the app lives in its own, so
a feature change can outdate the description.

## 10. Testing

**There is no test framework in the project today.** `package.json` defines `oxlint` and
nothing else. Adding Vitest is the first unit of work, before any feature work.

### 10.1 Property-based tests for generators

Unit tests are the wrong tool for generators: a template correct at seeds 1–10 can still
emit a broken question at seed 4,912. Generators get property-based tests (fast-check).
Across hundreds of seeds, for every template:

- exactly one option is marked correct;
- no two options have equal `text` (so no distractor silently duplicates the answer);
- every distractor carries a `misconception` tag, and its value equals what that
  misconception's rule produces from the same parameters — the tag is verified, not just
  present;
- the final line of the worked solution equals the stated answer;
- all values fall within the grade's expected range.

This is the difference between generated practice that can be trusted and generated
practice that quietly teaches something wrong.

### 10.2 Unit tests

Pure functions throughout: migration (real captured v1 fixture), the review scheduler
against a fixed clock, session composition, mastery computation, answer checking, and the
curriculum integrity walk of §6.4.

### 10.3 Component tests

React Testing Library over the quiz-runner flow: answering, flagging, navigating,
submitting, and the results diagnostic.

## 11. Repo, CI, and deploy

New public repo `frictionlesscode/ncmathssa`. Commits authored as
`Michael Swanson <8681739+frictionlesscode@users.noreply.github.com>`.

**App CI** (`ci.yml`, on pull request): typecheck, lint, test, build.

**Site deploy.** The site's existing `deploy.yml` gains a step that checks out the app
repo **at a pinned tag**, builds it, and writes the output to `public/math/app/` before
the Astro build.

Pinned rather than tracking `main`, deliberately: tracking `main` means a failing app
build takes the blog offline with it, and an unrelated app commit silently redeploys the
site. Releasing a new app version is a tag bump.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Fabricated Grade 1–4 standard codes corrupt mastery tracking and reporting | Sourcing from published NCSCOS documents is an explicit, verified plan step (§5.1) |
| Generated questions with incorrect worked solutions | Solutions derived from the same parameters as the question; property tests over many seeds (§10.1) |
| Migration destroys existing attempt history | Pure, separately tested migration against a real captured payload; v1 key retained until v2 write succeeds (§8.3) |
| Content volume for five grades is large | Generators carry fluency standards; authored items are reserved for reasoning problems (§6.2) |
| App build regression breaks the blog deploy | Site builds the app from a pinned tag, never `main` (§11) |
| Multiple choice inflates apparent mastery | Engineered distractors make the chosen wrong answer diagnostic (§6.3) |

## 13. Verification the author must perform

The live site at `frictionlesscode.com/math/` must be confirmed rendering correctly by
the repository owner. Local preview and build output can be verified in development;
the deployed custom-domain result cannot be, from here.
