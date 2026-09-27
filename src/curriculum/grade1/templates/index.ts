import type { QuestionTemplate } from '../../../engine/template';
import { oa1CompareDifference } from './oa1-compare-difference';
import { oa2ThreeAddends } from './oa2-three-addends';
import { oa6MakeTenAdd } from './oa6-make-ten-add';
import { oa6GetToTenSubtract } from './oa6-get-to-ten-subtract';
import { oa8MissingPart } from './oa8-missing-part';
import { oa8MissingWhole } from './oa8-missing-whole';
import { oa9AddWithin10 } from './oa9-add-within-10';
import { oa9SubtractWithin10 } from './oa9-subtract-within-10';

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
 *               asked about directly ("which is the same as 8 + 5?") are
 *               authored, where the strategy is the question.
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
 *  STRATEGY (and never naming them, ruling 22-5); NC.1.OA.4 is turning an
 *  unknown-addend problem into a subtraction; NC.1.OA.7 is deciding which
 *  equation is true (ruling 22-6). In all three the mathematics is in how the
 *  question is built, not in which numbers it uses, so fresh numbers add
 *  nothing. They are authored in full in `../authored.oa.ts`.
 *
 *  AUTHORED AND GENERATED DO NOT OVERLAP. For the five standards with a
 *  generator, the authored bank takes shapes the generators do not make: the
 *  other two NC.1.OA.1 problem types; three-addend stories that are not the
 *  generator's red, blue and green groups; counting on, a doubles fact, and
 *  making ten asked about as a strategy; 0 as an unknown or an answer; a
 *  result with the box on the left (☐ = 9 − 3); the pairs that make 10; and a
 *  fact family. `../authored.oa.test.ts` runs
 *  `assertNoGeneratorDuplicatesAuthored` over these templates to hold that. */
export const GRADE_1_TEMPLATES: QuestionTemplate[] = [
  oa1CompareDifference,
  oa2ThreeAddends,
  oa6MakeTenAdd,
  oa6GetToTenSubtract,
  oa8MissingPart,
  oa8MissingWhole,
  oa9AddWithin10,
  oa9SubtractWithin10,
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
};
