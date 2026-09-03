# NC Math SSA Prep (Wake County Grade 5 Math Acceleration)

A dedicated, comprehensive web application built to help 4th grade students prepare for **North Carolina Single Subject Acceleration (SSA)** to skip 5th grade mathematics and place directly into 6th grade math in the **Wake County Public School System (WCPSS)**.

---

## Assessment Reality & Methodology

- **Target Assessment**: Above-grade-level comprehensive assessment administered by WCPSS and built by **CASE** (Collaborative Assessment Solutions for Educators).
- **Qualifying Cutoff**: **80% or higher** on the comprehensive assessment.
- **Honest Blueprint**: Because the secure CASE item bank is strictly confidential and never made public, this application does **not** guess or fabricate real test items. Instead, the entire curriculum and question bank is built directly against the official, public **North Carolina Standard Course of Study (NCSCOS) for Grade 5 Mathematics**.
- **Assessment Format**: Supports both **Multiple-Choice** and **Open-Response / Free-Text** questions (including integers, decimals, simplified fractions, and mixed numbers).
- **Test Mode**: Real test simulation without mid-quiz answer hints. On completion, an immediate diagnostic report card displays overall score, SSA qualification status against the 80% cutoff, and full worked step-by-step solutions.

---

## Program Structure: 5 Domains & 16 Standards

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

---

## Core Application Features

1. **Overall SSA Readiness Gauge**:
   - Composite score dynamically weighted according to official NCDPI EOG weight midpoints (Fractions 41%, Base Ten 27%, Measurement & Data 13%, Algebraic Thinking 11%, Geometry 8%).
   - Visual gauge with prominent **80% WCPSS SSA benchmark marker**.
   - Tracks how many of the 16 standards have reached the Acceleration-Ready tier.

2. **Test-Taking Environment**:
   - Realistic test conditions with a timer and pause toggle.
   - Question Navigator Drawer to jump between answered, flagged, and unanswered questions.
   - **Calculator Inactive vs Calculator Active Sections**:
     - Strict "Calculator Inactive" banner on mental/computational problems.
     - Accessible built-in 4-function on-screen calculator on questions allowing calculators.
   - **Interactive Scratchpad Whiteboard**:
     - Built-in drawing canvas with pen, eraser, color swatches, and clear tool for working out long division, fraction math, and scratchwork directly on the screen.

3. **Difficulty Bias & Stretch Challenges**:
   - Questions trend toward the upper end of each standard (multi-step problems, reasoning over rote recall).
   - Includes **Above-Grade Stretch Questions** bridging 5th grade into 6th grade math (e.g. dividing fractions by fractions, rate ratios, composite prism volume) flagged clearly so pace tracking stays honest.

4. **Smart Answer Checker**:
   - Handles whole numbers, fractions (`3/4`), mixed numbers (`2 1/4`), decimals (`0.75`), and strips currency symbols (`$`) and units automatically.

5. **Post-Quiz Diagnostic Review**:
   - Immediate score percentage and pass/fail indicator against the 80% cutoff.
   - Confetti burst when scoring $\ge 80\%$.
   - Question-by-question breakdown showing student's answer vs correct target answer.
   - Complete step-by-step worked solutions from NCDPI unpacking guides.
   - "Watch Out!" common 4th/5th grade misconception callouts.
   - Inline "Try Again" tool to correct mistakes immediately.

6. **Weak Spots & Error Bank**:
   - Automatically tracks every question missed on any quiz until mastered.
   - 1-click **"Practice Missed Questions"** custom test builder.
   - Inline check & clear tool.

7. **Parent & Student Report Card**:
   - Clean, professional report formatted for printing or saving to PDF (`window.print()`).
   - Shows domain-by-domain mastery, 16-standard checklist, and test history.

8. **Study Pace & Countdown Planner**:
   - Set target SSA exam date (e.g., Spring WCPSS window) and daily question goals.
   - Calculates daily questions required to complete full preparation on time.

---

## Running the Web App Locally

```bash
# Navigate to the project directory
cd C:\Users\mswanson\Projects\ncmathssa

# Start the local development server
npm run dev

# Or build and run production preview
npm run build
npm run preview
```

Open your browser to:
```
http://localhost:5185/
```
*(Or the port displayed in the console)*
