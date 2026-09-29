# Rulings on the Tasks 12–16 pre-flight (Grade 3)

These OVERRIDE the task briefs wherever they conflict. Full audit in
`task-12-16-preflight.md`; this file is the binding decision on each of the 28
findings. Every Task 12–16 dispatch carries this file.

**All 28 are UPHELD.** Each is backed by text quoted from `standards.ts`, which the
auditor separately verified is verbatim-faithful to `nc-standards-1-5.json` for all 20
Grade 3 codes. The governing rule applies cleanly: where a brief and `standards.ts`
disagree, `standards.ts` wins. I am recording the corrections here rather than
restating the arguments — the audit makes them, and it makes them from the source.

## The pattern these share

Nineteen of the 28 are one defect class: **a brief phrase that imports Common Core's
version of a standard, or the next grade's version.** It is the same class as the
`NC.4.NBT.7` rounding error that shipped and the fractional-line-plot error caught in
Task 8's pre-flight. Grade 3 is the worst-hit batch in the plan because NC's Grade 3
diverges from CCSS's Grade 3 in more places than any other grade here.

Every implementer dispatch for Tasks 12–16 must carry this instruction verbatim:

> Derive what each standard requires from `src/curriculum/grade3/standards.ts` FIRST,
> including its `keyConcepts` bullets, and write to that. Where the brief describes
> mathematics the sourced text does not contain, the sourced text wins and the brief
> is wrong. Do not write the Common Core version of a Grade 3 standard from memory.

## Task 12 — Grade 3 OA

- **12-1** `NC.3.OA.8` STAYS AUTHORED. It is "Solve two-step word problems", and the
  Content Contract binds all of Tasks 5–26: multi-step word problems stay authored.
  Grade 4 already decided the analogous `NC.4.OA.3` the same way in shipped code. Drop
  the OA.8 template. The `generated.length >= 10` floor still holds with 16 generators.
- **12-2** `NC.3.OA.8` uses **only +, −, ×. Never division, never PEMDAS.** Sourced
  text: "using addition, subtraction, and multiplication". CCSS 3.OA.8 says "the four
  operations" — that is the version an implementer writes from recall. The
  wrong-order distractor means doing the two *steps* in the wrong order, not an order-
  of-operations item; a bare `3 + 4 × 2` is Grade 5 (`NC.5.OA.2`).
- **12-3** DROP the "division is commutative" distractor. `3 ÷ 12 = 0.25`, and a Grade 3
  child has no decimals, so it is not a value a student reaches and cannot be printed.
  Replace with a whole-number-reachable error (answering with the divisor or dividend;
  subtracting instead of dividing) and give it its own tag.
- **12-4** Each OA generator gets a DISTINCT question shape, specified: OA.1 an
  array/equal-groups figure in `promptDetails`; OA.2 the same for division; OA.3 a
  one-step word problem; OA.6 a missing-factor equation `6 × ? = 42`; OA.7 bare
  fluency. Only OA.7 is bare-fact recall. Five generators of the same shape would put
  one question under five review keys and mark a child mastered in all five — silent,
  and every test still green.
- **12-5** OA.1/OA.2/OA.6/OA.7 draw factors, divisors and quotients from **1–10
  inclusive**. `NC.3.OA.2` says "one-digit divisor and one-digit quotient"; `NC.3.OA.7`
  caps at 10. `100 ÷ 4` is out of range even though it is easy.
- **12-6** `NC.3.OA.9` is "**hundreds board and/or** multiplication table". Stays
  authored (correct), but the bank needs at least one hundreds-board item.
- **12-7** Add `assertNoGeneratorDuplicatesAuthored` to every Grade 3 bank test whose
  standard also has a generator. Grade 3 OA is the plan's worst case: factors 1–10 is
  100 products total, so authored/generated collisions are near-certain. The kit
  already exports it and `grade4/authored.nf.test.ts` uses it.
- **12-8 / 16-1** Authored item ids are **`g3-oa1-01`** — hyphen after the grade,
  matching Grade 4's 84 shipped ids. Template ids keep dots (`g3.oa1.times-as-many`),
  matching Grade 4. I have already corrected the plan's Content Contract for this.
- **12-9** Task 12 also creates `src/curriculum/grade3/templates/index.test.ts`
  mirroring Grade 4's. Per-template tests cannot see cross-file id collisions, and a
  template missing from `index.ts` is invisible to the app while still passing the
  misconception test through `allContent.ts`.

## Task 13 — Grade 3 NBT and NF

- **13-1** SPLIT `NC.3.NF.3` and `NC.3.NF.4` into two constrained templates. NF.4 is
  "Compare two fractions **with the same numerator or the same denominator**" with
  denominators "halves, fourths and eighths; thirds and sixths". Comparing 2/3 to 3/4
  is `NC.4.NF.2` — and there is already a landed Grade 4 generator for it. "Equivalence
  and comparison" is the single most natural phrase to write a general comparator from,
  and a general comparator is next year's content.
