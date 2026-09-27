# SDD ledger — plan: docs/superpowers/plans/2026-09-13-grades-1-4-content.md

Branch: feat/multi-grade-adaptive (not main/master — no consent gate needed)
Spec: docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md (reachable)
Baseline at start: 8dbb53a, 274/274 tests green, lint 0, tsc clean.

## Pre-flight conflict scan

Every pair of tasks that shares a file or an interface, plus each task against itself.

| Rows checked | Produces / Consumes | Finding |
|---|---|---|
| T1 × T2 — `src/curriculum/types.ts` | T1 adds `quizzes` + a `QuizDefinition` import; T2 adds `studyGuides` and must extend that same import line | Clean. T2 Step 4 says "extend the existing import" explicitly. |
| T1 × T2 — `src/curriculum/grade5/index.ts` | both add a field to `GRADE_5` | Clean, serial. |
| T1 × T2 × T3 — `src/curriculum/integrity.test.ts` | all three append inside the same `describe.each` callback | Clean, serial appends; T3 additionally adds `domainWeight` to the import. |
| T1 × T11/16/21/26 — quiz integrity test | T1 asserts every registered grade has a diagnostic and only references its own question ids | Clean. Each register task supplies a diagnostic; ids are grade-prefixed. |
| T2 × T11/16/21/26 — study-guide coverage test | T2's coverage assertion is gated on `contentComplete` | Clean. Grades register with `contentComplete: true` and a full guide set in the same task. |
| T3 × T4 — "no blueprint below grade 3" | T3's test runs over `listCurricula()`; T4 writes grade 1–2 standards but registers nothing | Clean. The test cannot see grades 1–2 until T21/T26, which set `even-by-standard-count`. |
| T3 × T5–T24 — misconception orphan test | every content task adds tags and uses them in the same task | Clean. A task that declared a tag it did not use would fail its own Step "Run the tests". |
| T4 × T5–T26 — `grade<N>/standards.ts` | every content task reads `GRADE_<N>_DOMAINS` | Clean, and T4 is ordered before all of them. |
| T5 × T6/T7/T8 — `grade4/templates/index.ts` | T5 creates `GRADE_4_TEMPLATES`; T6–T8 append | Clean, serial. T9 correctly does not touch it (Geometry has no templates). |
| T5 × T6–T24 — `authoredBank.testkit.ts` | T5 produces `assertAuthoredBankSound`; every later content task consumes it | Clean, and T5 is the first content task. |
| T5–T24 × `misconceptions.ts` | all append entries | Clean, serial. |
| T9/T14/T19/T24 × their grade's other domain tasks | the aggregator imports every per-domain array | Clean; each aggregator task is ordered last within its grade. |
| T21 × T2 — `PrintReportModal.tsx` | T2 touches `StudyGuideModal`, T21 touches `PrintReportModal` | Clean, different files. |
| T21 × 6a851cf — `weightLabel` | T21 adds `weightHeading` beside the already-shipped `weightLabel` | Clean, complementary. |
| T26 × T11/16/21 — `listCurricula()` ordering | T26 asserts `[1,2,3,4,5]` | Clean; `listCurricula()` sorts by grade. |
| Each task against itself | tests specified vs. code specified; files created vs. files later touched | One defect found and fixed pre-flight, below. |

### Findings and rulings

**F1 — plan defect, fixed before execution.** Task 3 Step 1's test body called a
helper `templatesOf(c)` that no step ever defined, while Step 2 introduced
`c.source.templates()` and told the implementer to swap them. Two names for one
thing in adjacent steps is how an implementer ends up inventing a third.
*Ruling:* rewrote Step 1 to call `c.source.templates()` directly, so the
undefined method IS the Step 2 failure. Cost if wrong: none, it is strictly
clearer. Fixed in 8dbb53a's parent.

**F2 — plan defect, fixed before execution.** Task 9 Step 1 imported a
non-existent `standardsOfDomains` from `../registry` and then told the
implementer to drop it. *Ruling:* removed the import and the instruction.

**F3 — unverified assumption, probed rather than ruled.** Task 4's test imports
`docs/sources/*.json` from under `src/`, where `tsconfig.app.json` sets
`"include": ["src"]`. Rather than leave the implementer a conditional fallback
that would have tempted them to copy the JSON into `src/` and fork the source of
truth, I probed it: vitest, `tsc -b --force --noEmit`, and oxlint all accept the
import unchanged (`allowArbitraryExtensions` + bundler resolution). Plan updated
to state this as fact. Recorded in 8dbb53a.

**F4 — spec gap, ruled and written into the spec.** The spec's §8.2 moved nine
components onto the active curriculum but said nothing about `src/data/quizzes.ts`
and `src/data/studyGuides.ts`, which are Grade 5 globals two components import
directly. Registering any second grade would serve a child another grade's
diagnostic. *Ruling:* both become `GradeCurriculum` fields; recorded as spec §5.4
and made Tasks 1–2, ahead of every content task. Cost if wrong: two files move and
two components change one line each — cheap to revert.

**F5 — scope ruling.** The plan's `hasGenerator` floors (12 at grade 4, 10 at
grades 2–3, 8 at grade 1) are mine, not the spec's. They exist because the owner's
original complaint was repetitive quizzes, and an authored-only grade repeats.
Cost if wrong: a task could be blocked on writing a generator for a standard that
genuinely does not want one — in which case lower the floor in the test and say so
in the commit, rather than writing a bad generator to hit a number.

## Task log

### Batch A (Tasks 1–3) — dispatched as ONE batch

Same-shape small refactors, batched per the skill's guidance rather than three
dispatches with three review cycles. BASE 8dbb53a.

Implementer returned DONE. Commits:
- `045f4d6` refactor: make static quizzes per-grade curriculum data
- `0e65e75` refactor: make study guides per-grade curriculum data
- `ad03d11` test: drive misconception and weighting checks from the registry

Tests 281/281 (up from 274). Lint 0, tsc clean. Verified independently by me:
`git log 8dbb53a..HEAD` shows exactly those three commits, and `npx vitest run`
reports 27 files / 281 tests passing.

Implementer-reported deviations from the briefs, all three of which are brief
defects rather than implementer errors:
1. `src/App.tsx` imported the moved `src/data/quizzes.ts`. The brief's file list
   missed it. Build would have broken without the fix.
2. Task 1's test snippet did not typecheck: `authoredFor()` returns
   `QuestionRef[]`, a union, and `.id` exists only on the authored arm. TS cannot
   narrow it even though the method only ever returns authored refs.
3. `src/curriculum/registry.test.ts` has a hand-built `GradeCurriculum` fixture
   that needed the two new required fields. Neither brief listed that file.

Ruling on all three: accepted as written. Each is a file the brief should have
named; none changes what the tasks were for. Cost if wrong: none — they are
mechanical consequences of the moves, and the suite proves the result.

Item (2) is carried into the review as an explicit question, because "fixed with
a cast" is the kind of fix that can quietly become `as any` and hide a real
union bug later. Task review dispatched on the full 8dbb53a..ad03d11 diff.

**Ruling: Task 4 dispatched in parallel with the Batch A review.** The skill bars
parallel *implementers*, not an implementer alongside a reviewer. Task 4's file
set (`src/curriculum/grade{1,2,3,4}/standards.ts` and one new test) is disjoint
from every file Batch A touched, and Task 4 depends on nothing Batch A produced —
standards data is independent of the quizzes/study-guides rewiring. Task 4 is
also the long pole of the plan, so serialising it behind a review buys nothing.
Cost if wrong: if the Batch A review returns a finding, its fix lands in files
Task 4 never opens, so the two cannot collide. Model: opus, because every later
task reads this data and no downstream test checks the prose.

Independent constraint checks I ran on Batch A myself, not delegated:
- no `fetch`/`XMLHttpRequest`/`sendBeacon`/`WebSocket`/analytics anywhere in `src/`
- `src/data/` removed; no stale imports of it
- `git diff --stat 8dbb53a..HEAD -- grade5/standards.ts misconceptions.ts` is
  EMPTY, i.e. the batch changed no curriculum content data, which is what a pure
  move-and-rewire should show

### Task 1–3: complete

Task review returned PASS on both verdicts — spec compliance and code quality.
No correctness bug, no constraint violation, no scope creep. Reviewer verified
independently that the moved files are byte-identical apart from import paths and
export names, and that `allUsedTags()`'s new registry-driven path reaches exactly
the same 17 Grade 5 standards the old direct-array iteration did.

Two findings, both taste-level. Rulings:

**R1 — `authoredFor()` narrowing cast. PARKED, no change.**
`integrity.test.ts` casts a `QuestionRef` to its authored arm to read `.id`.
Verified sound: `authoredFor()` only ever constructs `{kind:'authored', id}`.
It is an unchecked `as` rather than a type guard, so if that contract ever
widened to include generated refs it would read `.id` off an object lacking it
instead of failing to compile. But this is the pre-existing convention — the
identical cast already sat in `grade5/quizzes.ts` before this batch — so fixing
it here would be a codebase-wide refactor smuggled into a precondition task.
Cost if wrong: one latent read of `undefined` in a test, if someone changes
`authoredFor`'s contract without reading its callers. A proper `isAuthoredRef()`
type guard is the right fix, as its own change, later.

**R2 — `templates()` returns the live array by reference. QUEUED, not parked.**
`questionSource.ts` returns the closed-over array, so a caller could `push` or
`sort` into the internals that `itemsFor` and `hasGenerator` read. Only the
misconceptions test calls it today, and only reads. This came from my own brief
text, so it is my defect, not the implementer's. `return [...templates]` is a
one-line fix with no downside.
*Deferred, deliberately:* Task 4's implementer is running and verifies against a
green suite. Editing shared source underneath a running agent risks handing it a
transient failure it would then have to diagnose. Applying this the moment Task 4
commits.

### Task 4 — sourced standards for grades 1-4

Implementer returned DONE_WITH_CONCERNS. Commit `d71671f`, 304/304 tests
(281 baseline + 23 new), lint 0, tsc clean. Counts match the brief's table
exactly: grade 1 = 23, grade 2 = 23, grade 3 = 20, grade 4 = 25. It also
verified per-domain code ORDER against the JSON by hand, which the test does not
do — the test compares sets.

Four concerns raised. All four investigated by me, not taken on trust:

**C1 — brief/grade-5 colour conflict. Implementer was right, my brief was wrong.**
My Step 3 said "OA amber, MD violet". `grade5/standards.ts` in situ has MD amber,
OA violet. The implementer followed grade 5, citing my own "a domain looks the
same in every grade". Verified by grep: grade 5 is MD amber / OA violet, and
grade 4 now matches. *Ruling:* implementer's call stands; plan text corrected so
the grade 3/2/1 tasks do not inherit the error, with the added sentence that
`grade5/standards.ts` is ground truth if the two ever disagree.

**C2 + C3 — two source-JSON defects. CONFIRMED against the primary document, and
they were mine.** Not NCDPI's, and not the implementer's.
- `NC.1.NBT.7`'s only bullet was the cluster heading "Standard: Understand place
  value." — a section header with no mathematics in it.
- `NC.2.MD.5`'s only bullet was verbatim `NC.2.MD.6`'s ENTIRE text. I read the
  2025 Grade 2 Quick Reference Guide text back: it prints MD.5 and MD.6 as two
  separate standards with no sub-bullets under MD.5, and runs MD.5's text
  straight into the string "NC.2.MD.6" with no separator. My parser read the
  following standard as a bullet of the preceding one.

  This one had teeth. The implementer transcribed that bullet into MD.5's
  `keyConcepts`, so a later question author working NC.2.MD.5 would have seen
  MD.6's whole standard listed as one of MD.5's key concepts and written items
  assessing the wrong standard — with every test passing, because no test reads
  prose.

*Ruling:* corrected at the source, not just downstream. I then scanned all 108
standards for BOTH defect classes plus a third (a bullet containing an NC code):
1 instance, 1 instance, 0 instances — exactly the two the implementer found by
hand, and nothing else. Fixed `nc-standards-1-5.json`, `grade2/standards.ts`,
and recorded both in `PROVENANCE.md`. Commit `1e509a3`.

Note for the record: neither defect touched a standard CODE, which is why the
code-level cross-verification against the Quick Reference Guides never surfaced
them. Same lesson as the fabricated grade 5 weights — a source can be right in
one dimension and wrong in another, and each dimension needs its own check.

**C4 — my arithmetic in the brief was wrong** (predicted 13 tests, actual 23).
Harmless; the test file was used verbatim.

Queued ruling R2 applied in the same commit: `QuestionSource.templates()` now
returns `[...templates]` instead of the live array.

**Ruling: Task 5 is NOT dispatched in parallel with this review.** Unlike Task 4,
Task 5 consumes what is under review — it authors Grade 4 OA questions against
`grade4/standards.ts` descriptions, and I told the reviewer those descriptions
are the highest-risk area precisely because nothing tests them. Building content
on unreviewed prose is what the review exists to prevent. Waiting.

### Task 4: complete

Review: spec compliance PASS, code quality GOOD. The reviewer mechanically
verified all 91 codes in set AND order, all 10 weights, en dashes by codepoint,
zero `%` below grade 3, and re-derived `domainWeight()` by hand: grade 3 and
grade 4 both total exactly 100.0000. It independently re-ran my "no further
instances" scan three ways and confirmed it.

Six findings. Four fixed, one recorded, one acknowledged — commit `1766803`,
305/305 tests.

**F1 (real, fixed).** `grade2/standards.ts` called NBT "the largest Grade 2
domain by standard count". It is not: MD has 9, NBT 8. Load-bearing rather than
decorative, because grades 1-2 have no weights, so "largest by standard count"
is the only sizing signal the UI has — and 22 downstream tasks read
`DomainInfo.description` as their authoring prompt, so a study-guide author
would have repeated it in prose a child reads.

**F2 (ambiguous, fixed).** Grade 3 NBT "the smallest domain" and grade 4 NBT
"the second largest" were true by WEIGHT, false or tied by COUNT, sitting two
lines under an unlabelled percentage. Both now name the unit.

**F3 (not traceable, fixed).** `NC.1.G.1` carried the key concept "color and
size do not" — correct mathematics, and it matches the CCSS parent standard's
parenthetical, but it appears in neither NC source document. The only one of 91
that introduced an example the source lacks. Reworded to the source's own terms.

**F4 (recorded, not deleted).** `NC.2.OA.1`'s bullets contain "One-Step
problems:" and "Two-Step problems involving single digits". I widened the scan
to "any bullet ending in a colon": exactly one hit, this one. Checked the Quick
Reference Guide — these ARE printed; the standard's text ends "...when solving:"
and opens a genuine two-level list. So the JSON is faithful and the flat
`bullets` array is what lost the nesting. Deleting them would discard real NCDPI
content. Recorded in PROVENANCE instead, along with an honest statement of what
the scan actually covered — my earlier "no further instances" implied more than
it checked.

**F5 (acknowledged).** The reviewer is right that `1e509a3` bundled the
`templates()` hardening into a commit whose subject says "extraction defects".
Disclosed in the body, but someone bisecting a data defect lands on an engine
change. My error in batching; noted for the remaining tasks.

**F6 (no action).** Four descriptions complete a source stem ending in a colon by
adding one word, each supplied by the standard's own bullets. The reviewer's
numeric diff over all 91 found exactly one number not in the source, and it is
benign. Accepted.

### The finding the review surfaced indirectly — grade 5, again

The reviewer noted approvingly that the implementer declined to copy grade 5's
`weightCategory` style, `'Highest Priority (~14% of exam)'`. I checked why that
style existed. All seventeen grade 5 standards carried an invented per-standard
exam share, displayed in the study guide header next to the standard code.

