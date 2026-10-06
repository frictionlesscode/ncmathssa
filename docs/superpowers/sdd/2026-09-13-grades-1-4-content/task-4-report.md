# Task 4 report: Standards data for grades 1, 2, 3, and 4

Branch: `feat/multi-grade-adaptive`. No branch was created or switched.

## Files created

- `src/curriculum/sourcedStandards.test.ts` (verbatim from the brief, Step 1)
- `src/curriculum/grade4/standards.ts` (written first, as the brief's proving run)
- `src/curriculum/grade3/standards.ts`
- `src/curriculum/grade2/standards.ts`
- `src/curriculum/grade1/standards.ts`

`src/curriculum/registry.ts` was **not** touched. The four new grades remain unregistered.

## Step 2: the failing run

Baseline before any change: **281 tests passing, 27 files**.

`npx vitest run src/curriculum/sourcedStandards.test.ts` after writing only the test:

```
 FAIL  src/curriculum/sourcedStandards.test.ts [ src/curriculum/sourcedStandards.test.ts ]
Error: Failed to resolve import "./grade1/standards" from "src/curriculum/sourcedStandards.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: src/curriculum/sourcedStandards.test.ts:5:32

 Test Files  1 failed (1)
      Tests  no tests
```

Failure was for the intended reason: the four modules did not exist. The JSON imports
from `../../docs/sources/` resolved without complaint — no tsconfig change was needed,
and the JSON was not copied into `src/`. The brief's probe held.

## Counts delivered, against the brief's table

Verified programmatically against `docs/sources/nc-standards-1-5.json`: per domain, my
code sequence is not merely the same *set* as the source but the same *order* (the test
only compares sets, so this was checked separately). No duplicate codes; every
`domainId` agrees with its own code's domain segment.

| Grade | Domain | Brief | Delivered | Order matches source |
|---|---|---|---|---|
| 1 | OA | 8 | 8 | yes |
| 1 | NBT | 7 | 7 | yes |
| 1 | MD | 5 | 5 | yes |
| 1 | G | 3 | 3 | yes |
| 2 | OA | 4 | 4 | yes |
| 2 | NBT | 8 | 8 | yes |
| 2 | MD | 9 | 9 | yes |
| 2 | G | 2 | 2 | yes |
| 3 | OA | 7 | 7 | yes |
| 3 | NBT | 2 | 2 | yes |
| 3 | NF | 4 | 4 | yes |
| 3 | MD | 6 | 6 | yes |
| 3 | G | 1 | 1 | yes |
| 4 | OA | 4 | 4 | yes |
| 4 | NBT | 6 | 6 | yes |
| 4 | NF | 6 | 6 | yes |
| 4 | MD | 6 | 6 | yes |
| 4 | G | 3 | 3 | yes |

Totals: grade 1 = 23, grade 2 = 23, grade 3 = 20, grade 4 = 25. These match both the
brief's table and the verification table in `docs/sources/PROVENANCE.md`.

Weights: every `officialWeightRange` / `officialWeightMidpoint` for grades 3 and 4 was
copied from `nc-eog-blueprint.json` and is asserted equal to it by the test. MD and G at
both grades carry `officialWeightRange: '23–27%'`, `officialWeightMidpoint: 25`,
`weightGroup: 'MD+G'`, `weightGroupLabel: 'Measurement & Data and Geometry combined'`.
All dashes are en dashes (U+2013); a grep for the ASCII-hyphen pattern `\d+-\d+%` returns
nothing in any of the four files. Grades 1 and 2 carry
`officialWeightRange: 'No state assessment at this grade'`, midpoint `0`, and no
`weightGroup`; no string anywhere in those two files contains a percentage.

Nothing was invented: no code, no band, no midpoint appears in these four files that is
not in one of the two source JSON documents.

## Things in the source that surprised me (reported, not fixed)

None of these were changed in `docs/sources/`. Where a source artifact was clearly a
document-structure or typing slip rather than mathematics, I say below exactly what I did
with it in the TypeScript.

1. **`NC.1.NBT.7` has a stray cluster heading as a bullet.** Its `bullets` array is
   `["Standard: Understand place value."]` — that is a heading from the published
   document captured as if it were sub-content of the standard. It states no mathematics.
   I did **not** fold it into `keyConcepts`; I derived that standard's key concepts from
   its own `text` instead. This is the one place where a source bullet was deliberately
   omitted rather than transcribed. Flagging it because it means `NC.1.NBT.7` is the only
   grade 1 standard whose key concepts are not bullet-derived.
2. **`NC.1.NBT.7`'s `cluster` field disagrees with that stray bullet.** The cluster reads
   "Extend and recognize patterns in the counting sequence" while the bullet names
   "Understand place value". Consistent with the PROVENANCE note that domain membership
   in the published Google Doc cannot be trusted to headings.
3. **`NC.2.MD.5`'s only bullet is word-for-word identical to `NC.2.MD.6`'s entire
   `text`** ("Represent whole numbers as lengths from 0 on a number line diagram with
   equally spaced points and represent whole-number sums and differences, within 100, on
   a number line."). Both were transcribed as found, so that sentence appears twice in
   `grade2/standards.ts` — once as a key concept of MD.5 and once as the description of
   MD.6. This looks like a duplication in the published document, but I have no second
   source to adjudicate it, so it stands. **Downstream task authors writing MD.5 and MD.6
   questions should know these two standards overlap in the source.**
4. **`NC.2.MD.6` sits under the cluster "Build understanding of time and money"** but its
   text is entirely about number lines. Same kind of heading/content mismatch as (2).
5. **`NC.2.MD.3` text reads "Estimate lengths *in* using standard units of inches…"** —
   a stray "in". I dropped the stray word in the `description` (the brief permits light
   punctuation); no meaning changed.
6. **`NC.4.MD.1`'s first bullet reads "…involving metric units:, centimeter, meter,
   gram, kilogram, Liter, milliliter."** — a stray comma immediately after the colon, and
   "Liter" capitalized among lowercase unit names. I removed the stray comma and
   lowercased "liter" in the key concept. The unit list itself is unchanged.
7. **Whitespace artifacts**: `NC.4.NF.2` has a double space before "Recognize";
   `NC.1.G.3`'s first bullet has "halves and  fourths" (double space); `NC.2.OA.1` has
   "Add to/Take from- Change Unknown" and "Add to/Take From- Result Unknown" with a space
   after the hyphen instead of before. Normalized in the prose I wrote.
8. **`NC.2.OA.1`'s bullets mix structural headers with content.** Two of its seven
   bullets ("One-Step problems:", "Two-Step problems involving single digits") are
   headings for the bullets that follow them. I flattened each heading onto its children,
   producing five key concepts rather than seven. No problem type was added or dropped.
9. **Inconsistent dash characters inside the standards themselves.** `NC.1.NBT.6` writes
   "range 10-90" with an ASCII hyphen; `NC.3.NBT.3` writes "range 10–90" with an en dash
   for the identical phrase. Each was transcribed exactly as it appears. (This affects
   descriptions only — every weight range is an en dash, as required.)
10. **`NC.3.MD.3` uses curly quotation marks** around “how many more” and “how many
    less”. Kept verbatim.
11. **The NF domain name uses an en dash in the JSON** ("Number and Operations –
    Fractions") while the shipped grade 5 module uses an em dash ("Number & Operations —
    Fractions"). Domain `name` is not tested and is a display string, so I matched the
    shipped grade 5 module for visual consistency across grades.
12. **`NC.1.NBT.3`'s text ends with "…the symbols >, =, and <" and no terminal
    punctuation.** Added a period to the description; nothing else.

Two things about the **brief** rather than the sources, both minor:

13. **Step 4 predicts "PASS, 13 tests"; the actual count is 23.** The test file generates
    5 grades × 3 + 3 grades × 2 + 2 grades × 1 = 23. The test file itself was used
    verbatim and 23 is the correct arithmetic; the "13" appears to be a slip in the brief.
14. **The brief's color list conflicts with the shipped grade 5 module.** Step 3 says "NF
    emerald, NBT blue, **OA amber, MD violet**, G rose", but
    `src/curriculum/grade5/standards.ts` in situ has **MD amber and OA violet**. Since
    both the brief and my instructions say to read the class strings out of grade 5 so
    that "a domain looks the same in every grade", I followed the shipped grade 5
    assignment: NF emerald, NBT blue, MD amber, OA violet, G rose. Grades 1–4 are
    therefore consistent with grade 5. If the intent was actually to change grade 5's
    colors, that is a separate change and I did not make it.

One structural note: grade 5's domain array order (NF, NBT, MD, OA, G) is descending only
under the *fabricated* weights described in PROVENANCE (41, 27, 13, 11, 8). Under the real
blueprint, G at 21 outranks OA at 11, so grade 5 is no longer in descending order. I
ordered grades 3 and 4 by the real midpoints — grade 3: OA 34, NF 30, MD 25, G 25, NBT 11;
grade 4: NF 32, NBT 27, MD 25, G 25, OA 16 — with MD before G in both, matching grade 5's
within-group order. Grades 1 and 2 are in OA, NBT, MD, G order per the brief.

## Judgment calls on the fields that were mine

- `title`: short parent-legible names in the grade 5 register, e.g. "Divide by One-Digit
  Divisors with Remainders", "Tens & Ones in a Two-Digit Number".
- `description`: the source `text`, with a trailing colon replaced by a period and the
  typographic slips listed above repaired. No mathematics was added.
- `keyConcepts`: the source `bullets` where they exist (trailing periods stripped to match
  grade 5 style), otherwise a faithful restatement of the standard's own `text` broken
  into parts. Nothing states mathematics the source does not.
- `weightCategory`: for grades 3–4 it names a priority and cites the **domain's real
  band** — e.g. `'Highest Priority (NF band 30–34%)'`, `'Core (MD & G share 23–27%)'`. I
  deliberately did not copy grade 5's per-standard style ("~14% of exam"), because no
  NCDPI document publishes a per-standard percentage and inventing one is the exact
  failure mode this task exists to avoid. For grades 1–2 every standard reads
  `'Core (no state assessment at this grade)'` — no percentage, and no unsourced priority
  ranking below grade 3.
- Domain `description` for grades 3–4 refers to the band only as "weighted together with
  Geometry as a single band" or "the highest-weighted domain"; for grades 1–2 it makes no
  weighting claim at all.

## Final verification

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | **exit 0** (7 pre-existing warnings in `AdaptiveSessionCard.test.tsx`, `ProgressContext.tsx`, `QuizResults.tsx`, `WeakSpotsView.tsx` — none in the new files, none new) |
| Typecheck | `npx tsc -b --noEmit` | **exit 0**, clean |
| Tests | `npm test -- --run` | **28 files passed, 304 tests passed** |
| New test alone | `npx vitest run src/curriculum/sourcedStandards.test.ts` | 23 passed |
| Step 5 | `npx vitest run src/curriculum/integrity.test.ts` | 11 passed, still grade 5 only; `registry.ts` untouched |

304 = the 281 baseline + 23 new. No previously passing test was lost.
