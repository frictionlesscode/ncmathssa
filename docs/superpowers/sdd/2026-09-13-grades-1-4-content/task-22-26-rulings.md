# Rulings on the Tasks 22–26 pre-flight (Grade 1)

These OVERRIDE the task briefs wherever they conflict. Full audit in
`task-22-26-preflight.md`; this file is the binding decision on each of the 36
findings. Every Task 22–26 dispatch carries this file.

**All 36 are UPHELD.** The auditor dumped all 23 Grade 1 codes, descriptions and
keyConcepts bullets from `nc-standards-1-5.json` and compared them to
`grade1/standards.ts`: exact match, including the two places NC diverges from CCSS most
quietly (`NC.1.NBT.1` counts to **150**, not CCSS's 120; `NC.1.MD.5` coins exists, where
CCSS has no Grade 1 money standard). So `standards.ts` is a verified proxy for the
source and the governing rule applies with nothing to weigh.

## Three standard-code SWAPS — the worst defects in the plan

Grade 1 is where the briefs stop merely describing the wrong mathematics and start
filing it under the wrong code. Three swaps, each of which ships **both halves green**,
because `assertAuthoredBankSound` checks only that a code belongs to the domain and the
aggregate test checks only that *some* item exists per code. Nothing in the suite can
see that an item is about the wrong standard.

- **24-1 `NC.1.MD.3` ↔ `NC.1.MD.5` are inverted.** Source: MD.3 is "Tell and write time
  in hours and half-hours"; MD.5 is "Identify quarters, dimes, and nickels and relate
  their values to pennies". The brief calls MD.5 "Time" and MD.3 "money or coin
  recognition". Task 24's own "Standards covered" header lists both correctly — the swap
  is only in Step 4, which is where an implementer reads what to write. Every clock item
  would ship tagged as coins and every coin item as time; the "Identify Coins" study
  guide would be reinforced by clock quizzes, and a parent would be told their child is
  weak at telling time when they are weak at coins.
- **22-1 `NC.1.OA.6` ↔ `NC.1.OA.9`.** NC renumbers CCSS here: fluency-within-10 is
  `NC.1.OA.9`, and `NC.1.OA.6` is "Add and subtract, within 20, using strategies"
  (counting on, making ten, decomposing to a ten). CCSS 1.OA.6 *is* the fluency
  standard, which is exactly the recall the brief reproduced. The fluency template is
  OA.9 (within 10); OA.6 is the more template-worthy of the two and comes OFF the
  "reasoning, stays authored" list — that list becomes OA.3, OA.4, OA.7.
- **23-1 `NC.1.NBT.1` ↔ `NC.1.NBT.7`, with an invented description.** Source: NBT.1 is
  "Count to 150, starting at any number less than 150"; NBT.7 is "Read and write
  numerals … to 100". The brief gives NBT.1 the numeral-writing content and describes
  NBT.7 as "grouping to count", which is a paraphrase of `NC.1.NBT.2`'s unitizing bullet
  and appears nowhere in NBT.7. CCSS 1.NBT.1 folds counting and numeral-writing into one
  standard to 120; NC splits them and raises the count to 150.

**Every Grade 1 implementer dispatch carries this instruction verbatim:**

> Before writing any item, read the standard's `description` AND its `keyConcepts` in
> `src/curriculum/grade1/standards.ts` and write to that. The brief's prose descriptions
> of what a code means are NOT reliable — three codes are known to be described under
> each other's text. If the brief's description of a standard disagrees with
> `standards.ts`, `standards.ts` wins and the brief is wrong.

## Number ranges — every one the briefs left unstated

At Grade 1 the range *is* most of the standard, and the CCSS value is the recall trap.
Stated bounds, all from the sourced text, all to be asserted in the template tests:

- **23-2 `NC.1.NBT.4` is the most consequential.** "Within 100" is the CEILING, not the
  licence. The keyConcepts bound the second addend to **a one-digit number or a multiple
  of 10**. NC Grade 1 never adds two arbitrary two-digit numbers — 47 + 38 is Grade 2
  (`NC.2.NBT.5`). Assert the addend SHAPE, not just the sum. Otherwise a six-year-old
  who was never taught two-digit regrouping is served 47 + 38, fails, and is reported to
  their parent as having a place-value misconception — with every test green.
- **23-3** `NC.1.NBT.1` counts to **150** (CCSS says 120 — write 150, and pin a
  fixed-seed case at or above 120).
- **23-4** `NC.1.NBT.7` numerals **0–100** — do not inherit NBT.1's 150.
- **23-5** `NC.1.NBT.6` both operands are multiples of 10 in **10–90**, minuend ≥
  subtrahend. **No negative distractors** — negative numbers are in NC's K–5 standards at
  no grade, so "20 − 50 = −30" is not a value a first-grader can even read and the item
  becomes effectively three-option, inflating measured mastery.