They sum to **104**, not 100. And the MD total is 15, the G total 8 — those are
the fabricated 12-15% and 7-10% bands I corrected in `6a851cf` this morning,
still live. That fix reached `officialWeightRange` and never reached these
strings. Seventeen fabricated figures survived a correction aimed at exactly
this defect, in the same file, because nothing connected the two fields.

*Ruling:* fixed, in scope. Same defect class, same file, already-settled
principle, and grades 1-4 would otherwise have been honest while grade 5 lied.
Each now cites its domain's real band. Added an integrity test that rejects any
`weightCategory` percentage absent from its own domain's published band — and I
confirmed it FAILS on the old data before committing, rather than only passing
on the new. That is the check `6a851cf` should have shipped with.

### Task 5 — grade 4 OA content + the authored-bank test kit

Implementer returned DONE_WITH_CONCERNS. Commit `22ea01a`: the test kit, 17
authored items (OA.1x4, OA.3x5, OA.4x4, OA.5x4 — above the floor of 3 each), and
two generators. 331/331.

**The concern was a genuine plan defect, and a costly one. Ruling: fix the
harness, then send the task back.**

Task 3 scoped the misconception tag collector to `listCurricula()`. A grade's
content lands across five or six tasks and the grade registers only at the end,
so for that entire window every new tag is an orphan and the suite goes red.

The implementer diagnosed it correctly and worked around it: zero new tags, all
sixteen reused. But it then reported two places where a new tag was the right
answer, and — the part that matters — it **designed a distractor out of every
NC.4.OA.5 item** rather than file it under `counted-endpoints-not-intervals`,
whose `coordinate-plane` family would have told a parent their child has a
graphing problem when they have a pattern-counting problem. By its own account
that was the commonest Grade 4 pattern error.

So the plan was removing the app's best diagnostic content to keep a test green.
That is exactly backwards: the diagnostic distractor IS the product.

Fixed in `15a9b78`. `allContent.ts` discovers every authored file and template by
glob, registered or not. Registration says what the app offers a child; the tag
vocabulary says what content exists — different questions, so different sources.

**A bug in my own fix, caught before commit.** An eager `import.meta.glob` does
not merely match, it IMPORTS. `'./grade*/authored*.ts'` pulled in
`authored.oa.test.ts` and executed its `describe` blocks, grafting 57 unrelated
tests onto the misconceptions suite — which is why that file suddenly reported
60 tests instead of 3. Filtering paths inside the loop is too late; the negative
glob pattern is what actually prevents it. Verified the collector is not vacuous
by injecting an undeclared tag into an unregistered grade 4 item and confirming
the suite catches it.

Plan amended so the remaining twenty-one content tasks are told they may declare
tags freely, and told explicitly never to reuse a tag that names a different
error just to avoid declaring one.

Task 5 resumed with instructions to add the two tags, restore the removed OA.5
distractor, and re-examine all sixteen reuses with the constraint lifted.
Review held until that lands, so it reviews the content as it should have been.

### Task 5 review — content PASS, kit regression found

Reviewer worked all 18 items and all 60 distractors by hand before looking at
`isCorrect`, and swept both generators across their COMPLETE parameter spaces
rather than the 300 seeds `assertTemplateSound` samples out of 2^31.

Verdict: every answer key correct, every distractor reachable by the arithmetic
its comment claims, zero collisions in either generator. The collision algebra
in both files was re-derived independently and holds. The OA.5 scope claim
(single patterns only, two-pattern correspondence being NC.5.OA.3) checked out
against grade 5's standard text.

**F1 — the serious one, and mine. Fixed immediately in `1686899`, before
dispatching Task 6.** `assertAuthoredBankSound`, which I specified verbatim in
the brief, dropped the strongest content invariant in the repo: the
`numericValue()` guard in `grade5/authored.test.ts` that rejects two options
naming the same QUANTITY. The kit checked only distinct TEXT.

Grade 4's next two content tasks are Fractions and Measurement. A key of `1/2`
with a distractor of `4/8`, or `0.5` against `.50`, ships two right answers with
the suite green — and a child who picks the second is marked wrong. Twenty-one
banks were about to be built on that kit. Also promoted four invariants the kit
lacked: non-empty prompt, declared tags, `isStretch` agreeing with `difficulty`,
and the final worked-solution step stating the answer — which
`assertTemplateSound` already demanded of generators while nothing demanded it
of authored items.

**A false negative in my own verification, worth recording.** My first probe of
the restored guard injected a duplicate option and the suite passed. The guard
was fine; the probe was not — options carry units (`'30 feet'`), so my string
replace matched nothing and silently no-opped. A probe that no-ops is
indistinguishable from a probe that passes. Re-ran with `'144.0 feet'` against a
key of `'144 feet'` — different text, same value — and it fires. Every
negative-control probe from here asserts that its injection landed before
trusting the result.

**F2-F7 sent back to the implementer** as one fix round:
- `g4-oa5-04`'s stem asks which rule "generates" 3, 12, 48, 192, and the
  distractor "Add 9, then add 36, then add 144" genuinely does generate exactly
  those four terms. A careful child can be marked wrong. Stem defect, not key.
- `g4-oa4-01` offers 51; NC.4.OA.4 stops at 50, a bound the generator enforces
  and cites while the authored item crossed it.
- `g4-oa1-02` tags a distractor with a two-digit-divisor long-division error,
  which is NC.5.NBT.6 — a procedure the child has not been taught.
- Two authored items are exactly reproducible by their own generators, and the
  scheduler keys `{authored,id}` separately from `{generated,templateId}`, so a
  child can meet the same question twice under two identities.
- `ignored-remainder` on the factor-pair items surfaces to a parent as
  "Remainder Handling" when the problem is factor identification — the same
  argument the implementer itself used to move two other tags.
- Three tag descriptions that describe a different action than the one the
  child took.

Reviewer's two forward notes on my `allContent.ts` also fixed in `1686899`: the
templates glob now reaches every file under `templates/`, not just `index.ts`,
so a generator someone forgot to re-export cannot emit unchecked tags.

**Task 6 held until the fix round lands.** Both touch `misconceptions.ts` and
`grade4/templates/index.ts`; concurrent implementers on one file lose edits.

### Task 6: complete — grade 4 NBT

`48fe405` then `b2c0dda`. 438/438. Review: spec compliance PASS (one exception,
fixed), content quality STRONG. Reviewer solved all 18 items independently,
re-derived all 54 distractor comments, and verified all six exhaustive-sweep
counts really are the full parameter space.

**The plan told the implementer a lie and it caught it.** My Task 6 text called
`NC.4.NBT.7` "rounding". The sourced text says comparison with >, = and <, and
rounding appears NOWHERE in NC's grades 1-5 — CCSS has it at 4.NBT.A.3, NC's
revision dropped it. That was model recall in a plan whose first Global
Constraint forbids exactly that, and I repeated it three more times in the Grade
3 guidance. Corrected, plus a new Global Constraint: when a brief and
`standards.ts` disagree, `standards.ts` wins.

Tally worth keeping: four fabrications found in this project so far — two domain
weights, seventeen per-standard percentages, and one standard's entire subject.
Three of the four were mine. What catches them is never care at authoring time;
it is that every claim gets checked against a document by someone who did not
write it.

**The finding that mattered most — spec §6.5, "One template, one skill".**
`g4.nbt4.add-subtract` branched on the seed between two procedures. `ReviewKey`
is seedless and `sessionComposer.ts:45` re-realizes a due review at a FRESH
random seed, so both modes filed one key: a child who missed a subtraction gets
addition half the time at review, answers correctly, promotes the Leitner box,
and after five promotions the key retires as mastered — the borrow never
retested, the parent told a skill was repaired that the child still cannot do.
I verified this in the code before ruling. Split into `g4.nbt4.add` and
`g4.nbt4.subtract`, each now asserting its own misconception set so they cannot
silently re-merge. The tell generalises: disjoint tag sets mean two skills;
a shared distractor family (x/÷ by a power of ten) means one.

**Two range escapes.** The subtract distractor `n + m` was unbounded above
100,000 — 2.2% of seeds, max 109,925 — inside a standard bounded at 100,000.
The sibling test asserted the ANSWER stayed in range but never the distractors.
Now 0 over 100,000 across 200,000 seeds per template, and the bound check covers
options, prompts and explanations.

Four prose-vs-arithmetic defects also fixed, including a conceptSummary claiming
"80 more in the tens" where the ones place is worth at most 9, and an
explanation offering a nearest-thousand estimate as a check for a 90-unit
discrepancy it is structurally blind to.

Ten new misconception tags: eight judged clearly warranted with correct
families; the decimal-heritage argument checked against each near neighbour and
accepted. Two judgement calls named, neither blocking, both left as-is.

## Task 7: Grade 4 Number & Operations — Fractions

BASE b2c0dda, commit `3303f8e`. 24 authored items (4 per standard x 6), 7 generators,
11 new `fraction-operations` tags. Tests 438 -> 524 (+86), lint clean, tsc clean.

Implementer concerns, verified by me against `standards.ts` before dispatching review:
- NF.4 "any fraction less than one" — CONFIRMED, that is the sourced keyConcept text.
- NF.6 "Use equivalent fractions to add two fractions with denominators of 10 or 100"
  — CONFIRMED, a sourced keyConcept; the brief's decimal-notation framing would have
  dropped it. Implementer was right to follow standards.ts.
- NF.3 split into two template ids — required by spec §6.5, correct.

Ruling: the implementer following `standards.ts` over the brief in all three places is
upheld. That is the Global Constraint added after the NBT.7 rounding error, working as
intended for the first time.

Open for the content reviewer: `g4-nf1-02` uses denominator 20, which is outside NF.2's
sourced list (2,3,4,5,6,8,10,12,100). NF.1's own text names no denominators, so it is
arguably in scope — referred rather than ruled.

Review dispatched on opus: math-first, solve-before-looking, plus the value-collision
sweep and the numericValue() parse-gap audit.

### Task 8 pre-flight (brief vs standards.ts)

Three brief defects found before dispatch, all of the NBT.7-rounding class — the brief
describes content the sourced NC text does not ask for:

1. Ruling: **MD.2 is larger-unit-to-smaller-unit ONLY.** Sourced text: "convert metric
   measurements from a larger unit to a smaller unit". The brief's characteristic error
   "multiplying where dividing was needed" has it backwards — at Grade 4 the conversion
   direction is always multiplicative, so the error to model is DIVIDING when multiplying
   was needed. Cost if wrong: items drill a conversion direction NC does not test.

2. Ruling: **MD.4 is whole numbers only.** Sourced text: "Represent and interpret data
   using whole numbers." Common Core's 4.MD.B.4 puts fractional measurements on a line
   plot; NC does not. An implementer working from recall will write a line plot in
   eighths of an inch. Forbid it explicitly. Cost if wrong: a Grade 5 skill taught as
   Grade 4 and a child penalised for not having it.

3. Ruling: **MD.1/MD.2 are metric only** — centimeter, meter, gram, kilogram, liter,
   milliliter, per the sourced keyConcepts. No customary conversion at this grade.

4. Ruling: MD.1 and MD.2 get SEPARATE templates. The brief groups them under one
   "unit conversion" heading, but MD.1 is solving metric word problems and MD.2 is
   converting between units — different skills, and spec §6.5 forbids one template
   spanning both.

Verified present, brief is accurate on these: `promptDetails` is a real Question field
rendered by QuizRunner/QuizResults/WeakSpotsView; `grade5/templates/md1-unit-conversion.ts`
exists as the cited model. MD numbering is non-contiguous (1,2,3,4,6,8) — six standards,
not eight, is correct.

### Task 7 review — CHANGES REQUESTED, fix round 1 dispatched

Reviewer verdict: the mathematics is clean. All 24 items solved cold before looking at
the keys, all 24 agree; no second correct answer in any item (15 numeric checked by
value, 9 prose checked for a second true statement); every explanation lands on its key;
all seven generator spaces re-derived in an independent script — counts, barred
collisions and bounds all confirmed.

13 findings, 1 of them a genuine math defect. Fix list at `task-7-fixes.md`.

Rulings made on the findings:

- **F1 upheld (the only math defect).** `g4-nf7-04` option `0.7 < 0.07` tagged
  `omitted-placeholder-zero`; that error reads 0.07 as 0.7 and yields `=`, not `<`.
  Verified myself in the source. Fix is the option text, not the tag — placeholder zeros
  are the item's subject.
- **F3: the items are fine, the comment is wrong.** `0.018 m` and `0.009` are thousandths
  DISTRACTORS, which is precisely the shifted-place error NF.6 exists to catch; no child
  computes in thousandths. Narrow the header claim rather than touch the items.
- **F4 ruled against the authored items.** NF.1's sourced text names no denominators, so
  20ths and 15ths are defensible in isolation — but the standard's own generator
  restricts to NF.2's list, and a standard contradicting its own generator is worse than
  narrower practice. Aligning. Cost if wrong: a slightly smaller equivalence set.
  (This settles the question I referred to the reviewer.)
- **F7 upheld.** Ordering four fractions via a 120ths common denominator is a Grade 5
  move; NF.2's sourced strategies are benchmarks and common numerators. Worked solution
  must lead with benchmarks and never print a denominator off the list.
- **Ruled NOT to change:** `g4.nf3.add-like` printing a key of `8/8`. NC.4.NF.3 never
  requires simplest form and 8/8 is a true and useful thing for a child to see. Adding a
  closing step that names it as one whole instead. Cost if wrong: an answer that looks
  unfinished to a parent.
