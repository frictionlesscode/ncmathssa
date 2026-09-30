# content-g2 audit: Grade 2 content

## 1. Coverage

Checked:
- **90 authored questions** (OA 16, NBT 31, MD 34, G 9). I solved each one from the prompt alone, before looking at the key. My answer matched the key on all 90. I also checked exactly-one-correct, distinct option text, misconception tag against distractor value, explanation steps, wording, standard fit and `calculatorAllowed`. Every tag exists in `MISCONCEPTIONS`. Every id prefix matches its standardCode. `isStretch` matches `difficulty` on all 90. `calculatorAllowed` is false everywhere, which is right for Grade 2.
- **20 templates**, each read line by line, then run for **100,000 seeds each** (2,000,000 instances), plus an earlier 1,000-seed pass. Per instance I checked:
  - the shared invariants: 4 options, exactly one correct, `answerText` equals the correct option, options distinct, no NaN/undefined/null, no negative options;
  - an independent answer, computed by parsing the prompt or `promptDetails` and re-deriving the result. Examples: nbt4 truth of every inequality in every option, nbt1 value equality of every grouping, nbt3 digit-place parse, md8 coin re-sum, md10 bar lookup, md7 clock re-read, oa4 array re-count;
  - grade range: OA.2 ≤ 20, OA.4 ≤ 5×5, NBT.5 < 100, NBT.6 ≤ 3 addends, NBT.7 < 1000, NBT.8 in 100..900, MD.8 ≤ 99¢, ruler marks ≤ 12, and so on.

  Result: **0 wrong keys, 0 collisions, 0 throws, 0 range violations**. The two failing checks are the wording and explanation findings F1 and F2 below.
- **Quizzes**: all 6 resolve (diagnostic, four module drills, mock). No missing or duplicate ids, and every module item is in its own domain. The diagnostic has 23 items, exactly 1 per standard (OA4, NBT8, MD9, G2). The mock has 25 items (OA4, NBT9, MD10, G2). This matches the nearest-integer share of 23 standards. It covers all 23 standards, and none of its items are also in the diagnostic.
- **standards.ts**: 23 standards. NC.2.NBT.6 ("up to three") and NC.2.MD.3 (yards included) were confirmed by web search against NC text.
- **Study guides**: all 23 read. Every worked example was re-solved and all are correct. The traps echo the authored bank.
- **Engine data shape**: `correctOption` throws unless there is exactly one correct option. `checkAnswer` accepts the correct option's label or text, case-insensitive, so it cannot mark a wrong option right. Generated ids (`templateId#seed`) rebuild deterministically through `makeRng(seed)`, the same rng used in my sampling. `promptDetails` is rendered with `whitespace-pre-line` or `whitespace-pre-wrap` everywhere, so the oa4 array (newline-separated) displays correctly.

Not checked or limited:
- There are no images. Every "figure" (clock, ruler, number line, graphs, tally chart) is a text description in `promptDetails`. I verified the descriptions are self-consistent and correct, but I could not check any rendering.
- Grade 2 has no NC blueprint, so no weighting checks. I did not audit progress or mastery math (other auditors).
- I could not confirm from an authoritative source that "rhombus" is in NC.2.G.1 at Grade 2 (unsure, F10).

## 2. Findings

No Critical findings. Every authored key and every generated key is correct.

