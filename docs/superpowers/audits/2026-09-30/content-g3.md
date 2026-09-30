# Audit content-g3 (Grade 3 content)

## 1. Coverage
- 68 authored questions (OA 21, NBT 7, NF 14, MD 21, G 5), each solved by hand before reading the key. Every option checked against its tagged misconception, explanation steps re-derived, wording/level/standard fit, calculatorAllowed (all false, sensible).
- 18 templates (index exports 18, not ~19) read line by line, then each sampled at 3,004 seeds (0..2999 plus 4912, 99999, 2^31-1, 123456789) in a temporary vitest file with an INDEPENDENT oracle per template. The answer was recomputed by parsing the printed prompt/figure (array counts, number-line tick/marker columns, shaded-bar cells, clock times, side lists). Also checked: exactly one correct, correct == oracle, distinct texts, no NaN/undefined, misconception tags, fraction options not secretly equivalent (numeric compare), denominators only in {2,3,4,6,8}, nf4 exactly one TRUE statement by numeric evaluation and all like-parts, md1 same hour and end<=59, nbt options in (0,1000], md2 A>B. Result: 0 failures. All template answer keys are correct.
- Authored structure checks: unique ids, one correct, 4 distinct options, id prefix matches standard, no equivalent fraction options, last step states answer. Correct-option position A/B/C/D = 15/17/20/16 (no bias).
- Quizzes: all 7 resolve (no missing/duplicate ids). Diagnostic = 20 items, one per standard (OA7 NF4 MD6 G1 NBT2), disjoint from the mock. Mock = 28 (OA10 NBT3 NF8 MD6 G1) = 35.7/10.7/28.6/25.0% - inside all four blueprint bands; docs/sources blueprint matches (32-36, 9-13, 28-32, 23-27 MD+G).
- Study guides: all 20 read; every arithmetic figure in traps/examples re-checked.
- Standards checked against NC sources: NC.3.MD.1 "within the same hour" confirmed (web). NC.3.G.1 and trapezoid definition checked against the NC DPI 3rd-grade unpacking PDF (tools4ncteachers cluster5-grade3.pdf), text extracted locally.
- questionModel.ts: correctness is one boolean per option; correctOption() throws unless exactly one; labels are assigned after shuffle in all templates. The data shape cannot mis-grade if authors set the flag right. No issue.
- NOT checked: actual rendered screens (no browser run); truth of EOG item-statistics claims in study guides.
- Temp folder src/__audit__/content-g3 removed.

