# Rulings on the Tasks 17–21 pre-flight (Grade 2)

These OVERRIDE the task briefs wherever they conflict. Full audit in
`task-17-21-preflight.md`; this file is the binding decision on each of the 32
findings. Every Task 17–21 dispatch carries this file.

**All 32 are UPHELD.** The auditor dumped `nc-standards-1-5.json` key `"2"` in full and
compared it line by line with `grade2/standards.ts`: all 23 codes, all descriptions, all
keyConcepts bullets match, modulo two harmless normalisations (a JSON typo smoothed, and
trailing-colon lead-ins folded into bullets). `standards.ts` is a verified proxy.

**Grade 2 inventory:** OA 4 (`NC.2.OA.1–4`), NBT 8 (`.1`–`.8`), MD 9 (`.1`–`.8` plus
`MD.10`, there is no `MD.9`), G 2 (`G.1`, `G.3` — there is no `G.2`). Total 23.

## The two worst

- **18-1 `NC.2.NBT.6` is THREE two-digit numbers, not four.** The brief says four. CCSS
  2.NBT.B.6 says "Add up to **four** two-digit numbers"; NC's revision cut it to three,
  and the brief reproduced the Common Core sentence verbatim. Four two-digit addends
  total up to 396, so the generator would routinely emit sums above 300 with two
  regroupings — out of grade for NBT.6 and harder than anything NBT.5 (within 100)
  permits. Bound the generator to two or three addends, each in [10,99].
- **19-1 Three MD codes are cycled by one.** The brief assigns time to `MD.6`, money to
  `MD.7`, number line to `MD.8`. The source: **MD.6 is the number line, MD.7 is time,
  MD.8 is money.** This is worse than a mislabel because the brief's routing also decides
  templated-vs-authored, so as written the money and time generators carry the wrong
  `standardCode` and the number-line standard is exiled to "authored" under a code about
  coins. A clock template emitting `NC.2.MD.6` passes `integrity.test.ts` (the code
  exists and belongs to the grade) and passes `templates/index.test.ts`. The mis-filing
  reaches the child's mastery record: a child who cannot read a clock is recorded as weak
  on number lines. Corrected routing — templates: MD.1, MD.2, MD.5, **MD.7 (time)**,
  **MD.8 (money)**, MD.10; authored: MD.3, MD.4, **MD.6 (number line)**.

That is the fourth and fifth standard-code swap the audits have found (after Grade 1's
three). **Every Grade 2 implementer dispatch carries this instruction verbatim:**

> Before writing any item, read the standard's `description` AND its `keyConcepts` in
> `src/curriculum/grade2/standards.ts` and write to that. The brief's prose descriptions
> of what a code means are NOT reliable — three MD codes are known to be described under
> each other's text and one NBT standard is quoted from Common Core rather than NC. If
> the brief disagrees with `standards.ts`, `standards.ts` wins and the brief is wrong.

## Task 17 — OA and Geometry

- **17-1** `NC.2.OA.1` has five named problem-type bullets, two of them **two-step
  single-digit**, and the brief mentions none. Raise OA.1's floor from 3 to **5** and
  require one item each for Start Unknown, Compare-Bigger Unknown, Compare-Smaller
  Unknown, plus at least one two-step. Every item shows an equation with a symbol for the
  unknown — the description mandates it. Note the trap: an implementer left to choose
  picks Result Unknown, which is the one type the standard does *not* list for one-step
  problems.
- **17-2** `NC.2.OA.3` is **within 20**, and its third bullet (write an even number as a
  sum of two equal addends, `14 = 7 + 7`) is a distinct skill the brief never asks for.
- **17-3** `NC.2.OA.4` arrays are **up to 5 rows and 5 columns** — stated twice in the
  source, zero times in the brief. The equation-as-repeated-addition bullet is the point
  of the standard (it is the bridge to Grade 3 multiplication) and is unasked. **The
  brief's named error is unconstructible**: "counting a shared row or column twice" is an
  overlap error, and in a rectangular array no row or column is shared — so no distractor
  can be built from it and the implementer must fabricate a filler number with a
  mis-filed tag. Replace with adding rows + columns instead of repeated addition (3 rows
  of 4 → 7), or repeating the wrong addend.
- **17-4** `NC.2.OA.2` is fluency **within 20 using mental strategies** —
  `calculatorAllowed: false` on every item. A fluency standard answered with a calculator
  assesses nothing.
- **17-5** `NC.2.G.3`'s third bullet is the domain's one reasoning idea and must be
  covered.
- **17-6** `NC.2.G.1` spans 2-D polygons **and** 3-D solids; a floor of 3 cannot cover
  both. Raise it.
- **17-7** State that items must be non-image — figures go in `promptDetails` as
  screen-readable text. The brief never says so and the whole domain is figure-shaped.

