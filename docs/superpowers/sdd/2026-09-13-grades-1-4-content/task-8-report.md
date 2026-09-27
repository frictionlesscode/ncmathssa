# Task 8 — Grade 4 Measurement & Data — Report

Commit: `a9ca4c0 feat: add grade 4 measurement and data content`

## What I implemented

**Authored bank** — `src/curriculum/grade4/authored.md.ts`, 21 items across all six
standards (MD.1 x3, MD.2 x3, MD.8 x4, MD.3 x4, MD.4 x4, MD.6 x3), every standard
carrying at least one `mastery` and one `advanced` item. Every figure, table, bar
graph, line plot and angle diagram lives in `promptDetails` as screen-readable text;
no image assets.

**Templates** (five, one skill each, all registered in `templates/index.ts`):

- `md1-metric-word-problem.ts` — NC.4.MD.1, one-step metric multiplication word problems
- `md2-metric-convert.ts` — NC.4.MD.2, larger unit to smaller unit only
- `md3-rectangle-area.ts` / `md3-rectangle-perimeter.ts` — NC.4.MD.3, split
- `md6-missing-angle-part.ts` — NC.4.MD.6, the decomposition-subtraction half (NEW, written by me)

NC.4.MD.4 and NC.4.MD.8 get no generator: what they teach is in the wording
(which survey question yields numerical data, what "crosses the hour" means),
not in the numbers.

**Misconceptions** — 27 new tags plus a new `time-intervals` family, all used,
all with a parent-facing description.

## The pre-existing partial work: kept, with four corrections

I solved every authored item cold before reading its key and re-derived every
template's distractor algebra from scratch. The mathematics was sound — all the
collision proofs in the docstrings of `md1-metric-word-problem.ts` (the
`n = 10t/(t+1)` exclusions at (4,8) and (9,9)) and `md3-rectangle-area.ts`
(`(L-2)(W-2) = 4`, leaving only 6 by 3 to exclude) check out, and every authored
item's distractors recompute to exactly the value its `//` comment claims. I kept
it. Four corrections:

1. **`g4-md4-03`'s final worked step never stated its answer** ("5 more students
   read for…" does not contain the option text "5 students"). A child who got it
   wrong had nothing to check against. Caught by the shared kit; fixed.
2. **`g4-md2-01` sat inside its own generator's parameter space.** It was a bare
   `7 meters = ? centimeters` in `promptDetails`; `g4.md2.metric-convert` draws
   meters-to-centimetres at quantities 2..25 and prints the identical details
   line. The stems differed, so the kit's prompt-only duplicate check passed —
   but the child sees `promptDetails`. Rewritten as a length-model word problem
   (a meter stick laid along a 30-metre hallway); 30 is outside the generator's
   range as well.
3. **`g4-md3-01` (9 by 4) and `g4-md3-02` (8 by 3)** were both inside the
   rectangle pool their generators draw from, producing the same four option
   values under a second review key. Moved to 14 by 6 and 13 by 9, both outside
   the pool's `length <= 12`, with contexts to match.
4. Renamed the shared rectangle pool `AREA_RECTANGLES` -> `RECTANGLES`, since the
   perimeter template imports it too and the old name misdescribed it.

I also exported `PAIRS` / `ANGLE_PAIRS` / `RECTANGLES` so each sibling test can
enumerate the whole parameter space rather than sample it.

## Rulings honoured

- MD.2 is larger-to-smaller only; the modelled error is DIVIDING where
  multiplying was needed (`unit-conversion-inverted`, `0.3 centimeters` and
  `0.006 grams`), carried by authored items rather than the generator, because
  dividing by 1,000 lands in thousandths — NC.5.NBT.3, a grade above.
- MD.4 is whole numbers only. `g4-md4-03`'s line plot is marked in whole minutes,
  and a test asserts no MD.4 item prints a fraction, a decimal, or the words
  half/quarter/eighth.
- MD.1 and MD.2 are metric only. A test bans inch, foot, yard, ounce, pound,
  pint, quart, gallon, mile and kilometer across every field of every item.
  ("cup" is deliberately absent from that list — `g4-md1-01` pours a jug into
  8 cups, which are containers, not 8 x 237 mL.)
