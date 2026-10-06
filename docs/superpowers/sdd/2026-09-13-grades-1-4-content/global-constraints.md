# Global constraints binding every content task (verbatim from the plan, lines 13-69)

## Global Constraints

- **Rounding is not in NC's grades 1–5 mathematics standards.** CCSS has it at 4.NBT.A.3; North Carolina's revised NCSCOS does not, at any grade in this plan. This plan named `NC.4.NBT.7` "rounding" in its first draft — that came from model recall, not from the source, and the Grade 4 Base Ten implementer caught it by reading the sourced text instead of the brief. `NC.4.NBT.7` is comparison with `>`, `=` and `<`. When a brief and `standards.ts` disagree, **`standards.ts` wins** — it is transcribed from the published document and this plan is not.
- **Never invent an NC standard code, a standard's text, or a blueprint weight.** Every code and every domain weight in this plan comes from `docs/sources/nc-standards-1-5.json` and `docs/sources/nc-eog-blueprint.json`, transcribed from published NCDPI documents and described in `docs/sources/PROVENANCE.md`. Tests assert the TypeScript against those JSON files. If a value you need is not in them, stop and say so — do not supply it from memory.
- **Codes, weights, and `ssa` figures are three separate claims against three documents** (spec §5.3). Verifying one does not verify another.
- **Grades 1–2 have no NCDPI blueprint** — no EOG exists below grade 3. Their `weighting` is `{ kind: 'even-by-standard-count' }` and their UI must not imply an official weight exists.
- **Grades 3–5 weight Measurement & Data together with Geometry as one band.** Both domains carry the same `officialWeightRange` and `officialWeightMidpoint` plus `weightGroup: 'MD+G'` and `weightGroupLabel: 'Measurement & Data and Geometry combined'`. Any total must be computed through `domainWeight()`, never by adding raw midpoints.
- **`ssa: { passingPercent: 80, targetsGrade: N }`** for every grade. 80% is the WCPSS Single Subject Acceleration qualifying bar; the owner has confirmed it applies at each grade, and practice targets 100% mastery regardless.
- **Every question is multiple choice with exactly four options** (spec §4.1) — the NC EOG and the CASE assessment used for SSA are multiple choice.
- **Every incorrect option carries a `misconception` tag naming the specific error that produces it.** Never a filler number. `labelOptions()` throws if a wrong option has no tag.
- **Every misconception tag must be declared in `src/curriculum/misconceptions.ts`** with a family and a one-sentence description addressed to a parent, and every declared tag must be used by some content — `misconceptions.test.ts` fails in both directions. That check reads **all content on disk, registered or not** (`src/curriculum/allContent.ts`), so a content task may freely declare a new tag long before its grade registers. **Never reuse a tag that names a different error just to avoid declaring one** — a mis-filed tag tells a parent their child made a mistake they did not make, which is worse than no tag at all.
- **The app makes zero network calls.** Users are children; nothing leaves the browser (COPPA). No `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, or analytics import may enter the codebase.
- **`contentComplete: true` is flipped only when every standard in the grade has at least one authored item or template**, and a grade is registered in `registry.ts` only in the same task that flips it.
- Commit with the repo-local no-reply identity already configured. End every commit message with:

      Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
      Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1

- Verification gate for every task: `npm run lint` exits 0, `npx tsc -b --noEmit` is clean, and `npm test -- --run` is fully green. A task is not done with a red suite.

---

## The Content Contract

Tasks 5–26 all author curriculum content. They differ only in which grade and domain they cover; the contract below binds all of them and is not repeated in each task.

### Authored items

Each authored file exports `const GRADE_<N>_<DOMAIN>_AUTHORED: Question[]`, typed from `src/engine/questionModel.ts`, built with `labelOptions()`. Per standard, **at least three items**: one at `difficulty: 'mastery'`, one at `'advanced'`, and at least one more at either. Item ids follow the Grade 5 convention — the standard's tail, lowercased, then a two-digit ordinal, prefixed by grade for every grade except 5: `g4-nf1-01`, `g3-oa7-02`. The separator after the grade prefix is a HYPHEN, not a dot — this sentence said `g4.nf1-01` until Task 9-11 pre-flight found all 84 committed Grade 4 ids using the hyphen and a Task 11 test asserting the dot, which could not have passed. (Grade 5's existing ids stay bare — `nf1-01` — and must not be renamed.)

Every item needs:

- `prompt` — the question. `promptDetails` for an expression, a table, or a figure description.
- Four `options`; the correct one at a varied position, never always A.
- Each incorrect option: the value a student actually reaches by making one named error, with that error as its `misconception` tag and a `//` comment above it showing the arithmetic that produces it.
- `explanation.stepByStep` — the worked solution, the last step stating the answer.
- `explanation.conceptSummary` — one or two sentences on the underlying idea.
- `explanation.commonMisconception` — the trap, in a sentence.
- `calculatorAllowed`, `isStretch`, `difficulty`.

**Age-appropriateness is part of correctness.** A Grade 1 item's prompt must be readable by a six-year-old: short sentences, numbers within the standard's stated range, no multi-clause setups. A Grade 1 or 2 item may not require reading a paragraph to find the arithmetic.

### Templates (seeded generators)

A standard whose practice value comes from fresh numbers gets a template in `src/curriculum/grade<N>/templates/<domain-tail>-<slug>.ts` exporting a `QuestionTemplate`. Reasoning standards, classification standards, and multi-step word problems stay authored — there the wording carries the mathematics.

Every template must be deterministic in its seed, emit exactly four options with distinct texts at **every** seed, and pass `assertTemplateSound()` from `src/engine/templateTesting.ts` at 300 runs. Where two distractor formulas could collide at some seeds, exclude the colliding parameters by construction and document the algebra in a file comment, as `md5-prism-volume.ts` does — do not paper over it by resampling in a loop.

### Study guides

Each grade exports `const GRADE_<N>_STUDY_GUIDES: Record<string, StudyGuideSection>` keyed by standard code, one entry per standard, shaped by the `StudyGuideSection` interface. `whyItMattersForSSA` must cite a real figure — the domain's blueprint band for grades 3–5, or the domain's share of the grade's standards for grades 1–2 — and never a weight for a single domain inside a combined band.

### Tests

Every authored file gets a sibling `.test.ts` asserting, over that file's items: unique ids, exactly one correct option each, four options each, every wrong option tagged, every `standardCode` belonging to this grade's domain, and each standard in the domain having its floor of three items. Every template gets a sibling `.test.ts` calling `assertTemplateSound()` plus at least two fixed-seed tests pinning a known question and its correct answer.

---
