# content-g5 audit (Grade 5 content)

Authority: NC SCOS K-8 Math (adopted June 2017) 5th grade page (tools4ncteachers fifth-grade-standards-view.pdf), NC DPI 5th Grade Unpacking (Rev. June 2019, p.23), NC DPI EOG Math 3-8 Test Specifications (domain weights).

## 1. Coverage
- 49 authored questions: each solved by hand, every distractor's stated misconception recomputed, explanations read, tag checked against NC standard text. All keys arithmetically correct except g3-02 (wrong under NC's definition).
- 10 templates (not 12): nf1, nbt1, nbt3, nbt5, nbt6, nbt7, nf4, nf7, md1, md5. Each sampled at seeds 1..1500 (15,000 instances) with an independent exact-rational/BigInt solver that parses the prompt and recomputes the answer. Checked: exactly one correct; key equals independent answer; no distractor equal in VALUE to key; no two options equal in value; answerText matches; no NaN/undefined; no thrown collisions; nbt3 key is the true max and prompt list matches options; nbt6 dividends <= 4 digits. Result: 0 arithmetic/grading defects. Template defects are all scope (NC limits).
- All 17 study guide sections read; worked examples recomputed (arithmetic correct).
- quizzes.ts: all ids resolve, no duplicates within a quiz, mock-01/mock-02 disjoint, diagnostic = 1 item per standard (17). Blueprint balance computed.
- questionModel.ts: correctOption throws unless exactly one correct; labelOptions enforces misconception tags but not one-correct or distinct text (tests do). No mis-grading path found.
- Not checked: UI rendering of fractions/mixed numbers.
- Temp folder src/__audit__/content-g5 deleted.

## 2. Findings

