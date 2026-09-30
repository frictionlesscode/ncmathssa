# NC Math SSA Prep (Wake County Math Acceleration, Grades 1–5)

A web application built to help students prepare for **North Carolina Single
Subject Acceleration (SSA)** to skip ahead a grade in mathematics in the
**Wake County Public School System (WCPSS)**.

**Current scope: Grades 1 through 5.** Every grade's curriculum, question
bank, and adaptive engine are described below; the sections under "Program
Structure" and the architecture notes were written against Grade 5 first and
carry its numbers as the worked example, but the same structure now backs
Grades 1–4 as well (`src/curriculum/grade1/` through `grade4/`).

---

## Assessment Reality & Methodology

- **Target Assessment**: Above-grade-level comprehensive assessment administered by WCPSS and built by **CASE** (Collaborative Assessment Solutions for Educators).
- **Qualifying Cutoff**: **80% or higher** on the comprehensive assessment.
- **Honest Blueprint**: Because the secure CASE item bank is strictly confidential and never made public, this application does **not** guess or fabricate real test items. Instead, the entire curriculum and question bank is built directly against the official, public **North Carolina Standard Course of Study (NCSCOS)**, per grade. NCDPI publishes an EOG blueprint (a published weight range per domain) only for **Grades 3–5**; Grades 1–2 have no state assessment to weight against, so their domains are weighted evenly by standard count instead, and the app never shows a percentage as an official weight for those two grades.
- **Assessment Format**: Every question is **multiple choice**. There is no open-response or free-text entry. Each wrong option is engineered to be the answer a specific, named misconception produces (e.g. "added the denominators" for a fraction-addition slip), so a missed question is diagnostic, not just wrong.
- **Practice test**: A full-length simulation without mid-quiz answer hints, taken at the end of the path. It reports the overall score against the 80% cutoff ("Ready to try for SSA") and shows full worked step-by-step solutions.

---

## Program Structure: 5 Domains & 17 Standards (Grade 5)

### 1. Operations & Algebraic Thinking (OA) — 9–13% Blueprint Weight
- **NC.5.OA.2**: Write, explain, and evaluate numerical expressions with four operations (up to two steps); parentheses, brackets, and braces; order of operations; commutative, associative, and distributive properties.
- **NC.5.OA.3**: Generate two numerical patterns from two rules; identify relationships; form ordered pairs; graph them on a coordinate plane.

### 2. Number & Operations in Base Ten (NBT) — 25–29% Blueprint Weight
- **NC.5.NBT.1**: Place value patterns from one million to thousandths; $10\times$ and $\frac{1}{10}$ relationships; patterns when multiplying and dividing by powers of 10.
- **NC.5.NBT.3**: Read, write, and compare decimals to thousandths (base-ten numerals, number names, expanded form; $>$, $=$, $<$).
- **NC.5.NBT.5**: Fluently multiply up to a three-digit by a two-digit number using the standard algorithm.
- **NC.5.NBT.6**: Divide up to four-digit dividends by two-digit divisors (arrays, area models, partial quotients, multiplication/division relationship).
- **NC.5.NBT.7**: Add, subtract, multiply, and divide multi-digit whole numbers and decimals to hundredths; estimation to check reasonableness.

### 3. Number & Operations — Fractions (NF) — 39–43% Blueprint Weight (Highest Priority)
- **NC.5.NF.1**: Add and subtract fractions and mixed numbers with unlike (related) denominators; benchmark estimation; one- and two-step word problems.
- **NC.5.NF.3**: Interpret a fraction as division of numerator by denominator ($a/b = a \div b$); equal-sharing division word problems.
- **NC.5.NF.4**: Multiply a fraction or whole number by a fraction, including mixed numbers; area and length models; reasoning about how factors affect the product.
- **NC.5.NF.7**: Divide unit fractions by whole numbers and whole numbers by unit fractions.

