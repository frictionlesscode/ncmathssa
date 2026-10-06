# Task 12 report — Grade 3 Operations & Algebraic Thinking

Branch `feat/multi-grade-adaptive`. Baseline `1c15278` (637 passing).

## What I implemented

**`src/curriculum/grade3/authored.oa.ts`** — `GRADE_3_OA_AUTHORED`, 21 items,
exactly three per standard across all seven OA codes, 14 `mastery` and 7
`advanced` (one mastery and one advanced minimum per standard, asserted).
Ids are `g3-oa1-01` style — hyphen after the grade, per ruling 12-8.

**`src/curriculum/grade3/templates/`** — five generators, each with a sibling
test, plus `index.ts` (`GRADE_3_TEMPLATES`) and `index.test.ts`:

| id | standard | question shape |
|---|---|---|
| `g3.oa1.equal-groups-array` | NC.3.OA.1 | array drawn in `promptDetails`, product unknown |
| `g3.oa2.equal-shares` | NC.3.OA.2 | equal-groups figure in `promptDetails`, share unknown |
| `g3.oa3.one-step-word-problem` | NC.3.OA.3 | one-step word problem, no figure, no equation |
| `g3.oa6.missing-factor` | NC.3.OA.6 | bare equation with a box, `a × ☐ = p` |
| `g3.oa7.multiplication-fact` | NC.3.OA.7 | bare fact, `a × b` |

**`src/curriculum/misconceptions.ts`** — 17 new tags in a labelled Grade 3
block (the file already appends in batches rather than staying strictly
alphabetical). Families used: `incomplete-procedure` (4), `operation-choice`
(7), `patterns-and-sequences` (4), `remainder-handling` (1),
`order-of-operations` (1). No new family was needed.

Rulings applied:

- **12-1** NC.3.OA.8 is authored only; no OA.8 template. Documented in
  `templates/index.ts`.
- **12-2** NC.3.OA.8 uses only +, − and ×. A test in `authored.oa.test.ts`
  asserts no OA.8 item's prompt, figure, options or explanation contains `÷`,
  `divid…`, `quotient` or "shared equally". The wrong-order distractor is
  doing the two *steps* out of order (`4 × (8 + 5) = 52`), tagged
  `did-the-two-steps-in-the-wrong-order`.
- **12-3** No "division is commutative" distractor anywhere. A test asserts no
  option in the bank is a decimal or a negative. The replacements are
  `answered-with-the-number-of-groups`, `confused-the-quotient-with-the-dividend`
  and `read-the-quotient-as-the-leftover` — all whole numbers a child reaches.
- **12-4** Five distinct shapes, verified two ways (below).
- **12-5** Factors, divisors and quotients inside 1–10 throughout, asserted per
  template.
- **12-6** `g3-oa9-01` is a hundreds-board item; `g3-oa9-02` and `g3-oa9-03`
  are multiplication-table items. A test asserts both halves are present.
- **12-7** `assertNoGeneratorDuplicatesAuthored` runs in `authored.oa.test.ts`
  at the kit's 2,000 seeds per generator.
- **12-8** `/^g3-oa\d-\d{2}$/` asserted on every id; template ids keep dots.
- **12-9** `templates/index.test.ts` created, mirroring Grade 4's and adding
  the two collision guards plus an "every template file is exported" glob
  check.

## Where the brief disagreed with `standards.ts` beyond the rulings

Two, both minor and both resolved in favour of the source:

1. **The brief calls NC.3.OA.3 a "facts" standard.** Step 4 groups templates
   for "the multiplication and division facts and their relationship
   (NC.3.OA.1, NC.3.OA.2, NC.3.OA.3, NC.3.OA.6, NC.3.OA.7)". `standards.ts`
   titles NC.3.OA.3 "One-Step Multiplication & Division Word Problems" and its
   `description` is "Represent, interpret, and solve one-step problems". It is
   not a fact-recall standard, and writing it as one would have produced a
   second bare-fact generator — the exact failure ruling 12-4 exists to
   prevent. Its generator is a word problem with no figure and no printed
   equation.