| Sev | Location | What is wrong | Evidence | Suggested fix |
|---|---|---|---|---|
| **High** | `templates/nbt2-skip-count.ts:120` (template `g2.nbt2.skip-count`, any seed with step 5, about 1/3 of all draws, e.g. seed 0) | The explanation for counting by 5s says "Every number counted by 5s from here ends in the same two digits, over and over." This is false. Counting by 5s alternates 0 and 5 (105, 110, 115, 120), and the last two digits change every time. 33,307 of 100,000 instances show it. | Seed 0: "Start at 105 and count by 5s :: Step 2: 105 + 5 = 110. Every number counted by 5s ... same two digits". The study guide and authored `g2-nbt2-02` correctly say "ends in a 0 or a 5". | Replace with "Every number counted by 5s ends in a 0 or a 5." |
| **High** | `authored.oa.ts:412` (g2-oa3-03, option A) and `authored.oa.ts:453` (g2-oa3-04, options A and B) | The misconception tag on the distractor does not describe the error, and QuizResults shows the tag to the child ("error: judged the total by the count of pairs"). g2-oa3-04 A is `6 + 8 = 14`, tagged `judged-the-total-by-the-count-of-pairs`. The real error is unequal addends. B (`6 + 6 = 12`) is tagged `miscounted-while-pairing-the-objects`, but it is a false sum. g2-oa3-03 A ("Yes, 10 and 8") is tagged `miscounted-while-pairing`, but the real error is calling unequal groups equal. | The registry text for `judged-the-total-by-the-count-of-pairs` is "Decided odd or even from whether the number of PAIRS is odd or even". `6 + 8` has nothing to do with pairs. | Use or add a tag such as `called-unequal-parts-equal-shares` or `unequal-addends`, as the G.3 items do. Tag B as an arithmetic slip. |
| Medium | `templates/md2-two-units.ts:102-104`, prompt at line 144 (`g2.md2.two-units`, every instance, 100,000/100,000) | The hint clause drops its article and is ungrammatical in every generated question. The prompt reads "Since foot is longer than an inch, ..." or "Since centimeter is shorter than a meter, ...". A 7-year-old reads this ungrammatical sentence every time. | Seeds 0 and 1: "Since foot is longer than an inch"; "Since centimeter is shorter than a meter". The clause uses `${S.singular}` with no article for the first noun. | Prepend `${S.article.toLowerCase()}` (or "An/A" for the first unit) to the first noun. |
| Medium | `templates/oa3-odd-or-even.ts` explanation, Step 2 (`g2.oa3.odd-or-even`, answer 1 or 2) | Plural errors. Seed 0 (answer 2): "2 objects pair up into exactly 1 pairs". Seed 1 (answer 1): "1 objects pair up into 0 pairs, with 1 object left over". | Sampled seeds 0, 1, 3. | Add a plural helper for "pair(s)" and "object(s)". |
| Medium | `templates/oa3-odd-or-even.ts` (whole template) | The item is a bare "Which of these numbers is EVEN?" over four numerals. NC.2.OA.3 is about deciding whether a group of objects (within 20) has an odd or even number of members, by pairing or by two equal groups. A numeral-only item invites a last-digit rule. It also has only 2 distinct prompts, so its 3 distractors all carry the same generic tag `miscounted-while-pairing-the-objects`. | 100,000 seeds gave 2 distinct prompt strings. | Show a picture or emoji group, or word the item around objects. Use tags that differ per distractor. |
| Medium | `authored.oa.ts:330, 371, 412` (g2-oa3-01 D, g2-oa3-02 D, g2-oa3-03 B) | These options are not answers to the question. They are "16 crayons", "6 pairs" and "18 buttons", with a different form from the other sentence options, and all are tagged `restated-a-known-number-instead-of-solving`. The question is odd/even or yes/no, so they are eliminated on form alone. | Options D and B in the keyless dump. | Replace with a plausible wrong sentence, e.g. "Odd, because 16 is a big number." |
| Medium | `authored.nbt.ts:584` (g2-nbt4-04), `authored.g.ts:333` (g2-g3-04), and nbt4 template options (`templates/nbt4-compare-three-digit.ts`) | The reading level is high for Grade 2, with 15-20 word option sentences that contain nested clauses and numbers. Examples: "500 + 30 + 7 > 537, because 5, 30, and 7 written side by side make 5,307"; g2-g3-04 option A. | Read directly. | Shorten. Keep the reason clause but drop the second clause. |
| Medium | `authored.md.ts` md7-01..05, md4-01/02, md6-04, md10-*, `templates/md1`, `md7`, `md10` | Every clock, ruler, number line and graph is text ("The short hour hand is just past the 8..."). There is no picture. For MD.1, MD.6, MD.7 and MD.10, reading the visual is the skill, and here it is reading a sentence. The keys are correct, but validity for the standard is reduced and the reading load is higher. | `promptDetails` on those items is prose in a monospace box. | Add SVG or CSS figures. The data is already structured (hour, hand, bar heights). |
| Low | `authored.nbt.ts:1110` (g2-nbt8-04 B = 174, tag `wrong-power-of-ten`) | The `commonMisconception` says "the 100 was applied to the tens and the 10 to the hundreds". The value 174 is really 264 + 10 − 100, meaning the two amounts were swapped between the operations. The tag is close enough and the value is correct, but the prose is muddled. | 264 + 10 − 100 = 174 ✓. | Reword to "added 10 and took away 100 instead". |
| Low | `authored.oa.ts:161` (g2-oa1-04) | The explanation says "her friend gave her 4 more", but the prompt says only "got 4 more". Nobody is mentioned. | Prompt vs Step 2 of the explanation. | Say "she got 4 more". |
| Low | `templates/oa1-change-unknown.ts` | The story gives no end amount. "Mia had 45 stickers. Mia gave away some of them. In 45 − ☐ = 40, ..." The end (40) appears only in the printed equation. A child who ignores the equation cannot solve it, unlike the authored OA.1 items. | Sample seed 0. | Add "Now Mia has 40 stickers." |
| Low | `authored.nbt.ts` nbt5-03, nbt7-02, nbt7-03, nbt7-04 and md5 explanations | Inconsistent minus glyphs. Some use hyphen-minus (`72 - 35`, `412 - 158`), others `−`. | Prompt text in the dumps. | Normalize to `−`. |
| Low | `templates/nbt4-compare-three-digit.ts` | The two "=" distractors are weak. Neither tests a real misconception beyond digit count or stopping early, and a child who sees two different numbers rejects both. | Seed 1: three of the four options are "=" or clearly false. | Optional: replace one with a wrong-direction symbol. |
| Low | `templates/md5-shorter-length-unknown.ts` contexts | Implausible sizes. A 78-foot paper chain, a 52-meter kite string, a 78-inch ribbon. | Contexts × `LENGTH_PAIRS` (big up to 78). | Use plausible units per context, or cap by context. |
| Low | Correct-label distribution (authored bank) | A 23, B 25, C 25, D 17 out of 90. A slight under-use of D. Not exploitable. | Count. | Optional rebalance. |
| Low (unsure) | `authored.g.ts` g2-g1-04 | Uses "rhombus" as the correct answer. I could not confirm that the NC Grade 2 unpacking names rhombus (unsure), though the sourced text in `standards.ts` lists only triangles, quadrilaterals, pentagons and hexagons. | The standards.ts description for NC.2.G.1. | Confirm against the DPI unpacking. If it is not in scope, use "quadrilateral with four equal sides" wording. |
| Low | `quizzes.ts` diagnostic | The diagnostic has 1 item per standard, all of them each standard's `-01` item and all `mastery` difficulty. A baseline per standard is a single right/wrong result. This is a design limitation, not a bug. | 23 items, per-std count 1. | Note in UI copy that the per-standard baseline is coarse. |

