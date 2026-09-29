# Pre-flight audit — Tasks 9, 10, 11 (Grade 4 Geometry, study guides, registration)

Read-only audit. Method: the requirement was derived from `src/curriculum/grade4/standards.ts`,
`docs/sources/nc-eog-blueprint.json`, and the live code in the tree FIRST; the briefs were then
compared against it. Governing rule: when a brief and `standards.ts` disagree, `standards.ts` wins.

In-flight files (`authored.md.ts`, `templates/md*.ts`, `misconceptions.ts`) were read only to
establish facts about conventions; their incomplete state is not reported as a finding.

Totals: **Task 9 — 4 findings. Task 10 — 4 findings. Task 11 — 4 findings.**

---

## Task 9 — Grade 4 Geometry + the authored aggregator

### 9.1 — The brief scopes `NC.4.G.2` to quadrilaterals and drops triangles (MEDIUM-HIGH)

1. **Brief says:** under Templates it characterises Grade 4 Geometry as "what a ray is, **which
   quadrilateral a figure is**, where a line of symmetry falls", and Step 3's distractor list gives
   only "a rhombus called a square" for classification. Triangles are never mentioned anywhere in
   the brief.
2. **Source says** (`standards.ts`, `NC.4.G.2`):
   > "Classify **quadrilaterals and triangles** based on angle measure, side lengths, and the
   > presence or absence of parallel or perpendicular lines."
   `keyConcepts`: "Classify by angle measure", "Classify by side lengths", "Presence or absence of
   parallel lines", "Presence or absence of perpendicular lines".
3. **Source is right.** The brief omits mathematics the standard explicitly asks for. An implementer
   following the brief literally will author three quadrilateral items, `assertAuthoredBankSound`
   will pass (it only checks the floor of three items per standard), and triangle classification —
   acute / right / obtuse, scalene / isosceles / equilateral — will ship untested at Grade 4.
4. **Correction:** instruct that `NC.4.G.2` needs at least one triangle-classification item
   alongside the quadrilateral items, and that classification must be exercised on all three listed
   criteria (angle measure, side length, parallel/perpendicular presence), not on side length alone.
   Note NC's **inclusive** trapezoid definition (at least one pair of parallel sides) — the existing
   tag at `misconceptions.ts:441` already names the exclusive-definition error and exists precisely
   for this.
5. **Cost if the correction is wrong:** one or two extra authored items in a bank whose floor is
   three. Negligible. The cost of *not* correcting is a Grade 4 child never being assessed on half
   of a standard the EOG assesses.

### 9.2 — The brief's `NC.4.G.1` guidance omits parallel and perpendicular lines (MEDIUM)

1. **Brief says:** "what a ray is"; the only `G.1` distractor named is "a line segment called a ray".
2. **Source says** (`NC.4.G.1`):
   > "Draw and identify points, lines, line segments, rays, angles, and **perpendicular and parallel
   > lines**."
   `keyConcepts` lists "Perpendicular lines" and "Parallel lines" as two of four concepts.
3. **Source is right.** Ray-vs-segment is one of six named objects. Half the standard's key concepts
   are absent from the brief.
4. **Correction:** `G.1`'s three-item floor should cover the ray/segment/line distinction **and**
   identification of parallel vs perpendicular lines; the brief should say so.
5. **Cost if wrong:** an extra item. The risk of leaving it is that `G.1` ships as a
   ray-vocabulary standard when the source is a six-object drawing-and-identifying standard.

### 9.3 — Step 5's misconception guidance points at a family whose tags do not fit (MEDIUM)

1. **Brief says (Step 5):** "As in Task 5 Step 6. **The shape-classification family already exists
   for exactly this kind of error.**"
2. **Source says** (`misconceptions.ts:15-18`), the family's own docstring:
   > "Reasoning about what a shape IS — its definition and its place in the polygon hierarchy (e.g.
   > 'is every square a rectangle?') — as distinct from measuring or computing with a shape once
   > it's identified."
   Its existing tags are `classified-by-one-property-only`, a hierarchy-reversal tag, an
   over-broad-category tag, and `used-exclusive-trapezoid-definition`. A grep of the whole registry
   finds **no** tag for symmetry, for a ray-vs-segment naming error, or for parallel/perpendicular
   confusion.