- F2 (NF.3 decomposition absent — it is the standard's headline description), F5, F6,
  F8-F11 accepted as written.

### Task 7 fix round 1 — `bbf25a7`, 538 passing (+14). Re-review dispatched.

All eleven fixes plus the do-not-change instruction applied. Bank 24 -> 27 items,
7 -> 8 generators. F1 corrected to `0.7 = 0.07`.

Rulings on the implementer's four concerns:

1. F6 landed at 35, not 36 — accepted. Reworking `g4-nf1-02` for F4 moved a second
   authored item into the generator's space, so a second bar was required. The two fixes
   interacted; 35 is the honest number.
2. **`(4,12,3)` left drawable — UPHELD.** `g4-nf1-04` uses 3/4 = 9/12 but presents four
   EQUATIONS, so a child never sees the four strings the generator prints. The
   duplicate bar exists to stop the scheduler serving one question under two identities,
   not to stop a fact appearing twice in two forms — seeing 3/4 = 9/12 as an equation
   and again as a choice of fraction is practice, not repetition. Cost if wrong: a child
   meets the same fact twice in a session.
3. **F7's 81 -> 46 cut — UPHELD.** The loss is driven by a constraint on the EXPLANATION,
   not the question, and that is the right place to hold the line: a generator that
   teaches a Grade 5 common-denominator method at Grade 4 is worse than a smaller
   generator. If variety proves thin, the fix is more authored items, not a looser
   explanation.
4. Confirmed independently: 7/8 = 0.875 and 11/12 = 0.9167, so `g4-nf3-04`'s old
   reasonableness check was simply false. It shipped in `3303f8e` and survived a review
   that solved every item — because the check was prose ABOUT the answer, not the answer.
   Worth remembering: the solve-it-cold pass does not cover commonMisconception strings.

### Task 9 pre-flight note (banked early, Grade 4 Geometry)

Three standards only: `NC.4.G.1` (points, lines, rays, angles, perpendicular and
parallel), `NC.4.G.2` (classify triangles and quadrilaterals by angle measure, side
lengths, and presence/absence of parallel or perpendicular lines), `NC.4.G.3` (recognise
symmetry, identify and draw lines of symmetry).

The standing problem: **every one of these standards is written around DRAWING and
SEEING, and this app ships no image assets.** "Draw and identify", "recognize symmetry",
"draw lines of symmetry" cannot be asked directly. Items have to be posed in words a
screen reader can read, via `promptDetails` — "a quadrilateral with exactly one pair of
parallel sides", "how many lines of symmetry does a regular hexagon have". G.3 is the
tightest squeeze of the three.

Ruling to carry into the Task 9 dispatch: prefer counting and classification questions
over identification-from-a-picture, and state plainly in the bank header that the
visual half of G.1 and G.3 is out of reach for a text-only app rather than pretending
ASCII art covers it. Cost if wrong: the Geometry bank under-serves a domain sharing a
23-27% band.

### Task 7 re-review — APPROVED

New mathematics verified clean: no wrong key, no second correct answer, no distractor
comment failing to produce its option. Both decomposition items checked for MULTIPLE
valid decompositions — the trap that question shape sets — and each offers exactly one.
All 11 fixes ADDRESSED; the `8/8` non-change honoured and gated on `sum === d`.
Concerns 1-4 all upheld as I ruled them; reviewer independently re-derived the 35 count
and verified all 46 NF.2 worked solutions claim-by-claim.

Seven NOTEs, none blocking. Fix round 2 dispatched with five of them (`task-7-fixes-2.md`).

**Pattern worth naming, seen twice in two rounds:** the fix was right and the CLAIM
ABOUT the fix went stale in the same commit. Round 1 narrowed the header's thousandths
paragraph; the new NF.6 generator added in the same commit prints thousandths on all 71
draws, so the narrowed paragraph is false again. Round 1 exported `numericValue` so the
test could not keep a drifting copy; the generator sweeps in the same commit re-derive
option texts inline instead of calling `generate()`, which is the identical shape of
problem one layer down. Both are cheap to fix and neither is a live bug today. The
lesson is that a commit's prose and its verification code both need re-reading against
what the commit ADDED, not only against what it changed.

Parked, documented, not fixed: `g4-nf3-05/06` and `g4-nf1-04` are expression-shaped, so
`numericValue` returns null and the automated value guard does not cover them. Inherent
to offering equations as options; hand-checked clean by the reviewer. Getting a one-line
comment each so nobody later assumes the guard has them.

### Task 7: complete

`3303f8e` + `bbf25a7` + `5a0df68`. 543 passing (verified), lint and tsc clean.
27 authored items across 6 standards, 8 generators, 11 new `fraction-operations` tags.
NF is Grade 4's heaviest domain at 30-34%.

Round 2 closed all five notes plus the three park comments. The implementer went past
the patch on the stale-claim pattern: the thousandths paragraph now records IN FILE that
it has been wrong twice and states what belongs in its list, and each sweep says why it
drives `generate()` instead of rebuilding what `generate()` ought to print. Seed counts
were measured rather than guessed (full coverage first occurring at 200 / 301 / 353 /
5,158 / 1,133 / 295 / 316 / 28,118).

Ruling on its two closing concerns — both accepted, neither actioned:
- The NF.7 sweep costs ~1s at 60,000 seeds, the slowest test in the Grade 4 suite. Its
  own diagnosis is right: if suite time ever matters, cut the whole-number part `w`
  (0-9, a factor of 10 that teaches nothing), not the seeds. Noted for later, not now.
- Coverage is now asserted by observation (`seen.size === 71`) plus a per-seed
  admissibility check. Neither alone equals the old enumeration; together they do, in
  both directions. Both are load-bearing and a future edit that drops either one
  silently weakens the guard. Recorded here because the test file cannot say it as
  loudly as this can.

---

## Session resumed 2026-09-13 (new controller session)

Ledger identity confirmed. Task 7 complete at `601ba31`. Task 8 was pre-flighted
(four rulings above) and dispatched, but its implementer never reported: the tree
holds untracked `authored.md.ts` (1136 lines), four `templates/md*.ts`, and a
+147-line uncommitted edit to `misconceptions.ts`. No `.test.ts` files, no index
registration. Baseline verified before resuming: 543 passing at `601ba31`.

Ruling: re-dispatch Task 8 fresh rather than trust the orphaned work. The
implementer is told the partial work exists, is unreviewed, and is its to keep,
rewrite or discard on the merits. Cost if wrong: it rewrites content that was
already fine.

Ruling: commit trailer uses `Claude-Session: .../session_01WHu3ZCRhRuKXcW8mR7AMx4`,
this session, not the id frozen into the plan's Global Constraints. `601ba31` and
`5a0df68` already do. Cost if wrong: session links point at the session that
actually made the commit, which is the point of the field.

### Task 8 (re-dispatch) — BASE `601ba31`

Task 8 implementer dispatched (opus) with the brief plus the four pre-flight rulings
above, told the orphaned work is unreviewed and its to judge.

In parallel, two READ-ONLY pre-flight auditors dispatched (opus) — neither writes to
the repo, so neither collides with the implementer:
- Tasks 9/10/11 (Grade 4 Geometry, study guides, registration) -> `task-9-11-preflight.md`
- Tasks 12-16 (all of Grade 3) -> `task-12-16-preflight.md`

Ruling: pre-flight the whole remaining Grade 4 and Grade 3 span now rather than one
task ahead. The NBT.7 rounding defect and the three MD.x defects were all the same
class — a brief asserting mathematics the sourced text does not ask for — and that
class is cheaper to catch in a batch against `standards.ts` than one dispatch at a
time. Cost if wrong: two audits whose findings go stale if the plan is later revised.

### Tasks 9/10/11 pre-flight — 12 findings, all ruled

Audit at `task-9-11-preflight.md`; binding rulings at `task-9-11-rulings.md`, which
every Task 9/10/11 dispatch carries. Summary of the rulings:

- 9.1/9.2 upheld: the brief drops mathematics `standards.ts` asks for. `NC.4.G.2` is
  "Classify quadrilaterals AND triangles"; the brief names only quadrilaterals, so
  triangle classification would have shipped unauthored behind a green
  `assertAuthoredBankSound` (it only checks the floor of three items). `NC.4.G.1` is a
  six-object standard whose keyConcepts include parallel and perpendicular lines; the
  brief treats it as ray-vocabulary.
- 9.3 upheld: the brief says the shape-classification family "already exists for
  exactly this kind of error", but the registry has no symmetry tag at all. Read as
  "no new tags needed" it pushes the implementer into the reuse the Global Constraints
  forbid. New tags required.
- 9.4 ruled: aggregate coverage test moves to its own `authored.test.ts`, per the
  Content Contract and the Grade 5 precedent. Task 9 also fixes the now-false
  `templates/index.ts` docstring.
- 10.1 ruled AGAINST the brief: it banned every percentage in MD/G guides, but the
  23-27% combined band is a published figure for the PAIR and `weightLabel()` renders
  it. Permitted when the sentence names both domains; test retargeted.
- 10.2 upheld: extend the band assertion to EVERY guide. The brief tested only MD/G,
  so an invented NF percentage would ship green — the exact defect `integrity.test.ts`
  exists to catch after Grade 5 shipped seventeen of them.
- 10.3 ruled AGAINST both the brief and the audit: guide titles need not equal the
  standard title. Grade 5 rewords several on purpose. Prose claim dropped.
- 10.4 upheld: exclude the 80% SSA bar from the percentage guard.
- 11.1 ruled: HYPHEN wins. All 84 committed Grade 4 ids are `g4-oa1-01`; the brief
  asserted `g4.` and could not have passed, and the natural fix would have been an
  84-id rename. Plan Content Contract line 41 corrected in place so Grade 3 does not
  repeat the split. Cost if wrong: a rename nothing depends on.
- 11.2 upheld: `registry.test.ts` pins `toEqual([5])` and MUST redden at registration.
  Named in the brief now so the implementer does not hunt a Grade 4 defect that does
  not exist.
- 11.3 ruled: keep the duplicated grade4.test.ts assertions with a comment (Grade 5
  precedent, one-file diagnosis).
- 11.4 noted: the hasGenerator floor depends on Task 8 registering its MD templates.
  Task 11 verifies rather than assumes.

### Tasks 12-16 pre-flight (Grade 3) — 28 findings, ALL UPHELD

Audit at `task-12-16-preflight.md`; binding rulings at `task-12-16-rulings.md`.
Every Grade 3 dispatch carries the rulings file.

Ruling: all 28 upheld without exception. Each quotes `standards.ts`, which the auditor
separately verified is verbatim-faithful to `nc-standards-1-5.json` for all 20 Grade 3
codes, so the governing rule applies cleanly and there is nothing to weigh. Cost if
wrong: the corrections cost extra authored items and split templates; the reverse
error ships off-standard mathematics behind a green suite.

Nineteen of the 28 are ONE defect class: a brief phrase importing Common Core's
version of a standard, or the next grade's. Grade 3 is the worst-hit batch because
NC Grade 3 diverges from CCSS Grade 3 in more places than any other grade here.
The worst three:
- 14-1 `NC.3.MD.2` is CUSTOMARY measurement (cups/pints/pounds, quarter-inch). The
  brief said "mass or volume", which is CCSS 3.MD.A.2 metric vocabulary; NC metric is
  Grade 4 and already shipped as `md2-metric-convert.ts`. Two words of recall would
  have sent a whole standard inside a 23-27% band to another grade. A regex guard
  against metric words in Grade 3 MD prompts is now required.
- 13-1 one template spanning NF.3+NF.4 naturally generates 2/3 vs 3/4 comparisons —
  that is `NC.4.NF.2`, which already has a landed Grade 4 generator. NF.4 is same
  numerator OR same denominator only.
- 14-3 the Geometry misconception ("unequal parts called a quarter") is CCSS 3.G.2, a
  standard NC does not have. G is a ONE-standard domain, so it would have been a third
  of Grade 3 Geometry, on-code and passing every test.

Two structural defects that would have stopped the batch dead:
- 16-1 `startsWith("g3.")` — same hyphen/dot defect as 11.1, ruled the same way.
- 16-2 registry.test.ts pins BOTH `getCurriculum(3)` throwing AND `toEqual([5])`.
  Task 16 says "Expected: PASS" at Step 6; it cannot pass. Both edits are now part of
  the task.
- 16-3 mock SSA allocation 9/3/8/8 puts MD+G at 28.6%, outside its 23-27% band.
  Corrected to 10/3/8/7 = 35.7/10.7/28.6/25.0, every band satisfied.

Ruling: pre-flight Grades 2 and 1 as well, now, before any of their tasks are
dispatched. Two more read-only auditors sent (Tasks 17-21, Tasks 22-26). With four of
four audited batches returning defects of the same class — including one that already
shipped — the prior that an unaudited brief is sound is gone. Grade 1-2 audits also
carry the no-blueprint rule (no EOG below grade 3) and, for Grade 1, treat
age-appropriateness as a first-class correctness check. Cost if wrong: two audits
whose findings go stale if the plan is revised.

### Task 8 — implementer DONE at `a9ca4c0`, review dispatched

597 passing (+54 over the 543 baseline), lint 0, tsc clean. 21 authored items across
all six NC.4.MD standards, 5 templates (MD.1, MD.2, MD.3 area, MD.3 perimeter, MD.6 —
the last newly written), all registered in `templates/index.ts`, all with sibling
tests. 27 new misconception tags plus a `time-intervals` family.

The implementer kept the orphaned work after checking its mathematics cold, with four
corrections. Three of those are worth recording because they are a class the shared
kit does NOT catch: `g4-md2-01`, `g4-md3-01` and `g4-md3-02` each sat inside their
own generator's parameter space, so a seed could serve a child the same numbers under
a second review key. `assertNoGeneratorDuplicatesAuthored` compares PROMPTS; these
collisions were in `promptDetails` and option values. The fourth was a real defect:
`g4-md4-03`'s final step never stated its answer.

Reviewer dispatched on opus, math-first: solve every item cold before looking at the
key, re-derive every template parameter space independently, check every item against
the sourced standard text and the four pre-flight rulings. Told explicitly that the
inherited 1,660 lines have never been reviewed by anyone and are new code under
review, not pre-existing code it may skip.

Controller committed `6dcc2a2` (docs-only): the plan Content Contract's item-id
separator, per ruling 11.1. Kept out of the task diff deliberately — it is a plan
correction, not Task 8 content. The review range is `601ba31..a9ca4c0` and excludes it.

### Task 8 review — Approved, 2 Important; fix round 1 dispatched

Mathematics confirmed sound end to end. The reviewer solved all 21 items cold before
looking at any key and every key matched; re-derived all three by-construction
exclusion proofs BY ENUMERATION and confirmed them, including the exact 1,208-of-1,215
claim on md6; verified every distractor is reachable by the error its declared tag
names. All four pre-flight rulings honoured against the sourced text.

Notable: the implementer followed `standards.ts` over the brief on MD.3 vs MD.8 — the
brief assigns area/perimeter to MD.8, but standards.ts has MD.3 = area & perimeter and
MD.8 = time intervals. That is the Global Constraint working as intended for the
second time, and it means the Task 8 brief had a FIFTH defect of the same class that
pre-flight did not catch. Worth noting for the final review: pre-flight catches most
of this class, not all of it.

Ruling: the implementer's self-flagged `g4-md6-02` concern is dismissed. The reviewer
checked `assumed-a-right-angle` against its declaration — "reporting how far the given
angle falls short of a right angle" — which is exactly 90-35=55. Not a mis-filed tag.
Cost if wrong: one weak distractor in a 21-item bank.

Two Important findings into the loop:
- `g4-md4-04` may have a second defensible answer. The stem asks which question yields
  NUMERICAL data; "How many students in our class own a dog?" answers yes to the
  standard's own "is it a number?" test. The discriminator is argued only in the
  explanation, not forced by the stem.
- All five template sibling tests PIN NOTHING. Each fixes a seed then derives the
  expectation from the generator's own printed prompt — self-consistency, passing for
  any output, blind to a pool or ordering change. The Content Contract requires fixed
  seeds pinning a known question and answer.

Task 8: minor (deferred): md1 can emit 90-litre watering cans and 20-gram rice bags —
  each context shares one 20-90 range; the file's own commonMisconception tells children
  to sanity-check magnitude.
Task 8: minor (deferred): `55 degrees` is the weakest distractor in the bank (correctly
  tagged, but requires reading 35 correctly then answering a different question).
Task 8: minor (deferred): the banned-unit regex exempts "cup" wholesale and omits ton,
  centiliter, millimeter.
Task 8: minor (deferred): five data-display tags filed under `geometry-and-measurement`
  where a `data-and-graphs` family would fit; follows existing precedent, not a
  regression.
Task 8: minor (deferred): heaviest test block in the grade — md6 drives 30,000 seeds,
  authored.md.test.ts ~44,000 generate() calls. md6 reaches full coverage at ~12,000.

### Tasks 17-21 pre-flight (Grade 2) — 32 findings, ALL UPHELD

Audit at `task-17-21-preflight.md`; rulings at `task-17-21-rulings.md`. The auditor
dumped `nc-standards-1-5.json` key "2" in full and compared it line by line with
`grade2/standards.ts`: all 23 codes, descriptions and bullets match. Verified proxy.

Two worst:
- 18-1 `NC.2.NBT.6` is THREE two-digit numbers. The brief says FOUR, which is CCSS
  2.NBT.B.6 verbatim — NC cut it to three. Four two-digit addends reach 396, so the
  generator would emit sums past 300 with two regroupings: out of grade, and harder than
  NBT.5 (within 100) permits anywhere.
- 19-1 THREE MD codes cycled by one. Brief: time=MD.6, money=MD.7, number line=MD.8.
  Source: MD.6 number line, MD.7 time, MD.8 money. Worse than a mislabel, because the
  brief's routing also decides templated-vs-authored — the money and time generators
  would carry the wrong standardCode and pass BOTH `integrity.test.ts` and
  `templates/index.test.ts`, since the codes exist and belong to the grade. A child who
  cannot read a clock gets recorded as weak on number lines.

That is the 4th and 5th standard-code swap found (Grade 1 had three). Running total
across four audited batches: 108 findings, every one upheld.

21-4 is the first finding that reaches shipped UI rather than unwritten content, and I
verified it myself: `src/components/Dashboard.tsx:91` renders "Weighted by official NC
EOG blueprint domain weights" UNCONDITIONALLY, for every grade, directly under "Overall
SSA Readiness Gauge". For grades 1-2 that is false, and it is a larger claim than the
column heading Task 21 was written to fix, because it describes the number the parent
acts on. The file is not in Task 21's Files list, and the task's own verification step
is a grep for `Blueprint Weight|blueprint weight` over `src/` — so the gate CANNOT be
satisfied while that line stands. Task 21 would have shipped declaring the UI honest.

Ruling: fix `Dashboard.tsx` in Task 21 even though the approved single-path redesign
spec deletes that file outright. The redesign is out of scope for this plan, wants its
own branch, and may never land; shipping a false blueprint claim to grade 1-2 parents
in the meantime is not acceptable. Cost if wrong: four conditional lines thrown away
when the redesign lands.

Ruling: the registration defects are now systemic, not incidental. All four registration
briefs (11, 16, 21, 26) assert a dotted item-id prefix against hyphenated ids, and three
of four omit `registry.test.ts` while promising a green suite. Each rulings file carries
the correction; noting the pattern here so the final review can check the four landed
registrations against each other rather than one at a time.

### Task 8: fix round 1/5 (2 addressed, 0 open; commits 6dcc2a2..ae39fdd)

Re-reviewer verdict: both ADDRESSED, no new breakage, sweeps untouched.

F1: the implementer re-worded the stem instead of swapping the option, arguing that
replacing it would orphan `asked-for-a-single-total-not-data` and redden
`misconceptions.test.ts` (which fails in both directions). Re-reviewer verified the
claim holds — tag declared at misconceptions.ts:140, still consumed by the same option
— and then solved the item fresh against the new stem: "every student ... answer one
survey question with a number about themselves" excludes the class-level fact by the
stem itself rather than by the explanation. Only one option survives. Good call by the
implementer: the cheaper-looking fix would have broken a different test.

F2: all ten pins now assert literal prompt, promptDetails, answerText and a literal
ordered option array, verified NOT re-derived through the generator's own helpers.

Task 8: minor (deferred): in `md3-rectangle-area.test.ts` and
  `md3-rectangle-perimeter.test.ts` the SECOND pinned-seed test omits the
  `options.find(o => o.isCorrect).text` assertion its sibling and the other three files' 
  second pins all carry. The generator could flag the wrong option correct and that pin
  would not catch it. Contained: the first pin in each file does check it, and
  assertTemplateSound asserts exactly-one-correct at 300 runs.

### Task 8: complete (commits 601ba31..ae39fdd, review clean)

21 authored items across all six NC.4.MD standards, 5 templates, 27 new misconception
tags, 597 passing. Mathematics verified cold by an independent reviewer.

### Task 9 (Grade 4 Geometry + aggregator) — BASE `ae39fdd`, implementer dispatched

Carries the brief, the Task 9 section of `task-9-11-rulings.md`, and the
source-over-brief instruction with the Task 8 MD.3/MD.8 near-miss as the worked
example of why. Two known brief defects pre-ruled: G.2 covers triangles as well as
quadrilaterals, G.1 includes parallel and perpendicular lines.

### Task 9 — implementer DONE at `304c5af`, review dispatched

610 passing (+13), lint 0, tsc clean. Both ruled brief defects confirmed against the
source and resolved in the source's favour: `NC.4.G.2` now classifies triangles (2 of
5 items) with all three sourced criteria exercised, `NC.4.G.1` covers parallel and
perpendicular lines (2 of 4 items). 18 new misconception tags DECLARED rather than
borrowed — confirming ruling 9.3: the brief's claim that the shape-classification family
"already exists for exactly this kind of error" was false for symmetry and line
vocabulary.