### 4. Measurement & Data (MD) — 12–15% Blueprint Weight
- **NC.5.MD.1**: Convert measurement units within a system (customary and metric) using multiplicative reasoning.
- **NC.5.MD.2**: Represent and interpret data; line graphs and plots with fractional intervals ($\frac{1}{8}, \frac{1}{4}, \frac{1}{2}$).
- **NC.5.MD.4**: Volume as an attribute of 3D solids; measure volume by counting unit cubes.
- **NC.5.MD.5**: Relate volume to multiplication and addition ($V = l \times w \times h$ and $V = B \times h$); volume of rectangular prisms and composed composite 3D figures.

### 5. Geometry (G) — 7–10% Blueprint Weight
- **NC.5.G.1**: Graph points in the first quadrant of the coordinate plane; interpret $x$ and $y$ coordinates in real-world contexts.
- **NC.5.G.3**: Classify two-dimensional figures (polygons, quadrilaterals, trapezoids, parallelograms, rectangles, rhombuses, squares) by properties in a hierarchy.

> **Question pool note:** 10 of the 17 standards have a seeded question
> generator, which supplies effectively unlimited practice items. The other
> 7 — **NC.5.G.1, NC.5.G.3, NC.5.MD.2, NC.5.MD.4, NC.5.NF.3, NC.5.OA.2, and
> NC.5.OA.3** — currently have hand-authored questions only, so their
> practice pool is small and will repeat sooner than the generated
> standards. This is a known gap, not an oversight; see `src/curriculum/grade5/templates/`
> for the current generator set.

---

## How it works

1. **Set up.** After agreeing to the disclaimer, enter the student's name and grade.
2. **Parent home.** One page shows how ready the student is (goal: 80%), how they're doing on each topic, and whether they're on track for the test date. One button always says what to do next.
3. **Check-up (optional).** A short test that finds topics the student already knows, so practice skips them.
4. **Three rounds across every topic.**
   - Round 1: try every topic.
   - Round 2: get every topic to 80%.
   - Round 3: test-ready practice under test conditions.
5. **Practice test.** A full practice test. Scoring 80% or better shows "Ready to try for SSA".

Hand the device to the student for each session. Practice gives feedback after every question, and missed questions come back in later sessions. At the end the student hands it back and the parent sees a short summary. Progress is saved after every answer, so closing the tab loses nothing.

**Short on time?** Set a test date within two weeks and the path skips ahead to the weakest topics, then the practice test.

The "Detailed view" link on the home page keeps the full breakdown by NC standard, study guides and per-standard drills.

**Also available**

- Calculator, on the questions where a calculator is allowed
- Scratchpad for working out answers
- Printable report of progress
- Weak-spots and per-standard drills in Detailed view
- Multiple students, each with their own progress

**Spaced review.** A missed question returns on the existing Leitner schedule: after 1 day, then 3, 7, 16 and 35 days each time it is answered correctly.
A wrong answer sends it back to 1 day, and after one more correct answer at 35 days it is retired.

---

## Architecture

The refactor this app went through separates *what the questions are* from
*how they get chosen and served*, so that supporting a new grade is a data
change, not a new component.

- **`src/curriculum/`** — curriculum as data. One module per grade
  (`grade1/` through `grade5/`) exports a `GradeCurriculum`: its domains,
  standards, official blueprint weighting (or an even-by-standard-count
  weighting for grades with no state blueprint), and a `QuestionSource`.
  `src/curriculum/registry.ts` is the single place that lists which grades
  exist; the UI (first-run picker, profile grade selector) reads that
  registry rather than hardcoding a grade.
- **Two question sources, one interface** — `src/engine/questionSource.ts`
  defines `QuestionSource`, implemented by `makeQuestionSource()` over two
  kinds of content per standard: hand-authored items
  (`src/curriculum/grade5/authored.ts`) and seeded generator templates
  (`src/curriculum/grade5/templates/`, one file per standard) that produce
  effectively unlimited fresh instances from a numeric seed. Callers ask
  for `itemsFor(standardCode, { count, seedBase })` and get back a mix of
  both, without caring which standard has which.