| Sev | Location | What's wrong | Evidence | Fix |
|---|---|---|---|---|
| **Critical** | authored.ts g3-02; standards.ts G.3 keyConcepts (~line 280); studyGuides.ts NC.5.G.3 (Trapezoid rule, step 2, "square is a trapezoid" trap) | Key wrong under NC. NC uses the EXCLUSIVE trapezoid definition (exactly one pair of parallel sides), so "All parallelograms are trapezoids" is FALSE. Marked-correct option D teaches the opposite; option A ("False, ... never more than 1 pair") is the NC-correct one. The item even says "NC's definition" | Unpacking p.23: "North Carolina has adopted the exclusive definition for a trapezoid. A trapezoid is a quadrilateral with exactly one pair of parallel sides." NC hierarchy: quadrilateral > parallelogram > rectangle/rhombus > square; trapezoid separate | Rewrite g3-02 (correct = False, parallelogram has two pairs); fix explanation, standards.ts hierarchy, study guide |
| High | authored nbt7-04 (14.76 / 0.12); studyGuides NBT.7 | Decimal / decimal is Common Core leakage. NC.5.NBT.7: whole / decimal and decimal / whole only, via repeated subtraction/area models, to hundredths | NC text | Use whole / decimal (6 / 0.25) or decimal / whole |
| High | authored nbt1-02 (47.62 / 10^3); templates/nbt1-powers-of-ten.ts | Exponent notation (CC 5.NBT.2) and dividing by 1,000 are outside NC. NC.5.NBT.1: multiply by 1,000, 100, 10, 0.1, 0.01; divide by 10 and 100 only | Template always prints 10^e; 247/1500 seeds are / 10^3; never uses 0.1/0.01 | Print 10/100/1,000; divide only by 10/100; add x0.1, x0.01 |
| High | authored md2-01, md2-02; standards.ts MD.2; studyGuides MD.2 | CC leakage: fractional line plots. NC.5.MD.2 is: data that changes over time, make/interpret a line graph, categorical vs numerical vs over-time. Items also say "line plot" but show a list | NC text | Replace with line-graph / data-type items |
| High | authored nf1-01 (3/4+5/6), nf1-02 (1/5, 3/4); templates/nf1-add-unlike.ts | NC.5.NF.1 requires related fractions: halves/fourths/eighths; thirds/sixths/twelfths; fifths/tenths/hundredths. 4&6, 5&4 violate. Template comment misreads this and emits 2&6, 3&9, 4&12, 4&16, 5&15, 5&20, 6&18, 6&24 | 831/1500 (55%) sampled instances unrelated, e.g. "1/5 + 12/20" | Restrict to allowed families; rewrite nf1-01/02 |
| High | authored oa2-01, oa2-03; study guide OA.2 example | NC.5.OA.2 is "up to two-step problems"; oa2-01 has 4 operations, oa2-03 has 5 and two paren groups | NC text | Cap operations, or explicitly mark above-grade |
| High | authored nf7-03 (tagged NC.5.NF.7) | 3/4 / 2/5 is Grade 6 (6.NS.1); NF.7 is unit fraction / whole and whole / unit fraction, one-step. Explanation says "In 6th grade" | NC text | Retag or move out of grade-5 pools/mock-02 |
| High | authored md1-02, md1-03; study guide MD.1 example | NC.5.MD.1: given a conversion chart, ONE-step conversions. md1-02 chains 3 conversions; md1-03 is mixed-unit subtraction | NC text | Make one-step |
| High | authored md1-02 distractor "320 bowls" | Stated misconception does not produce the value: extra doubling gives 160, not 320 | 1 gal = 16 cups; half cups = 32/gal | Use 160 or relabel |
| Medium | templates/nf4-multiply-fractions.ts; authored nf4-03 (5/8 x 4/15) | NC.5.NF.4 models fraction x fraction with denominators 2, 3, 4. Template uses 2,3,4,5,6,8 (1397/1500 draws have a denominator > 4); nf4-03 uses 8 and 15 | NC text | DENOMINATORS = [2,3,4] |
| Medium | authored g3-03 | Perpendicular/bisecting diagonals are beyond G.3; "Kite" not in NC grade 5 hierarchy | NC hierarchy | Drop diagonals and kite |
| Medium | authored md5-03 | NC.5.MD.5 composed prisms use one-digit dimensions; item uses 10 | NC text | Dims <= 9 |
| Medium | authored nf1-04 | Unrelated denominators 12 and 10; distractor "1 29/60" is the true exact sum, arguably also right | 89/60 | Related fractions; non-value distractor |
| Medium | quizzes.ts mock-ssa-01/02, diagnostic-01 | Not balanced to blueprint (OA 9-13, NBT 25-29, NF 39-43, MD+G 19-23). mock-01 (30): OA 10%, NBT 33%, NF 27%, MD+G 30%. mock-02 (19): OA 21%, NBT 26%, NF 21%, MD+G 32%, no NBT.5/NF.3/MD.4. Diagnostic (17): NF 24%, MD+G 35%. Blueprint bands in standards.ts do match NCDPI specs | counts | Rebalance or disclose; needs more NF items (13 authored) |
| Medium | quizzes.ts mock-ssa-01 comments | "Calculator Inactive/Active section" does not exist; UI uses per-question flag; "Active" block contains calculator-off items (nbt5-02, md1-01/02, md2-01, md4-01, g1-01/02, g3-01) | resolve() flags | Fix comments |
| Medium | oa3-03 conceptSummary uses "slope"; oa3-02 commonMisconception is a tip; oa3-03 calculatorAllowed true for 48/6 | reading level | | Reword |
| Medium | study guides: G.3 step 2 "(1 = trapezoid, 2 = parallelogram)"; MD.2 "average" (grade 6); NF.1 "#1 tested concept" / NBT.6 "most common mistake on CASE" | Unsupported or out-of-grade claims | | Remove |
| Low | nbt3-02 comment ("three placeholder zeros" but 6.0045 has two); nbt7-01 misconception text ".85 or .25"; templates print large numbers without commas; md1 template says "same length" for volume/weight units | style | | Tidy |

Clean: all 10 templates' keys and distinctness over 1500 seeds; all authored numeric keys other than g3-02; NBT.3, NBT.5 (3x2), NBT.6 (4-digit / 2-digit), G.1 (Quadrant I), MD.4 items in scope; nbt5-01 distractor 30,276 verified as real carry-before-multiply result.

## 3. Recommendations
- Add per-template scope tests from the NC text (allowed denominator families, exponents, divisor types); current tests only prove arithmetic.
- Per-standard scope records (max steps, denominators, conversion chain length) and a lint over authored items.
- Blueprint test for mock forms (domain share within band +-5 points).
- Single constant/doc reference for the NC trapezoid definition; re-verify against the unpacking doc.
- Enforce one-correct and value-distinct options in labelOptions or a shared authored-data test.
