import type { QuestionTemplate } from '../../../engine/template';
import { oa1CompareDifference } from './oa1-compare-difference';
import { oa2ThreeAddends } from './oa2-three-addends';
import { oa6MakeTenAdd } from './oa6-make-ten-add';
import { oa6GetToTenSubtract } from './oa6-get-to-ten-subtract';
import { oa8MissingPart } from './oa8-missing-part';
import { oa8MissingWhole } from './oa8-missing-whole';
import { oa9AddWithin10 } from './oa9-add-within-10';
import { oa9SubtractWithin10 } from './oa9-subtract-within-10';
import { nbt1CountPastATen } from './nbt1-count-past-a-ten';
import { nbt2TensAndOnes } from './nbt2-tens-and-ones';
import { nbt3WhichSentenceIsTrue } from './nbt3-which-sentence-is-true';
import { nbt4AddWithin100 } from './nbt4-add-within-100';
import { nbt5TenMoreOrLess } from './nbt5-ten-more-or-less';
import { nbt6SubtractMultiplesOfTen } from './nbt6-subtract-multiples-of-ten';
import { nbt7WriteTheNumeral } from './nbt7-write-the-numeral';
import { md2MeasureWithUnits } from './md2-measure-with-units';
import { md4ReadTheData } from './md4-read-the-data';