2. **Ruling 12-5 is one notch looser than `standards.ts` for NC.3.OA.2.** The
   ruling says divisors and quotients come from "1–10 inclusive"; the sourced
   text says "a one-digit divisor and a one-digit quotient", i.e. at most 9.
   I followed the source: `g3.oa2.equal-shares` draws divisors 2–9 and
   quotients 3–9, which also satisfies the ruling's cap. The other four
   generators use 2–10, which is what their own standards say ("factors up to
   and including 10"). Every authored division item also keeps both to one
   digit. This is not a defect in the ruling — 1–10 is right for OA.1, OA.6 and
   OA.7 — but OA.2 is stricter than the ruling states and I wanted it recorded.

Nothing else in the brief described mathematics the sourced text does not
contain. In particular the brief's OA weight claim ("32–36%, larger than
Fractions") matches `standards.ts` (OA 32–36%, NF 28–32%), and its list of
seven OA codes matches exactly — NC Grade 3 has no OA.4 or OA.5.

## How I verified the five generators cannot collide (ruling 12-4)

By construction, then twice by test — not by hoping.

**By construction.** Each generator's prompt is built from a fixed frame that
no other generator's frame can produce. Every frame contains a literal
substring unique to it: `"below are arranged in equal rows"`,
`"are shared equally among"`, `"Each <group> holds|seats"`,
`"goes in the box to make the equation"`, and the whole-string form
`"What is a × b?"`. The arithmetic is deliberately *not* what separates them —
all five draw from the same 100 products, so the separation has to be
structural.

**Test 1 — pairwise disjointness sweep.** `index.test.ts` generates 800 seeds
of every template, keys each question by prompt plus figure, and fails if two
different template ids ever produce the same key. 4,000 questions, no
collision.

**Test 2 — per-generator prompt sentinel.** A regex per template, applied to
400 seeds of *every* template, asserting each prompt matches its own sentinel
and none of the other four. This is the stronger one: it holds at every seed,
not only the swept ones, and it is what makes the disjointness a property of
the design rather than of the sample.

**Both are non-vacuous.** I demonstrated it: changing `g3.oa7`'s prompt to
`"The ${a} below are arranged in equal rows..."` leaves test 1 green (the
numbers differ from oa1's noun, so no exact key repeat) and turns test 2 red
with `g3.oa7.multiplication-fact @ seed 0 ... matches
g3.oa1.equal-groups-array's sentinel`. The two tests catch different things,
which is why both are there. The file was restored immediately afterwards.

**Authored-vs-generated** is separate and covered by
`assertNoGeneratorDuplicatesAuthored` at 2,000 seeds per generator.

**Option collisions inside each generator** are excluded by construction with
the algebra written out in each file header, and each generator's draw space
(70, 42, 71, 78, 78 pairs) is swept *in full* by its sibling test rather than
sampled — a property run that never happens to draw `(3, 3)` proves nothing
about `(3, 3)`.

## TDD evidence

**RED.** `authored.oa.test.ts` written first, run first:

```
npx vitest run src/curriculum/grade3/authored.oa.test.ts
FAIL  Failed to resolve import "./authored.oa" ... Test Files 1 failed, Tests no tests
```

**RED, deliberate.** The ruling 12-4 sentinel guard, broken on purpose (above)
— failed with the exact collision message, then restored.

**GREEN.** `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
→ 8 files, 75 tests passed.

**Full suite.** `npx vitest run` → **67 files, 709 tests passed**, 0 failed.
Baseline was 637, so this task adds 72 tests (75 in my seven new files, minus
the 3 pre-existing `misconceptions.test.ts` tests).

**Typecheck.** `npx tsc -b --noEmit` → `TypeScript: No errors found`.

## `npm run lint` — actual exit code

**`npm run lint` exits 0**, with **7 warnings**, on my tree *and* at the
baseline commit `1c15278`. I could not reproduce the exit 1 the dispatch
describes.

What I measured, on this tree: 17 consecutive runs, 17 × exit 0, 7 warnings
each — 12 in a counted loop, 5 earlier, across `> file`, `> /dev/null` and
piped forms. I then checked out `1c15278` into a throwaway worktree and ran
`npx oxlint` there: **exit 0, 7 warnings**, so it is not something this task
changed. The script is bare `oxlint` with no `--deny-warnings`, and oxlint
exits 0 when it emits only warnings.

One caveat, reported because it is the only evidence on the other side: my
very first measurement, a compound command that ran `npm run lint` and
`npx oxlint` back to back, printed exit 1 for the first. It has not recurred
in 17 subsequent runs and I could not reproduce it; I record it rather than
discard it, but I would not describe exit 1 as this repo's behaviour.

The 7 warnings, re-derived from my own run rather than quoted from the
dispatch, by file:

- `src/context/ProgressContext.tsx` — 4 (three `react(only-export-components)`
  at 152, 173, 223; one `react(purity)` `Date.now` at 243)
- `src/components/AdaptiveSessionCard.test.tsx` — 1 (`react(globals)`,
  reassigning `resolveFn` at 49)
- `src/components/QuizResults.tsx` — 1 (`eslint(no-unused-vars)`, unused catch
  parameter at 48)
- `src/components/WeakSpotsView.tsx` — 1 (`react(purity)` `Date.now` at 123)

That is the same four files and the same count the dispatch names. None is
mine and I changed none of them.

## Files changed

New:

- `src/curriculum/grade3/authored.oa.ts`
- `src/curriculum/grade3/authored.oa.test.ts`
- `src/curriculum/grade3/templates/index.ts`
- `src/curriculum/grade3/templates/index.test.ts`
- `src/curriculum/grade3/templates/oa1-equal-groups-array.ts` + `.test.ts`
- `src/curriculum/grade3/templates/oa2-equal-shares.ts` + `.test.ts`
- `src/curriculum/grade3/templates/oa3-one-step-word-problem.ts` + `.test.ts`
- `src/curriculum/grade3/templates/oa6-missing-factor.ts` + `.test.ts`
- `src/curriculum/grade3/templates/oa7-multiplication-fact.ts` + `.test.ts`

Modified:

- `src/curriculum/misconceptions.ts` (+107 lines, 17 new tags, no deletions)

15 files, +2,294 lines against `1c15278`.

Commits:

- `5a0b681` feat: add grade 3 operations and algebraic thinking content
- `c6e6cf7` fix: remove a stray NUL byte from the grade 3 template index test
- `38fbe6b` fix: name the unknown-factor distractor its own error, not a near miss

## Self-review findings

I re-solved all 21 authored items and all five generators cold after
committing. Three things came out of it, two of which I fixed.

1. **A NUL byte in `templates/index.test.ts`** (fixed, `c6e6cf7`). The
   cross-template collision key joined prompt to figure with a literal `\0`.
   It ran correctly, but git classified the file as binary — no diff, no
   blame, no reviewable change. Replaced with a `\n<<figure>>\n` separator,
   which is equally unforgeable (a prompt cannot contain a line break) and
   readable. The blob at HEAD is text; only the intermediate commit pair
   renders as `Bin`, which is cosmetic.

2. **A tag that named half an error** (fixed, `38fbe6b`). `g3-oa6-01`'s option
   "42 ÷ 7, and the missing number is 6" was tagged
   `used-the-wrong-given-quantity`. That tag says the child worked with a
   number the question was not about — true for one route to the option
   (dividing by the wrong factor), false for the commoner route (finding 7
   correctly, then reporting the other end of the fact family, where the
   quantity used was right and the one reported was wrong). Declared
   `reported-the-factor-that-was-already-given`, which covers both routes and
   is the error NC.3.OA.6 is about. This is the one place I nearly shipped
   the mis-filed tag the Global Constraints call worse than no tag.

3. **Two options share one tag in `g3-oa9-01`** (kept deliberately). `24` and
   `35` are both `checked-only-one-of-the-two-patterns` — 24 passes Mia's
   count only, 35 passes Ravi's only. It is genuinely the same error committed
   on opposite sides, the description covers both, and splitting it would
   invent a distinction a parent does not need. Flagging it so a reviewer
   does not have to rediscover it.

Also checked and clean:

- Every item has exactly one defensible answer. The two places that could have
  had a second — `g3-oa1-02` (an equivalent product written the other way
  round) and `g3-oa9-03` (a second true explanation) — are constructed so the
  alternatives are false, not merely unlisted. No item offers both `6 × 9` and
  `9 × 6`, and no division item offers a reversed-order equivalent.
- Every `explanation.stepByStep` ends on the key, with the last step containing
  the correct option's exact text (enforced by the shared kit, checked by hand
  for the prose items where the phrasing had to be bent to fit).
- Every distractor is a whole number an eight-year-old can write. The largest
  are 288 (`48 × 6`) and 252 (`42 × 6`), both genuine products of the named
  error. I dropped a `p × a` distractor from `g3.oa6.missing-factor` for this
  reason: at `a = b = 10` it is 1,000, which no Grade 3 child would weigh, so
  it would have been a filler dressed as a distractor.
- Correct-answer positions: A 5, B 5, C 6, D 5 across 21 items.
- Every item is all-numeric or all-prose in its options, so the kit's
  "two options naming one quantity" guard is never half-applied.
- Register: every prompt is one or two short sentences, one clause each.

## Concerns

1. **`5a0b681`'s commit message says "sixteen new misconception tags"; it is
   now 17** after `38fbe6b` added one. The message was accurate when written.
   Noting it so a reviewer reading the messages in order is not confused.

2. **`did-the-two-steps-in-the-wrong-order` is filed under the
   `order-of-operations` family**, which surfaces to a parent as "Order Of
   Operations". That family is "which operation to carry out first", which is
   exactly what goes wrong, and the alternatives (`incomplete-procedure`,
   `operation-choice`) both describe something else. But ruling 12-2 is
   emphatic that NC.3.OA.8 is not an order-of-operations standard, so if the
   family label reads wrong to the owner on a Grade 3 report, this is the
   place to change it. I left the reasoning in a comment above the entry.

3. **`g3.oa3.one-step-word-problem` covers only the multiplication half of
   NC.3.OA.3**, and `g3.oa7.multiplication-fact` only the multiplication half
   of NC.3.OA.7. Both halves of both standards are covered — the division half
   is authored (`g3-oa3-01`, `g3-oa3-03`, `g3-oa7-01`, `g3-oa7-02`,
   `g3-oa7-03`) — but the split is deliberate and follows Grade 4's
   one-template-one-skill rule, because a review key is seedless and a
   generator spanning both would let a child who cannot divide be reviewed
   with a multiplication item and retired as mastered. If the owner would
   rather have a second generator per standard than lean on authored items,
   that is a design change, not a bug fix.

4. **`src/curriculum/grade3/standards.ts` has no sibling `standards.test.ts`**,
   unlike the plan's File Structure section, which lists one per grade. Grade 3
   codes are covered by `sourcedStandards.test.ts` instead. Out of scope for
   this task; flagging in case Task 16 expects the file to exist.

---

# Fix round 1 — review response

Commit `5dddce0`. Both Important findings addressed; nothing in the "do NOT
fix" list was touched.

## Important 1 — `did-the-two-steps-in-the-wrong-order` family

**Chose a new family, `multi-step-problems`**, not `incomplete-procedure`.

Why, on the parent-facing label test the review set: `familyLabel()` turns it
into **"Multi Step Problems"**, which I verified by calling it rather than
reading the function — that is the bold line a parent sees at
`WeakSpotsView.tsx:226` and `PrintReportModal.tsx:254`, with the tag
description beneath it. "Multi Step Problems / Carried out the second step of
a two-step problem before the first" reads as one coherent sentence to a
parent and points at NC.3.OA.8, which is where the child actually is.

`incomplete-procedure` — "Incomplete Procedure" — would have been wrong in the
opposite direction from `order-of-operations`. A child who did both steps in
the wrong order did not stop early; they finished. Telling a parent the
procedure was left incomplete describes a different mistake, and the whole
point of the finding is that a family label which describes a different
mistake is the defect. `forgot-the-final-step` deliberately stays in
`incomplete-procedure`: it is the genuinely unfinished half of the same
two-step failure, and the two halves are worth telling apart — a child who
answers 32 has a different problem from one who answers 52, and the bank tags
them differently on purpose.

I followed the file's own precedent, cited in the review: the new family is
declared in the union with a comment saying why neither existing family fits,
matching `patterns-and-sequences` and `factors-and-multiples` at
`misconceptions.ts:19-34`. I checked first that nothing switches exhaustively
on `MisconceptionFamily` — the only consumers are `familyLabel()` (generic
string transform) and `mastery.ts`, which keys a `Map` — so adding a member is
safe. `misconceptions.test.ts` stays green.

## Important 2 — literal pins in all five template tests

Each of the five files now has two `emits exactly this question at seed N`
tests, at seeds 7 and 123, pinning the exact `prompt`, `promptDetails`,
`answerText`, and the full ordered option list as
`[label, text, isCorrect, misconception]`.

**The strings came from a real run.** I added a throwaway test that dumped
`JSON.stringify` of every generator's output at both seeds, pasted the output
verbatim, and deleted the dump file. Nothing was written from what the code
looks like it should produce.

**Demonstrated non-vacuous.** I renamed one `CONTEXTS` noun in
`oa1-equal-groups-array.ts` (`stickers` to `badges`) and re-ran that file:
**11 of 12 tests stayed green** — including `is sound at every seed`, `is
deterministic`, `draws the picture the prompt describes`, the full draw-space
sweep and all five per-tag distractor checks — and **exactly one went red**,
the seed-7 pin. That is the Task 8 defect reproduced and then caught. File
restored immediately; `grep` confirms `stickers` is back.

The existing sweeps and `every distractor is the value its tag names` blocks
were left in place, as instructed. Pins are additive.

## Ruling 12-5

Left exactly as it was, per the coordinator: `g3.oa2.equal-shares` draws
divisors 2–9 and quotients 3–9 (NC.3.OA.2's "one-digit divisor and one-digit
quotient"); the other four generators use 2–10 (their standards' "up to and
including 10").

## Verification

- `npx tsc -b --noEmit` → `TypeScript: No errors found`.
- `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
  → 8 files, **80 tests passed** (was 75; +5 net — ten new pins replacing five
  old self-consistency tests).
- `npx vitest run` (full) → 67 files, **714 passed**, 0 failed. Was 709; the
  task now adds 77 tests over the 637 baseline.
- **`npm run lint` exits 0**, 7 warnings, 3 consecutive runs. Same four
  pre-existing files as before; none of them mine.

## Files changed in this round

- `src/curriculum/misconceptions.ts` — new `multi-step-problems` family with
  its rationale comment; one tag's family changed.
- `src/curriculum/grade3/templates/oa1-equal-groups-array.test.ts`
- `src/curriculum/grade3/templates/oa2-equal-shares.test.ts`
- `src/curriculum/grade3/templates/oa3-one-step-word-problem.test.ts`
- `src/curriculum/grade3/templates/oa6-missing-factor.test.ts`
- `src/curriculum/grade3/templates/oa7-multiplication-fact.test.ts`

Each test file gained a local four-line `shape()` helper. Kept local rather
than shared: a non-test `.ts` file under `templates/` would be eagerly
imported by `allContent.ts`'s glob, and each test file in this tree already
carries its own local `parse()` and `optionValue()`.

## Concerns after this round

None new. The three from the first round that remain open are closed or
deferred by the review: the OA.3/OA.7 generator split and the missing
`grade3/standards.test.ts` are both accepted, the stale "sixteen tags" commit
message is explicitly not to be fixed, and my `order-of-operations` concern —
the one I raised and could not resolve myself — is now fixed.