- **13-2 (CORRECTED after Task 13 review — the NF.4 half was wrong)** NF denominators
  are **{2, 3, 4, 6, 8}** for NF.1 and NF.2. The related families {2,4,8} and {3,6}
  constrain **NF.3 ONLY**, not NF.4. `NC.3.NF.3` says "equivalent fractions using
  **related** fractions: halves, fourths and eighths; thirds and sixths" — the word
  *related* is there and the families are load-bearing. `NC.3.NF.4` says "...with
  denominators: halves, fourths and eighths; thirds and sixths" — no "related"; that
  semicolon list is the permitted denominator SET. Decisive check: NF.4 is "same
  numerator or same denominator", so a family constraint would forbid `1/2` vs `1/3`,
  the most natural benchmark comparison an eight-year-old makes. Cross-family
  same-numerator comparisons are IN standard. Fifths, tenths, twelfths and
  hundredths are Grade 4. Each template test sweeps the draw space and asserts it.
- **13-3** `NC.3.NF.3` has THREE bullets, not one. Beyond equivalence: "a fraction with
  the same numerator and denominator equals one whole" (4/4 = 1) and "expressing whole
  numbers as fractions" (3 = 6/2). Two thirds of the standard is absent from the brief,
  and a three-item floor of equivalence items would mark it covered.
- **13-4** `NC.3.NBT.3`'s multiple of 10 is **in the range 10–90**. Largest legal
  product 9 × 90 = 810.
- **13-5** `NC.3.NBT.2` is not "do the algorithm". Its bullets are estimation for
  reasonableness, the addition/subtraction inverse relationship, and expanded-form
  decomposition. Require one item of each alongside the generator. NBT has only two
  standards carrying a 9–13% band, so NBT.2 is most of it.
- **13-6** The "reading 1/4 as 'one and four'" tag is real but must bind to an item
  shape where it is REACHABLE — a model-matching or number-line item, not "What is 1/4
  of 8?". There is no numeric value for "one and four", so on a numeric item it becomes
  the mis-filed tag the Global Constraints call worse than no tag.
- **13-7** KEEP the brief's "nothing else" clause on NBT — it correctly forecloses CCSS
  3.NBT.1 rounding, which NC has at no grade in this plan. Make the exclusion explicit.

## Task 14 — Grade 3 MD, Geometry, aggregate

- **14-1 (the most serious finding in this batch)** `NC.3.MD.2` is **CUSTOMARY
  measurement** — cups, pints, quarts, gallons, ounces, pounds; lengths to the quarter-
  and half-inch, feet and yards. The brief says "mass or volume word problems", which
  is CCSS 3.MD.A.2's metric vocabulary (grams, kilograms, liters). NC's metric work is
  Grade 4 `NC.4.MD.1`, already shipped as `grade4/templates/md2-metric-convert.ts`.
  Two words of recall-sourced vocabulary would have redirected an entire standard
  inside a 23–27% band to another curriculum and another grade.
  REQUIRED GUARD: a test asserting no Grade 3 MD prompt matches
  `/\b(gram|kilogram|kg|liter|litre|centimeter|metre|meter|milliliter)\b/i`.
  Keep each problem in the SAME customary unit, per the standard's third bullet.
- **14-2** `NC.3.MD.2`'s length strand is required too: at least one item reading a
  length to the nearest quarter- or half-inch (ruler in `promptDetails`), one on
  feet/yards.
- **14-3** REPLACE the "unequal parts called a quarter" Geometry misconception. It is
  CCSS 3.G.A.2, which NC does not have at Grade 3 in any domain. `NC.3.G.1` is
  composing/decomposing and quadrilateral examples/non-examples. Use an error G.1
  actually produces (a tilted rhombus called "not a parallelogram"; a square called
  "not a rectangle"; a trapezoid named a parallelogram). G is a ONE-standard domain, so
  one off-standard item is a third of Grade 3 Geometry. An on-code item testing
  off-standard mathematics passes every test in the suite.
- **14-4** `NC.3.MD.1` time intervals stay **within the same hour**, by construction in
  the generator with the algebra documented in a file comment — not by resampling in a
  loop. Crossing the hour is Grade 4. Also require a plain "tell the time to the
  nearest minute" item, which is the standard's first half.
- **14-5** SPLIT `NC.3.MD.5` (tile and count unit squares — a figure, answer is a
  count) from `NC.3.MD.7` (area via multiplication, and the two-rectangle
  decomposition the brief never mentions). "6 × 4 = 24 square units" satisfies both as
  a string and neither as a skill. Guard with `assertNoGeneratorDuplicatesAuthored`.
