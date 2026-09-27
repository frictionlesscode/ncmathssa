# Rulings on the Tasks 9/10/11 pre-flight

These OVERRIDE the task briefs wherever they conflict. The full audit is in
`task-9-11-preflight.md`; this file is the binding decision on each finding.

## Task 9 — Grade 4 Geometry

**9.1 UPHELD — `NC.4.G.2` covers triangles as well as quadrilaterals.** The sourced
text is "Classify quadrilaterals **and triangles** based on angle measure, side
lengths, and the presence or absence of parallel or perpendicular lines." The brief
names only quadrilaterals. `standards.ts` wins. G.2 needs at least one
triangle-classification item (acute/right/obtuse, scalene/isosceles/equilateral)
alongside the quadrilateral items, and classification must be exercised on all three
listed criteria, not on side length alone. Use NC's INCLUSIVE trapezoid definition
(at least one pair of parallel sides); `used-exclusive-trapezoid-definition` already
exists in `misconceptions.ts` for the error.
Cost if wrong: one or two extra items in a bank whose floor is three.

**9.2 UPHELD — `NC.4.G.1` is a six-object standard, not a ray-vocabulary standard.**
Sourced text: "Draw and identify points, lines, line segments, rays, angles, and
**perpendicular and parallel lines**." Two of its four keyConcepts are parallel and
perpendicular lines, both absent from the brief. G.1's floor must cover the
ray/segment/line distinction AND parallel-vs-perpendicular identification.
Cost if wrong: an extra item.

**9.3 UPHELD — declare new misconception tags; do not borrow classification tags for
symmetry.** The brief's "the shape-classification family already exists for exactly
this kind of error" is misleading: the registry has no tag for symmetry, for
ray-vs-segment naming, or for parallel/perpendicular confusion. Two of the three
distractors the brief itself names are symmetry errors with no tag. Reusing a
classification tag for them violates the Global Constraint "Never reuse a tag that
names a different error just to avoid declaring one" — it would tell a parent their
child made a polygon-hierarchy error when the child eyeballed a fold line. Declare
new, specific tags. `shape-classification` is the right family for the G.2
classification tags; the symmetry and line-object tags are new.
Cost if wrong: three or four extra entries, and `misconceptions.test.ts` fails in
both directions so an unused tag is caught immediately.

**9.4 RULED — create `src/curriculum/grade4/authored.test.ts` as the aggregator's
sibling.** The Content Contract says every authored file gets a sibling `.test.ts`,
and Grade 5 has `grade5/authored.test.ts` beside `grade5/authored.ts`. Burying the
aggregate's 25-standard coverage check inside `authored.g.test.ts` means deleting one
domain's test file silently deletes the only check that `GRADE_4_AUTHORED` is
complete. Move the two aggregate `describe` blocks there.
Also add `src/curriculum/grade4/templates/index.ts` to Task 9's Modify list: its
docstring currently ends "Tasks 8 and 9 append this grade's MD and G templates here",
which Task 9 contradicts by shipping no Geometry template. Fix that sentence to say
Geometry is authored-only by design, and why.
Cost if wrong: a file move, zero behavioural risk.

## Task 10 — Grade 4 study guides

**10.1 RULED — the combined band IS citable, but only when the sentence names both
domains.** The brief bans any percentage in an MD or G guide; the Content Contract
requires `whyItMattersForSSA` to cite a real figure and forbids only "a weight for a
single domain inside a combined band". `nc-eog-blueprint.json` publishes
`{domains:["MD","G"], range:"23–27%", midpoint:25}` — that is a real figure for the
PAIR, and `weightLabel()` already renders it that way in the UI. "Measurement and
Geometry together are 23–27% of the Grade 4 EOG" is compliant; the brief's test would
have rejected it. Retarget the test: any percentage in an MD or G guide must be the
group band `23–27%` AND its sentence must mention both Measurement and Geometry;
reject every other percentage. "Geometry is 23–27%" alone stays a failure.
Cost if wrong: the relaxed rule risks a single-domain claim, which the retargeted
test catches.