3. **The brief is misleading, not wrong.** The *family* fits the `G.2` items; it does not contain a
   tag for two of the three distractors the brief itself names — "a diagonal of a rectangle offered
   as a line of symmetry" and "a figure judged symmetric because it merely looks balanced" are
   symmetry errors with no existing tag at all. Read as "no new tags needed", this brief pushes the
   implementer into exactly the reuse the Global Constraints forbid: *"Never reuse a tag that names
   a different error just to avoid declaring one."*
4. **Correction:** reword Step 5 to "declare new, specific tags for the symmetry and line-object
   errors; the existing `shape-classification` family is the right home for the `G.2`
   classification tags, and a symmetry tag may sit in `shape-classification` or
   `geometry-and-measurement`, but it must be a new tag naming the symmetry error, not a
   classification tag borrowed for it."
5. **Cost if wrong:** three or four extra entries in `misconceptions.ts`. `misconceptions.test.ts`
   fails in both directions, so an unused tag is caught immediately — the correction is cheap and
   self-checking. The cost of not correcting is a parent report telling a child they made a
   polygon-hierarchy error when they eyeballed a fold line.

### 9.4 — File/test structure disagrees with the contract and with the tree (LOW)

1. **Brief says:** Files creates `authored.g.ts`, `authored.g.test.ts` and `authored.ts` — no
   `authored.test.ts`. The aggregator's two assertions live inside `authored.g.test.ts`. Files does
   not list `src/curriculum/grade4/templates/index.ts`.
2. **Source says:** the plan's Content Contract — *"Every authored file gets a sibling
   `.test.ts`"* — and the Grade 5 precedent, which has `grade5/authored.test.ts` beside
   `grade5/authored.ts`. Separately, `grade4/templates/index.ts` currently ends with the docstring
   line *"Tasks 8 and 9 append this grade's MD and G templates here."*, which Task 9 deliberately
   contradicts by shipping no Geometry template.
3. **Both are defensible but should be made explicit.** Burying the aggregate's coverage test in one
   domain's test file means deleting `authored.g.test.ts` silently deletes the only check that
   `GRADE_4_AUTHORED` covers all 25 standards. The stale template docstring will otherwise sit in
   the tree asserting something untrue.
4. **Correction:** either name `authored.test.ts` in Files and move the two aggregate `describe`
   blocks there, or state in the brief that the aggregate is deliberately tested from
   `authored.g.test.ts` because Geometry is the last domain written. Add
   `src/curriculum/grade4/templates/index.ts` to the Modify list for the one-line docstring fix
   (Geometry is authored-only, by design).
5. **Cost if wrong:** a file move. Zero behavioural risk either way.

---

## Task 10 — Grade 4 study guides

### 10.1 — The no-percentage rule for MD/G collides with the contract's "must cite a real figure" (MEDIUM)

1. **Brief says (Step 3):** "For MD and G standards it **may not cite a percentage at all**, because
   their band is shared". Its third test enforces this with
   `/\d+\s*[-–]\s*\d+\s*%|\b\d+\s*%/` returning `false` for every MD and G guide.
2. **Source says** — the plan's Content Contract:
   > "`whyItMattersForSSA` must cite a real figure — the domain's blueprint band for grades 3–5 …
   > and **never a weight for a single domain inside a combined band**."
   And `nc-eog-blueprint.json` grade 4: `{ "domains": ["MD","G"], "range": "23–27%", "midpoint": 25 }`
   — the 23–27% band *is* a published figure, for the pair.
3. **The contract is right and the brief over-corrects.** "Measurement and Geometry together are
   23–27% of the Grade 4 EOG" cites a real published figure and attributes it to the pair, exactly
   as `weightLabel()` renders it in the UI. The brief's test would reject that compliant sentence.
   The defect the constraint targets is a *single-domain* claim ("Geometry is 12% of the test"),
   which is what commit 6a851cf removed.