Verified sound, worth noting because they looked risky:
- `g2-nbt5-01` B (35) is 50 − 15, correctly tagged. `nbt6-03` D (84) is 46 + 38. `md8-04` D (20¢) is the nickel/dime swap (30¢ → 20¢ short). `md10-03` D (10) is 6 + 4.
- `g2-nbt7-04` B is a truly wrong strategy (198), so D is the unique best.
- `g2-md1-01` A (12-inch ruler) does measure feet, but it is clearly not "best", and the explanation says so.
- `g2-g1-02` uses a "NOT" stem and is fine.
- `g2-md3-*` yards is in NC.2.MD.3.
- All template collision guards are complete: 100,000 seeds per template found no collision, so the excluded pairs in `oa4`, `md1`, `md5`, `nbt5/7-sub` (ones difference ≠ 5) are correct.

## 3. Recommendations

- Add an **independent-oracle sampling test per template**, as I did here. Parse the prompt and recompute the answer instead of asserting only structure. `assertTemplateSound` checks only structure, so a wrong key with a well-formed shape would pass.
- Add a **template text lint** to `assertTemplateSound`: search for `\b1 (objects|pairs|…)\b`, "Since <singular> is", and repeated-digit claims. The nbt2 false statement and the md2 grammar bug both live in prose that no test reads.
- Add an **explanation-truth spot check** for generator branches with a fixed sentence (`placeMoved` in nbt2, `step3` in nbt8), one fixture per branch.
- Add a **tag-fit review**: a per-option check that the misconception's registry description matches the distractor. This could be an authored-only test that requires each authored non-correct option to have a `// derivation` value. Tags shown to children in QuizResults need to be right.
- Put diagrams (or at least structured `figure` data) on the clock, ruler, number-line and graph items.

`src/__audit__/content-g2/` was deleted at the end of the run.