/** Every parameterized Grade 1 template. Task 22 (Operations & Algebraic
 *  Thinking) starts this list; Tasks 23 (Base Ten) and 24 (Measurement & Data)
 *  append to it.
 *
 *  ── Operations & Algebraic Thinking ───────────────────────────────────────
 *
 *  RULING 22-1 DECIDES WHICH CODE EACH OF THESE CARRIES. North Carolina
 *  renumbered the Common Core here: fluency within 10 is NC.1.OA.9, and
 *  NC.1.OA.6 is "add and subtract, within 20, using STRATEGIES". The Task 22
 *  brief had the two the Common Core way round, and a fluency generator filed
 *  as NC.1.OA.6 passes every test that only asks whether its code exists.
 *  `./index.test.ts` checks every id's middle against the code it is filed
 *  under, and `../standards.ts` — transcribed from the published standards —
 *  is the ground truth for what each code means.
 *
 *  Five of the eight NC.1.OA standards have generators, eight templates in
 *  all, each drilling ONE skill with ONE set of named errors:
 *
 *    NC.1.OA.1  COMPARE — DIFFERENCE UNKNOWN, "how many more" or "how many
 *               fewer", within 20. The authored bank carries one item of each
 *               of the standard's three named problem types (ruling 22-2);
 *               this adds fresh numbers to the type first-graders fail most.
 *    NC.1.OA.2  THREE ADDENDS in a word problem, sum at most 20 (ruling 22-3).
 *    NC.1.OA.6  MAKING TEN to add, and GETTING TO 10 FIRST to take away — two
 *               templates, each naming its strategy in its worked solution
 *               (ruling 22-4). Counting on, a doubles fact, and making ten
 *               and getting to 10 asked about directly ("which is the same
 *               as 8 + 5?") are authored, where the strategy is the question.
 *    NC.1.OA.8  a missing PART (six positions, either side of the equal sign)
 *               and a missing WHOLE (☐ − b = c) — two templates, because one
 *               is solved by taking away and the other by adding, and the
 *               wrong operation a child reaches for is opposite in each.
 *    NC.1.OA.9  ADDITION facts and SUBTRACTION facts within 10 — two
 *               templates, matching the standard's two keyConcept bullets.
 *
 *  THE SPLITS ARE NOT STYLE. A review key is seedless —
 *  `{kind:'generated', templateId}` (`../../../engine/questionModel.ts`) — so
 *  a template that coin-flipped between addition and subtraction would let a
 *  child who failed a take-away be re-served a sum under the IDENTICAL key,
 *  pass it, and have the take-away failure retired as mastered. The same
 *  argument split Grade 2's NC.2.NBT.5 and NC.2.NBT.7, Grade 3's NC.3.NBT.2
 *  and Grade 4's NC.4.NBT.4. What a single template here DOES coin-flip
 *  between — "more" or "fewer", which side of the equal sign the box is on,
 *  which way a counting slip lands — changes the words and never the skill,
 *  and shares every misconception tag.
 *
 *  NC.1.OA.3, NC.1.OA.4 and NC.1.OA.7 have NO generator, deliberately.
 *  NC.1.OA.3 is using the commutative and associative properties as a
 *  STRATEGY (and never naming them, ruling 22-5); NC.1.OA.4 is solving an
 *  unknown addend by the METHOD the standard names — adding on, or changing
 *  it to a take-away (8 + ☐ = 13 as 13 − 8); NC.1.OA.7 is deciding which
 *  equation is true (ruling 22-6). In all three the mathematics is in how the
 *  question is built, not in which numbers it uses, so fresh numbers add
 *  nothing. They are authored in full in `../authored.oa.ts`.
 *
 *  AUTHORED AND GENERATED DO NOT OVERLAP. For the five standards with a
 *  generator, the authored bank takes shapes the generators do not make: the
 *  other two NC.1.OA.1 problem types; three-addend stories that are not the
 *  generator's red, blue and green groups; counting on, a doubles fact, and
 *  making ten and getting to 10 asked about as a strategy; 0 as an unknown
 *  or an answer; a result with the box on the left (☐ = 9 − 3); the pairs
 *  that make 10; and a fact family. `../authored.oa.test.ts` runs
 *  `assertNoGeneratorDuplicatesAuthored` over these templates to hold that.
 *
 *  ── Number & Operations in Base Ten (Task 23) ─────────────────────────────
 *
 *  RULING 23-1 DECIDES WHAT EACH CODE MEANS. The Task 23 brief swaps
 *  NC.1.NBT.1 and NC.1.NBT.7: NC.1.NBT.1 is COUNTING to 150 from any starting
 *  number, and NC.1.NBT.7 is READING AND WRITING NUMERALS to 100. `../
 *  standards.ts` is the ground truth, transcribed from the published
 *  standards, and every template below is filed under the code its own
 *  sibling test checks against that source.
 *
 *  RULING 23-9 KEEPS A GENERATOR ON ALL SEVEN NBT STANDARDS, for the same
 *  reason Grade 4 makes the same call: place-value procedures are learned on
 *  numbers a student has not memorized the answer to, so a bank of only
 *  authored items would let a student pass by recognizing the specific
 *  numbers rather than by doing the place-value reasoning. Seven templates,
 *  each drilling ONE skill:
 *
 *    NC.1.NBT.1  COUNT ON across a ten, from any start below 150.
 *    NC.1.NBT.2  TENS AND ONES — what number is N tens and M ones.
 *    NC.1.NBT.3  COMPARE two two-digit numbers (ruling 23-6: "which sentence
 *                is true?", four complete comparison sentences).
 *    NC.1.NBT.4  ADD WITHIN 100 (ruling 23-2: the second addend is always a
 *                one-digit number or a multiple of 10, never an arbitrary
 *                two-digit number, which would be NC.2.NBT.5's regrouping).
 *    NC.1.NBT.5  10 MORE OR 10 LESS than a two-digit number, mentally.
 *    NC.1.NBT.6  SUBTRACT two multiples of 10 (ruling 23-5: 10-90, minuend at
 *                least the subtrahend, no negative distractors).
 *    NC.1.NBT.7  WRITE THE NUMERAL for a number name, to 100 (ruling 23-4:
 *                never inherits NC.1.NBT.1's 150).
 *
 *  AUTHORED AND GENERATED DO NOT OVERLAP. `../authored.nbt.ts` takes shapes
 *  the generators above do not make: numerals under 20 and numerals with a
 *  zero digit for NC.1.NBT.7 (the generators exclude both), teen-number
 *  decomposition and a plain decade for NC.1.NBT.2, word-problem framings for
 *  NC.1.NBT.4-6 where the generators ask bare "what is" questions, and single-
 *  next-number counting for NC.1.NBT.1 where the generator always asks for
 *  three numbers at once. `../authored.nbt.test.ts` runs
 *  `assertNoGeneratorDuplicatesAuthored` over these templates to hold that.
 *
 *  ── Measurement & Data (Task 24) ──────────────────────────────────────────
 *
 *  RULING 24-1 SWAPS NC.1.MD.3 AND NC.1.MD.5: NC.1.MD.3 is TIME to the hour
 *  and half-hour; NC.1.MD.5 is COINS, identifying quarters, dimes and nickels
 *  and relating their values to pennies. The Task 24 brief has those two
 *  backward in its own Step 4.
 *
 *  RULING 24-2/24-3 MAKES NC.1.MD.1 AUTHORED, NOT TEMPLATED. Ordering three
 *  objects by length, and comparing two objects indirectly through a third,
 *  is transitivity over a DESCRIBED scenario: the natural prompt needs three
 *  clauses of held state, over the two-sentence cap a six-year-old can read.
 *  Task 24 therefore contributes only TWO templates, for NC.1.MD.2 and
 *  NC.1.MD.4 - Time, Coins and all three Geometry standards (NC.1.G.1-3) are
 *  fully authored in `../authored.md.ts` and `../authored.g.ts`, because a
 *  generator over them would only shuffle labels on described figures, not
 *  exercise a different draw of numbers.
 *
 *    NC.1.MD.2  MEASURE WITH NON-STANDARD UNITS - read off a count of units
 *               already laid out correctly (ruling 24-9: the "no gaps or
 *               overlaps" figure lives in promptDetails, not the
 *               length-checked prompt). The authored bank takes the
 *               standard's OTHER shape: judging whether a description of
 *               measuring (with gaps, with overlaps, stacked) is correct.
 *    NC.1.MD.4  READ THE DATA - one template, branching on the seed across
 *               the standard's own three question types (ruling 24-5: the
 *               total; how many in one category; how many more or less),
 *               always with exactly three categories. AUTHORED AND GENERATED
 *               DO NOT OVERLAP: the authored bank uses two-category graphs, a
 *               take-apart shape (total given, one category missing), and
 *               "how many fewer" phrasing the generator never asks.
 */
export const GRADE_1_TEMPLATES: QuestionTemplate[] = [
  oa1CompareDifference,
  oa2ThreeAddends,
  oa6MakeTenAdd,
  oa6GetToTenSubtract,
  oa8MissingPart,
  oa8MissingWhole,
  oa9AddWithin10,
  oa9SubtractWithin10,
  nbt1CountPastATen,
  nbt2TensAndOnes,
  nbt3WhichSentenceIsTrue,
  nbt4AddWithin100,
  nbt5TenMoreOrLess,
  nbt6SubtractMultiplesOfTen,
  nbt7WriteTheNumeral,
  md2MeasureWithUnits,
  md4ReadTheData,
];

export {
  oa1CompareDifference,
  oa2ThreeAddends,
  oa6MakeTenAdd,
  oa6GetToTenSubtract,
  oa8MissingPart,
  oa8MissingWhole,
  oa9AddWithin10,
  oa9SubtractWithin10,
  nbt1CountPastATen,
  nbt2TensAndOnes,
  nbt3WhichSentenceIsTrue,
  nbt4AddWithin100,
  nbt5TenMoreOrLess,
  nbt6SubtractMultiplesOfTen,
  nbt7WriteTheNumeral,
  md2MeasureWithUnits,
  md4ReadTheData,
};