- **`src/engine/`** — the adaptive engine, curriculum-agnostic:
  - `mastery.ts` computes per-standard mastery status from quiz attempts.
  - `scheduler.ts` is the Leitner-style spaced-review scheduler.
  - `sessionComposer.ts` composes a practice session from due reviews plus
    tiered standard selection (struggling > untested > going-well).
  - `questionModel.ts` and `template.ts` define the `Question` / answer
    option / misconception-tag shape and how a template realizes into a
    concrete question given a seed.
  - `path.ts` derives the check-up / rounds / practice-test position from attempts.
  - `pace.ts` computes the on-track status and the weekly plan.
  - `pathSession.ts` builds the next session for the current step.
  - `activeSession.ts` is the saved in-progress session stored on the profile.
  - `sessionSummary.ts` builds the end-of-session results.
- **`src/components/DetailedView.tsx`** — the old tabs (dashboard, standards, quizzes, weak spots) now live here, behind the "Detailed view" link.
- **`src/state/`** — app state, with a versioned schema
  (`AppStateV2`: multiple `Profile`s plus an `activeProfileId`) and a pure,
  tested `migrate()` that upgrades older single-profile saves without
  losing quiz history or the error bank.

### Adding a grade

Because curriculum is data and the engine is not, adding a grade does not
touch `src/engine/` or the components under `src/components/`:

1. Add `src/curriculum/gradeN/standards.ts` with that grade's domains and
   standards, transcribed from the published NCSCOS document for that
   grade (not recalled from memory — see the standards-integrity check
   below).
2. Set `weighting` to the NCDPI blueprint for grades with a state EOG
   assessment, or `{ kind: 'even-by-standard-count' }` for grades without
   one (currently grades 1–2), and label the UI gauge accordingly.
3. Author multiple-choice items and/or write seeded generators for each
   standard, and wire them into a `QuestionSource` via
   `makeQuestionSource()`. Leave `contentComplete: false` on the
   `GradeCurriculum` until every standard has at least one source — this
   gates a coverage assertion in the integrity test suite
   (`src/curriculum/integrity.test.ts`).
4. Register the grade in `src/curriculum/registry.ts`. That alone makes it
   selectable in the first-run picker and the profile grade selector —
   no other file needs to change.

---

## Running the Web App Locally

```bash
# Navigate to the project directory
cd ncmathssa

# Install dependencies
npm install

# Start the local development server
npm run dev

# Or build and run production preview
npm run build
npm run preview
```

Open the URL Vite prints in the console, including the `/ncmathssa/` path
(its default is `http://localhost:5173/ncmathssa/`, but it will pick the
next free port if that one is busy).

### Tests and checks

```bash
npm run test:run   # runs the test suite once and exits (CI-safe)
npm test           # watch mode — reruns on file changes; not for CI
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit, project references
npm run build      # tsc -b && vite build
```

`.github/workflows/ci.yml` runs lint, typecheck, `test:run`, and build on
every pull request and on pushes to `master`.

## Live Site

The app is published to GitHub Pages at
**https://frictionlesscode.github.io/ncmathssa/** by
`.github/workflows/deploy.yml`, which runs only after the CI workflow succeeds on
`master` (a red CI never publishes; to redeploy, re-run the deploy workflow from the
Actions page).

---

## Status: Grades 1–5 Complete

Grades 1 through 5 are all registered and playable (`src/curriculum/registry.ts`).
Grades 1–2 use `{ kind: 'even-by-standard-count' }` weighting because NCDPI
publishes no state EOG blueprint below grade 3; Grades 3–5 weight domains by
the published NCDPI blueprint. Adding a future grade (e.g. Grade 6) follows
the same four steps under [Adding a grade](#adding-a-grade) above.

---

## Disclaimer

This is an independent, unofficial practice tool. It is not affiliated with,
endorsed by, or produced by WCPSS, NCDPI, CASE, or any school or district. Its
questions were written from publicly available information only; the actual
test is secure and not public, so nothing here is a real test item. It is
provided as is, with no guarantee of accuracy or of any test or placement
outcome, and is used at your own risk. The app asks every visitor to agree to
this, including a hold-harmless clause, before it can be used
(`src/components/DisclaimerGate.tsx`).

## License

[MIT](LICENSE).