4. **Correction:** permit the combined band in MD/G guides **only when the sentence names both
   domains**, and retarget the test: assert that any percentage appearing in an MD or G guide is
   the group band `23–27%` and that the same sentence mentions both Measurement and Geometry;
   reject any other percentage. If the controller prefers the stricter rule, keep it — but then say
   in the brief that the contract's "must cite a real figure" is satisfied for MD/G by naming the
   reporting category, so the implementer does not think the two documents conflict.
5. **Cost if wrong:** under the strict rule, MD/G guides lose a legitimate motivating figure — a
   pedagogical loss, not a correctness one. Under the relaxed rule the risk is an implementer
   writing "Geometry is 23–27%" alone, which the retargeted test catches.

### 10.2 — The test never checks that OA/NBT/NF cite the *correct* band (MEDIUM, defect class E)

1. **Brief says (Step 3):** "For OA, NBT, and NF standards, `whyItMattersForSSA` may cite the domain
   band — 14–18%, 25–29%, 30–34% respectively." No test asserts this.
2. **Source says** (`nc-eog-blueprint.json`, grade 4): OA 14–18%, NBT 25–29%, NF 30–34%. Those three
   figures in the brief are **correct**. But `integrity.test.ts` already demonstrates the check that
   belongs here — it asserts that any percentage quoted in `weightCategory` is that domain's own
   published band, and its comment records that Grade 5 shipped seventeen invented per-standard
   shares before that test existed.
3. **The brief under-asserts.** Its third test guards the MD/G case and nothing else; an implementer
   who writes "Fractions are about 40% of the Grade 4 test" in an NF guide ships green.
4. **Correction:** extend the third test to every guide — for each guide, extract every percentage
   from `whyItMattersForSSA` and assert it appears in that standard's own domain
   `officialWeightRange`, mirroring `integrity.test.ts`'s `weightCategory` assertion; keep the
   MD/G-specific rule on top of it.
5. **Cost if wrong:** an over-strict test could flag a legitimate non-weight percentage (see 10.4).
   That is a one-line exclusion. The cost of omitting it is the exact defect class this audit exists
   to prevent, in the one field of the guide a parent is most likely to quote.

### 10.3 — "title matching the standard's title" is prose, not an assertion (LOW)

1. **Brief says (Step 3):** "`title` matching the standard's `title` in `standards.ts`".
2. **Source says:** the brief's own first test asserts only
   `expect(guide.standardCode).toBe(s.code)` and `title.trim().length > 0`.
3. **The brief is right about the requirement and silent in the test.**
4. **Correction:** in the first test, add `expect(guide.title).toBe(s.title)`. It is one line and
   it makes the "one guide per standard" test actually verify the guide is *about* that standard.
5. **Cost if wrong:** if the controller intends study-guide titles to be child-friendly rewordings
   rather than the standard's formal title, this assertion is wrong and should instead be dropped
   from Step 3's prose. Decide one way; do not leave the two disagreeing.

### 10.4 — The percentage regex will false-positive on mastery language (LOW)

1. **Brief says:** the MD/G guard is `/\d+\s*[-–]\s*\d+\s*%|\b\d+\s*%/`.
2. **Source says:** the Global Constraints put an `80%` SSA passing bar and a "practice targets 100%
   mastery" framing in front of every author, and Grade 5's guides use motivating prose
   (`grade5/studyGuides.ts:32`, `:64`, `:97`) rather than weights.
3. **The brief's intent is right, the regex is blunt.** "You need 80% to qualify" in an MD guide
   fails a test whose message says the guide "cites a percentage for a domain that shares a band" —
   a misleading failure that will cost the implementer time.
4. **Correction:** exclude the SSA bar explicitly (e.g. strip `80%` and `100%` before matching) or
   phrase the assertion against `officialWeightRange`-shaped strings only, and fix the failure
   message to say what it actually matched.
5. **Cost if wrong:** an implementer works around a confusing red test by deleting a true and useful
   sentence.

---

## Task 11 — Register Grade 4

### 11.1 — CRITICAL: the quiz test asserts an item-id prefix no Grade 4 item uses

