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
- **Test Mode**: Real test simulation without mid-quiz answer hints. On completion, an immediate diagnostic report card displays overall score, SSA qualification status against the 80% cutoff, and full worked step-by-step solutions.

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

## Core Application Features

1. **Overall SSA Readiness Gauge**:
   - Composite score dynamically weighted according to official NCDPI EOG weight midpoints (Fractions 41%, Base Ten 27%, Measurement & Data 13%, Algebraic Thinking 11%, Geometry 8%).
   - Visual gauge with prominent **80% WCPSS SSA benchmark marker**.
   - Tracks how many of the 17 standards have reached the Acceleration-Ready tier.

2. **Test-Taking Environment**:
   - Realistic test conditions with a timer and pause toggle.
   - Question Navigator Drawer to jump between answered, flagged, and unanswered questions.
   - **Calculator Inactive vs Calculator Active Sections**:
     - Strict "Calculator Inactive" banner on mental/computational problems.
     - Accessible built-in 4-function on-screen calculator on questions allowing calculators.
   - **Interactive Scratchpad Whiteboard**:
     - Built-in drawing canvas with pen, eraser, color swatches, and clear tool for working out long division, fraction math, and scratchwork directly on the screen.

3. **Adaptive Practice Engine**:
   - Every session is composed by the engine, not hand-picked: due spaced-review items first (capped so a bad week doesn't turn every session into remediation), then standards the student is struggling with, then untested standards, then standards already going well — weight only breaks ties within a tier.
   - A Leitner-style review scheduler tracks every missed question by a stable key (an authored item's id, or a generator template's id) and re-serves it on an expanding schedule (1, 3, 7, 16, 35 days); a correct answer promotes it, a miss sends it back to day 1, and enough correct answers in a row retires it from the queue.
   - Per-standard mastery requires a minimum sample size before a perfect run counts as "acceleration-ready" — a lucky streak of 3 questions doesn't flip the gauge.

4. **Difficulty Bias & Stretch Challenges**:
   - Questions trend toward the upper end of each standard (multi-step problems, reasoning over rote recall).
   - Includes **Above-Grade Stretch Questions** bridging 5th grade into 6th grade math (e.g. dividing fractions by fractions, rate ratios, composite prism volume) flagged clearly so pace tracking stays honest.

5. **Diagnostic Answer Options**:
   - Every incorrect multiple-choice option is tagged with the specific misconception that produces it (e.g. "found a common denominator but forgot to convert the numerator"), so a miss tells you *why*, not just *that*.

6. **Post-Quiz Diagnostic Review**:
   - Immediate score percentage and pass/fail indicator against the 80% cutoff.
   - Confetti burst when scoring $\ge 80\%$.
   - Question-by-question breakdown showing the student's chosen option vs the correct one.
   - Complete step-by-step worked solutions from NCDPI unpacking guides.
   - "Watch Out!" common misconception callouts, tied to the misconception tags above.

7. **Weak Spots & Error Bank**:
   - Automatically tracks every question missed on any quiz until mastered, via the Leitner review queue.
   - 1-click **"Practice Missed Questions"** custom test builder.

8. **Multiple Student Profiles**:
   - State supports more than one profile (e.g. multiple children) under one browser, with an active-profile switch.
   - Older single-profile save data is migrated automatically and losslessly the first time the app loads the new format — a prior error bank becomes due-immediately review entries rather than being discarded.

9. **Parent & Student Report Card**:
   - Clean, professional report formatted for printing or saving to PDF (`window.print()`).
   - Shows domain-by-domain mastery, the 17-standard checklist, and test history.

10. **Study Pace & Countdown Planner**:
    - Set target SSA exam date (e.g., Spring WCPSS window) and daily question goals.
    - Calculates daily questions required to complete full preparation on time.

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

## Live Site

The app is published to GitHub Pages at
**https://frictionlesscode.github.io/ncmathssa/** by
`.github/workflows/deploy.yml` on every push to `master`.

### Tests and checks

```bash
npm run test:run   # runs the test suite once and exits (CI-safe)
npm test           # watch mode — reruns on file changes; not for CI
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit, project references
npm run build      # tsc -b && vite build
```

`.github/workflows/ci.yml` runs lint, typecheck, `test:run`, and build on
every pull request and on pushes to `main`.

---

## Status: Grades 1–5 Complete

Grades 1 through 5 are all registered and playable (`src/curriculum/registry.ts`).
Grades 1–2 use `{ kind: 'even-by-standard-count' }` weighting because NCDPI
publishes no state EOG blueprint below grade 3; Grades 3–5 weight domains by
the published NCDPI blueprint. Adding a future grade (e.g. Grade 6) follows
the same four steps under [Adding a grade](#adding-a-grade) above.