Correction to my own ruling 9.1: I quoted the existing tag as
`used-exclusive-trapezoid-definition`. The implementer reports it is spelled
`exclusive-trapezoid-definition`, and I verified that at misconceptions.ts:475. My
ruling misquoted it; the implementer was right to follow the tree. No harm — the tag
exists and is used — but worth recording that a ruling written from a report rather than
from the file carried an error into a dispatch.

Reviewer dispatched on opus. Told the primary risk in a CLASSIFICATION bank is the
second-defensible-answer case, because shape hierarchies overlap: every square is a
rectangle and a rhombus, and NC's INCLUSIVE trapezoid definition makes every
parallelogram a trapezoid. Also told to judge each `promptDetails` figure description
on sufficiency — nearly every Geometry item is a figure, and the constraint is that a
screen reader must be able to convey it.

Referred to the reviewer rather than ruled: the implementer's own concern on
`g4-g2-04`, where a "Scalene triangle" distractor is INDETERMINATE rather than false
(the prompt asks for classification by angles and gives no side lengths). Its argument
is that the prompt and worked solution both state the constraint. I declined to adopt
that framing and asked the reviewer to decide independently whether an
indeterminate-rather-than-false option is a legitimate distractor for a nine-year-old,
or whether it teaches that "not enough information" equals "wrong".

### Task 9 review — Approved, zero Critical, zero Important

Reviewer solved all 12 items cold; all 12 keys correct. No second defensible answer
anywhere, which was the flagged primary risk in a classification bank. The two
deliberate near-misses are handled correctly: `g4-g2-02` never offers "trapezoid" as a
FALSE statement about a parallelogram (it would be true under NC's inclusive
definition), and `g4-g2-01` offers "Parallelogram" — true, but the prompt asks for the
MOST SPECIFIC name and the option is tagged `named-a-broader-category`. Handled, not
accidentally ambiguous.

Every reused tag checked against its registry description and none mis-filed. Every
promptDetails figure judged answerable from text alone — no item needs a picture.

Ruling on the referred `g4-g2-04` question: the reviewer independently judged the
option LEGITIMATE but explicitly NOT for the implementer's stated reason. "Scalene" is a
side-length name and the prompt says "Based on its angles", so the option fails on
ATTRIBUTE, not on truth value — the child is never asked whether the triangle is
scalene, so the item does not teach that "not enough information" equals "wrong".
`classified-by-the-wrong-attribute` names precisely that error. Upholding the
reviewer: the option stands, and the implementer's framing is recorded as wrong so it
is not reused as precedent. This is why it was referred rather than ruled on the
implementer's own account.

Task 9: minor (deferred): `authored.g.test.ts:47-58` "never states one fact twice in
  two wordings" only catches verbatim-identical strings after normalisation. The
  assertion is worth keeping; its title and docstring overclaim what it guards.
Task 9: minor (deferred): `g4-g1-02` calls segments "lines" inside the one standard
  that teaches the segment/ray/line distinction.
Task 9: minor (deferred): `NC.4.G.1` coverage — no item identifies a point or an angle,
  and keyConcept "Rays and the angles they form" is half exercised. Floor met 4x over.
Task 9: minor (deferred): `named-a-triangle-by-its-smaller-angles` and
  `called-a-large-angle-a-right-angle` sit in different families despite being the same
  class of error in the same item. Both truthful to a parent; cosmetic.
Task 9: minor (deferred): `authored.test.ts:45-53` partly overlaps the per-bank kit
  check, though it is the only check spanning all five banks.
Task 9: minor (deferred, PRE-EXISTING, not this task): the kit at
  `authoredBank.testkit.ts:137-141` checks the mastery/advanced difficulty spread
  DOMAIN-WIDE, not per standard. Task 9 satisfies the per-standard spread but nothing
  tests it. Applies to every authored bank in the plan — flagging for the final review.

### Task 9: complete (commits ae39fdd..304c5af, review clean)

### Task 10 — implementer DONE at `88f643a` (2 commits), review dispatched

615 passing (+5), lint 0, tsc clean. 25 guides, one per Grade 4 standard. All four
rulings applied and both new guards reported mutation-tested red.

Notable: the implementer found NO mathematical disagreement between brief and source
this time — it checked MD.3/MD.8, G.2 triangles and NBT.7 rounding specifically and the
brief was right on all three. That is the first clean source check in the plan, and it
makes sense: Task 10 writes ABOUT standards rather than authoring items for them, so it
inherits the corrections Tasks 8 and 9 already made.

Review package spans BOTH commits (`304c5af..88f643a`), not `HEAD~1` — the self-review
pass is half the change.

Three implementer concerns referred to the reviewer rather than ruled, so it reaches its
own verdict without my framing:
- It added an assertion beyond ruling 10.2's literal text: every guide must cite at
  least one band figure. I gave the reviewer the Content Contract clause verbatim
  ("`whyItMattersForSSA` must cite a real figure") and let it judge. My own read is that
  the contract requires it and the assertion is correct, but the reviewer decides
  whether it is overbuild.
- 1,082 lines for 25 guides against Grade 5's 547 for 17 — 43 lines/guide vs 32. I
  verified those counts. Asked the reviewer to judge whether the extra ~11 lines per
  guide is substance or padding.
- Nine MD/G guides carry necessarily-similar "weighted together ... 23-27%" sentences,
  a direct consequence of ruling 10.1.

### Task 10 review — Needs fixes (2 Critical, 3 Important); fix round 1 dispatched

The highest-risk part is clean: all 25 percentages verified against the blueprint
(6x30-34 NF, 6x25-29 NBT, 9x23-27 MD+G, 4x14-18 OA, matching domain membership
exactly), no invented figure, no per-standard share, and all nine MD/G sentences name
both domains. All 25 worked examples solved by hand and correct.

Rulings on the three referred implementer concerns, all resolved AGAINST the
implementer's doubt:
- The extra "cites no blueprint figure" assertion STAYS. The Content Contract requires a
  real figure, and without it the guard is vacuous for a guide that omits the band. Not
  overbuild.
- 1,082 lines is the right shape. The extra ~11 lines/guide is substance — more
  rulesAndFormulas and bank-derived commonTraps — not padding. No split.
- The nine repetitive MD/G sentences are not a defect; each has its own lead-in and the
  repetition is forced by ruling 10.1.

2 Critical, both the SAME failure mode and worth naming: a vivid number lifted from a
bank item into a guide whose worked example uses different numbers.
- `:672` "multiplying every side gives 280 for a 13 by 9 room, nearly seven times the
  real floor" — 13x9x13x9 = 13,689, and 280 is 2.4x the 117 floor. The 280 belongs to a
  RECTILINEAR figure at authored.md.ts:716 with sides 7,5,4,2, where 7x5x4x2=280 really
  is ~7x its area. Falsifiable by a parent against the guide's own example in ten seconds.
- `:42` keeping the old numerator on 2/3 -> twelfths gives 2/12, NOT 3/12. 3/12 is a
  different error with its own tag, and it is the very next trap in the same list, so
  the two are conflated. "Half as much" is true only in the bank item it came from
  (3/4 -> eighths).
The fix dispatch tells the implementer to audit every OTHER commonTrap carrying a
specific figure against its own guide's example — the reviewer sampled the rest and
found them sound, but it sampled.

Important 3 is the best catch of the session: `officialWeightRange.includes(n)` is a
SUBSTRING test. `"30-34%".includes("3")` is true, so "Fractions are 3% of the test"
ships green; `"25-29%".includes("25")` is true, so "Base Ten is 25%" ships green — a
point value NCDPI never published. The implementer's reported 40% mutation went red only
because "40" happens not to be a substring. A guard reported as mutation-tested was
nearly vacuous. Fix requires re-mutation-testing with 3% and 25%.

Important 4: the 10.1 guard tests the whole field, not the SENTENCE carrying the figure,
so "Geometry is 23-27%. Measurement and Data is tested alongside it." would pass while
making the banned claim. Guard defect, not content defect — all nine guides comply.

Important 5: the MD.8 method is forward-addition-only while the sourced description
covers addition AND subtraction of time intervals; followed literally it asks a child to
take 15 minutes out of 10.

Ruling: I moved ONE minor into the fix round — the NF.3 method's "at Grade 4 they always
will" claim about denominators, which is false at NC.4.NF.6 three entries later in the
same file. It is the same class as the two Criticals (a false statement in a guide) and
the implementer is already editing that neighbourhood for Critical 2. Cost if wrong: one
extra edit in a round that was happening anyway.

Task 10: minor (deferred): rulesAndFormulas/stepByStepMethod/commonTraps/
  workedExample.steps are array-length checks only; an array of empty strings passes.
Task 10: minor (deferred): British "marks" register at :562, :729, :991 — NC EOG scores
  in points.
Task 10: minor (deferred): MD.1 trap says 1,250 litres "would fill a small swimming
  pool"; it is ~1.25 cubic metres, a large tub.

### Task 10 fix round 1 — `6ec4821`, scoped re-review dispatched

All five findings reported fixed plus the reassigned NF.3 minor. Mutation evidence
reported: `3%` red, `25%` red, and the exact two-sentence Geometry string red naming the
offending sentence.

The requested sweep found EIGHT more commonTraps carrying an unanchored figure. The
implementer reports none were arithmetically false. That claim is the one I told the
re-reviewer to try hardest to disprove and to re-solve independently: the two Criticals
were exactly this class and the implementer's own first self-review passed over both.

Re-reviewer also asked to attack both tightened guards rather than accept them — to try
a hyphen instead of the en dash U+2013, `~25%`, `30.5%`, an endpoint-only citation, and
to judge whether the sentence split survives abbreviations, decimals mid-sentence, and a
figure in a final sentence with no terminator. And to follow the new MD.8 method
LITERALLY on all four branches including 3:45 + 10 min, which is the case that broke
before. A method that works on its own worked example and breaks on a neighbour is the
defect that was reported.

### Task 10: fix round 1/5 (6 addressed, 2 new Important; commits 88f643a..6ec4821)

All six verdicts ADDRESSED. Both guards attacked with 16 adversarial strings — nothing
slipped through. The sweep claim held: all eight extra traps re-solved independently,
none false. Mutation evidence judged to redden for the RIGHT reason, reproduced against
the shipped guard code rather than taken on trust — `"25-29%".includes("25")` was true
under the old guard and is false under the new one, which is the decisive case.

But the fix introduced two new Important defects, both in the new MD.8 method, both the
SAME literal-following class as the finding they were written to fix:
- step 5 (start time) got no smaller-interval guard though step 3 did: "ended 4:35 after
  20 minutes" -> take 35 off when only 20 exist -> -15.
- step 4 (duration) has no same-hour case: 5:10 to 5:40 -> 50 + 0 + 40 = 90, true 30.

Ruling on scope, made against a real objection the implementer could raise. I read
`standards.ts:216`: NC.4.MD.8 is "time intervals THAT CROSS THE HOUR", and its
keyConcepts agree. Both failing cases are same-hour, so both are genuinely outside the
standard and neither would appear on the EOG. Requiring them fixed anyway, because:
(1) a nine-year-old applies a study-guide method to whatever problem is in front of
them, not only to items tagged with this code, and a method that silently returns 90 for
a 30-minute interval or a negative number is worse than one that names its own scope;
(2) step 3 already guards its non-crossing case, so the asymmetry reads as oversight and
the next editor will not know which it was; (3) this guide's own commonTraps warns
against "subtracting the start minutes from the end minutes in columns", a SAME-HOUR
move — the guide warns about a case its method cannot handle.
Cost if wrong: three extra clauses in one method, and a guide slightly wider than its
standard.

Ruling: the semicolon hole in the sentence splitter goes into round 2 despite being
reported Minor. `"Geometry is 23-27% ...; Measurement and Data is tested alongside it."` 
passes the guard — the same Ruling 10.1 violation just closed, one character away. The
guard exists to stop a false claim about a published NCDPI document reaching a parent,
the implementer is editing that function this round anyway, and a one-character hole in
a guard I asked for is not something to hand to the final review. Cost if wrong: one
extra line in a splitter.

Round 2 dispatched with a requirement to trace all SIX literal cases in the report —
four were verified last round and two of those four were the ones that broke.