1. **Brief says (Step 1 test):**
   ```ts
   expect(id.startsWith('g4.'), `quiz ${q.id} carries non-grade-4 item ${id}`).toBe(true);
   ```
   The plan's Content Contract agrees, giving the convention as "`g4.nf1-01`, `g3.oa7-02`".
2. **Source says** — the content already committed by Tasks 5–7:
   `src/curriculum/grade4/authored.oa.ts:48` → `id: 'g4-oa1-01'`;
   `authored.nf.ts` → `'g4-nf1-01'`, `'g4-nf2-01'`; `authored.nbt.ts` likewise. A grep for
   `id: 'g4.` across every file in `src/curriculum/grade4/` returns **zero matches**; all 63+
   committed Grade 4 ids use a hyphen.
3. **The tree is right and both the test and the plan's contract are wrong.** The ids are shipped,
   referenced from nowhere-else-yet, but renaming 63 ids to satisfy a brief sentence is gratuitous
   churn, and the hyphen form is what `authored.md.ts` (in flight) is also using. As written, this
   test fails on **every** quiz item at Step 6, and the natural "fix" — renaming every item — is the
   expensive wrong one.
4. **Correction:** change the assertion to `id.startsWith('g4-')`, and correct the Content
   Contract's stated convention to `g4-nf1-01` / `g3-oa7-02` so Grade 3 does not repeat the split.
5. **Cost if wrong:** if the controller genuinely wants dotted ids, the correction is backwards and
   Tasks 5–8's banks need a rename — so this should be confirmed, not assumed. But the test as
   written cannot pass against anything currently on disk, so it must change one way or the other
   before Task 11 starts.

### 11.2 — Registering Grade 4 breaks a pinned assertion in a file the brief never lists

1. **Brief says:** Files → Modify: `src/curriculum/registry.ts`. Nothing else. Step 6 says "read any
   failure as a real finding about Grade 4, not as noise."
2. **Source says** (`src/curriculum/registry.test.ts:19-21`):
   ```ts
   it('lists only grades that actually have modules', () => {
     expect(listCurricula().map((c) => c.grade)).toEqual([5]);
   });
   ```
   This is a hard-pinned expectation that goes red the moment `CURRICULA` gains key `4`. (The
   sibling `expect(() => getCurriculum(3)).toThrow(/no curriculum/i)` stays valid — Grade 3 is a
   later batch — and `registry.ts` does throw `No curriculum module for grade ${grade}`, which
   matches.)
3. **The test is right to be pinned; the brief's file list is incomplete.** Combined with Step 6's
   instruction, an implementer hitting this will hunt for a Grade 4 content defect that does not
   exist.
4. **Correction:** add `src/curriculum/registry.test.ts` to the Modify list, with the specific edit:
   `toEqual([5])` → `toEqual([4, 5])` (note `listCurricula()` sorts ascending, so the order is
   `[4, 5]`, not `[5, 4]`). Reword Step 6 to say "one pinned expectation in `registry.test.ts` is
   *expected* to fail and its update is part of this task; every other failure is a real finding."
5. **Cost if wrong:** none — the assertion has to change regardless; naming it just saves the
   implementer the hunt.

### 11.3 — `grade4.test.ts` re-implements two assertions `integrity.test.ts` already runs (LOW, defect class E)

1. **Brief says (Step 1):** `grade4.test.ts` includes "totals its domain weights to 100 through
   domainWeight" (`>99`, `<101`) and "has content for all 25 standards" plus
   `expect(GRADE_4.contentComplete).toBe(true)`.
2. **Source says:** `src/curriculum/integrity.test.ts` runs `describe.each(listCurricula())` and
   already contains `it('totals every domain weight to 100')` with the identical `>99 / <101`
   bounds and the identical reduce, plus `it('covers every standard when the grade is
   content-complete')` and `it('writes a study guide for every standard when content-complete')`.
   Once Task 11 registers Grade 4, both run against it automatically.