- **23-8** `NC.1.NBT.5` draws two-digit numbers **10–99**.
- **22-3** `NC.1.OA.2` three addends with **sum ≤ 20**, asserted across all 300 runs.
- **22-8** `NC.1.OA.4` unknown-addend **within 20**.
- **24-8** `NC.1.G.3` partitions into **two and four** equal shares only. **Thirds are
  out of scope** — "partition into equal shares" is the CCSS/Grade-2-shaped phrase that
  pulls them in.

## Dropped bullets — mathematics the standards ask for and the briefs omit

Each of these would ship a third of a standard behind a green three-item floor:

- **22-2** `NC.1.OA.1`'s three problem types are the substance of the standard: Add
  to/Take from–Change Unknown; Put together/Take Apart–Addend Unknown;
  Compare–Difference Unknown. One item each. Compare–Difference Unknown is the type
  first-graders fail most and would have shipped untested.
- **22-4** `NC.1.OA.6`'s six strategies must be NAMED in `stepByStep`; at minimum
  "making ten" and "counting on" each appear.
- **22-5** `NC.1.OA.3` needs a three-addend regrouping item for the associative half,
  and **no item may ask the child to name the property** — the source says strategy, not
  vocabulary, and a six-year-old is not reading "associative".
- **23-7** `NC.1.NBT.2` needs a teen-decomposition item AND a decade item. The teens are
  where "13 read as 31" lives — a misconception the brief itself cites without
  connecting it to the bullet that requires it.
- **24-4** `NC.1.MD.5` is "identify … **and relate their values to pennies**". One item
  must be value-in-pennies. Out of scope, state it explicitly: NC Grade 1 does NOT add
  coin values, use `$` or `¢`, or solve money word problems — that is `NC.2.MD.8`.
  "Money … recognition" is the doorway to importing it.
- **24-5** `NC.1.MD.4`'s three question types (total; how many in each category; how many
  more/less) ARE the standard. Branch on the seed or split the template; pin one
  fixed-seed test per type. Categories ≤ 3.
- **24-6** `NC.1.G.1` includes **three-dimensional** shapes — cubes, rectangular prisms,
  cones, spheres, cylinders. At least one 3-D item.
- **24-7** `NC.1.G.2` includes 3-D composites and **half-circles** (named in the source,
  absent from the brief), and "naming the components" — at least one item asking which
  shapes it is made of, not what the new shape is.
- **24-8** `NC.1.G.3` also needs "decomposing into more equal shares creates SMALLER
  shares" — the counter-intuitive bullet, and the most common fraction error in the
  primary grades, unmentioned in the brief.

## Item shapes that cannot be four-option multiple choice

The Global Constraints require exactly four options with four distinct texts at every
seed. Two standards' natural shapes cannot satisfy that, and both need the shape briefed
or the implementer will pad with untagged filler and `labelOptions()` will throw:

- **22-6** `NC.1.OA.7` is naturally true/false. Brief it as "**Which equation is
  true?**" — four candidate equations, three false for a named reason.
- **23-6** `NC.1.NBT.3` symbol choice has only three possible answers (`>`, `=`, `<`).
  Brief it as "**Which sentence is true?**" — four complete comparison statements
  (`43 > 38`, `43 < 38`, `43 = 38`, `38 > 43`). Keeps the symbol recording the standard
  demands and yields four distinct texts at every seed.

## Age-appropriateness — a correctness check at this grade