### Task 10 fix round 2 — `d5f4283`, scoped re-review dispatched

Implementer accepted the scope ruling without objection. Step 5 now mirrors step 3's
guard, step 4 branches on the two hour numbers, step 2 stopped assuming a start time is
given. Six literal traces reported: 4:35 pm / 3:55 pm / 55 min / 30 min / 3:45 pm /
4:15 pm. `sentencesOf` became `clausesOf`, splitting on `;` as well as `.!?` with
optional whitespace.

Its own argument on the step-4 branch is worth recording: the same-hour branch does not
fight the surviving "subtract the minutes in columns" trap, because that error requires
the end time to have FEWER minutes than the start, which cannot happen inside one hour.
Referred to the re-reviewer to check rather than accepted.

Re-review told its single most valuable job is to find a SEVENTH failing case: both
previous rounds fixed this method and both left a case that broke when followed
literally. Named boundaries to try — an interval landing exactly on the hour, crossing
more than one hour, zero minutes, 12:00 where "the hour below" is ambiguous, an a.m./p.m.
crossing. Also told to judge the mutation evidence sceptically, because round 1's
evidence was technically true and proved less than it appeared to, which is how a
nearly-vacuous guard shipped.

### Task 10: fix round 2/5 (3 addressed, 0 open; commits 6ec4821..d5f4283)

All three ADDRESSED, no new breakage. All six literal traces reproduced independently by
the re-reviewer following the shipped text as a child would: 4:35pm / 3:55pm / 55min /
30min / 3:45pm / 4:15pm. Cases 4 and 6 — the two that produced 90 and -15 — now
correct. Step 2 confirmed coherent across all three branches.

The implementer's trap-conflict argument was checked and holds: the surviving trap is
scoped "when the end has fewer" minutes, and inside one hour a later end necessarily
shows more, so the precondition cannot hold on the new branch's domain.

Worth recording: the re-reviewer verified the "whitespace-optional" semicolon claim
DIRECTLY rather than accepting it, and notes the implementer's own mutation used only the
spaced form — so the claim was true but its evidence did not demonstrate it. Second time
in this task that mutation evidence proved less than it appeared to.

Ruling: accept and close the loop at round 2 rather than open a round 3. The re-reviewer
attacked the method with nine boundary cases and found four residual gaps, but graded
none as a wrong-number defect of the -15/90 class and explicitly judged the splitter one
"not worth another round". Its "New Breakage in the Fix Diff" is None, so under the loop
rules these are observations, not open findings. Cost if wrong: four narrow gaps ship
into a final review that is pointed straight at them.

Task 10: minor (deferred): START branch when the END time shows :00. "Arrived 4:00pm
  after a 20-minute ride" — 20 is not smaller than 0, so the BIGGER branch fires, takes
  off 0 minutes, drops the child nowhere, and hands back the full-hour subtraction the
  branch exists to avoid. Recoverable only by reaching outside the method to the borrow
  rule. Same family as the two defects already fixed here, in a narrower form.
Task 10: minor (deferred): steps 3 and 5 branch on "smaller"/"bigger" with NO equality
  case. 3:45+15 and 4:35 back 35 fall between the branches. Both readings land on 4:00
  and step 6's trade rule rescues "3:60", so no wrong answer — but the pair is not
  exhaustive, against the literal-reading standard this task is held to.
Task 10: minor (deferred): NO a.m./p.m. or 12-to-1 rollover rule anywhere. 11:45am + 30
  gives "12:15" with nothing to say which half of the day; a child writes 12:15 a.m. and
  is twelve hours wrong. Every example in the guide is pm-to-pm. Largest real-world
  consequence of the four, though outside the standard's "cross the hour" wording.
Task 10: minor (deferred): multi-hour intervals are asymmetric. The addition side has an
  explicit trigger ("any answer with 60 or more minutes"); the subtraction side has no
  "if you cannot take it off, borrow another hour" counterpart, and the borrow rule is
  stated once for one hour only.
Task 10: minor (deferred): `clausesOf` closes the semicolon but not its siblings — the
  single-domain claim still hides behind a comma splice, hyphen, em dash, coordinating
  "and", colon, or bare newline (all confirmed hidden). The guard is a prose heuristic
  and will need separators added one at a time.
Task 10: minor (deferred): the MD.8 worked example exercises only the two branches it
  covered in round 1; the new same-hour and smaller-interval branches have none.

### Task 10: complete (commits 304c5af..d5f4283, review clean after 2 fix rounds)

### Task 11 — implementer DONE_WITH_CONCERNS at `dcdd0bc`, review dispatched

636 passing (+21 — registration multiplies integrity.test.ts and sourcedStandards
across one more curriculum), tsc clean, build succeeds.

**A verification-gate finding I checked myself, and it is the controller-facing one.**
`npm run lint` exits 1. The implementer reported this accurately and claimed it is
identical at baseline. I verified: exit 1 with the SAME 7 warnings at `dcdd0bc`,
`d5f4283`, `88f643a`, `304c5af`, `ae39fdd`, `a9ca4c0` AND `601ba31` — i.e. since before
this session started. The warnings live in AdaptiveSessionCard.test.tsx,
QuizResults.tsx, ProgressContext.tsx and WeakSpotsView.tsx, none touched by any content
task.
So the plan Global Constraint "npm run lint exits 0" has NEVER been satisfied in this
session, and the Task 8, 9 and 10 reports each claimed "lint exit 0". Those reports were
wrong — most likely reading "no new warnings in my files" as a pass. Task 11 is the
first implementer to report the gate accurately.
Ruling: do not block on it. It is pre-existing, outside every content file, and fixing
UI lint warnings is not in this plan's scope. But it goes to the final review as a real
item, and every remaining dispatch must stop claiming a gate it has not checked. Cost if
wrong: a lint gate stays red into a merge decision the owner makes with the facts.

Parked RULINGS.md precondition CLOSED. `RULINGS.md:97` recorded "Dashboard.tsx reads
grade-5 STATIC_QUIZZES regardless of curriculum.grade ... a hard precondition before
grade 1-4 ships". I verified no component references GRADE_5_QUIZZES any more; only
`grade5/index.ts` and `grade5/authored.test.ts` do, correctly. This is also the same
hardcode the single-path redesign spec folded into its own scope — it is now closed here
instead, ahead of that redesign.

The implementer reports `App.tsx` looked quizzes up in GRADE_5_QUIZZES, so NO GRADE 4
QUIZ COULD HAVE STARTED, and that Dashboard found the mock and the diagnostic-taken flag
by grade-5 ids. Registration is what exposed all three. Those are application-code
changes argued from code and never watched running — no browser in the session — so the
review is pointed at them as the highest-risk part of the diff, including whether a
grade-5 profile now behaves differently than before.

Ruling: carry the implementer's second-stale-pin finding into the Grade 3, 2 and 1
rulings. It found `FirstRunScreen.test.tsx` pins `toEqual(["5"])`, which none of the four
pre-flight audits caught — they all found `registry.test.ts` and stopped there. Tasks 16,
21 and 26 each need BOTH files listed. Cost if wrong: nothing; the pin has to change
either way.

### Task 11 review — Approved, 1 Important; fix round 1 dispatched

All four rulings honoured. All 151 quiz references verified to resolve to real authored
Grade 4 items, zero template ids, and the 96 authored items each used exactly once
across the five drills. Mock allocation confirmed to RE-DERIVE through `domainWeight()`
at runtime and only then compare to the pinned counts — the property the implementer
claimed, independently checked. MD 25x6/9 = 16.667, G 25x3/9 = 8.333, total exactly 100.
No raw midpoint summed anywhere.

The UI de-hardcoding was checked in the two places a regression was most likely and both
preserve prior behaviour EXACTLY: Grade 5 ships TWO isMockAssessment quizzes and find()
returns `mock-ssa-01`, byte-identical to the removed literal; grade 5's sole isDiagnostic
quiz is `diagnostic-01`, exactly the removed literal, so stored grade-5 attempt history
still matches. `getQuizById` confirmed zero remaining callers. The App.tsx bug was real:
every Grade 4 quiz launch would have been a silent no-op.

Ruling: the first-run default grade becomes the HIGHEST registered grade, derived from
the list, pinned by a test asserting the pre-selected value on a fresh render. Registering
Grade 4 silently moved the default from 5 to 4 because `listCurricula()` sorts ascending
and `FirstRunScreen.tsx:17` takes `curricula[0]`. Reasons: it preserves today's behaviour
so this task introduces no user-facing change; `curricula[0]` DEGRADES as the plan
proceeds, and once Task 26 lands every new user would default to a first-grade profile,
silently, exactly as this one did; and an acceleration tool's typical user is the oldest
cohort. Cost if wrong: new users see grade 5 preselected instead of grade 4, one line to
flip, and it is now tested either way.

Ruling: the Geometry allocation tolerance goes into the fix round despite being reported
Minor. `toBeLessThanOrEqual(0.5)` clears by 4e-16 — the expected value is
2.4999999999999996 and the distance is 0.49999999999999956. Any reassociation of
`domainWeight`'s expression reddens a CORRECT allocation, and its discriminating power at
G is nil. This plan has already shipped one guard reported as tested that was nearly
vacuous; a tolerance clearing by one float ULP is the same category of false assurance.

Ruling: `QuizzesListView.tsx:200` ("G • 23-27%", a single-domain claim for a grouped
domain) is NOT fixed here. Pre-existing, affects Grade 5 equally, and Task 21 exists to
stop the UI claiming blueprints that do not exist — folded into that task instead, and
written into `task-17-21-rulings.md` as 21-8 so it cannot be lost. Same reasoning as the
Dashboard.tsx ruling: the work lands in the task that owns it.

Task 11: minor (deferred): the report claims "156 item references"; it is 151. Immaterial
  to correctness, but presented as a counted fact that was not counted.
Task 11: minor (deferred, PRE-EXISTING): grade5/quizzes.ts:3 <-> registry.ts:3 is a live
  circular import, green only by import order. Now nastier: registry imports ./grade4
  BEFORE ./grade5, so if grade5/index becomes a graph entry CURRICULA evaluates to
  {4: GRADE_4, 5: undefined} — a partially working registry rather than a clean throw.
  Scheduled into Grade 3's batch at the latest.

### Task 11 fix round 1 — `1c15278`, scoped re-review dispatched

637 passing, tsc clean, lint reported accurately as exit 1 with 7 pre-existing warnings.

The implementer accepted the default-grade ruling "without reservation" and named the
third reason decisive — that `curricula[0]` gets WORSE as the plan succeeds. Seeded from
`curricula[curricula.length - 1]`, derived not hardcoded, pinned by a test that reads the
select on a fresh render and submits without touching the picker. Mutation-checked:
reverting the component reddens it with `expected "4" to be "5"`.

Notable: the implementer CHOSE A BETTER FIX THAN I SPECIFIED on the tolerance. I said
use `< 0.5 + 1e-9`; it used `floor(ideal) <= n <= ceil(ideal)` and argued that
Geometry's 2.5 is a GENUINE tie, so a +/-0.5 window is the wrong SHAPE however the
epsilon is nudged — it either clears by an ULP or rejects a correct allocation depending
which side the float lands. floor/ceil is exact integer arithmetic with nothing to tune.
That reasoning is better than mine and I am accepting it. Sent to the re-reviewer to
assess on its merits, and specifically to check whether floor/ceil is LOOSER than the
old guard at any domain whose ideal is not near a tie — the one way the swap could cost
something.

It also self-corrected a factual error from its first report (five lint warnings, not
seven, from a truncated `tail`). Recording that because the opposite behaviour — a
report defending a miscount — is what the last three tasks' "lint exit 0" claims were.

### Task 11: fix round 1/5 (2 addressed, 0 open; commits dcdd0bc..1c15278)

Both ADDRESSED, no new breakage. The default now derives from
`curricula[curricula.length - 1]` at render time, and the new test derives its
expectation INDEPENDENTLY via `Math.max(...grades)` rather than from the same expression
the component uses — which is what makes the mutation evidence real rather than a
coincidence of matching source.

The re-reviewer answered the looseness question I asked, and the answer was yes: at every
domain whose ideal is NOT on a half-integer boundary, floor/ceil admits one extra integer
the old distance check rejected (OA 4.8 admits {4,5} where +/-0.5 admitted {5} alone;
same at NBT, NF, MD). That is structural, not confined to Geometry.

Ruling: accept anyway, and I verified the load-bearing part myself rather than taking the
re-reviewer's word. `grade4.test.ts:85` pins the exact counts literally
(`toEqual({OA:5,NBT:8,NF:10,MD:5,G:2})`), and the floor/ceil check at :95-98 is a SECOND,
INDEPENDENT derivation from `domainWeight()`. So the looseness costs nothing: the literal
pin catches any change to the allocation, and the derived check catches a literal pin that
has drifted from the blueprint. Two guards with different failure modes, which is better
than one tight guard. floor/ceil is also the mathematically correct bound for a
total-conserving apportionment — a fair share can legitimately round either way to keep
the 30-item sum exact. Cost if wrong: an allocation one item off at a single domain
passes the derived check while the literal pin still catches it.

Task 11: minor (deferred): the CORRECTED lint report is still incomplete — it lists three
  files, and there are four (`AdaptiveSessionCard.test.tsx:49` is missing). The count was
  fixed 5->7 and the cause correctly attributed to a truncated `tail`, but the corrected
  file list was not re-derived. Same class as the error it was correcting.

### Task 11: complete (commits d5f4283..1c15278, review clean after 1 fix round)

**GRADE 4 IS DONE.** Tasks 1-11 complete: 25 standards, 96 authored items, 22 templates
over 18 standards, 25 study guides, 7 quizzes, registered and playable. 637 passing.
Batch D (Grade 3, Tasks 12-16) is next, with 28 pre-flight rulings already written.

---

# BATCH D — Grade 3

### Task 12 (Grade 3 OA) — BASE `1c15278`, implementer dispatched

Carries the brief, the full `task-12-16-rulings.md` (nine rulings for this task), and the
source-over-brief instruction with the specific warning that Grade 3 is the worst-hit
batch in the plan — 19 of its 28 audited defects are the Common-Core-import class.

Told explicitly to verify BY CONSTRUCTION that the five OA generators cannot emit the
same question (ruling 12-4), not to hope. The number space is 100 products total, so
collisions there are near-certain rather than hypothetical, and the failure is silent:
one question under five review keys, a child marked mastered in all five, every test
green.

Also told to report `npm run lint`'s actual exit code and to RE-DERIVE the warning file
list rather than quoting mine. Three reports in this plan claimed "lint exit 0" when it
has never been 0, and a fourth corrected the count but published an incomplete file list.

### CORRECTION — the lint gate PASSES. My earlier finding was wrong.

I recorded at Task 11 that `npm run lint` exits 1, that the gate had "NEVER been
satisfied in this session", and that the Task 8, 9 and 10 reports claiming "lint exit 0"
were wrong. **All of that was incorrect and I am retracting it.**

The Task 12 implementer contradicted me with 17 consecutive runs plus a baseline check in
a throwaway worktree, all exit 0. I re-measured: `npm run lint` exit 0 three times,
`npx oxlint` exit 0 three times. The script is bare `oxlint` with no `--deny-warnings`,
so 7 warnings do not fail it. Authoritative state: **exit 0, 7 warnings** —
ProgressContext.tsx (4), AdaptiveSessionCard.test.tsx (1), QuizResults.tsx (1),
WeakSpotsView.tsx (1).

How I got it wrong: every exit-1 reading I took came from inside a compound shell command
run while subagents were concurrently writing files, and the Task 12 implementer saw the
same one-off exit 1 in ITS first compound command and never reproduced it. So the signal
was a transient — most likely a file lock on Windows — and I ran it six times inside the
same kind of compound command and read consistency as confirmation. Repetition of a
flawed measurement is not replication.