## 2. Findings
| Sev | Location | What's wrong | Evidence | Fix |
|---|---|---|---|---|
| CRITICAL | authored.g.ts g3-g1-05 (~260-309); studyGuides.ts NC.3.G.1 (Trapezoid rule ~742, trap ~757, workedExample); comment authored.g.ts 40-44 | Key is wrong per NC. Marked correct: "A square is a trapezoid, because it has at least one pair of parallel sides". The option marked wrong (tag exclusive-trapezoid-definition) is the NC definition. Explanation and study guide claim NC uses "at least one pair". | NC DPI 3rd Grade Unpacking, NC.3.G.1: "Note: North Carolina has adopted the exclusive definition for a trapezoid. A trapezoid is a quadrilateral with exactly one pair of parallel sides." So a square is NOT a trapezoid in NC. Item is in Module 5 drill. | Rewrite item (correct: a square is not a trapezoid because it has two pairs of parallel sides, not exactly one); fix explanation, study guide rule/trap/steps and comments; grep grade 4/5 for the same claim. |
| CRITICAL (display) | KidPractice.tsx:101 renders promptDetails in a p with whitespace-pre-line and proportional font. Affects g3.nf2 template (all seeds), g3-nf2-02, g3.nf3 shaded bar | pre-line collapses runs of spaces and strips leading spaces. The number-line marker P (placed with leading spaces) renders at far left under the first tick, labels 0/1 collapse together, ticks are not monospace. Point position unreadable, so the child cannot determine the answer. nf3 bar (unshaded cells are spaces) collapses to unequal cells. | CSS semantics; QuizRunner/QuizResults/WeakSpots use font-mono + pre-wrap, KidPractice does not. From source, not rendered. | font-mono whitespace-pre overflow-x-auto in KidPractice, or SVG figures. |
| HIGH (display) | QuizRunner.tsx:235 (font-mono text-base, pre-wrap) with nf2 template d=6 (31 chars) and d=8 (41 chars) | On phone widths 41 mono chars (~394px) exceed ~300px inner width and wrap, misaligning P. Quizzes use authored items only (21-char line is fine); matters if generated items reach this component. | char-width arithmetic | overflow-x-auto + whitespace-pre or smaller font. |
| HIGH | studyGuides.ts NC.3.NBT.3 rule "One zero, because one ten" and trap 3 | Says "50 holds a single ten" / "contains only one ten". 50 is 5 tens (the same guide says so in Step 1). Teaches something false. | 50 = 5 tens | Reword: multiplying by 10 moves one place. |
| MEDIUM | authored.md.ts g3-md1-01 | Clock text inconsistent with 2:43: hour hand "a little way past the 2", but at 2:43 it is ~72% of the way to 3. Pushes a careful child toward other options. Text only, no picture. | 43/60 of an hour | "nearly at the 3", or a real clock SVG. |
| MEDIUM | authored.oa.ts g3-oa9-03 | Row for 3 printed only to 24, row for 6 to 36, yet claim is every number in the row for 6 appears in the row for 3 (30, 36 not shown). Reasoning-statement options are high reading level for grade 3. | prompt text | Print equal-length rows or say "and so on". |
| MEDIUM | templates md7 | Unit drawn independently of object: "bulletin board 8 yards long", "patio 3 inches wide". Absurd sizes in a grade that estimates sensible units. | THINGS x UNITS | Pair unit with thing. |
| MEDIUM | templates md2 | Unrealistic volumes: "soup pot holds 87 quarts", "juice jug 93 pints". | VESSELS x 30-98 | Cap by vessel. |
| MEDIUM | studyGuides.ts NC.3.OA.2 coreConcept | "divisor and the answer are both single digits, 10 or less"; 10 is not a single digit. | standards.ts OA.2 vs OA.3/OA.7 | Reword. |
| MEDIUM | studyGuides.ts NC.3.OA.9 trap 3 | "after ten steps the ones digits start over": row for 4 repeats 4,8,2,6,0 every FIVE steps. | 4..20 then 24 | "after five steps". |
| MEDIUM | studyGuides.ts whyItMattersForSSA (NF.2 "most-missed", MD.1 "practically every form", MD.3 "every year", MD.8 "asks most often", etc.) | Unsourced claims about EOG/SSA item statistics stated as fact to parents. | nothing in docs/sources | Remove or source. |
| MEDIUM | templates nbt2.add-within-1000, md2.customary-capacity | Plural slips in worked solutions. nbt2.add: "1 tens" in 47 of 2000 seeds. md2: "1 tens" 383/2000, "1 ones" 797/2000 (e.g. "only 1 ones in 41"). nbt2.subtract has a count() guard; these two do not. | 2000-seed sweep | Reuse count(). |
| MEDIUM | template nf1.unit-fraction-model | Option "d whole shapes, with 1 of them shaded" (e.g. "2 whole rectangles, with 1 of them shaded") is 1/2 of a set, so a careful child can defend it against the prompt "1/2 of a whole rectangle". Marked wrong. | option text | Reword to remove set reading. |
| MEDIUM | authored.nbt.ts g3-nbt2-01; standards.ts:277 | "closest hundred" is rounding in effect while all files say NC has no rounding at Grade 3; NBT domain parentName is "Place value & rounding", contradicting that. NC.3.NBT.2 does name estimation, so item is in scope. Unsure whether NC.3 has a rounding standard (I believe not). | | Rename parentName. |
| LOW | g3-nbt2-02 | Distractors 1,010 and 1,216 exceed "within 1,000" (option text only). | | |
| LOW | g3-oa1-03 | Three factors under OA.1 "two factors"; associative property is in the standard, acceptable. | | |
| LOW | g3-oa2-03 / g3-oa2-02 | "28 bracelets" weak distractor; step 4 phrasing "one thing only: The number..." awkward. | | |
| LOW | md7 template explanation | Says each row across holds W and there are L rows, while prompt says L is long. Math fine. | | swap |
| LOW | studyGuides MD.2/MD.3 | Trap "4 and 3/8 inches" matches no authored option; crayon "about 5 inches" (real ~3.6); British "favourite"/"practise". | | |
| LOW | many authored items | Correct option is usually the longest text in sentence-option items (nf1-01, nf4-01..04, md5-01, md7-03, g1-*): test-taking cue. | | |
| LOW | MD/G figures | Clock, ruler, graphs, shapes are text descriptions only. Accessible but unlike the real test. | | consider SVG |
| LOW | oa7 template | Distractor (a+1)*b up to 110, beyond the 10x10 table. | | |

All authored keys other than g3-g1-05 verified correct with exactly one correct option. Every distractor value matches its misconception. Fractions use only denominators 2,3,4,6,8; no NF.4 item compares unlike families; no metric units; no time crossing the hour.

## 3. Recommendations
- Any key that encodes a definition NC chose (trapezoid) needs a citation of the DPI document in a comment and a test pinning it; a test cross-checking study guide vs item wording would have caught both places.
- Component test for promptDetails rendering (monospace, whitespace-pre) using the nf2 template as fixture.
- Extend assertTemplateSound with a per-template oracle hook (as done here) and a grammar check for "1 <plural>" in explanations.
- Constrain template contexts (unit-object, vessel capacity) with paired data.
- Review study-guide whyItMatters claims against sources or drop them.