- **14-6** `NC.3.MD.8` includes **finding an unknown side length** given the perimeter.
  Two templates, not one — the two directions go wrong differently, and the
  one-template-one-skill rule applies.
- **14-7** Create `src/curriculum/grade3/authored.test.ts` for the aggregate
  assertions. Same ruling as Grade 4's 9.4.

## Task 15 — Grade 3 study guides

- **15-1** Same ruling as Grade 4's 10.1: the test checks **attribution, not
  presence**. The brief forbids any percentage in MD/G guides, which makes the Content
  Contract's "must cite a real figure" impossible for seven of twenty guides. Cite
  23–27% and say in the same sentence that it covers Measurement & Data and Geometry
  together. Note the EN DASH (U+2013) in `23–27%` — the blueprint and `standards.ts`
  both use it and a literal with a hyphen will not match.
- **15-2** The `rulesAndFormulas.length > 0` assertion passes on
  `[{label:'', detail:''}]`. Add `.trim().length` checks on every field, matching the
  neighbouring assertions, and do the same for `stepByStepMethod`, `commonTraps` and
  `workedExample.steps`.
- **15-3** Verified correct, keep as written: OA 32–36%, NBT 9–13%, NF 28–32% all match
  the blueprint, all three are ungrouped domains entitled to their own band. Keep the
  brief's "Write for a nine-year-old" instruction verbatim — it is the right one.

## Task 16 — Register Grade 3

- **16-1** `id.startsWith('g3-')`, per 12-8.
- **16-2** Add `src/curriculum/registry.test.ts` to the Files list. TWO assertions go
  red and both updates are part of Task 16: the `getCurriculum(3)` throw case moves to
  a grade that still has no module (1 or 2), and `listCurricula()` becomes
  `[3, 4, 5]`. Step 6's "Expected: PASS" is wrong as written. Amend it to say these two
  are expected and every other failure is a real Grade 3 finding — and that
  `integrity.test.ts` and `sourcedStandards.test.ts` now run Grade 3 through their
  `describe.each`.
- **16-3** Mock SSA allocation becomes **10 OA, 3 NBT, 8 NF, 7 MD+G = 28** (35.7 /
  10.7 / 28.6 / 25.0 — every one inside its band, MD+G exactly on its midpoint). The
  brief's 9/3/8/8 puts MD+G at 28.6%, above its 23–27% band, at OA's expense. Within
  the 7 MD+G items: 6 MD + 1 G, by standard count as `domainWeight()` splits it. Never
  check this by summing raw midpoints — they total 125.
- **16-4** Each `g3-mod-*` drill sets its `domainId`; `g3-mock-ssa-01` sets
  `isMockAssessment: true`. Both fields are optional to the compiler, so omitting them
  is silent and a drill with no `domainId` filters to nothing.
- **16-5/16-6** Verified correct, no action: the `GRADE_3` literal matches
  `GradeCurriculum` exactly, the blueprint source string matches character for
  character, `domainWeight()` totals to 100.00, `standardsOf(GRADE_3).length === 20`,
  and the contentComplete/registration pairing is honoured. `grade3.test.ts`'s overlap
  with `integrity.test.ts` is the deliberate Grade 4/5 precedent — a reviewer should
  not report it as copy-paste.

---

## Added after Task 11 (not from the Grade 3 pre-flight)

**16-7 — `FirstRunScreen.test.tsx` is a SECOND stale registration pin, and the first-run
default grade is a third thing Task 16 must not break.** No pre-flight audit caught this:
all four found `registry.test.ts` and stopped there. Task 16 must list BOTH test files.

`FirstRunScreen.tsx` seeds its grade picker from the registered list. Task 11 established
the rule: **the default is the HIGHEST registered grade**, derived as
`curricula[curricula.length - 1]?.grade ?? 5` (the list sorts ascending), never
hardcoded. Registering Grade 4 had silently moved the default from 5 to 4 by taking
`curricula[0]`, and no test could see it. Registering Grade 3 must not move it again.
`FirstRunScreen.test.tsx` now pins this with a test that derives the expectation
independently via `Math.max(...grades)`, guards its own vacuity, and reads the select's
value on a fresh render without calling `selectOptions`. Task 16 updates the option-list
expectation and leaves that default test passing untouched.

**16-8 — Grade 5's circular import should be fixed in this batch at the latest.**
`grade5/quizzes.ts:3` imports `standardsOf` from `../registry` while `registry.ts:3`
imports `./grade5` — a live cycle, green only by import order. It got nastier at Task 11:
`registry.ts` now imports `./grade4` before `./grade5`, so if `grade5/index` ever becomes
a graph entry, `CURRICULA` evaluates to `{4: GRADE_4, 5: undefined}` — a partially
working registry, which fails worse than a clean throw. `grade4/quizzes.ts` shows the fix:
count off `c.domains` instead of importing `standardsOf`. One line.

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