- MD.1 and MD.2 have separate templates; so do area and perimeter under MD.3.
- Nothing describes 23–27% as MD's own weight; `authored.md.ts` opens by saying
  the band is MD and Geometry together and that MD's own share is unpublished.

## TDD evidence

**RED 1** — `npx vitest run src/curriculum/grade4/authored.md.test.ts`

```
Tests  2 failed | 5 passed (7)
AssertionError: g4-md4-03: final step "Step 4: 5 more students read for 20 minutes
  than for 35 minutes." never states the answer "5 students"
AssertionError: g4-md1-01 uses a unit outside NC.4.MD.1's six
```

Expected: the bank existed but had never been tested. The first failure is a real
defect in the item. The second was my own banned-unit regex over-firing on the
word "cups"; I narrowed the regex and documented why.

**RED 2** — `npx vitest run src/curriculum/grade4/templates/md6-missing-angle-part.test.ts`

```
Error: Failed to resolve import "./md6-missing-angle-part"
Test Files  1 failed (1)   Tests  no tests
```

Expected: the module did not exist yet.

**GREEN** — after the fixes and the new template:

```
npx vitest run src/curriculum/grade4/templates/md6-missing-angle-part.test.ts
  Test Files  1 passed (1)    Tests  8 passed (8)

npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts
  Test Files  28 passed (28)  Tests  281 passed (281)

npx vitest run
  Test Files  56 passed (56)  Tests  597 passed (597)

npm run lint      -> exit 0 (7 pre-existing warnings, none in MD files)
npx tsc -b --noEmit -> clean
```

Baseline at `601ba31` was 543 passing; this task adds 54.

## Files changed

Created:
`src/curriculum/grade4/authored.md.test.ts`,
`src/curriculum/grade4/templates/md1-metric-word-problem.test.ts`,
`md2-metric-convert.test.ts`, `md3-rectangle-area.test.ts`,
`md3-rectangle-perimeter.test.ts`, `md6-missing-angle-part.ts`,
`md6-missing-angle-part.test.ts`.

Kept and corrected (were uncommitted): `authored.md.ts`,
`md1-metric-word-problem.ts`, `md2-metric-convert.ts`, `md3-rectangle-area.ts`,
`md3-rectangle-perimeter.ts`, `misconceptions.ts` (+147).

Modified: `src/curriculum/grade4/templates/index.ts`.

Not committed: an uncommitted edit to
`docs/superpowers/plans/2026-09-13-grades-1-4-content.md` about item-id
separators appeared in the tree mid-task. It is not mine (it cites a Task 9–11
pre-flight) and I left it staged-free for whoever made it.

## Self-review findings

- Re-solved all 21 items cold. Every key is right and no item has a second
  defensible answer — checked by a canonicalising parser in the sibling test that
  converts metric lengths to centimetres, masses to grams, capacities to
  millilitres, durations and clock times to minutes, and rectangles to a sorted
  dimension pair. That is strictly stronger than the shared kit's
  `numericValue()`, which is blind in both directions here (it calls 1.5 kg and
  1,500 g different, and 6 m and 6 cm the same).
- One deliberate exception, documented in the test: `g4-md8-01` offers "4:95 p.m."
  beside the key "5:35 p.m.". As instants those coincide; 4:95 is not a time any
  clock shows, and being that artifact is the whole of NC.4.MD.8. Any reading
  with 60 or more minutes keys to its own literal text rather than normalising.
- Every distractor is reachable by the exact error its tag names, and every `//`
  comment recomputes to the number beside it. I re-did the three the file's own
  docstring flags as easy to get wrong (130 − 45 without regrouping = 115; the
  straight-angle assumption giving 180 − 45 = 135, not 180 − 130; the off-by-one
  gridline giving 6 x 5 = 30).
- Key positions: A x6, B x5, C x5, D x5 across 21 items.
- New template's parameter space is 1,208 (whole, part) pairs with exactly seven
  excluded by construction (`whole + 2*part = 180`, where the straight-angle
  distractor would collide with the added-instead-of-subtracted one). The sibling
  test drives `generate()` over 30,000 seeds and asserts it reaches all 1,208 —
  it never recomputes the option texts inline, so the test cannot drift into
  checking its own arithmetic against itself.