3. **The duplication is real but low-cost**, and Grade 5 set the precedent (`grade5.test.ts` does
   the same). The two assertions worth keeping in `grade4.test.ts` are the ones that are *not*
   generic: `standardsOf(GRADE_4).length === 25` and the `hasGenerator >= 12` floor.
4. **Correction:** optional. If kept, add a comment saying the check also exists generically in
   `integrity.test.ts` and is repeated here so `grade4.test.ts` can be run alone. Do not let the
   implementer copy the weight-total block verbatim without that note.
5. **Cost if wrong:** removing them loses the ability to diagnose Grade 4 from one file. Keeping
   them costs a few lines that must be kept in sync by hand.

### 11.4 — The `hasGenerator >= 12` floor and the mock-SSA allocation are both sound; one caveat (LOW)

1. **Brief says:** `expect(generated.length).toBeGreaterThanOrEqual(12)`, and a mock SSA of
   "roughly 30 items … about 5 OA, 8 NBT, 10 NF, and 7 across MD and Geometry together."
2. **Source says:** `grade4/templates/index.ts` currently registers 17 templates covering **14
   distinct standards** (OA.1, OA.4; NBT.1, 2, 4, 5, 6, 7; NF.1, 2, 3, 4, 6, 7). Task 8 adds MD.1,
   MD.2 and MD.3, taking it to **17 distinct standards** — comfortably past 12. Task 9 adds none,
   by design. Blueprint grade 4 midpoints × 30: OA 16% → 4.8, NBT 27% → 8.1, NF 32% → 9.6,
   MD+G 25% → 7.5. The brief's 5 / 8 / 10 / 7 is the correct rounding of the published bands.