Consequences to undo:
- The Task 8, 9 and 10 reports were ACCURATE. My ledger entry accusing them of reading
  "no new warnings in my files" as a pass was unfounded and is withdrawn.
- Task 11's report was accurate about the count but its exit-1 claim inherited my error.
- Two dispatches (Task 11 fix, Task 12) were told lint exits 1 and to report it as such.
  No harm done — neither was asked to change lint behaviour — but the instruction was
  false and must not be repeated. Remaining dispatches get the corrected fact.
- The final review must NOT be pointed at a failing lint gate. There is no such item.

Lesson worth keeping: I told three implementers their reports were wrong on the strength
of my own unreplicated measurement. The one that pushed back with better evidence than
mine was right. Weight an implementer's 17 clean runs over the controller's 6 noisy ones.

### Task 12 — implementer DONE_WITH_CONCERNS at `38fbe6b` (3 commits), review dispatched

709 passing (+72), tsc clean. 21 authored items (3 per standard x 7), 5 generators, 17
new misconception tags.

**Ruling 12-5 was MINE and it was partly wrong. The implementer corrected it and I am
accepting the correction.** I wrote "factors, divisors and quotients from 1-10 inclusive"
for OA.1/OA.2/OA.6/OA.7. But NC.3.OA.2 says "one-digit divisor and one-digit quotient",
and 10 is two digits. The implementer used 2-9 for OA.2 and kept 1-10 only for OA.7,
which genuinely does cap at 10 in its own text. My ruling conflated two standards' ranges
by taking the audit's summary phrasing instead of re-reading the source. Second ruling of
mine this plan that was written from a report rather than from the file — the first was
the trapezoid tag spelling at Task 9. Sent to the reviewer to adjudicate rather than
asserted, since I am the one who got it wrong.

It also found a brief/source disagreement no audit caught: the brief calls NC.3.OA.3 a
"facts" standard when the source is one-step WORD PROBLEMS. Writing it as facts would
have produced a second bare-fact generator — precisely the collision ruling 12-4 exists
to prevent, arriving by a route the ruling did not name.

Referred to the reviewer rather than ruled: the implementer filed
`did-the-two-steps-in-the-wrong-order` under the `order-of-operations` FAMILY, which
surfaces to a parent as "Order Of Operations". Ruling 12-2 exists precisely because
order-of-operations is not part of NC.3.OA.8. The error itself is real and correctly
named; the question is whether the family label misleads a parent about what their child
got wrong. That is a judgment about what a parent reads, and the implementer grading its
own call is not the check I want on it.

Task 12: minor (deferred): `grade3/standards.ts` has no sibling `standards.test.ts`.
  Covered generically by `sourcedStandards.test.ts`. Flagged by the implementer for
  Task 16; noting here so it reaches the final review if Task 16 does not take it.

### Task 12 review — Needs fixes (2 Important, 0 Critical); fix round 1 at `5dddce0`

Mathematics fully verified: reviewer solved all 21 items cold, agreed with every key,
re-derived every distractor as reachable and whole-numbered, and independently re-derived
all five generators' exclusion algebra confirming the counts 70/42/71/78/78 and every
barred pair. Ruling 12-5 adjudicated in the implementer's favour against `standards.ts`:
my "1-10 inclusive" was wrong, its 2..9 / 2..10 split is right.

The collision design is better than the ruling asked for: the five generators are
separated STRUCTURALLY by prompt frame rather than numerically, which is the right answer
when all five draw from the same ~100 products. A sentinel test asserts each prompt
matches its own regex AND fails all four others, at 400 seeds per template.

**The implementer rejected BOTH family placements I offered and made a better argument.**
I suggested a new family or `incomplete-procedure`. It chose a new `multi-step-problems`
family, reasoning that a child who did both steps in the WRONG ORDER did not stop early,
so `incomplete-procedure` would mis-tell the parent in the opposite direction from
`order-of-operations` — and `forgot-the-final-step` stays put as the genuinely-unfinished
half. That is a sharper reading of what each label tells a parent than either option I
gave. Accepting it; sent to the re-reviewer to assess on merits rather than rubber-stamp.

**Standing ruling added to all three remaining rulings files: fixed-seed pins must pin
LITERALS.** The derived-pin defect has now shipped TWICE — Task 8 and Task 12, five
templates each time, caught only at review both times. Root cause is in the briefs
themselves: several ask only for "a pinned-seed assertion that the correct option's text
equals answerText", which IS the derived form. The Content Contract overrides them. The
ruling is written into task-12-16, task-17-21 and task-22-26 rulings with the failure
explained and a literal example, so Tasks 13, 14, 17-19 and 22-24 do not repeat it.
Cost if wrong: a few more lines of test per template.

Ruling: the period-4 correct-answer rotation (C,A,D,B repeating) stays deferred. I
checked the mechanism myself rather than accepting the reviewer's "worth breaking anyway":
`labelOptions` preserves authored order and nothing shuffles options at serve time, BUT
`questionSource.ts:57` shuffles which QUESTIONS are drawn, so a child never experiences
the file-order sequence and the cycle is not gameable. Cost if wrong: a pattern no child
can reach.

Task 12: minor (deferred): `g3-oa9-03` has the longest prompt in the bank — two number
  sequences plus a claim plus a question before an eight-year-old reaches the options.
Task 12: minor (deferred): `oa2-equal-shares` draws labelled EMPTY containers
  ("[ bag 1 ] [ bag 2 ]") rather than the objects — a weaker equal-groups figure than
  oa1's array, though the total is stated above it and it reads fine aloud.

### Task 12: fix round 1/5 (2 addressed, 0 open; commits 38fbe6b..5dddce0)

Both ADDRESSED. The re-reviewer did the strongest verification of the session: it
INDEPENDENTLY REIMPLEMENTED all five generators — context arrays, PAIRS construction, and
the mulberry32 RNG verbatim from `src/engine/rng.ts` — ran them at seeds 7 and 123
outside the test harness, and matched every pinned prompt, figure, answerText and full
ordered option array. That is verification by reconstruction, not by reading.

It also upheld the implementer's family argument over both of mine, with a reason I had
not reached: a third family naming "sequencing / holding state across steps" ties
directly to NC.3.OA.8's OWN keyConcept about keeping track of the first step's result
before taking the second. So the new family is not a compromise between my two options —
it is what the standard's text already describes.

Exhaustiveness risk I flagged came back clean and was checked properly: nothing in src/
switches on `MisconceptionFamily` or keys a fixed `Record` by it. `familyOf` keys by TAG,
`familyLabel` is a generic string transform, and `mastery.ts` builds its Map dynamically
with `?? new Map()`. Adding a union member is safe.

It judged the mutation evidence NOT overclaimed, and verified why: seed 123 draws the
`tiles` context, not `stickers`, so renaming the `stickers` noun could only ever redden
the seed-7 pin. The report claimed exactly what the demonstration shows.

Task 12: minor (deferred): the five test files each duplicate an identical four-line
  `shape()` helper rather than sharing one. Deliberate — a shared non-test file under
  `templates/` would be eagerly imported by `allContent.ts`'s glob. Defensible.

### Task 12: complete (commits 1c15278..5dddce0, review clean after 1 fix round)

714 passing. 21 authored items across 7 OA standards, 5 generators separated structurally
by prompt frame, 17 new misconception tags, 1 new family.

### Task 13 — implementer DONE_WITH_CONCERNS at `a9183e0` (2 commits), review dispatched

829 passing (+115), tsc clean, lint exit 0 reported correctly. 25 new misconception tags,
20 of them in `fraction-operations`. Large diff: 3,652 insertions across 21 files.

No brief/standards.ts disagreements beyond the seven rulings — the first task in Grade 3
where the pre-flight caught everything.

Self-review catch worth recording as a PATTERN, not just a fix: `g3-nf1-01` was its own
generator's question in different words. `assertNoGeneratorDuplicatesAuthored` does an
exact trimmed-prompt SET MATCH, so a reworded semantic duplicate passes it invisibly.
That is the third distinct way this plan has found authored/generated duplication hiding
from the kit — after Task 8's promptDetails/option-value collisions and Task 12's
near-miss frames. The kit guards one channel; the other channels are caught only by
someone reading.

Ruling: the implementer's reading of 13-7 is CORRECT and I verified the source myself
rather than accepting it. `standards.ts` NC.3.NBT.2 keyConcept 1 is verbatim "Use
estimation strategies to assess reasonableness of answers". So estimation is IN standard
and CCSS 3.NBT.A.1 rounding-as-a-skill is not; `g3-nbt2-01` estimating "which hundred is
it closest to" without the word "round" is exactly right, and the test barring "round"
from NBT items is a good guard. Cost if wrong: one item and one test.

Referred to the reviewer rather than ruled: `g3.nf4.compare-like-parts` can show two
EQUIVALENT fractions in one item (seed 7 keys `1/2 > 1/4` alongside a `2/4 > 3/4`
distractor). Both statements are in-standard for NF.4 — one same-numerator, one
same-denominator — and every truth value is unambiguous. But NC.3.NF.3, in the same
grade, teaches that 1/2 and 2/4 ARE the same number, so an eight-year-old meets both
forms in one four-option item. The implementer notes constraining it away kills the (2,4)
denominator pair entirely. Whether that is harmless, confusing, or actually instructive is
a pedagogical judgment, and the implementer weighing its own design is not the check I
want on it.

### Task 13 review — 1 Critical, 1 Important WITHDRAWN; fix round 1 dispatched

Mathematics clean throughout: all 21 items solved cold, every key correct, no second
defensible answer BY VALUE (the sharpest risk in the plan for fractions), and every
generator's by-construction algebra independently re-derived and confirmed. The standing
literal-pin ruling honoured in full across all seven templates — first task in the plan
to get that right on the first attempt, which is the ruling working as intended.

Both referred concerns resolved in the implementer's favour. The equivalent-fractions item
stands: the reviewer re-derived the option algebra and found exactly one option true by
value at every seed, with the equivalence never landing on opposite sides of one symbol —
a child substituting 1/2 for 2/4 evaluates the distractor to the same false, so the
coincidence neither rewards nor punishes the substitution.

**CORRECTION TO MY RULING 13-2.** The reviewer flagged two authored items crossing the
related-family boundary. I went to the source and the flag is wrong because MY RULING was
wrong. NC.3.NF.3 says "equivalent fractions using RELATED fractions: halves, fourths and
eighths; thirds and sixths" — families load-bearing. NC.3.NF.4 says "...with denominators:
halves, fourths and eighths; thirds and sixths" — no "related"; a permitted denominator
SET. Decisive: NF.4 is "same numerator OR same denominator", so a family constraint would
forbid 1/2 vs 1/3, the most natural benchmark comparison an eight-year-old makes. I
carried NF.3's language across to NF.4. Finding withdrawn, items stand, ruling file
patched in place.

That is my THIRD wrong ruling this plan (trapezoid tag spelling at Task 9, OA.2 range at
Task 12, this). All three share a cause: written from an audit's summary prose rather than
from `standards.ts` itself. The audits are reliable about WHAT is wrong and less reliable
as a quotation source. Remaining rulings I write get checked against the file first.

Consequence recorded, NOT actioned: the nf4 generator is therefore NARROWER than the
standard allows. Widening to cross-family same-numerator pairs would enlarge the draw
space and largely dissolve the equivalence coincidence, since within-family pairs are
exactly where equivalences arise. Not requesting it — the generator is sound and verified,
and narrower-than-allowed is not a defect. Cost of leaving it: a smaller NF.4 space than
the standard permits.

Critical into the loop: `g3-nf4-04` option D `1/6` tagged
`named-the-unit-fraction-not-the-count`, an error that cannot produce it — the item asks
which fraction is GREATER, nothing is being named. The worked solution concedes it by
grouping 1/6 with 2/6 under one explanation while they carry different tags. Not a retag:
every fraction sharing a part with 4/6 and greater than it is unusable, so the option
needs a different error or the item needs reshaping.

Ruled in despite Minor: `authored.nbt.test.ts:83`'s rounding guard is LEXICAL (scans for
the word "round") while the item states the rounding rule in other words. Same category as
the substring guard that let "Fractions are 3%" pass — a guard weaker than its own comment.

### Task 13 fix round 1 — `e45e740`, scoped re-review dispatched

Both findings taken the harder way, which is the right instinct in both cases:

- Critical 1 RESHAPED rather than retagged. The implementer reached the same conclusion
  the reviewer did — every fraction greater than 4/6 sharing a part with it is a CORRECT
  answer, so no retag could have worked. `g3-nf4-04` is now a same-denominator word
  problem (Raj 5/6, Sam 2/6) keeping the item's standard half, mastery tier and option
  position, with the worked solution telling the two routes to "Sam" apart explicitly.
  `named-the-unit-fraction-not-the-count` keeps its correct use on `g3-nf3-02`, which
  matters: `misconceptions.test.ts` fails on a declared-but-unused tag, so an orphan
  would have reddened the suite.
- The rounding guard STRENGTHENED rather than comment-narrowed. I offered either. It now
  also catches `nearest ten/hundred/thousand`, the item summary was reworded, and the
  comment states exactly what is and is not caught. Verified load-bearing by the
  implementer against the exact string previously in the file, and against "around" as a
  negative case.

Re-reviewer told to solve the reshaped item COLD before reading its key, check every
distractor against its tag's declaration word for word (that is precisely what failed
before), and check the regex itself on both the positive and negative strings rather than
accepting the load-bearing claim.

### Task 13: fix round 1/5 (2 addressed, 0 open; commits a9183e0..e45e740)

Both ADDRESSED. The re-reviewer solved the reshaped item cold — sandwiches stated to be
the same size and both cut into 6 equal pieces, so comparing numerators directly is
valid; 5/6 > 2/6, Raj unique by value — and checked every distractor against its tag's
DECLARATION word for word, which is the check that failed the first time. All five tags
in the table: declared, used elsewhere so not orphaned, description fits the error.

The guard was verified by running the regex, not by reading it: fires on the exact string
previously in the file ("swapped for the nearest hundred"), does not fire on the reworded
replacement, does not false-positive on "around". The re-reviewer drew the right
conclusion from that — the old text WOULD have failed the strengthened test, which is why
it had to be reworded. The guard is load-bearing, not decorative.

The new `commonMisconception` separates the two routes to "Sam" explicitly, which is what
the Critical said was missing.

### Task 13: complete (commits 5dddce0..e45e740, review clean after 1 fix round)

829 passing. 21 authored items across 2 NBT and 4 NF standards, 7 generators, 25 new
misconception tags.

### Task 14 — DONE_WITH_CONCERNS at `e42b4f8` (2 commits), review dispatched

940 passing (+111), tsc clean. 21 authored MD items + 5 Geometry + the aggregate, 6 new
generators (18 total, all in the sentinel map), 22 new misconception tags. All seven
rulings implemented with 14-1/14-4/14-5 enforced by construction, algebra in file
comments, guards sweeping 400-2000 seeds.

Found a brief/source disagreement the audit MISSED — the third in Grade 3 after Task 12's
OA.3 "facts" error: `NC.3.MD.3`'s first keyConcept is "collect data by asking a question
that yields data in up to four categories", a SURVEY-DESIGN skill the brief never
mentions. Added an item and a test for it. The pre-flights caught 108 defects and are
still not exhaustive; the source-over-brief instruction in each dispatch is what catches
the remainder.

Root cause of my lint error, refined: the implementer reports the rtk wrapper prints a
JSON-parse error and returns a nonzero WRAPPER status, while `rtk proxy npm run lint`
shows the real 0. That is a better explanation than my "transient file lock" guess — my
exit=1 readings came through the wrapper. Substantive conclusion unchanged and already
corrected: lint exits 0.

### Task 14 review — Approved, 0 Critical, 2 Important; fix round 1 dispatched