## Concerns

One, minor. `g4-md6-02`'s "55 degrees" distractor is tagged `assumed-a-right-angle`
(90 − 35). It is the weakest distractor in the bank: a child must already have
read 35 correctly off the protractor to produce 55. I kept it because the item's
own `promptDetails` says the angle is "clearly smaller than a right angle" — a
line that is needed to disambiguate the two scales without a picture, and which
makes "how much smaller than a right angle" a live misreading of the question. The
tag's declared description matches that error exactly. A reviewer may reasonably
want it replaced.

---

# Fix report — review round 1

Commit: `ae39fdd fix: grade 4 measurement and data review round 1`, on top of
`6dcc2a2`.

## Finding 1 — `g4-md4-04`'s second defensible answer

Agreed, and the reviewer's diagnosis is exactly right: the discriminator was
argued in the explanation instead of being forced by the stem.

I took the **re-word the stem** option rather than swapping the option out. The
option is worth keeping — "a number about the whole class is not a data set" is a
real NC.4.MD.4 distinction, and it is the only thing the tag
`asked-for-a-single-total-not-data` names, so replacing the option would have
left that tag orphaned and `misconceptions.test.ts` red in its "every declared
tag is used" direction. Deleting a genuine distinction to dodge an ambiguity
would have been the worse trade.

The stem is now:

> Ms. Okafor wants every student in her class to answer one survey question with
> a number about themselves, so that she collects numerical data she can graph.
> Which question should she ask?

Under that stem "How many students in our class own a dog?" is unambiguously
wrong: no student can answer it about themselves. The two categorical options are
unaffected — neither is answered with a number at all. Step 1 and Step 3 were
rewritten to match ("it is a number, but it is ONE number about the whole class"),
and Step 4 still ends on the key, "How many pets do you have at home?", which the
shared kit checks. A comment above the prompt records why the stem is worded this
way, so nobody shortens it back.

## Finding 2 — the five pinned-seed tests asserted nothing

Agreed without reservation. Each pin parsed the numbers back out of the prompt
the generator had just printed and compared them to itself, so it passed for any
question the generator emitted.

All ten pins (two per template) now assert literal strings: the prompt, the
`promptDetails` figure or conversion line where there is one, the `answerText`,
and all four option texts in order via `toEqual`. The option array is pinned too,
so a changed rng draw order — which reorders the shuffle without changing any
value — fails the test. The strings were taken from the generators' real output,
not hand-written; I dumped the ten seeds through a scratch test, checked each by
hand against the algebra (e.g. seed 104: 95 − 68 = 27, sum 163, no-regroup
10(9−6) + (8−5) = 33, straight 180 − 68 = 112), then deleted the scratch file.
The full-space sweeps are untouched.

## Verification

Covering test files: `src/curriculum/grade4/authored.md.test.ts` (Finding 1) and
`src/curriculum/grade4/templates/md1-metric-word-problem.test.ts`,
`md2-metric-convert.test.ts`, `md3-rectangle-area.test.ts`,
`md3-rectangle-perimeter.test.ts`, `md6-missing-angle-part.test.ts` (Finding 2).

```
npx vitest run src/curriculum/grade4/authored.md.test.ts \
  src/curriculum/grade4/templates/md1-metric-word-problem.test.ts \
  src/curriculum/grade4/templates/md2-metric-convert.test.ts \
  src/curriculum/grade4/templates/md3-rectangle-area.test.ts \
  src/curriculum/grade4/templates/md3-rectangle-perimeter.test.ts \
  src/curriculum/grade4/templates/md6-missing-angle-part.test.ts

  Test Files  6 passed (6)
  Tests       49 passed (49)
```

```
npm run lint        -> exit 0 (7 pre-existing warnings, none in grade4)
npx tsc -b --noEmit -> TypeScript: No errors found
npx vitest run      -> Test Files 56 passed (56)   Tests 597 passed (597)
```

The deferred minors (md1's 90-litre watering cans, the `55 degrees` distractor,
the banned-unit regex's "cup" exemption, the `geometry-and-measurement` family
placement for the data-display tags, test runtime) were left alone as instructed.

No new concerns.