3. **Both claims are accurate.** The caveat: the floor is only met if Task 8 lands its three MD
   templates *and* registers them in `templates/index.ts` — Task 8's templates are on disk but the
   index has not yet been updated (it still ends "Tasks 8 and 9 append this grade's MD and G
   templates here"). At 14 registered standards the floor passes anyway, so this is a
   robustness note, not a blocker.
4. **Correction:** none required. Optionally add to Step 6 a check that `GRADE_4_TEMPLATES` includes
   the MD generators, since `allContent.ts` globs every template *file* and would not notice one
   missing from the index — its docstring says so explicitly.
5. **Cost if wrong:** none; this is a confirmation.

---

## D. Cross-task consistency

### Pairs sharing a file or interface

| Pair | Produced by | Consumed by | Agree? |
|---|---|---|---|
| 9 → 11 | `GRADE_4_AUTHORED: Question[]` from `grade4/authored.ts` | `makeQuestionSource(GRADE_4_AUTHORED, GRADE_4_TEMPLATES)` in `grade4/index.ts` | **Yes.** Name, path and type match; `makeQuestionSource(authored: Question[], templates: QuestionTemplate[])` is the real signature in `src/engine/questionSource.ts`. |
| 9 → 11 | Authored item ids `g4-*` (Tasks 5–9) | `grade4.test.ts` asserts `startsWith('g4.')`; `quizzes.ts` `questionIds` | **No — finding 11.1.** Separator mismatch; Task 11's test cannot pass. |
| 9 → 11 | Nine+ Geometry items, no Geometry template | `grade4.test.ts` `hasGenerator >= 12` | **Yes.** 17 standards have generators without Geometry (finding 11.4). |
| 9 → 11 | Authored coverage of all 25 standards (asserted in `authored.g.test.ts`) | `integrity.test.ts` coverage gate once `contentComplete: true` | **Yes**, provided Task 8's MD bank lands. Task 9's aggregate test is the earlier tripwire. |
| 10 → 11 | `GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection>` | `studyGuides:` field on `GRADE_4` | **Yes.** `GradeCurriculum.studyGuides` is `Record<StandardCode, StudyGuideSection>`; `StudyGuideSection` is exported from `src/types/index.ts` with exactly the fields Task 10's test probes, including `workedExample.whyItMattersForSSA`. |
| 10 → 11 | 25 guides, one per standard | `integrity.test.ts` "writes a study guide for every standard when content-complete" and "keys every study guide to a standard of this grade" | **Yes.** Task 10's own test is a strict superset; Task 11 flips the gate that makes the generic one run. |
| 9 → 10 | Distractor misconception wording | Step 3: `commonTraps` "naming the same errors the authored distractors use, in the same words" | **Weakly.** Nothing asserts it, and Task 9's Geometry tags do not exist yet (finding 9.3). Task 10 must be run after Task 9, which the ordering already implies. |
| 9 + 10 → 11 | Both feed `GRADE_4`; neither registers | `contentComplete: true` + `CURRICULA[4]` flipped together in Task 11 only | **Yes — the plan's rule is honoured.** `contentComplete` and the registry entry are both set for the first time in Task 11 Steps 4–5, nowhere earlier. Verified: no `grade4/index.ts` exists in the tree today, and `registry.ts` currently holds `{ 5: GRADE_5 }` only. |
| 11 → existing tests | `CURRICULA` gains key `4` | `registry.test.ts` `toEqual([5])` | **No — finding 11.2.** |

### Each task against itself

| Task | Self-consistent? |
|---|---|
| 9 | **Mostly.** The test it specifies matches the code it specifies (`assertAuthoredBankSound(items, domain, opts?)` is the real signature; `GRADE_4_DOMAINS.find(d => d.id === 'G')` is real). Two internal gaps: it creates `authored.ts` but specifies no `authored.test.ts` while the contract demands a sibling test for every authored file (9.4), and its "no templates" decision contradicts a docstring in a file it does not list as Modify (9.4). Its Step 3 content guidance is narrower than the standards it claims to cover (9.1, 9.2). |
| 10 | **No.** Step 3 permits domain bands for OA/NBT/NF but the test it specifies checks no band anywhere (10.2); Step 3 mandates `title` matching `standards.ts` but the test asserts only non-emptiness (10.3); and its MD/G rule is stricter than the plan's contract it claims to implement (10.1). |
| 11 | **No.** Step 1's quiz test contradicts the ids Steps 3 and 5 will actually reference (11.1); Step 6 promises a green suite while Step 5's edit is guaranteed to redden a file Step 1 never lists (11.2). Steps 4, 5, 7 and 8 are internally consistent and match the tree. |

---

## Verified accurate — brief claims checked and found correct

**Counts and codes**
- Grade 4 has exactly **25** standards (`standards.ts`: NF 6, NBT 6, MD 6, G 3, OA 4). Task 10's "25 entries" and Task 11's `standardsOf(GRADE_4).length === 25` are both right.
- Task 9's three Geometry codes `NC.4.G.1`, `NC.4.G.2`, `NC.4.G.3` all exist in `standards.ts`, all carry `domainId: 'G'`, and no other code does. No invented code appears in any of the three briefs.
- Task 9's statement that Grade 4 Geometry has no measurement content is correct: protractor work and angle arithmetic are `NC.4.MD.6`, not `G`.
- Task 9's distractor mathematics is sound: a non-square rectangle's diagonal is genuinely **not** a line of symmetry, and a rhombus is genuinely not a square unless its angles are right.

**Weights**
- Blueprint grade 4 bands (`nc-eog-blueprint.json`): OA 14–18% (mid 16), NBT 25–29% (27), NF 30–34% (32), MD+G 23–27% (25). Task 10's three quoted bands match exactly.
- MD and G in `standards.ts` both carry `officialWeightRange: '23–27%'`, `officialWeightMidpoint: 25`, `weightGroup: 'MD+G'`, `weightGroupLabel: 'Measurement & Data and Geometry combined'` — the combined-band contract is already satisfied by the sourced file.
- Task 11's weight total is achievable through `domainWeight()`: 16 + 27 + 32 + (25 × 6/9) + (25 × 3/9) = 100.000. The brief correctly routes through `domainWeight()` and never sums raw midpoints.
- Task 11 Step 7's expected UI string "23–27% (Measurement & Data and Geometry combined)" is byte-for-byte what `weightLabel()` in `registry.ts` produces.
- Task 11's mock-SSA allocation (5/8/10/7 of 30) is the correct proportional rounding of the published bands.
- No number in any of the three briefs was found that does not trace to `nc-eog-blueprint.json`.

**Interfaces (all confirmed present with the named shape)**
- `assertAuthoredBankSound(items: Question[], domain: DomainInfo, opts?: { itemsPerStandard?: number })` — `src/curriculum/authoredBank.testkit.ts`. Import path `'../authoredBank.testkit'` from `grade4/` is correct.
- `GRADE_4_DOMAINS` — `src/curriculum/grade4/standards.ts`.
- `GRADE_4_TEMPLATES` — `src/curriculum/grade4/templates/index.ts` exists already (17 templates).
- `makeQuestionSource` — `src/engine/questionSource.ts`; `QuestionSource` exposes `allStandardsWithContent()`, `hasGenerator()`, `authoredFor()`, `itemsFor()`, `resolve()`, `templates()`. Task 11's test uses only real members.
- `getCurriculum`, `listCurricula`, `standardsOf`, `domainWeight` — all exported from `src/curriculum/registry.ts`.
- `GradeCurriculum` (`src/curriculum/types.ts`) requires exactly the fields Task 11's `GRADE_4` literal supplies: `grade`, `label`, `ssa {passingPercent, targetsGrade}`, `weighting`, `contentComplete`, `domains`, `quizzes`, `studyGuides`, `source`. Nothing missing, nothing extra.
- `Weighting` accepts `{ kind: 'ncdpi-blueprint'; source: string }` — Task 11's value is valid, and its source string matches `nc-eog-blueprint.json`'s `source` field verbatim (better than Grade 5's, which does not).
- `StudyGuideSection` (`src/types/index.ts`) — `standardCode`, `title`, `coreConcept`, `rulesAndFormulas: {label, detail}[]`, `stepByStepMethod: string[]`, `commonTraps: string[]`, `workedExample: {problem, steps, answer, whyItMattersForSSA}`. Every field Task 10's test touches is real.
- `QuizDefinition` (`src/types/index.ts`) — `subtitle: string | ((c: GradeCurriculum) => string)`, `domainId?`, `isDiagnostic?`, `isMockAssessment?`, `timeLimitMinutes?`, `questionIds: string[]`. Task 11's Step 3 quiz shapes are all expressible, including the curriculum-function subtitle (Grade 5 uses exactly that form).
- `DomainInfo.weightGroup` exists — Task 10's third test can read it.
- Grade 4 quiz ids `g4-diagnostic-01` etc. do not collide with Grade 5's bare `diagnostic-01` / `mod-*-01` / `mock-ssa-01`.
- The `shape-classification` misconception family exists (`misconceptions.ts:18`) — Task 9's claim about the family is true (its claim about the *tags* is not; see 9.3).

**Process claims**
- Task 11's "puts a second option in the navbar's grade picker" is correct and requires no component edit: `src/components/Navbar.tsx:48` and `src/components/FirstRunScreen.tsx:15` both read `listCurricula()`; `Grade` already includes `4`.
- Task 9's "`CurriculumView` will badge them 'Fixed Question Set'" is correct — `src/components/CurriculumView.tsx:132,150,162` drives that badge from `curriculum.source.hasGenerator(standard.code)`.
- Neither Task 9 nor Task 11 needs to touch `src/curriculum/allContent.ts`: it discovers content by `import.meta.glob` over `./grade*/authored*.ts` and `./grade*/templates/*.ts`, so new files are picked up automatically. The briefs correctly omit it.
- Task 11's Step 3 claim that the quiz-id integrity test exists is correct — `integrity.test.ts` "defines quizzes that only reference this grade's own questions" checks `questionIds` against `authoredFor()`.
- Task 11's Step 8 network grep matches the Global Constraint's COPPA rule.
- `grade4/index.ts`'s narrower re-export list (only `GRADE_4_DOMAINS`, vs Grade 5's four) breaks nothing: a tree-wide grep finds no consumer of `getStandardByCode`, `getDomainById` or `GRADE_5_STANDARDS` outside `grade5/index.ts` itself.
- The `contentComplete`/registration co-timing rule from the Global Constraints is honoured by Task 11 and violated by neither Task 9 nor Task 10.
