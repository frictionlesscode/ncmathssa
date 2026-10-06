# Task 21 Report: Register Grade 2, and stop the UI claiming a blueprint that does not exist

Branch `feat/multi-grade-adaptive`, starting HEAD `5b4120b`. Commit produced: `f81e24b`.

## What I implemented, ruling by ruling

**21-1** — `src/curriculum/registry.test.ts` updated, not left "Expected: PASS":
- `getCurriculum(...)` throw-case pin re-pointed from grade 1 (unchanged, was already grade 1 in the committed file at HEAD — the brief's own stale comment referred to a state before Task 16, but the actual assertion `getCurriculum(1)` was already correct; I updated the comment to explain the Task 21 handoff and note the Task 26 re-expression as `getCurriculum(6 as Grade)`).
- `listCurricula()` pin extended from `[3, 4, 5]` to `[2, 3, 4, 5]`.

**21-2** — Every authored item id and every `questionIds` entry across `grade2/quizzes.ts` and `grade2/grade2.test.ts` uses `g2-` (hyphen), matching the real authored bank (`g2-oa1-01`, `g2-nbt6-02`, etc.), never `g2.`.

**21-3** — Beyond swapping the label to `weightHeading()`, I added a second registry helper, `weightValue(c, domainId)`:
- Blueprint grade: delegates to `weightLabel()` (unchanged behavior).
- Unweighted grade: renders `Math.round(domainWeight(c, domainId))` + `%` — a real number, never the `officialWeightRange` placeholder string ("No state assessment at this grade").

Both `CurriculumView.tsx` and `PrintReportModal.tsx` now render `{weightHeading(curriculum)}: {weightValue(curriculum, domain.id)}`, so a Grade 2 parent reads e.g. "Share of Grade Standards: 35%", never "Share of Grade Standards: No state assessment at this grade".

This wasn't in the brief's literal interface list (which only names `weightHeading`), but 21-3 is explicitly UPHELD and its text requires exactly this ("`domainWeight()` already computes the right number for an unweighted grade; render that") — `weightHeading` alone cannot satisfy it since it only touches the label, not the value.

**21-4** — `src/components/Dashboard.tsx` line ~96 (`Weighted by official NC EOG blueprint domain weights`) is now conditional on `curriculum.weighting.kind === 'ncdpi-blueprint'`; the else-branch reads `Weighted by each domain's share of Grade {grade} standards — no state test exists at this grade`. `PrintReportModal.tsx:273` — both the bold label (`Focus by Blueprint Weight:` / `Focus by Standards Share:`) and the sentence are now conditional; the unweighted branch tells the parent to "prioritize the domains furthest below the {passingPercent}% qualifying bar" instead of ranking by blueprint weight, exactly as the ruling specifies.

**21-5** — `g2-diagnostic-01` has `isDiagnostic: true`; its subtitle is a function of the curriculum (`(c) => ...c.domains.reduce(...)...c.grade...`), never a baked Grade 2 literal (verified by a test that the function form is used and produces text containing "23" and "Grade 2" when invoked against `GRADE_2`). `g2-mock-ssa-01` has `isMockAssessment: true` and `timeLimitMinutes: 40`. Every `questionIds` entry across every quiz names a real authored item id — verified programmatically (see Tests section) against `GRADE_2.source.authoredFor()`, not a template id.

**21-6** — The mock's 25-item allocation: OA 4.3→4, NBT 8.7→9, MD 9.8→10, G 2.2→2 (4+9+10+2 = 25, exactly as the ruling states). Geometry carries 2 items, never 0. Full reasoning and floor/ceil choice documented in the `quizzes.ts` file comment and re-verified by a dedicated `grade2.test.ts` test using `domainWeight()`.

**21-7** — No action needed; this ruling upholds the brief's code blocks as written (they type-check against the repo as-is) and notes two harmless items: (a) I followed the *more* consistent pattern noted as an improvement — `grade2/index.ts` re-exports `GRADE_2_STANDARDS`, `getStandardByCode`, `getDomainById` alongside `GRADE_2_DOMAINS`, matching `grade3/index.ts` and `grade5/index.ts` rather than the brief's narrower single re-export line; (b) the `officialWeightRange` no-`%` assertion is included verbatim in `grade2.test.ts`.

**21-8** — `src/components/QuizzesListView.tsx` (~line 200) no longer prints `domain?.officialWeightRange` bare. I used `weightValue(curriculum, quiz.domainId ?? '')` rather than plain `weightLabel()`. This goes one step further than the ruling's literal text ("weightLabel() exists for exactly this") because `weightLabel()` alone would still print the "No state assessment at this grade" placeholder on a Grade 2 module-drill card — the exact defect class this whole task exists to close. Using `weightValue()` here is consistent with the fix in `CurriculumView.tsx`/`PrintReportModal.tsx` and closes the gap for Grade 5's grouped MD+G cards too (they now correctly show the "(Measurement & Data and Geometry combined)" annotation, which the old bare `officialWeightRange` never carried).

**21-9** — `src/components/FirstRunScreen.test.tsx`'s `offers only grades that have a curriculum` test updated from `['3', '4', '5']` to `['2', '3', '4', '5']`, with an updated comment. The `pre-selects the highest registered grade` test needed **no change** — it was already written to derive `highest` from `listCurricula()` dynamically and assert on a fresh render without `selectOptions` (exactly what the ruling asks for), so it continues to hold: 5 is still the highest grade after Grade 2 registers. `FirstRunScreen.tsx` itself needed no change either — its default-grade expression (`curricula[curricula.length - 1]?.grade ?? 5`) was already correctly derived, not hardcoded.

## Deviation beyond the rulings (self-initiated, same defect class)

While auditing `src/components/` for every remaining `officialWeightRange`/blueprint occurrence, I found two more instances of the identical "bare officialWeightRange" defect that no ruling named explicitly:
- `CurriculumView.tsx`'s domain filter pills (`{d.id} ({d.officialWeightRange})`).
- `Dashboard.tsx`'s domain card badge (`{domain.id} • {domain.officialWeightRange} Weight`).

Both would have shown "OA (No state assessment at this grade)" / "OA • No state assessment at this grade Weight" for a Grade 2 parent — the exact class of false/nonsensical claim Task 21 exists to eliminate, and directly contradicts the self-review checklist's "no weight claim for Grade 2 anywhere a parent can see." I fixed both using `weightValue()`, in files already in scope for this task. Flagging this explicitly in case the controller wants to scope it differently.

## Residual grep hit judged not a violation

`Dashboard.tsx:65` names "the North Carolina Standard Course of Study (NCSCOS) Grade N Mathematics **blueprint**" — this is the standards document itself (which exists for every grade, Grade 2 included — `grade2/standards.ts` is transcribed from the same `nc-standards-1-5.json` source), not an EOG *weight* claim. It is true for every grade and does not depend on `weighting.kind`, so I left it unconditional. It is the same kind of generic usage as `Navbar.tsx`'s "{curriculum.label} Blueprint" and `CurriculumView.tsx`'s "Content Blueprint" / "Standard Blueprints" page headers (neither of which match the grep's case-sensitive pattern at all). All test assertions I wrote check for the specific false-claim phrase (`/blueprint weight/i` or the exact literal strings), not the bare word, for this reason.

## Tests, with TDD evidence

**RED** — before creating `grade2/index.ts` / `grade2/quizzes.ts`, with `registry.ts` already importing `./grade2` and the heading/value tests already written in `registry.test.ts`:

```
$ npx vitest run src/curriculum/registry.test.ts
FAIL src/curriculum/registry.test.ts [ src/curriculum/registry.test.ts ]
Error: Failed to resolve import "./grade2" from "src/curriculum/registry.ts". Does the file exist?
Test Files  1 failed (1)
     Tests  no tests
```
Expected failure: grade 2 has no module yet, so nothing in the file — including the new `weightHeading`/`weightValue` assertions — can even load.

**GREEN** — after adding `grade2/index.ts` and `grade2/quizzes.ts`:
```
$ npx vitest run src/curriculum/registry.test.ts
✓ src/curriculum/registry.test.ts (16 tests) 5ms
Test Files  1 passed (1)
     Tests  16 passed (16)
```

**GREEN** — `grade2/grade2.test.ts` (written before the file existed conceptually validated it would fail the same way; run immediately after `index.ts`/`quizzes.ts` existed, so RED wasn't captured as a separate run, but the file could not have passed without the implementation — the module didn't exist a few commands earlier):
```
$ npx vitest run src/curriculum/grade2/grade2.test.ts
✓ src/curriculum/grade2/grade2.test.ts (13 tests) 7ms
```

**GREEN** — component tests, after fixing two over-broad `/blueprint/i` assertions to the more precise `/blueprint weight/i` (the honest Grade 2 disclaimer text legitimately contains the bare word "blueprint" while correctly saying none exists — my first draft of these tests banned the word outright and had to be corrected, which is itself evidence they're checking real rendered text, not tautologies):
```
$ npx vitest run src/components/CurriculumView.test.tsx src/components/PrintReportModal.test.tsx src/components/Dashboard.test.tsx src/components/QuizzesListView.test.tsx src/components/FirstRunScreen.test.tsx
✓ src/components/Dashboard.test.tsx (2 tests)
✓ src/components/QuizzesListView.test.tsx (2 tests)
✓ src/components/PrintReportModal.test.tsx (2 tests)
✓ src/components/CurriculumView.test.tsx (2 tests)
✓ src/components/FirstRunScreen.test.tsx (6 tests)
Test Files  5 passed (5)
     Tests  14 passed (14)
```

**Full suite, final:**
```
$ npx vitest run
Test Files  119 passed (119)
     Tests  1247 passed (1247)
```

**Programmatic cross-check** (written as a temporary in-tree vitest file, run, then deleted — not part of the commit): confirmed for every one of the 6 Grade 2 quizzes that (a) every `questionIds` entry resolves via `GRADE_2.source.authoredFor()` to a real authored item, (b) for domain-drill quizzes every resolved item's standard belongs to the declared `domainId`, (c) no duplicate ids within a quiz, and (d) the diagnostic covers all 23 standards exactly once:
```
Total quizzes: 6
 - g2-diagnostic-01 23 items
 - g2-mod-oa-01 16 items OA
 - g2-mod-nbt-01 31 items NBT
 - g2-mod-md-01 34 items MD
 - g2-mod-g-01 9 items G
 - g2-mock-ssa-01 25 items
ERRORS: 0
```

**Lint:**
```
$ npm run lint
(oxlint output: 7 pre-existing warnings, all in files I did not touch — WeakSpotsView.tsx, AdaptiveSessionCard.test.tsx, ProgressContext.tsx, QuizResults.tsx)
$ echo $?
0
```

**Typecheck:**
```
$ npx tsc -b --noEmit
(no output — clean)
```

**Build:**
```
$ npm run build
✓ 1963 modules transformed.
dist/index.html                     0.72 kB
dist/assets/index-UPB277eT.css     56.48 kB
dist/assets/index-fzApeCNL.js   1,193.18 kB
✓ built in 891ms
(one pre-existing chunk-size warning, unrelated to this change)
```

**Blueprint grep, scoped to `src/components/`, production code only (`.tsx`, excluding `*.test.tsx`):**
```
$ grep -rn "Blueprint Weight\|blueprint weight\|blueprint" src/components/ --include="*.tsx" | grep -v "\.test\.tsx"
src/components/Dashboard.tsx:65:  ...NCSCOS...blueprint with multi-step reasoning...   [documented exception above — names the standards document, true at every grade]
src/components/Dashboard.tsx:97:  {curriculum.weighting.kind === 'ncdpi-blueprint'
src/components/Dashboard.tsx:98:  ? 'Weighted by official NC EOG blueprint domain weights'
src/components/PrintReportModal.tsx:273: 1. <strong>{curriculum.weighting.kind === 'ncdpi-blueprint' ? 'Focus by Blueprint Weight:' : ...}</strong>
src/components/PrintReportModal.tsx:274:  {curriculum.weighting.kind === 'ncdpi-blueprint'
src/components/PrintReportModal.tsx:275:  ? `Prioritize the domains with the highest NC EOG blueprint weight above...`
src/components/PrintReportModal.tsx:276:  : `There is no official state blueprint at this grade to rank by weight...`
```
Every occurrence except the documented Dashboard.tsx:65 exception sits behind a `weighting.kind === 'ncdpi-blueprint'` check. `CurriculumView.tsx` and `QuizzesListView.tsx` have zero occurrences of any form.

## What a Grade 2 parent and a Grade 5 parent should each now see

**Grade 2 parent:**
- **Curriculum tab (`CurriculumView`)**: each domain header reads "Share of Grade Standards: 17%" (OA), "35%" (NBT), "39%" (MD), "9%" (G) — no "blueprint" word anywhere on the page except the generic "Content Blueprint" / "Standard Blueprints" page-header chrome (naming the curriculum document itself, present at every grade). The domain filter pills at the top read "OA (17%)", "NBT (35%)", etc. — no raw "No state assessment..." text anywhere.
- **Dashboard**: the readiness gauge subtitle reads "Weighted by each domain's share of Grade 2 standards — no state test exists at this grade" instead of the blueprint claim. Each domain card badge reads e.g. "OA • 17% Weight" instead of "OA • No state assessment at this grade Weight".
- **Testing Center (`QuizzesListView`)**: a diagnostic (23 questions, 35 min), four module drills (OA/NBT/MD/G), and one 25-item mock exam ("Full Practice Assessment (Form A)", 40 min) whose subtitle honestly states there is no state blueprint to allocate against and instead cites the domain's share of the 23 standards. Each module-drill card badge shows a real percentage, e.g. "OA • 17%".
- **Printed parent report (`PrintReportModal`)**: the domain table's weight column header reads "Share of Grade Standards" and every row shows a real percentage. The recommendations section's item 1 reads "Focus by Standards Share: There is no official state blueprint at this grade to rank by weight. Prioritize the domains furthest below the 80% qualifying bar above."

**Grade 5 parent (must be unchanged):**
- **Curriculum tab**: domain headers still read "NC Blueprint Weight: 39–43%" (etc.); filter pills still read "NF (39–43%)".
- **Dashboard**: gauge subtitle still reads "Weighted by official NC EOG blueprint domain weights"; MD/G domain cards now additionally show the "(Measurement & Data and Geometry combined)" annotation they were missing before (a strict improvement, not a regression — covered by a new test).
- **Testing Center**: MD and G module-drill card badges now show "19–23% (Measurement & Data and Geometry combined)" instead of the old bare "19–23%" (same improvement).
- **Printed report**: weight column header still "NC Blueprint Weight"; recommendations item 1 still "Focus by Blueprint Weight: Prioritize the domains with the highest NC EOG blueprint weight above...".

All of the above is asserted by the new `*.test.tsx` files (one Grade-5 test + one Grade-2 test per component), not just eyeballed — but the controller's browser check is still valuable to confirm layout/readability, since these are new render paths.

## Files changed

New:
- `src/curriculum/grade2/quizzes.ts`
- `src/curriculum/grade2/index.ts`
- `src/curriculum/grade2/grade2.test.ts`
- `src/components/CurriculumView.test.tsx`
- `src/components/Dashboard.test.tsx`
- `src/components/PrintReportModal.test.tsx`
- `src/components/QuizzesListView.test.tsx`

Modified:
- `src/curriculum/registry.ts` (added `weightHeading`, `weightValue`, registered `GRADE_2`)
- `src/curriculum/registry.test.ts`
- `src/components/CurriculumView.tsx`
- `src/components/PrintReportModal.tsx`
- `src/components/Dashboard.tsx`
- `src/components/QuizzesListView.tsx`
- `src/components/FirstRunScreen.test.tsx`

Commit: `f81e24b` — "feat: register grade 2 and label unweighted grades honestly"

## Concerns for the controller

1. **`weightValue()` is a new export not named in the brief's interface list.** I judged it necessary to satisfy the UPHELD 21-3 ruling, which explicitly says the value must also change, not just the heading. Flagging for explicit sign-off since it's an API surface addition beyond the brief's stated contract.
2. **Two additional bare-`officialWeightRange` fixes** (`CurriculumView.tsx` filter pills, `Dashboard.tsx` domain card badge) beyond what any numbered ruling named. Same defect class, same files already in scope, judged in-bounds — see "Deviation beyond the rulings" above.
3. **Dashboard.tsx:65's "blueprint" reference left unconditional** — judged a true, grade-invariant statement about the NCSCOS document rather than a weight claim. Worth a second look if the controller reads it differently.
4. Mock assessment time limit (40 min) and module-drill time limits (25/45/45/15 min) were my own judgment calls — the ruling states the item allocation but not timing; I scaled roughly from the diagnostic's stated 35 min / 23 items ratio and Grade 3's precedent. Not asserted by any hard test beyond `> 0`.

## Fix round 1

Starting HEAD `f81e24b` (the commit above), branch `feat/multi-grade-adaptive`. Commit produced: `2d350ad`
("fix: close task 21 review findings F1-F12").

Source: `.superpowers/sdd/2026-09-13-grades-1-4-content/task-21-fixes.md` (F1-F12), all required.

### F1 — compact combined-band labels

New helper `weightCompactLabel(c, domainId)` in `src/curriculum/registry.ts:98-106`, placed next to
`weightLabel`/`weightValue`/`weightHeading`. Behavior:
- No `weightGroup` on the domain: delegates straight to `weightValue()` — byte-identical to today for
  every Grade 1-2 domain and every ungrouped Grade 3-5 domain (`registry.ts:100`).
- Has a `weightGroup`: returns `` `${domain.officialWeightRange} with ${otherGroupMemberIds}` `` —
  one line, no parens at all inside the value itself (`registry.ts:101-105`).

**The exact compact form chosen:** `"19–23% with G"` (for MD) and `"19–23% with MD"` (for G), i.e.
review finding's example B ("MD • 19–23% with G"), not example A ("MD+G 19–23%"). Reason: every call
site already had its own established wrapper — parens at the `CurriculumView` pill, a bullet at
`Dashboard`'s and `QuizzesListView`'s badges, plus a trailing " Weight" at `Dashboard`. Making the helper
return only the *value* fragment (never the id) let every call site keep its existing wrapper verbatim,
so the Grade 1-2 / ungrouped-Grade-3-5 rendered output is provably unchanged (same code path, same
string), while the grouped-Grade-3-5 case gets exactly one new word ("with X") marking the band shared.
A self-contained `"MD+G 19–23%"` form would have required also rewriting each wrapper to stop
double-printing the id, touching more lines for no behavioral gain.

Call sites updated to use it, each with a `title` attribute carrying `weightGroupLabel` (the full
"Measurement & Data and Geometry combined" wording) for a hover/tap tooltip:
- `src/components/CurriculumView.tsx:74-80` — domain filter pills. Grade 5 MD pill: `MD (19–23% with G)`.
- `src/components/Dashboard.tsx:313-318` — domain card badge. Grade 5 MD badge: `MD • 19–23% with G Weight`.
- `src/components/QuizzesListView.tsx:225-230` — module-drill badge. Grade 5 MD badge: `MD • 19–23% with G`.

Full wording is unchanged and untouched at the two spots with room: `CurriculumView.tsx:101` (domain
header, still `weightHeading(curriculum)}: {weightValue(...)`) and `PrintReportModal.tsx:171` (printed
table cell, still `weightValue(...)`) — both still render
`"NC Blueprint Weight: 19–23% (Measurement & Data and Geometry combined)"` for Grade 5 MD.

Tests: `src/components/CurriculumView.test.tsx` pins `MD (19–23% with G)` and `G (19–23% with MD)`
exactly for Grade 5, plus confirms the full "combined" wording still appears elsewhere on the page.
`src/components/Dashboard.test.tsx` pins `MD • 19–23% with G Weight` / `G • 19–23% with MD Weight` for
Grade 5, and `OA • 17% Weight` exactly for Grade 2 (M3's ask). `src/components/QuizzesListView.test.tsx`
pins `MD • 19–23% with G` / `G • 19–23% with MD` for Grade 5, and `OA • 17%` exactly for Grade 2.

### F2 — study guide "4th/5th Grade" heading

`src/components/StudyGuideModal.tsx:111`: `Common 4th/5th Grade Traps to Avoid` →
`` Common Grade {curriculum.grade} Traps to Avoid ``. Since neither of F2's two offered fixes (derive
from `curriculum.grade`, or drop the grade) preserves the old literal string, this is one of the few
spots where Grade 5's rendered text does change (from "Common 4th/5th Grade Traps to Avoid" to "Common
Grade 5 Traps to Avoid") — F2 says so by construction, not by an explicit exemption clause; I flag it
here for the controller's attention. New file `src/components/StudyGuideModal.test.tsx` (none existed):
one Grade 5 test pinning the new derived heading on `NC.5.OA.2`'s guide, one Grade 2 test pinning
`Common Grade 2 Traps to Avoid` on `NC.2.OA.1`'s guide and asserting no `/4th\/5th/` anywhere.

### F3 — Testing Center mock header

`src/components/QuizzesListView.tsx:43-66` computes `mockMinutesLabel` and `mockHasCalculatorSplit` from
`curriculum.quizzes.filter(q => q.isMockAssessment)`: minutes are a single value when every mock agrees,
else `"min-max"`; the calculator clause only appears when resolving every mock item (via
`curriculum.source.resolve(parseQuestionRef(id)).calculatorAllowed`) actually yields both `true` and
`false`. Rendered at `QuizzesListView.tsx:150`:
`` Timed {mockMinutesLabel} Minutes{mockHasCalculatorSplit ? ' • Divided into Calculator Inactive & Active' : ''} ``.

Verified against the real data before writing the derivation (not assumed):
- Grade 5: two mocks (60, 65 min); Form A's own source comment marks "Calculator Inactive section" /
  "Calculator Active section", and both forms mix `calculatorAllowed: true` and `false` items → renders
  `Timed 60-65 Minutes • Divided into Calculator Inactive & Active` (byte-identical to today).
- Grade 2: one mock (40 min); grepped all 112 `calculatorAllowed` occurrences under `src/curriculum/grade2/`
  — every one is `false`, none `true` → renders `Timed 40 Minutes`, no calculator clause.
- Grade 3: one mock (55 min); all 28 mock items are `calculatorAllowed: false` → `Timed 55 Minutes`.
- Grade 4: one mock (60 min); all 29 mock items are `calculatorAllowed: false` → `Timed 60 Minutes`.

Tests in `QuizzesListView.test.tsx`: Grade 5 pins the exact unchanged string; Grade 2 pins
`Timed 40 Minutes` and asserts no `/Calculator/` text anywhere in that header.

### F4 — printed report's mock-testing recommendation

`src/components/PrintReportModal.tsx:21-32` derives `mockCountWord` ("one"/"two"), `mockNoun` ("mock
exam"/"mock exams"), and `mockWindowMinutes` (`Math.min` of the mocks' `timeLimitMinutes`) from
`curriculum.quizzes.filter(q => q.isMockAssessment)`. Rendered at `PrintReportModal.tsx:296`:
`` Have the student complete at least {mockCountWord} full {mockNoun} within a {mockWindowMinutes}-minute window before the Wake County test day. ``

Verified: Grade 5 has two mocks (60, 65 min) → count "two", noun "mock exams", `Math.min(60,65)=60` →
renders **byte-identical** to today's "Have the student complete at least two full mock exams within a
60-minute window before the Wake County test day." Grade 2 has one mock (40 min, confirmed above) →
"...at least one full mock exam within a 40-minute window...". Grade 3 (55 min) and Grade 4 (60 min)
each get their own honest single-mock sentence, not asserted by a hard test (only Grade 2/5 required).

Tests: one Grade 5 test pins the exact unchanged sentence (via regex, since it's split across a `<strong>`
sibling); one Grade 2 test pins the derived "one full mock exam within a 40-minute window" sentence.

### F5 — unweighted-grade advice contradicting itself

- `src/components/PrintReportModal.tsx:130`: `Focused drill on high-weight domains is recommended.` is
  now gated — blueprint grades keep that exact sentence; unweighted grades get
  `Focused drill on the domains furthest below the bar is recommended.`
- `src/components/Dashboard.tsx:235-237`: `` Drill High-Weight Domains to Reach the {passingPercent}% Benchmark ``
  is now gated the same way; unweighted grades get
  `` Drill the Domains Furthest Below the {passingPercent}% Benchmark ``.

Grade 5 unchanged (both gated on `curriculum.weighting.kind === 'ncdpi-blueprint'`, Grade 5's own kind).
Tests: `PrintReportModal.test.tsx` — one Grade 2 test (queries the paragraph never says "high-weight
domains is recommended"), one Grade 5 test (still says it, unchanged). `Dashboard.test.tsx` — reaching
the "what to do next" hero's below-bar branch needed a profile that has *taken* its diagnostic and scored
under the bar (a fresh profile never leaves the "take the baseline diagnostic" branch), so I added a
`stateHavingTakenDiagnostic(grade)` test helper that seeds one low-scoring diagnostic attempt; one Grade 2
test off that helper (no "High-Weight Domains" anywhere, does say "Domains Furthest Below"), one Grade 5
test off the same helper (still says the exact old "Drill High-Weight Domains to Reach the 80% Benchmark").

### F6 — "Focus by Standards Share:" label

`src/components/PrintReportModal.tsx:287`: unweighted-grade label changed from `Focus by Standards
Share:` to `Focus on the Biggest Gaps:` (the exact example the fixes file suggested), matching the
sentence beside it, which already prioritises "the domains furthest below the...qualifying bar" and
never mentioned a share. Blueprint grades keep `Focus by Blueprint Weight:` unchanged. Updated the
existing Grade 2 print test to assert the new label and that the old one is gone.

### F7 — "Blueprint" page chrome at a grade with no blueprint

All four spots gated on `curriculum.weighting.kind === 'ncdpi-blueprint'`; blueprint grades keep their
exact current wording:
- `src/components/Navbar.tsx:84-87` — top banner: `{label} Blueprint (targets Grade N)` vs.
  `{label} Standards (targets Grade N)`.
- `src/components/CurriculumView.tsx:45-53` — eyebrow `Grade N Content Blueprint` vs.
  `Grade N Content Standards`; h1 `Curriculum Structure & Standard Blueprints` vs.
  `Curriculum Structure & Standards`.
- `src/components/Dashboard.tsx:65` — trailing word `blueprint` vs. `standards` inline in the hero
  sentence (`...Grade {grade} Mathematics</strong> {blueprint|standards} with multi-step reasoning...`).

New `src/components/Navbar.test.tsx` (none existed): Grade 5 pins the exact unchanged banner string;
Grade 2 asserts no `/blueprint/i` anywhere and pins the new "Standards" banner. `CurriculumView.test.tsx`
and `Dashboard.test.tsx` each got a Grade 2 test asserting no `/blueprint/i` in the whole rendered page,
plus a Grade 5 test pinning the exact unchanged chrome text — confirmed safe by grepping
`src/curriculum/grade2/` for the word "blueprint": every hit is inside an honest disclaimer sentence
("there is no state blueprint...") that never reaches these four components, or is in a comment/test.

`QuizzesListView.tsx` and `PrintReportModal.tsx` were deliberately left alone for F7 — the fixes file's
list of in-scope spots is exactly Navbar/CurriculumView/Dashboard; those two components' existing
"blueprint weight" disclaimer text (`there is no official state blueprint to allocate against/rank by
weight`) is the honest kind F7 says to keep, and was already correctly scoped by the existing
`/blueprint weight/i` test assertions from Task 21 proper.

### F8 — browser title says Grade 5 for every grade

`index.html:7-8`: title → `NC Math SSA Prep | North Carolina Grades 2-5 Math Acceleration (WCPSS)`;
description → `Structured preparation program for North Carolina Single Subject Acceleration (SSA) in
Grades 2-5 Mathematics (Wake County / NCSCOS standards).` No blueprint claim, no runtime `document.title`
code added (confirmed none exists anywhere in `src/` before or after). Static HTML has no test coverage
in this suite; verified by inspection and by `npm run build`'s output `dist/index.html`.

### F9 — `types.ts:26` wrong-renderer comment and the '0%'/'' asymmetry

`src/curriculum/types.ts:24-30`: comment on `officialWeightRange` now points at `weightValue()` ("correct
at every grade") instead of `weightLabel()` (which reprints the raw placeholder string verbatim for an
unweighted grade — the exact bug this pointed readers toward).

`src/curriculum/registry.ts:73-91`: `weightValue()` now early-returns `''` when the domain isn't found,
matching `weightLabel()`'s behavior exactly, instead of falling through to
`` `${Math.round(domainWeight(...))}%` `` → `domainWeight()`'s own `return 0` for an unknown domain →
`"0%"` (a fabricated, real-looking weight for a domain that doesn't exist).

Test added in `src/curriculum/registry.test.ts` ("agrees with weightLabel on an unknown domain..."):
asserts `weightValue(g5, 'ZZZ') === weightLabel(g5, 'ZZZ') === ''` and the same for `g2`.

### F10 — `registry.test.ts` stale history comment

`src/curriculum/registry.test.ts:22-31`: the claim "then grade 2 until this task" (implying the pin was
grade 2 immediately before Task 21) is corrected — per the rulings file, "Task 16 chose grade 1
deliberately", so the pin has been grade 1 since Task 16, not grade 2, and Task 21's own grade-2
registration doesn't move it (grade 1 remains the only unregistered grade). The assertion itself
(`getCurriculum(1)`) was already correct and unchanged; only the comment's false historical claim was
rewritten.

### F11 — `grade2/quizzes.ts` muddled rounding comment

`src/curriculum/grade2/quizzes.ts:72-85`: replaced the floor/ceil-per-domain reasoning with a plain
statement — nearest-integer rounding of 4.3 / 8.7 / 9.8 / 2.2 gives 4 / 9 / 10 / 2, which totals 25
exactly, with Geometry keeping its 2 items rather than rounding away to 0. The underlying numbers and the
per-domain item counts (`MOCK_SSA_01_QUESTION_IDS`) are unchanged; only the comment's prose changed.

### F12 — `grade2.test.ts:124` unnecessary cast

`src/curriculum/grade2/grade2.test.ts:124`: `domainWeight(GRADE_2, domainId as never)` →
`domainWeight(GRADE_2, domainId)`. `domainId` here comes from `Object.entries(counts)` on a
`Record<string, number>`, and `DomainId` is itself `type DomainId = string` (see `types.ts:6`), so the
cast was always a no-op that `tsc -b --noEmit` confirms compiles clean without it.

### Covering tests, commands and output

RED (before implementation) and GREEN (after) evidence was captured per component by writing/adjusting
the Grade 2 and Grade 5 assertions first, running just that file, confirming failure, then implementing
and re-running. Representative examples:

**RED, CurriculumView (F1 pill + F7 chrome):**
```
$ npx vitest run src/components/CurriculumView.test.tsx
 × compacts the grouped MD/G pill onto one line without a bare, misattributed band (Finding F1)
 × says "standards", never "blueprint", anywhere in the page chrome at grade 2 (Finding F7)
Tests  2 failed | 3 passed (5)
```
**GREEN, same file, after editing `CurriculumView.tsx`:**
```
$ npx vitest run src/components/CurriculumView.test.tsx
✓ src/components/CurriculumView.test.tsx (5 tests) 463ms
Test Files  1 passed (1)
     Tests  5 passed (5)
```

**RED, Dashboard (F1 badge, F5 wording, F7 chrome):**
```
$ npx vitest run src/components/Dashboard.test.tsx
 × compacts the grouped MD/G domain card badge onto one line (Finding F1)
 × says "standards", never "blueprint", in the hero banner at grade 2 (Finding F7)
 × advises the domains furthest below the bar for grade 2, not "high-weight domains" (Finding F5)
Tests  3 failed | 5 passed (8)
```
**GREEN, same file, after editing `Dashboard.tsx`:**
```
$ npx vitest run src/components/Dashboard.test.tsx
✓ src/components/Dashboard.test.tsx (8 tests) 185ms
```

**RED, QuizzesListView (F1 badge, F3 mock header):**
```
$ npx vitest run src/components/QuizzesListView.test.tsx
 × labels grade 5's grouped MD+G drill cards with the compact shared form... (Finding F1)
 × derives grade 2's mock header from its one 40-minute mock... (Finding F3)
Tests  2 failed | 2 passed (4)
```
**GREEN, after editing `QuizzesListView.tsx`:**
```
$ npx vitest run src/components/QuizzesListView.test.tsx
✓ src/components/QuizzesListView.test.tsx (4 tests) 115ms
```

**RED, PrintReportModal (F4, F5, F6):**
```
$ npx vitest run src/components/PrintReportModal.test.tsx
 × never claims a blueprint for grade 2 in the printed report (F6 label)
 × recommends the mock-exam count and window it actually has for grade 2 (Finding F4)
 × advises the domains furthest below the bar, not "high-weight domains", for grade 2 (Finding F5)
Tests  3 failed | 3 passed (6)
```
**GREEN, after editing `PrintReportModal.tsx`:**
```
$ npx vitest run src/components/PrintReportModal.test.tsx
✓ src/components/PrintReportModal.test.tsx (6 tests) 160ms
```

**RED, StudyGuideModal (F2, new test file):**
```
$ npx vitest run src/components/StudyGuideModal.test.tsx
 × never tells a grade 2 parent their child is making "4th/5th grade" traps
Tests  1 failed | 1 passed (2)
```
**GREEN, after editing `StudyGuideModal.tsx`:**
```
$ npx vitest run src/components/StudyGuideModal.test.tsx
✓ src/components/StudyGuideModal.test.tsx (2 tests) 47ms
```

**RED, Navbar (F7, new test file):**
```
$ npx vitest run src/components/Navbar.test.tsx
 × never says "blueprint" in the top banner for grade 2, which has none
Tests  1 failed | 1 passed (2)
```
**GREEN, after editing `Navbar.tsx`:**
```
$ npx vitest run src/components/Navbar.test.tsx
✓ src/components/Navbar.test.tsx (2 tests) 45ms
```

**registry.ts (F1 helper, F9 fix) and grade2 comment/cast fixes (F10-F12) — written together with their
unit tests** (pure-function additions specified directly from the fixes file's own worked examples, not
adjusted from a pre-existing failing assertion):
```
$ npx vitest run src/curriculum/registry.test.ts src/curriculum/grade2/grade2.test.ts
✓ src/curriculum/registry.test.ts (21 tests)
✓ src/curriculum/grade2/grade2.test.ts (13 tests)
Test Files  2 passed (2)
     Tests  34 passed (34)
```

**All covering tests together:**
```
$ npx vitest run src/components/CurriculumView.test.tsx src/components/Dashboard.test.tsx \
    src/components/QuizzesListView.test.tsx src/components/PrintReportModal.test.tsx \
    src/components/StudyGuideModal.test.tsx src/components/Navbar.test.tsx \
    src/curriculum/registry.test.ts src/curriculum/grade2/grade2.test.ts
Test Files  8 passed (8)
     Tests  61 passed (61)
```

### Full gate

```
$ npm run lint
(oxlint — same 7 pre-existing warnings as before, all in files untouched by this round:
 AdaptiveSessionCard.test.tsx, ProgressContext.tsx ×4, WeakSpotsView.tsx, QuizResults.tsx)
$ echo $?
0

$ npx tsc -b --noEmit
(no output — clean)

$ npx vitest run
Test Files  121 passed (121)
     Tests  1271 passed (1271)

$ npm run build
✓ 1963 modules transformed.
dist/index.html                     0.73 kB
dist/assets/index-UPB277eT.css     56.48 kB
dist/assets/index-BX7edICm.js   1,194.57 kB
✓ built in 402ms
(one pre-existing chunk-size warning, unrelated)
```

### Blueprint grep (required check)

```
$ grep -rn -i "blueprint" src/components/ --include=*.tsx | grep -v "\.test\.tsx"
CurriculumView.tsx:45-52   — both gated on curriculum.weighting.kind === 'ncdpi-blueprint'
Dashboard.tsx:65           — gated inline (blueprint|standards ternary)
Dashboard.tsx:97-98        — gated on curriculum.weighting.kind === 'ncdpi-blueprint'
Dashboard.tsx:235          — gated on curriculum.weighting.kind === 'ncdpi-blueprint'
Navbar.tsx:84-85           — gated on curriculum.weighting.kind === 'ncdpi-blueprint'
PrintReportModal.tsx:130   — gated inline (ternary)
PrintReportModal.tsx:287-289 — gated on curriculum.weighting.kind === 'ncdpi-blueprint'
PrintReportModal.tsx:290   — the honest "There is no official state blueprint..." disclaimer, kept
```
Every hit is either gated on `weighting.kind` or is the honest disclaimer. `QuizzesListView.tsx` and
`StudyGuideModal.tsx` have zero occurrences of the word in production code.

### What a Grade 2 parent and a Grade 5 parent now see, per changed spot

**Grade 2 parent (all newly honest, no fabricated figures):**
- Top banner (`Navbar`): "Grade 2 Mathematics Standards (targets Grade 2)" — no "Blueprint".
- Curriculum tab eyebrow/h1 (`CurriculumView`): "Grade 2 Content Standards" / "Curriculum Structure &
  Standards" — no "Blueprint". Domain pills unchanged in value, e.g. "OA (17%)".
- Dashboard hero: "...authoritative NCSCOS Grade 2 Mathematics standards with multi-step reasoning..." —
  no "blueprint". Domain card badges unchanged, e.g. "OA • 17% Weight". "What to do next" hero, once the
  diagnostic is taken and below bar, now reads "Drill the Domains Furthest Below the 80% Benchmark"
  (previously "Drill High-Weight Domains...").
- Testing Center (`QuizzesListView`): mock-exam header now reads "Timed 40 Minutes" (previously "Timed
  60-65 Minutes • Divided into Calculator Inactive & Active", which was simply false for Grade 2).
- Printed report (`PrintReportModal`): recommendation 1 now reads "Focus on the Biggest Gaps: There is no
  official state blueprint..." (previously "Focus by Standards Share:", which contradicted its own
  sentence). Recommendation 3 now reads "...complete at least one full mock exam within a 40-minute
  window..." (previously claimed two exams / 60 minutes, both false for Grade 2). The composite-readiness
  banner, when below bar, now reads "...Focused drill on the domains furthest below the bar is
  recommended." (previously "high-weight domains", contradicting item 1 on the same page).
- Study guide (`StudyGuideModal`): any Grade 2 standard with `commonTraps` now reads "Common Grade 2
  Traps to Avoid" (previously "Common 4th/5th Grade Traps to Avoid" on e.g. `NC.2.OA.1`'s guide).
- Browser tab title: "NC Math SSA Prep | North Carolina Grades 2-5 Math Acceleration (WCPSS)".

**Grade 5 parent (unchanged except where noted):**
- Top banner, Curriculum tab chrome, Dashboard hero, printed-report labels/sentences, Testing Center mock
  header, and the composite-readiness/"what to do next" wording are all byte-identical to before this
  round.
- Curriculum tab MD/G filter pills now read "MD (19–23% with G)" / "G (19–23% with MD)" instead of
  wrapping onto two lines with "MD (19–23% (Measurement & Data and Geometry combined))" — a layout fix,
  same underlying figures, full wording still visible in the domain header just below the pills.
- Dashboard MD/G domain-card badges now read "MD • 19–23% with G Weight" / "G • 19–23% with MD Weight"
  instead of wrapping to two lines — same fix.
- Testing Center MD/G module-drill badges now read "MD • 19–23% with G" / "G • 19–23% with MD" instead of
  the full parenthetical (a pre-existing improvement from Task 21 proper that this round only reformats
  for layout, not reverts to the pre-Task-21 bare band).
- Study guide "Common Traps" heading changed from "Common 4th/5th Grade Traps to Avoid" to "Common Grade
  5 Traps to Avoid" (see F2 above — this is the one spot Grade 5's literal text does change, by design).
- Browser tab title changed from Grade-5-only wording to the grade-neutral "Grades 2-5" wording (this
  changes for every grade, including Grade 5, since it's a single static `<title>` for the whole app).

## Fix round 2

Re-review passed everything from round 1 except F8: round 1's "Grades 2-5" wording still named specific
grades, which becomes false the moment Task 26 registers Grade 1, and no later task touches `index.html`
to fix it then. Commit produced: `80e94ac` ("fix: make index.html grade-neutral (F8 fix round 2)"), on
top of round 1's `2d350ad`.

### F8 — truly grade-neutral this time

`index.html:7-8` rewritten to name no grade number and no grade range at all, and to keep "blueprint" out
of both, as required:

- Title: `NC Math SSA Prep | North Carolina Math Acceleration Practice (WCPSS)`
- Meta description: `Structured practice program for North Carolina Single Subject Acceleration (SSA) in mathematics (Wake County / NCSCOS standards).`

Full file after the change:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NC Math SSA Prep | North Carolina Math Acceleration Practice (WCPSS)</title>
    <meta name="description" content="Structured practice program for North Carolina Single Subject Acceleration (SSA) in mathematics (Wake County / NCSCOS standards)." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Verification

```
$ grep -n "Grade" index.html
(no output - no match; grep exit code 1)
```

```
$ grep -ni "blueprint" index.html
(no output - no match; grep exit code 1)
```

```
$ npm run build
> ncmathssa@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
transforming...
✓ 1963 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.71 kB │ gzip:   0.42 kB
dist/assets/index-UPB277eT.css     56.48 kB │ gzip:   9.50 kB
dist/assets/index-BX7edICm.js   1,194.57 kB │ gzip: 328.75 kB
✓ built in 415ms
(one pre-existing chunk-size warning, unrelated to this change)
```

No suite run needed beyond the build, per the controller's instruction — no test in the repo covers
`index.html`.

### Commit

```
git add index.html
```
(explicit path only; `graphify-out/` remains untracked and uncommitted, as in round 1.)

Commit `80e94ac`, message ends with:
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012ve1EbS2XpgkomSbxXpCFc
```
