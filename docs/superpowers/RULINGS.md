# Rulings — Adaptive Engine Foundation

Decisions made by the execution controller without asking, during the 16-task build of
the multi-grade adaptive engine (branch `feat/multi-grade-adaptive`, 41 commits).
Each records what was decided, why, and what it costs if wrong, so any can be reversed.

Plan: `docs/superpowers/plans/2026-09-11-adaptive-engine-foundation.md`
Spec: `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`

---

Ruling: `.superpowers/` added to .gitignore — the SDD workspace is scratch and must not enter git history. Cost if wrong: none; a one-line revert.

Ruling (F2): authored items must vary the correct option's position, and `authored.test.ts` gains an assertion that the correct answer is not always the same label across the 49 items (expect at least 3 distinct correct-labels). — Multiple choice already risks measuring test-taking over mastery; an answer key of all-A makes the practice actively misleading. Cost if wrong: a slightly noisier test and 49 items needing their options reordered.

Ruling (F3): T12's migration must import and call `reviewKeyId({kind:'authored', id})` rather than hardcoding the key string. — One format, one owner; a silent drift here would orphan every migrated review entry. Cost if wrong: none, it is strictly safer.

Ruling (F4): the shared harness keeps the presence check; the *value* check required by spec §10.1 moves into each template's own test, which asserts its three distractor values at two fixed seeds. A generic derivation check would require every template to declare its misconception rules as data, which is a heavier design than this plan's budget. — Spec intent is preserved (every distractor's value is verified); only the location changes. Cost if wrong: per-template tests are more verbose and a new template could ship without the assertion unless review catches it.

Ruling (F5): T7 Step 4 draws `remainder = rng.int(1, divisor-1)`. — A zero remainder makes `ignored-remainder` indistinguishable from the answer. Cost if wrong: the generator never produces an exact-division item; acceptable, since exact division is covered by other NBT.6 content.

Ruling (F6): T7 Step 9's third distractor becomes `(l*w*h)/2` tagged `used-area-not-volume` only once, with the third slot taking `l+w+h` tagged `used-perimeter-formula`, and the second slot `l*w` tagged `used-area-not-volume`. Final three: `l*w` (area-not-volume), `2*(l+w+h)` (perimeter), `l+w+h` (perimeter-sum). Two perimeter-family tags are acceptable; a duplicate *value* is not. — Cost if wrong: one distractor is less diagnostically distinct.

Ruling (F7): T7 Step 3 draws `b` such that `b % 10 !== 0` (redraw deterministically by adding 1 when divisible). — Cost if wrong: the generator never uses round multipliers, a negligible loss of variety.

Ruling (F8): T11's "not yet due" test must assert that no returned ref matches the queued key, not merely that the session is full. — A test that passes regardless of the behavior it names is worse than no test: it reports safety that was never checked. Cost if wrong: none.

All rulings are carried into the dispatch briefs for their tasks.


Ruling (T2/T3 merge): Tasks 2 and 3 dispatched as ONE unit. Task 2's registry.ts imports
  ./grade5, which only Task 3 creates, so Task 2 can never be green alone — the plan
  itself says they land as one commit. Splitting them would have produced a guaranteed
  BLOCKED or red-test report and a wasted fix loop. Cost if wrong: one review covers a

Ruling (F10 — standard count): the data has 17 grade-5 standards, not 16. Verified by
  the controller directly (counted `code: 'NC.5.*'` in standards.ts = 17). The original
  README's heading said 16 while its own enumerated list contained 17; that error was
  propagated into the spec and plan. Implementer correctly adjusted the TEST rather than

Ruling (F9 — diagnostic gap): `diagnostic-01` in src/data/quizzes.ts lists 16 question
  ids and omits `g3-01`, so NC.5.G.3 is never assessed by the baseline while the
  subtitle claims full coverage; the readiness gauge would report that standard untested
  forever. Fix folded into Task 5 as a binding brief addendum (add g3-01, correct the

Ruling (F13 — tag vocabulary untracked + fragmented): content uses 93 distinct
  misconception tags across 147 distractors, 66 appearing exactly once, and the
  vocabulary lived only in a gitignored scratch file. Folded into Task 6: create a
  tracked, typed `src/curriculum/misconceptions.ts` registry with a two-way test (every

Ruling (F14 — misconception ranking would be noise): with 66 singleton tags,
  topMisconceptions surfaces singletons, defeating spec §6.3. Folded into Task 9: keep
  per-tag ranking, ADD topMisconceptionFamilies rolling tags up to ~10 families. Cost if
  wrong: a second ranking function nobody uses.

Ruling (F15 — geometry family conflates two error types): geometry-and-measurement held
  19 tags mixing shape-classification/hierarchy errors (is a square a rectangle?) with
  volume/area procedure errors. Those need different remediation, so a family lumping
  them tells a parent nothing actionable — defeating the purpose families exist for.

Ruling (F16 — nudge loops are a quiet lie): the reference generator's third distractor
  (`scaledBoth`) is algebraically identical to its second (`notScaled`) — controller
  verified exhaustively, 585/585 parameter combinations collide, 100%, not an edge case.
  The collision-nudge loop then silently rewrote that option to an arbitrary near-answer

Ruling (F17 — duplicate questions in one session): the review step pushes refs, then the
  fill step independently calls itemsFor and can re-draw an authored id already pushed as
  a review. NC.5.NF.1 has only 4 authored items, so a session can serve the same question
  twice in one sitting — a visible defect independent of the cap. Fix: track selected

Ruling (F18 — my formula contradicts the spec): spec §7.3 specifies an ORDERED four-tier
  fill (reviews, weakest-weighted, untested, coverage). My brief collapsed tiers 2-4 into
  one blended score with untested pinned at gap 70, which lets an untested Fractions
  standard (70*0.41=28.7) outrank a standard the child is actively failing at 0%

Ruling: Math.random() for profile ids is acceptable — the purity constraint scopes to
  question generators so they replay from a seed; a profile id is a local map key, never
  replayed, not a security token. Reviewer concurred independently. Only the testability
  cost is being fixed.

Ruling (F11 scope was too narrow — MY error): quizzes.ts:9 and :79 still hardcode "17
  standards" and "80% passing bar" in subtitle strings rendered by Dashboard and
  QuizzesListView. My F11 ruling said to grep src/components/, so the implementer
  correctly did exactly that and missed these. quizzes.ts also still imports

Parked — Leitner double-step: one template can now supply two items per session, so
  recordResult can promote the shared seedless review key twice in one sitting. Ruling:
  accept. It is more evidence per sitting, not less, and the alternative (re-tightening
  dedup) reintroduces the generator cap that finding D existed to remove.
Parked — topMisconceptions is now referenced only by its own test (dead production code
  created by fix 8). Ruling: leave. It is the per-standard drill-down the spec still
  wants; a consumer belongs in the follow-on, not a rushed pre-merge deletion.
Parked — answerChecker's replacement comment cites callers that do not exist; the
  correct.text branch is unreachable. Ruling: leave, cosmetic.
Parked — Dashboard.tsx:231 `?? 45` fallback would print a false duration if the
  diagnostic ever omits timeLimitMinutes. Ruling: leave, the field is populated today.
Parked — Dashboard.tsx:38 reads grade-5 STATIC_QUIZZES regardless of curriculum.grade.
  Pre-existing, outside the diff. Ruling: MUST be fixed by the follow-on plan before any
  grade 1-4 ships, or a grade-3 profile will see grade-5 quizzes. Recorded as a hard
  precondition for that plan.
Parked — familyLabel title-cases every word ("Place Value And Decimals"). Cosmetic.
Parked — Navbar gear menu and add-profile popover can open simultaneously and overlap.
Parked — NC.5.MD.4 has only ONE authored question, not the 2-4 assumed. The badge is
  truthful but that standard repeats immediately. Highest-priority item for the
  follow-on content plan.