Everything held under independent verification: all 26 items re-solved cold, all six draw
spaces re-derived (176 time pairs, 54/77 perimeter pairs, the L=3W/(W-2) exclusions, the
digit-wise g=5 bar), and all twelve pin literals recomputed from the algebra. No wrong
key, no second defensible answer, no unreachable distractor, NO METRIC UNIT anywhere in
Grade 3 MD. Ruling 14-1 — the worst defect the audits found in this grade — is closed.

The `NC.3.MD.3` survey-design find confirmed against `standards.ts:201` verbatim.

Three of the implementer's four concerns resolved in its favour. The fourth became
Important 1, but not in the form it raised: its self-description was honest, and the
defect is the test NAME, not the test.

Important 1: `authored.g.test.ts:101` is titled "offers exactly one true statement per
item" but asserts only an id-pin plus a one-correct-option check that
`assertAuthoredBankSound` ALREADY makes. Read from a test list it promises a semantic
hierarchy guarantee nothing in the repo provides. Third guard in this plan of that exact
shape, after the substring band check and the lexical rounding guard. Renaming, not
deleting — the id pin is a real forcing function and the reviewer hand-checked all five
items hold.

Important 2: `added-without-converting` sits in the `unit-conversion` FAMILY, and
converting between customary units is what ruling 14-1 establishes is Grade 4. The tag's
description fits the error; the family headline would tell a Grade 3 parent their child is
weak at a skill NC does not teach until next year. Identical to Task 12's
`order-of-operations` finding and resolved the same way: declare an accurately-named tag
rather than borrow a misleading family. That is now twice; the family-label check is
earning its place in every dispatch.

Ruling: two Minors pulled into the round.
- The clock figure states "five small marks between one number and the next". There are
  FOUR marks and five intervals. The answer stays determinate, but an eight-year-old
  reading a figure description will count the marks and find the figure wrong. Figures
  must be ACCURATE, not merely sufficient, and the described figure is the only figure a
  child gets. Cost if wrong: one corrected sentence.
- The METRIC regex omits `millilitre`, `kilometer`, `cm`, `mm`. Not reachable from current
  pools, so not a live defect — but this guard is the single thing standing between Grade
  3 MD and CCSS metric vocabulary, and it costs one line. Cost if wrong: a slightly
  broader regex.

### Task 14 fix round 1 — `b77efb3`, scoped re-review dispatched

All four addressed. The implementer went past the patch on the metric guard: rather than
just widening the regex in place, it EXTRACTED the patterns to a shared
`grade3/metricGuard.ts` imported by all five test files so they cannot drift, and grew
the both-directions test to 21 must-catch and 7 must-not strings. It also declined to add
bare `g` or `m`, reasoning that false positives get guards weakened — which is the right
instinct and the opposite failure mode from the three overclaiming guards this plan has
already had to fix.

I checked the extraction's one real hazard myself before dispatching, because Task 12's
implementer had specifically avoided a shared non-test helper for this reason:
`allContent.ts` uses EAGER globs `./grade*/authored*.ts` and `./grade*/templates/*.ts`,
and an eager glob IMPORTS what it matches. `grade3/metricGuard.ts` is named neither
`authored*.ts` nor placed under `templates/`, so neither glob reaches it. Safe, and placed
correctly rather than by luck — the same helper under `templates/` would have been swept
into the content set.

Re-reviewer told to run the widened regexes itself against the must-catch and must-not
strings rather than trusting the list, to count the clock marks itself, and to verify
`added-without-converting` is not orphaned by the retag — `misconceptions.test.ts` fails
on a declared-but-unused tag, so an orphan would redden the suite.

### Task 14: fix round 1/5 (4 addressed, 0 open; commits e42b4f8..b77efb3)

All four ADDRESSED. The re-reviewer RAN the widened regex in Node against all 21
must-catch and all 7 must-not strings — all pass. It counted the clock marks itself and
confirmed the correction: 60 minute-marks over 12 numerals means 5 minutes between
consecutive numerals and therefore FOUR marks strictly between them, the fifth coinciding
with the next numeral. The old "five small marks" was false; the new sentence is true.
It also verified the MD.2 ruler figure independently — 3 marks between whole inches give
4 quarter-inch segments, consistent with the pinned key of 4 3/4 inches.

Orphan check passed: `added-without-converting` is still consumed at
`grade4/authored.md.ts:384` on a genuine metric-to-metric conversion item, so the retag
did not redden the both-directions check.

Drift prevention verified properly: all four template test files had their LOCAL `const
METRIC = /.../` DELETED in favour of the import, not left as dead duplicates. Five
consumers, one definition, no remaining local copy.

The renamed test's new docstring explicitly disclaims what it cannot do — "nothing in this
repo can decide truth short of a shape-hierarchy model" — and flags its one-correct-option
assertion as a deliberate repeat kept so the test fails loudly rather than vacuously.
That is the right resolution of the overclaiming-guard pattern: say what you check.

### Task 14: complete (commits e45e740..b77efb3, review clean after 1 fix round)

940 passing. 21 authored MD items + 5 Geometry + the aggregate, 6 generators (18 total),
22 new misconception tags, shared metric guard.

**GRADE 3 CONTENT IS COMPLETE.** All 20 standards carry authored items; 18 generators.
Tasks 15 (study guides) and 16 (registration) remain in Batch D.

### Task 15 — DONE at `bb3dfdb`, review dispatched

946 passing (+6), tsc clean, lint exit 0. 20 guides, 857 lines — 43/guide against Grade
4's 43/guide, so the same shape at a smaller count.

The Task 10 lesson transfer appears to have worked. All four guards were reportedly
mutation-tested IN THE FAILING DIRECTION and reverted — semicolon single-domain claim,
`3%` substring, empty rule, "Grams" — which is the four specific defects Task 10 shipped,
each pre-empted rather than rediscovered. Task 10 needed two fix rounds; the whole point
of handing its defect list forward was to spend that cost once.

It also applied the metric guard to ALL 20 guides rather than only MD/G — stronger than
the item banks' own scope, and deliberate. Sensible: a guide is prose, so metric
vocabulary could leak into an OA or NF guide's worked example where the banks would never
carry it.

Reviewer given the five Task 10 defect classes as explicit checks, with the
transplanted-figure sweep named as the highest-yield: that is what shipped TWO false
commonTraps in Grade 4, with eight more unanchored figures found only on a later sweep.
Also told to attack the clause splitter for a separator beyond `;` and `.!?` that still
hides a single-domain claim, and to follow every BRANCHING method literally — Task 10's
method defect took two rounds precisely because each round guarded one branch and left
another.

Told explicitly not to accept "mutation-tested" as a claim: twice in this plan reported
mutation evidence proved weaker than it appeared.

### Task 15 review — 0 Critical, 4 Important; fix round 1 dispatched

Four of Task 10's five defects avoided outright — the lesson transfer mostly worked. The
trap-figure sweep came back clean under independent recomputation of every numeric trap
in all 20 guides, and where the authored bank's figure differed the implementer had
RE-DERIVED it rather than copied it (MD.7 guide 8x5x3x4=480 vs the bank item's 300).
That is exactly the defect that shipped twice in Grade 4.

All 27 percentage occurrences enumerated against the blueprint directly; 29 en dashes,
zero hyphen-form ranges. Every worked example re-solved by hand.

Important 1 is the interesting one and worth recording as a lesson about lesson-transfer:
the clause splitter handles `;` and `.!?` — the two forms GRADE 4 WAS BITTEN BY — and
lets a comma, em dash or colon through. The reviewer ran the real splitter and confirmed
"Geometry alone is worth 23-27% ..., and Measurement and Data is counted somewhere else."
passes. A defect list tells you where the last failure was, not where the next one is.
Inheriting it prevents repetition, not recurrence.

Important 4 is the same class as the incident this plan's whole weight-checking apparatus
exists because of: `NC.3.NBT.3` claims it "carries half of that band" — a per-standard
share NCDPI never publishes, stated to a parent as fact. Grade 5 shipped seventeen of
those before a test caught them. NO GUARD CAN SEE THIS ONE because it carries no digits,
which is why it needed a reader. It also contradicts NBT.2 nine lines above.

Important 2 is Task 10 defect #4 in its exact shape — NBT.2's Step 3 says "subtract the
hundreds, then the tens, then the ones" with trading only at Step 4, so 402-176 asks a
child to take 70 from 0. The implementer's own trace SILENTLY REWROTE Step 3 rather than
following it, and the worked example is an addition so the branch is never exercised. The
instruction to trace literally is only worth what the tracing discipline is.

Important 3: OA.1 teaches groups x size ("the first number counts the trays") while OA.2
and OA.3 write size x groups. Answers unaffected; the discrimination those standards
ACTUALLY ASSESS is not. OA.2's own trap warns against "swapping the two jobs", which the
guide then does.

Ruling: two Minors pulled in.
- NF.4's method never derives `=`, but the keyConcept requires recording with >, < AND =.
  Incomplete against the source, not merely terse.
- MD.1's trap 3 offers `250 - 215` as the WRONG method; it yields 35, the correct answer
  for that example, and the trap concedes the hour cancels. A wrong method that produces
  the right answer and admits it may teach a nine-year-old that the method is fine.

### Task 15 fix round 1 — `de352e7`, scoped re-review dispatched

All six addressed. Two decisions in the fix are sharper than the instruction they answer:

- The splitter ends clauses at `,` `;` `:` and a SPACED dash, spaced deliberately because
  the UNSPACED en dash is the one inside `23-27%` itself. Had it split on the unspaced
  form, the band literal would have broken into "23" and "27%" — silently failing every
  real citation while still passing a naive comma mutation test. That is the exact shape
  of trap this plan keeps hitting: a guard that looks tested and is not. The implementer
  saw it unprompted.
- Rather than only widening the splitter, it REWROTE five of the seven MD/G sentences to
  put the figure in a comma-free stretch naming both domains. That fixes the content as
  well as the guard, which is the right order — a guard that passes because the prose was
  written to satisfy it is stronger than one that passes because the prose got lucky.

Factor-role convention resolved to GROUPS FIRST, SIZE SECOND on the grounds that it is
the order NC.3.OA.1's own keyConcept uses — deriving the convention from the source
rather than picking one. Applied to OA.2, OA.3 and OA.6.

NBT.2's trade-down check moved into step 3 ahead of any subtracting, and 402-176 is now
worked INSIDE the guide rather than only in the trace. That closes the gap that let the
defect survive: the branch is now exercised by the artifact itself, not by a report.

Re-reviewer told to run the shipped splitter on all seven REAL citations as well as the
banned forms — the failure mode being guarded against would break the real ones — and to
trace both NBT.2 branches literally, since Grade 4's equivalent defect took two rounds
because each round guarded one branch and left another.

### Task 15: fix round 1/5 (6 addressed, 0 open; commits bb3dfdb..de352e7)

All six ADDRESSED. The re-reviewer ran the shipped splitter itself against the banned
comma and colon+em-dash forms (both correctly fail) AND against all seven real MD/G
citations pulled from the live file (all seven pass with both domains in the clause
carrying the figure).

It then did the check that mattered most: it BUILT THE COUNTERFACTUAL. A splitter using
`[-–—]+` without the surrounding `\s+` tears "...worth 23–27% of the Grade 3 EOG" into
"...worth 23" and "27% of the Grade 3 EOG", exactly as the implementer's comment warned.
So the spaced-dash requirement is load-bearing, and the implementer saw unprompted a trap
that would have silently defeated the citation-presence guard while still passing a comma
mutation test.

Both NBT.2 branches traced literally against the shipped 7-step method: addition 347+289
-> 636 (estimate 640, checks back); subtraction 402-176 -> step 3 catches ones 2<6 and
tens 0<70, trades the hundred THROUGH the zero tens, rewrites 402 as 300+90+12, gives
226 (estimate 220, checks back). NO STEP EVER ASKS FOR 70 FROM 0.

Factor-role convention verified against the source: OA.1's keyConcept is literally "the
number of equal groups AND the number of objects in each group", so groups-first is
derived from the standard rather than chosen. Applied uniformly across OA.1/2/3/6.

The re-reviewer also audited the implementer's own bookkeeping — the "five of seven"
rewrite count — against the base-vs-head diff and confirmed it accurate, including WHY
the other two needed no substantive change.

### Task 15: complete (commits b77efb3..de352e7, review clean after 1 fix round)

946 passing. 20 study guides, one per Grade 3 standard.

### Task 16 — DONE at `e8d86a7`, review dispatched

969 passing (+23: 11 new grade3.test.ts, 12 from integrity.test.ts gaining a third
curriculum), tsc clean, lint exit 0. Exactly the three PREDICTED assertions went red —
registry.test.ts x2 and FirstRunScreen.test.tsx's option list — and nothing else. The
first-run default test stayed green untouched: the default is still 5, so ruling 16-7
held and registering a LOWER grade did not move it, which was the whole point.

Mock allocation 10/3/8/6+1 = 28 -> 35.7/10.7/28.6/25.0, MD 21.4286 = 25x6/7 and G
3.5714 = 25x1/7, all through domainWeight(). Study guides wired in. Grade 5's circular
import fixed (16-8).

It also corrected the BRIEF: the brief claims `sourcedStandards.test.ts` would multiply
on registration, but it is already parameterised over all five grades. A small thing, but
it is the fourth time an implementer has corrected a brief claim the audits passed over.

Declined to add `grade3/standards.test.ts`, reasoning that `sourcedStandards.test.ts`
already checks Grade 3's codes, domains, bands, midpoints and grouping against both source
JSONs, and Grade 4 has no sibling either. Referred to the reviewer to verify rather than
accept — Task 12 flagged this forward and it deserves a real answer, not a deferral.

CONCERN WORTH THE FINAL REVIEW: drill subtitles cite blueprint bands as UNGUARDED FREE
TEXT. The implementer caught a `32-32%` typo of its own that no test would have. I
verified the gap is real and CROSS-GRADE: `grade3/quizzes.ts:80` carries "(32-36%)" in a
subtitle and `grade5/quizzes.ts:77` carries "(~41%)". The study guides have a band guard
that parses endpoints and checks attribution; quiz subtitles have nothing. Referred to
the reviewer with a specific question — does Grade 5's "~41%" trace to the blueprint at
all? If it does not, that is an invented weight shown to users, which is the exact class
that shipped seventeen times at Grade 5 before a test caught it.

Second concern (App.tsx importing three grade-agnostic drill factories from
`grade5/quizzes.ts`) referred with the note that the single-path redesign spec §11 already
owns moving them to `src/engine/drills.ts`, and that redesign is out of this plan's scope.

### Task 16 review — Approved, 0 Critical, 0 Important

Every load-bearing claim verified from source. All 116 question references extracted and
diffed against the 68 authored (id, standardCode) pairs — all resolve, no template id,
and the five drills cover all 68 items EXACTLY ONCE (21+7+14+21+5), with diagnostic and
mock disjoint. Allocation re-derived through domainWeight(): MD 25x6/7 = 21.4286, G
25x1/7 = 3.5714, MD+G landing on its exact 23-27 midpoint. Both cited percentages are
verbatim blueprint ranges BYTE-DUMPED to confirm U+2013.

The circular-import fix verified as REAL, not relocated: no production module under
grade3/4/5 imports `../registry` any more — only the three test files, which are not in
the app graph. And it mattered more than it looked: `App.tsx:19-23` imports
`./curriculum/grade5/quizzes` DIRECTLY, so that file genuinely is a near-entry-point and
the partially-evaluated-registry failure was reachable.

**CORRECTION to my own framing on Grade 5's "~41%".** I asked whether it traces to the
blueprint, flagging it as possibly the invented-weight class. It DOES trace:
`bands."5"` NF is `{"range": "39-43%", "midpoint": 41}`. It is a sourced midpoint, NOT a
fabrication, so it is not the defect that shipped seventeen times. What it actually is:
OFF-CONVENTION. The repo rule, encoded at `integrity.test.ts:35-42`, is that a displayed
percentage must be the domain's published RANGE, and `"39-43%".includes("41%")` is false.
So a subtitle guard written to mirror the existing one would redden Grade 5 on a
legitimate figure. That is a one-line consistency fix, not a fabrication hunt — and worth
knowing BEFORE the guard is written rather than after it goes red.

Ruling: the unguarded-subtitle gap goes to the FINAL whole-branch review, not into Task
16. Grade 3's own figures are correct and exact, so this task ships no defect; extending
`integrity.test.ts`'s existing weightCategory guard to subtitles needs the existing grades
swept first, including the Grade 5 range/midpoint fix above. Cost if wrong: a typo class
that the implementer caught by hand once stays uncaught until the final review.

Task 16: minor (deferred): `grade3.test.ts:118`'s own-quizzes guard has one blind spot —
  Grade 5 ships Geometry ids `g3-01`..`g3-05` (standard NC.5.G.3) which satisfy
  `startsWith("g3-")`. Not live (integrity.test.ts catches it properly via authoredFor)
  but the test reads stronger than it is.
Task 16: minor (deferred): the "exact integers, no rounding" comment is off by floating
  point — 25*(6/7)/100*28 = 5.999999999999999, so MD's window is [5,6] not exactly 6.
Task 16: minor (deferred): `standardsOf` now exists in three places, the documented price
  of breaking the cycle; the durable fix is a helper in `src/engine/`, which belongs with
  the redesign spec §11 drill relocation.
Task 16: minor (deferred): mock comment blocks run OA/NBT/NF/MD/G while standards.ts and
  the diagnostic run OA/NF/MD/G/NBT.

### Task 16: complete (commits de352e7..e8d86a7, review clean, no fix round)

### BATCH D COMPLETE — GRADE 3 IS REGISTERED AND PLAYABLE

969 passing. Grades 3, 4 and 5 all complete and registered. Tasks 1-16 done, 10 remain.
Batch E (Grade 2, Tasks 17-21) and Batch F (Grade 1, Tasks 22-26) are next, with 68
pre-flight rulings already written across both.

### Task 17 — Grade 2 OA and Geometry, DONE at `2685482`

969 -> 1005 passing (+36), tsc clean, lint exit 0 (pre-existing warnings only, none in
new files). No fix round yet; this run went straight from brief + rulings 17-1..17-7 to a
green suite on the first full pass, so an independent review is still owed before this
is called closed the way Tasks 1-16 were.

`GRADE_2_OA_AUTHORED`: 16 items — NC.2.OA.1 x5 (one per named CGI type per ruling 17-1:
Start Unknown, Compare-Bigger Unknown, Compare-Smaller Unknown, two-step Change Unknown,
two-step Result Unknown), NC.2.OA.2 x3 (fluency to 20, calculatorAllowed false per
17-4), NC.2.OA.3 x4 (pairing/counting by 2s, splitting into two equal groups, AND the
equal-addends equation per 17-2), NC.2.OA.4 x4 (arrays to 5x5, added not multiplied,
per 17-3). `GRADE_2_G_AUTHORED`: 9 items — NC.2.G.1 x5 (raised past the brief's floor of
3 per 17-6, covering 2-D naming, a non-example, AND rectangular-prism/cube faces),
NC.2.G.3 x4 (halves/thirds/fourths, including the "equal shares need not look alike"
reasoning item per 17-5, g2-g3-04).

Four templates, one per OA standard, none for Geometry (same call as Grade 3's G.1 — the
mathematics is in the wording): `g2.oa1.change-unknown` (one-step take-from, a CGI type
neither authored item covers), `g2.oa2.fluency-fact`, `g2.oa3.odd-or-even`,
`g2.oa4.array-repeated-addition`. All four ship literal-seed pins per the Content
Contract's standing ruling, a full sibling test each, and `templates/index.test.ts`
checking id uniqueness, standard-code validity, disk/index parity, the `g2.<tail>.<slug>`
naming convention, tag declaration, and pairwise prompt-shape disjointness by sentinel
regex over 400 seeds per template — all copied from Grade 3's pattern.

Three real defects were caught and fixed DURING authoring, before any external review,
worth flagging so a reviewer checks the fix rather than re-deriving the bug:

- The brief's "counted a shared row or column twice" error for NC.2.OA.4 is exactly what
  ruling 17-3 already found unconstructible; replaced with adding rows+columns and
  skip-counting a row short/too-many, and one authored distractor (`4 + 4 + 4 = 12`)
  that looked like the wrong-addend error was caught as a SECOND TRUE ANSWER — 4+4+4 does
  equal 12, just not by repeating the row size — and swapped for `3+3+3+3+3=15`.
- Both NC.2.OA.1 two-step items originally used `did-the-two-steps-in-the-wrong-order`,
  copied from Grade 3's OA.8 pattern. Working the arithmetic showed the order never
  matters for pure addition/subtraction of different quantities (`start - x + given` and
  `start + given - x` solve to the same x), so no wrong-order error produces a distinct
  wrong value here. Both items were rewritten to use a stopped-early error and a
  counting-off-by-one error instead; this is called out in the file's own docstring as a
  documented deviation.
- The template generator's array-addition distractors collided algebraically the same way
  Grade 3's did (`oneShort = oneRow` whenever rows = 2, and `wrongOp = oneShort` at
  (3,3) and (4,2)), caught by hand-deriving the collision equations before the property
  test ran, not by watching it fail. Rows now start at 3, and (3,3)/(4,2) are excluded —
  the identical exclusion set Grade 3's multiplicative array generator uses, for a
  different reason (addition vs. multiplication), which is a coincidence worth noting but
  not acting on.