- **24-2 / 24-3 `NC.1.MD.1` becomes AUTHORED.** The brief excludes Geometry from
  templating because "a generator would only shuffle labels", then templates MD.1, where
  a generator can only shuffle labels. MD.1 is transitivity over described objects; the
  natural prompt ("The pencil is longer than the crayon. The crayon is longer than the
  eraser. Which is longest?") is three sentences and three clauses of held state — over
  the cap and squarely the "multi-clause setup" the contract forbids. Task 24 therefore
  contributes TWO templates, not three.
- **24-9 `NC.1.MD.2`** puts the figure ("6 paper clips end to end, one with a gap") in
  `promptDetails`, which the length rule does not test, keeping `prompt` to the question.
  Otherwise "no gaps or overlaps" — the whole point of the standard — gets dropped to fit
  the character budget.
- **22-7 RULED:** keep `sentences.length <= 2` (one setup, one question is defensible for
  a word problem), drop the character cap from 120 to **90**, and add a word-length guard
  (no word longer than 10 letters) — that is what actually catches "determine",
  "associative", "represent". Amend the brief's prose, which says "one short sentence",
  to match. Do NOT add a second emptiness check; `assertAuthoredBankSound` already
  asserts `prompt.trim().length > 0`.
- **E.3 RULED:** extract the readability guard to a single
  `assertGradeOneReadable(items)` in `src/curriculum/authoredBank.testkit.ts`, written in
  Task 22 and imported by Tasks 23 and 24. The brief specifies copying it verbatim into
  seven-plus files with the same magic numbers. The testkit's own docstring explains why
  that is a defect: "A domain test that re-declared these patterns locally could drift
  from this copy without anything going red — which is precisely the failure the guard
  exists to prevent." Grade 2 (Tasks 17–20) imports it too rather than duplicating again.

## Duplicate-serving guard

- **23-9** Keep generators on all seven NBT standards (Grade 4 makes the same call for
  the same reason — procedures are learned on unseen numbers) but require the
  `templates/index.ts` docstring to state the reasoning as Grade 4's does, and make the
  authored/generated division of labour explicit so the authored bank is not a duplicate
  of generator output. Add
  `assertNoGeneratorDuplicatesAuthored(GRADE_1_NBT_AUTHORED, nbtTemplates)` — it exists
  in the testkit and no Grade 1 brief calls it.

## Task 25 — study guides

- **25-1** The brief points at **Task 10 Step 3**, which is the GRADE 4 study-guide task
  and licenses citing 14–18% / 25–29% / 30–34%. Those bands do not exist at Grade 1 —
  no NCDPI blueprint exists below grade 3. Repoint at Task 20 Step 3 (Grade 2, the
  no-blueprint case) and state explicitly that Task 10 Step 3's second paragraph does not
  apply. The `%` test would not have caught "roughly a quarter of the exam", and scans
  only `whyItMattersForSSA` — not `coreConcept` or `commonTraps`.
- **25-2** The brief states the prohibition and drops the contract's positive
  requirement. `whyItMattersForSSA` must cite a real figure; for grades 1–2 that is the
  domain's share of the grade's standards. Give the implementer the four counts, as
  counts rather than percentages so the `%` guard stays green: **OA 8 of 23, NBT 7 of 23,
  MD 5 of 23, G 3 of 23.** This is the same arithmetic as `domainWeight()`'s
  even-by-standard-count branch. Without them, 23 guides of generic filler ship green.
- **25-3** Reword Task 20's "because grade 2 has no state assessment" failure messages to
  say grade 1. Cosmetic.

## Task 26 — register Grade 1 and close out

- **26-1** `startsWith('g1-')`, not `g1.`. Third occurrence of this defect (Tasks 11, 16,
  21, 26 all carry it); the contract has been corrected. Quiz ids themselves
  (`g1-diagnostic-01`) are already correct — only the Step 1 **item**-id assertion is
  wrong.
- **26-2** Add `src/curriculum/registry.test.ts` to the Files list; final value
  `toEqual([1, 2, 3, 4, 5])`. Unlisted for the third audit running.
- **26-3 RULED — keep the throw test, repoint it past the union.** After Task 26 no
  member of `Grade = 1|2|3|4|5` is unregistered, so `getCurriculum(3)` can no longer
  throw and the test is inexpressible as written. Express it as
  `expect(() => getCurriculum(6 as Grade)).toThrow(/no curriculum/i)` with a comment
  saying the cast is deliberate — it simulates a future grade whose module does not exist
  yet. The thrown message is `No curriculum module for grade ${grade}`, which matches.
  Deleting the test would remove the only coverage of the registry's failure path on the
  very task that finalises the registry, and that failure path is what stops a missing
  module rendering as a blank app.
- **26-4** Raise the generator floor from 8 to **12** and name the expected standards. 8
  of 13 is a floor that cannot fail; a third of the generators could vanish with
  everything green. (13, not 14, after MD.1 becomes authored per 24-2.)
- **26-6** Every quiz `questionId` must be an AUTHORED item id, never a template id —
  `integrity.test.ts` resolves them through `c.source.authoredFor(code)`. Task 26 Step 3
  does not say this, and an implementer building a 20-item mock from generators goes red.
- **26-5 RULED — close-out also records the process finding.** The auditor verified the
  close-out steps: the `describe.each` claim is true by construction, the privacy grep
  currently returns no output, spec §13 exists at the line the brief names, and its
  stated claim — that standards and weights are machine-checked against `docs/sources/`
  while the mathematical correctness of authored items is not — is true and is the most
  honest sentence in the plan. Keep it verbatim. ADD to §13 the durable process finding
  this plan's audits produced: **briefs written from recall describe mathematics NC does
  not teach, and `standards.ts` is the only authority.** Record the specific classes —
  the `NC.4.NBT.7` rounding ship, Grade 3's `NC.3.MD.2` customary/metric error, Grade 1's
  three code swaps — with the note that no test in the suite can detect any of them.
  Cost if wrong: a paragraph nobody needed. Cost of omitting: the next content plan
  repeats all of it.

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