## Task 18 — Base Ten

- **18-1** Three addends, not four. See above.
- **18-2** `NC.2.NBT.1`'s "compose and decompose using **various groupings**" bullet
  (243 as 2 hundreds + 4 tens + 3 ones, but also as 1 hundred + 14 tens + 3 ones) is the
  hardest and most-assessed idea in the standard and is absent from the brief.
- **18-3** "Count within 1000" is dropped, and the skip-count set is understated.
- **18-4** Step 3's fourth named error is arithmetically impossible — replace it, per the
  same reasoning as 17-3.
- **18-5** Five of the eight NBT generators have no stated range. State all five.
- **18-6** `NC.2.NBT.8` is "10 **or** 100", not "10 and 100".
- **18-7** `NC.2.NBT.5` and `NC.2.NBT.7` are strategy standards. Keep the generators
  (Grade 4 makes the same call for procedures) but require the authored bank to carry the
  "explain the strategy" half, and document the division of labour in the
  `templates/index.ts` docstring as Grade 4 does.

## Task 19 — Measurement & Data, aggregate

- **19-1** The three-code cycle. See above.
- **19-2** `NC.2.MD.2` is measuring one object **twice with two different-length units**
  and describing how the measurements relate to unit size — it is not "a fixed unit", and
  it must not be merged with MD.1.
- **19-3** NC Grade 2 measurement units must be stated; ranges are unstated across MD.
- **19-4** `NC.2.MD.10` drops the "organize and represent" half — it is not only reading
  data.
- **19-5** Step 3's error list covers rulers and clocks only; three standards get no
  named error at all.
- **19-6** The aggregate test moves to its own `src/curriculum/grade2/authored.test.ts`
  and must assert coverage of all 23 standards. Same ruling as Grade 4's 9.4, Grade 3's
  14-7.
- **19-7** State the MD template naming convention: `g2.md7.<slug>` — dots for templates.

## Task 20 — study guides

- **20-1** Same ruling as Grade 1's 25-2 and Grade 3's 15-1: the brief forbids any
  percentage, the Content Contract requires a real figure, and for grades 1–2 that figure
  is **the domain's share of the grade's standards**, stated as a COUNT so the `%` guard
  stays green: **OA 4 of 23, NBT 8 of 23, MD 9 of 23, G 2 of 23.**
- **20-2** Four of the nine section assertions are array-length checks that pass on
  whitespace. Add element-level `.trim().length` checks.
- **20-3** The percentage check scans one field while `/blueprint/i` scans the whole
  guide. Make the percentage check scan the whole guide too — a fabricated weight in
  `coreConcept` is the same defect in a less-guarded field.
- **20-4** State which fields address the child and which address the parent.
  `coreConcept` and `stepByStepMethod` are read aloud to a seven-year-old.

## Task 21 — register Grade 2, and stop the UI claiming a blueprint

- **21-1** Add `src/curriculum/registry.test.ts` to the Files list; Step 7's "Expected:
  PASS" is wrong. **Third consecutive registration task with this omission.** Re-point
  the `getCurriculum(…)` throw case to **grade 1** — the only grade still without a
  module after this task — and extend `listCurricula()` to include `2` in sorted
  position. Carry forward the note from Grade 1's ruling 26-3: after Task 26 no member of
  `Grade` is unregistered, so the assertion becomes a type-level impossibility and is
  re-expressed there as `getCurriculum(6 as Grade)`, not deleted.
- **21-2** `startsWith('g2-')`, not `g2.`. Fourth occurrence across four registration
  briefs. **Additionally: none of Tasks 17, 18 or 19 states the item-id rule at all** —
  give it to each of them explicitly (`g2-oa1-01`, `g2-nbt6-02`, `g2-md7-03`). Template
  ids keep dots and are already correct.
- **21-3 UPHELD — the heading fix is incomplete.** Replacing the label with
  `weightHeading(curriculum)` leaves a Grade 2 parent reading "**Share of Grade
  Standards: No state assessment at this grade**" — a heading promising a share followed
  by a non-answer, because every Grade 2 domain's `officialWeightRange` is that string.
  The same string lands in the printed report. `domainWeight()` already computes the
  right number for an unweighted grade; render that.