**10.2 UPHELD — assert the band in EVERY guide, not just MD/G.** The brief's OA
14–18%, NBT 25–29%, NF 30–34% are correct against the blueprint, but nothing tests
them, so "Fractions are about 40% of the Grade 4 test" would ship green. Extend the
test to every guide: extract each percentage from `whyItMattersForSSA` and assert it
appears in that standard's own domain `officialWeightRange`, mirroring the existing
`weightCategory` assertion in `integrity.test.ts` — which exists because Grade 5
shipped seventeen invented per-standard shares before it did. Keep the MD/G rule from
10.1 on top of it.

**10.3 RULED AGAINST THE BRIEF'S PROSE — study-guide titles need NOT equal the
standard's title.** The brief's prose says "title matching the standard's title" while
its own test only checks non-empty; the audit proposed asserting equality. The tree
settles it: Grade 5 matches exactly in some guides ("Place Value Patterns & Powers of
10") and deliberately rewords others ("Division with 2-Digit Divisors (Up to 4
Digits)" for "Divide Whole Numbers with 2-Digit Divisors"). A study guide is addressed
to a child and a parent; the standard's formal title is not always the right heading.
DROP the prose claim, keep the non-empty assertion, and add a uniqueness assertion
across guides. Do not assert equality.
Cost if wrong: guide headings drift from the standards' wording, which is what Grade 5
already does on purpose.

**10.4 UPHELD — exclude the SSA bar from the percentage guard.** `80%` (the SSA
qualifying bar) and `100%` (the "practice targets 100% mastery" framing) are in front
of every author via the Global Constraints and appear in Grade 5's motivating prose.
The brief's blunt regex would fail "You need 80% to qualify" with a message about
shared bands. Strip `80%` and `100%` before matching, or match only
`officialWeightRange`-shaped strings, and make the failure message name what it
actually matched.

## Task 11 — Register Grade 4

**11.1 RULED — the hyphen wins; the plan was wrong and has been corrected.** Every one
of the 84 committed Grade 4 item ids uses `g4-oa1-01` form; a grep for `id: 'g4.`
returns zero. The brief's test asserts `id.startsWith('g4.')`, which cannot pass, and
the obvious "fix" — renaming 84 ids — is the expensive wrong one. The assertion
becomes `id.startsWith('g4-')`. I have already corrected the plan's Content Contract
(line 41) to read `g4-nf1-01` / `g3-oa7-02` with a note recording why, so Grade 3 does
not repeat the split.
Cost if wrong: if dotted ids were genuinely wanted, Tasks 5-8's banks need a rename —
but nothing on disk or in the UI depends on the separator, and the shipped convention
is the cheaper truth.

**11.2 UPHELD — `registry.test.ts` is expected to go red and its update is part of
Task 11.** `registry.test.ts:19-21` pins `expect(listCurricula().map(c => c.grade))
.toEqual([5])`, which reddens the moment `CURRICULA` gains key 4. Add the file to the
Modify list; the edit is `toEqual([5])` -> `toEqual([4, 5])` (`listCurricula()` sorts
ascending). The sibling `expect(() => getCurriculum(3)).toThrow(/no curriculum/i)`
stays valid — Grade 3 is a later batch. Step 6's "read any failure as a real finding"
is amended: this ONE pinned expectation is expected to fail and updating it is part of
the task; every other failure is a real finding.

**11.3 RULED — keep `grade4.test.ts`'s duplicated assertions, with a comment.**
`integrity.test.ts` already runs the weight-total and content-complete checks
generically over `listCurricula()`, so they duplicate once Grade 4 registers. Grade 5
set the precedent and the value is diagnosing one grade from one file. Keep them, and
add a comment saying the check also exists generically in `integrity.test.ts` and is
repeated here deliberately. The genuinely non-generic assertions —
`standardsOf(GRADE_4).length === 25` and the `hasGenerator >= 12` floor — are the ones
that carry their weight.

**11.4 NOTED — the `hasGenerator >= 12` floor depends on Task 8 registering its
templates.** The brief's floor and its 5/8/10/7 mock-SSA allocation are both correct
against the blueprint (OA 16%, NBT 27%, NF 32%, MD+G 25% x 30 items). But the floor is
only met if Task 8 lands its MD templates AND registers them in
`templates/index.ts` — Task 8's step 5 requires exactly that, and Task 11 must verify
it rather than assume it.