Fourteen new misconception tags declared, all under existing families (`incomplete-
procedure`, `operation-choice`, `shape-classification`, `geometry-and-measurement`) — no
new `MisconceptionFamily` union member was needed. Full list and rationale in the "Grade 2
Operations & Algebraic Thinking" and "Grade 2 Geometry" comment blocks appended to the end
of `misconceptions.ts`.

CONCERN WORTH THE REVIEW: this task was executed by a single implementer pass with no
separate reviewer dispatch, unlike Tasks 1-16's implementer/reviewer/fix-round structure.
Everything above is self-reported. The three defects caught during authoring are exactly
the class of thing this plan's review process exists to catch independently — they were
caught here, but nothing caught THIS implementer's blind spots. Recommend a real Task 17
review pass before Task 18 builds on `GRADE_2_OA_AUTHORED`/`GRADE_2_G_AUTHORED` the way
Task 13 built on Task 12.

### Task 17 review — 1 Important, fixed; `f110217`

Independent pass, the missing review flagged above. Verified every requirement in
task-17-brief.md against what shipped: standard coverage, item floors, the specific error
types, the g2.<domain><tail>.<slug> naming convention, geometry staying template-free. Read
task-17-21-rulings.md and confirmed rulings 17-1..17-7 exist and say what the file's own
docstring claims they say.

Worked every authored item's math and every template's exclusion algebra by hand:

- `authored.oa.ts` (16 items) and `authored.g.ts` (9 items): every stated correct answer
  verified correct, every distractor verified wrong (no correct-answer-via-wrong-method,
  the specific defect class this plan has caught before).
- `oa4-array-repeated-addition.ts`'s four pairwise collision equations re-derived from
  scratch; `(3,3)` and `(4,2)` are the only collisions in the `r∈[3,5], c∈[2,5]` domain,
  matching the shipped `EXCLUDED` set exactly.
- `oa1-change-unknown.ts`'s two collision conditions (`start = 2·change` and
  `start = 2·change − 1`) and the parity argument for why `added` vs. `shortByOne` never
  collides both check out.

**1 Important, fixed:** `g2-oa1-01`'s "6" distractor was tagged
`counted-on-by-ones-and-stopped-one-short`, but stopping one count short while counting
BACK from 15 by 8 lands one count ABOVE the correct answer (8 = 15−7), not below it. The
value 6 is only reachable by taking one count too many (15−9=6, `...-one-too-many`). The
item's own comment said "stopped one count short: 6 instead of 7," which is internally
contradictory once the count is traced. Sibling item `g2-oa1-03` and the
`oa2-fluency-fact` template both get this direction right for subtraction (stop-short
overshoots toward the larger known number), so `g2-oa1-01` was the outlier, not a new
convention. Fixed the tag and the comment; no test changes needed since
`assertAuthoredBankSound` checks bank invariants, not individual option values.

Checked the implementer's three self-reported deviations: NC.2.OA.4's replaced error
traces to ruling 17-3 verbatim; the dropped wrong-order tag on both two-step OA.1 items
holds up algebraically for the specific numbers each item uses (pure addition/subtraction
of distinct quantities commutes); the array template's excluded pairs are exactly and only
the two the collision algebra predicts, nothing else in the remaining 10-pair space
collides.

Misconceptions: the commit message claims fourteen new tags; the diff has thirteen
`entry(...)` calls. Cosmetic — not worth a fix commit on its own, noted here so the count
doesn't get treated as load-bearing later. All 13 are used by at least one item or
template per `misconceptions.test.ts`'s orphan-tag check (no orphans); all sit under
existing families, no new `MisconceptionFamily` member needed.

1005 passing (unchanged — the fix only relabels an existing distractor), tsc clean, lint
exit 0 (same pre-existing warnings, none in Grade 2 files). Grade 2 OA/Geometry is now
safe for Task 18 to build on.

### Task 17: complete (commits 2685482..f110217, review clean after 1 fix)

### Task 18 — Grade 2 Number & Operations in Base Ten, DONE at `3718348`

1005 -> 1080 passing (+75), tsc clean, lint 0. 30 authored items across all eight NC.2.NBT standards, eight generator
templates (one per standard), 26 new misconception tags. Carried rulings 18-1..18-7 from
`task-17-21-rulings.md` verbatim: three-addend cap on NBT.6 (not four, the CCSS number),
NBT.1's "various groupings" genuinely exercised, NBT.8 "10 or 100" not "and", NBT.5/NBT.7
kept as strategy standards with the authored bank carrying the explain/compare/select half
per ruling 18-7.

Independent review dispatched (opus, math-first: solve every item cold, re-derive every
generator's parameter algebra, confirm every fixed-seed pin is a true literal not a
self-consistency fake). First review attempt failed mid-run on an account spend-limit
rate-limit (not a repo issue); relaunched fresh once the limit reset.

### Task 18 review — CHANGES REQUESTED, one spec violation plus two content defects

**Spec §6.5 violation, upheld and required a real split, not a taste call.** `nbt5-within-
100.ts` and `nbt7-within-1000.ts` each combined addition AND subtraction into one template
id, selected by an internal coin flip. `ReviewKey` is seedless
(`{kind:'generated',templateId}`), so a child who fails the subtraction mode could be
re-served the addition mode at review time under the identical key, answer correctly, and
have a real borrowing failure silently retired as mastered — precisely the Task 6 NBT.4
defect this plan already paid to learn from once. The reviewer proved the tags disjoint for
both templates (borrow-error tags vs carry-error tags, zero overlap) and caught that the
implementer's own justification cited Grade 4's docstring as combining add/subtract for its
procedure standards when that file says the opposite — Grade 4 explicitly splits for this
exact reason (`nbt4-add.ts`/`nbt4-subtract.ts`), as does Grade 3's `nbt2-add-within-1000.ts`/
`nbt2-subtract-within-1000.ts` for the identical standard one grade up. Ruling: split
required, non-negotiable.

**Two real content defects, both Important.** `nbt4-compare-three-digit.ts`'s pair
construction forced `a > b` at every one of its 18,225 draws (the sibling test even
asserted `expect(a).toBeGreaterThan(b)`), so every generated NC.2.NBT.4 item in the app was
answerable by "pick the option with `>`," with zero comparison required — defeating the
template's own stated reason for using full-sentence options instead of bare symbols. And
across the whole domain (generator plus all three authored items) `=` never once appeared
as a correct answer, though the sourced standard requires >, =, and < all be recorded.
Ruling: fix both (orientation swap plus one new authored `=`-keyed item).

Four Minor findings also ruled and required: a wrong range claim in a docstring ([1,69]
should be [1,59]), an NC.2.NBT.2 bullet claiming something the code contradicts, an authored
item ("5,100" distractor) whose comment didn't actually derive its own stated value, another
authored item (`g2-nbt4-02`) whose "more digits" distractor had a false premise (both
numbers are three-digit), a tautological test in `nbt6-three-addend-sum.test.ts` that
recomputed its own expectation from the same loops it was testing, and two near-duplicate
misconception tags sitting in different families. Two items — the NBT.6 two-addend
degenerate distractor and a weak four-addend guard — were reviewed and ruled acceptable,
left as-is.

### Task 18 fix round 1 — `33d0b18`, all six required fixes landed

1005 -> 1080 -> 1102 passing (+22 from the split's extra template test files), tsc clean,
lint 0. The two combined templates became four single-operation templates
(`g2.nbt5.add-within-100`/`g2.nbt5.subtract-within-100`, `g2.nbt7.add-within-1000`/
`g2.nbt7.subtract-within-1000`), each with its own sibling test carrying two literal
fixed-seed pins and a pinned full-space sweep count — no coverage lost in the split.
`nbt4-compare-three-digit.ts` now draws an orientation boolean so `>` and `<` split roughly
50/50 across 36,450 draws (doubled from 18,225 by the added dimension), and a new authored
item `g2-nbt4-04` (500+30+7 = 537) makes `=` reachable. The four docstring/test/tag fixes
also landed. Scope stayed clean — nothing outside the six ruled fixes touched, ruling
18-7's authored strategy items left alone as instructed.

### Task 18 re-review — one Important defect in the fix round's OWN new content

Independent re-reviewer verified all six fixes by re-derivation rather than trust: recomputed
every sweep count from the source parameter lists (all matched the pinned literals),
confirmed `ReviewKey`'s seedlessness and the now-accurate Grade 3/4 precedent citation,
re-ran the orientation-split assertion, and confirmed `g2-nbt4-02`'s rewritten option leaves
the item with exactly one correct answer.

One Important finding, in code this round itself introduced: the new item `g2-nbt4-04`'s
fourth distractor claimed "500, 30, and 7 written side by side make 5,307" — concatenating
500, 30, and 7 literally makes 500307, not 5,307. Same defect class the round existed to fix
(a stated derivation that doesn't produce its own value), this time in student-facing text
rather than a code comment. One Minor also noted (the nbt7 subtraction split's sibling test
lacks the counterfactual collision proof its nbt5 sibling has for the same exclusion) — not
blocking, left as a documented gap rather than actioned, matching the reviewer's own
recommendation not to hold up completion for it.

Ruling: fixed directly by the controller rather than another dispatch round, since it was a
one-line, fully-specified correction (concatenate the hundreds/tens/ones COUNTS — 5, 30, 7 —
instead of the expanded-form terms, which genuinely produces 5,307 and matches both the
misconception tag's own description and the analogous nbt5/nbt2 distractors elsewhere in the
same task). Commit `1f7af45`. Full suite re-run clean: 1102/1102, lint 0, tsc clean.

### Task 18: complete (commits f110217..1f7af45, review clean after 1 fix round + 1 direct fix)

1102 passing. Grade 2 NBT joins Grade 2 OA and Geometry (Task 17). Grade 2 Measurement &
Data (Task 19), study guides (Task 20) and registration (Task 21) remain.

### Workspace snapshot committed to git (2026-09-26)

The repo gained a private GitHub remote (`frictionlesscode/ncmathssa`) and all three
branches were pushed. Because this workspace is gitignored, a snapshot of its markdown
(ledger, briefs, pre-flights, rulings, reports — not the review diffs, which git can
regenerate) was committed to `docs/superpowers/sdd/2026-09-13-grades-1-4-content/`. This
live copy stays authoritative; re-copy the markdown into that folder at the end of each
batch and at the Task 26 close-out so the backup does not drift.