- **21-4 UPHELD — `Dashboard.tsx` is the bigger claim and the task may not touch it.**
  I verified `src/components/Dashboard.tsx:91` myself: it renders "Weighted by official
  NC EOG blueprint domain weights" unconditionally, for every grade, directly under
  "Overall SSA Readiness Gauge". That is a false claim about **the number the parent acts
  on** — larger than the column heading the task was written to fix. It is not in Task
  21's Files list, and because the task's own verification step is a grep for
  `Blueprint Weight|blueprint weight` over `src/`, the gate **cannot be satisfied while
  that line stands**: the task would ship having declared the UI honest with the
  dashboard still citing a blueprint that does not exist.
  Add `src/components/Dashboard.tsx` to the Files list and make line 91 conditional on
  `curriculum.weighting.kind`. Also: `PrintReportModal.tsx:273` carries **two** claims on
  one line (the bold "Focus by Blueprint Weight:" label and the sentence) and both must
  be conditional. Scope the grep to `src/components/` so `grade5.test.ts`'s benign test
  prose does not fail the gate.
  *Noted, not acted on:* the approved single-path redesign spec deletes `Dashboard.tsx`
  outright. That redesign is explicitly out of scope for this plan, wants its own branch,
  and may not land; shipping a false blueprint claim to Grade 1–2 parents in the meantime
  is not acceptable. Fix it here. Cost if wrong: four conditional lines thrown away later.
- **21-5** `g2-diagnostic-01` needs `isDiagnostic: true` and a subtitle that is a
  function of the curriculum (Ruling F11 — never bake grade-5 literals into a subtitle);
  `g2-mock-ssa-01` needs `isMockAssessment: true` and `timeLimitMinutes`. Task 16's
  equivalent step says this and Task 21's does not. Both fields are optional to the
  compiler, so omitting them compiles and then fails inside `integrity.test.ts` at Step 7
  with no obvious cause. Every `questionIds` entry must name an **authored** item id,
  never a template id.
- **21-6** State the mock SSA's computed allocation rather than leaving "in proportion to
  standard count" to the implementer: over 25 items the proportions are OA 4.3, NBT 8.7,
  MD 9.8, G 2.2. **Geometry must not round to zero.** Task 16 states its numbers; Task 21
  should too.
- **21-7** See the audit; upheld as written.

---

## Added after Task 11 (not from the Grade 2 pre-flight)

**21-8 — `QuizzesListView.tsx:200` prints a grouped domain's bare band.** Module-drill
cards render `domain?.officialWeightRange`, so the Geometry drill card reads
"G • 23–27%" — a single-domain weight claim for a domain that has no published weight of
its own. `weightLabel()` exists for exactly this and is used correctly in
`CurriculumView.tsx:94` and `PrintReportModal.tsx:157`; `types.ts:26` instructs it.
Pre-existing and affects Grade 5 equally, so it is not a regression from any task here —
but it is the same class of false claim that rulings 10.1, 15-1 and 20-1 spent effort
preventing in the study guides, and Task 21 is the task whose whole purpose is stopping
the UI claiming blueprints that do not exist. Add it to Task 21's Files list alongside
`Dashboard.tsx` and `PrintReportModal.tsx`. Found by the Task 11 review.

**21-9 — `FirstRunScreen.test.tsx` is a SECOND stale registration pin, and the
first-run default grade is a third thing to update.** None of the four pre-flight audits
caught this: all four found `registry.test.ts` and stopped. `FirstRunScreen.test.tsx`
pins the grade option list, and `FirstRunScreen.tsx:17` derives the pre-selected grade
from the registered list. Task 21 must list BOTH test files, and must not let the
default-grade expression drift. See the Task 11 ruling: the default is the HIGHEST
registered grade, derived from the list rather than hardcoded, and pinned by a test that
asserts the pre-selected value on a fresh render without calling `selectOptions`.

---

## STANDING RULING for every content task in this batch — fixed-seed pins must pin LITERALS

This defect has now shipped twice and been caught only at review both times: Task 8
(Grade 4 MD, all five templates) and Task 12 (Grade 3 OA, all five templates).

**The failure:** a "fixed-seed test" draws a seed, then reads the numbers back out of the
generator's own prompt or figure and asserts the answer equals a function of them. That
asserts self-consistency. It passes for ANY question the generator emits, and stays green
through a change to the seed→pair mapping, the context/noun list, `rng.pick` ordering, or
the entire wording of the question. It cannot detect a pool change or an ordering change,
which is the only thing a pin is for.

**The requirement**, from the Content Contract: every template gets "at least two
fixed-seed tests pinning a known question and its correct answer." That means LITERAL
strings:

```ts
expect(generate(makeRng(7)).prompt).toBe('What is 7 × 4?');
expect(g.answerText).toBe('28');
expect(g.options.map((o) => o.text)).toEqual(['28', '11', '21', '35']);
```

Run the generator to obtain the real strings; never hand-write what you think it emits.
Keep the full-space sweeps and the per-distractor recomputation blocks — they are better
than the pins at what they do, and they do not replace the pins.

**Note for briefs:** several task briefs in this plan ask only for "a pinned-seed
assertion that the correct option's text equals `answerText`", which is the derived form
and is not sufficient. The Content Contract overrides the brief here.
