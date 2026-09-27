import type { QuestionTemplate } from '../../../engine/template';
import { oa1ChangeUnknown } from './oa1-change-unknown';
import { oa2FluencyFact } from './oa2-fluency-fact';
import { oa3OddOrEven } from './oa3-odd-or-even';
import { oa4ArrayRepeatedAddition } from './oa4-array-repeated-addition';
import { nbt1VariousGroupings } from './nbt1-various-groupings';
import { nbt2SkipCount } from './nbt2-skip-count';
import { nbt3ExpandedForm } from './nbt3-expanded-form';
import { nbt4CompareThreeDigit } from './nbt4-compare-three-digit';
import { nbt5AddWithin100 } from './nbt5-add-within-100';
import { nbt5SubtractWithin100 } from './nbt5-subtract-within-100';
import { nbt6ThreeAddendSum } from './nbt6-three-addend-sum';
import { nbt7AddWithin1000 } from './nbt7-add-within-1000';
import { nbt7SubtractWithin1000 } from './nbt7-subtract-within-1000';
import { nbt8TenOrHundred } from './nbt8-ten-or-hundred';
import { md1ReadARuler } from './md1-read-a-ruler';
import { md2TwoUnits } from './md2-two-units';
import { md5ShorterLengthUnknown } from './md5-shorter-length-unknown';
import { md7ClockToFiveMinutes } from './md7-clock-to-five-minutes';
import { md8CountCoins } from './md8-count-coins';
import { md10BarGraphHowManyMore } from './md10-bar-graph-how-many-more';

/** Every parameterized Grade 2 template, from Task 17 (OA and Geometry),
 *  Task 18 (Base Ten) and Task 19 (Measurement & Data).
 *
 *  One generator per NC.2.OA standard, each covering a DIFFERENT problem
 *  shape from the authored bank in `../authored.oa.ts` so a review key never
 *  overlaps between the two:
 *
 *    NC.2.OA.1  a one-step TAKE-FROM, CHANGE UNKNOWN word problem. The
 *               authored bank hand-writes the other four named CGI types
 *               (Start Unknown, Compare-Bigger, Compare-Smaller, and both
 *               two-step types); this is the one common type neither of
 *               those covers.
 *    NC.2.OA.2  a bare addition or subtraction FACT within 20, fluency
 *               practice with fresh numbers every draw.
 *    NC.2.OA.3  a set of four numbers, ODD-OR-EVEN asked for one of them.
 *               The standard's third bullet — writing an even number as a
 *               sum of two equal addends — is a distinct skill authored by
 *               hand instead (g2-oa3-04), per ruling 17-2.
 *    NC.2.OA.4  a RECTANGULAR ARRAY, up to 5 rows by 5 columns, total found
 *               by ADDING equal rows (never multiplying — that is Grade 3).
 *
 *  NC.2.G.1 and NC.2.G.3 have NO generator, deliberately: G.1 is naming
 *  shapes and describing solids by their attributes, and G.3 is partitioning
 *  and describing equal shares, including the "equal shares need not look
 *  alike" reasoning idea (ruling 17-5). In both, the mathematics is entirely
 *  in the wording; swapping a number changes nothing. Both are authored in
 *  full in `../authored.g.ts`, matching Grade 3's Geometry (no generator
 *  either, same reasoning).
 *
 *  ── Base Ten ──────────────────────────────────────────────────────────────
 *
 *  Every one of the eight NC.2.NBT standards has a generator here — ten
 *  templates in all, because NC.2.NBT.5 and NC.2.NBT.7 each get two — because
 *  Base Ten is where Grade 2's procedures live and a procedure is learned on
 *  numbers a child has not seen before. Each one takes the half of its
 *  standard that changing the numbers actually changes, and leaves the rest to
 *  `../authored.nbt.ts`:
 *
 *    NC.2.NBT.1  TRADING one hundred for ten tens — the standard's third
 *                keyConcept, "compose and decompose numbers using various
 *                groupings" (ruling 18-2). Its other two keyConcepts,
 *                unitizing and "100 … 900 are N hundreds with 0 tens and 0
 *                ones", are single facts that fresh numbers do not exercise,
 *                and are authored (g2-nbt1-01, g2-nbt1-02).
 *    NC.2.NBT.2  SKIP-COUNTING by 5s, 10s or 100s. A count by 10s starts on a
 *                number whose ones digit is non-zero and a count by 100s on one
 *                whose tens AND ones digits are both non-zero, so neither can
 *                be answered by reciting 10, 20, 30 or 100, 200, 300 — the
 *                count has to carry the lower digits along. A count by 5s does
 *                start on a multiple of 5, because that is what counting by
 *                fives means. Plain counting within 1,000 is authored
 *                (g2-nbt2-01), because the only interesting case is the moment
 *                a hundred rolls over and a random start almost never lands
 *                on it.
 *    NC.2.NBT.3  EXPANDED FORM. The standard's other two representations,
 *                base-ten numerals and number NAMES, turn on English number
 *                words — "four hundred seven" heard as forty-seven — and a
 *                generator spelling number names would be generating English
 *                rather than mathematics; both are authored (g2-nbt3-01,
 *                g2-nbt3-02, g2-nbt3-04).
 *    NC.2.NBT.4  COMPARING two three-digit numbers that share a hundreds
 *                digit, so the tens have to settle it. Every option carries
 *                its reason, because the standard says "based on the VALUE of
 *                the hundreds, tens, and ones digits" and a bare symbol is
 *                answerable by guessing.
 *    NC.2.NBT.5  addition WITHIN 100 and subtraction WITHIN 100, as TWO
 *                templates, one regrouping each.
 *    NC.2.NBT.6  two or three TWO-DIGIT addends — never four, whatever the
 *                Common Core standard of the same number says (ruling 18-1) —
 *                with the total held above 100 so the item is not something
 *                NC.2.NBT.5 already owns.
 *    NC.2.NBT.7  addition WITHIN 1,000 and subtraction WITHIN 1,000, as TWO
 *                templates.
 *    NC.2.NBT.8  10 OR 100 more or less, mentally, on a number 100–900. All
 *                four combinations are drawn, and the amount NOT asked for is
 *                always a distractor, because using one where the other
 *                belongs is the error the standard exists to catch
 *                (ruling 18-6).
 *
 *  NC.2.NBT.5 AND NC.2.NBT.7 ARE STRATEGY STANDARDS, and their generators
 *  carry only half of what they ask for (ruling 18-7). NC.2.NBT.5's sourced
 *  keyConcepts are using strategies flexibly, COMPARING strategies and
 *  explaining why they work, and SELECTING an appropriate one; NC.2.NBT.7's
 *  are concrete models, place-value strategies, properties of operations, and
 *  the addition/subtraction relationship, all in service of "relating the
 *  strategy to a WRITTEN METHOD". None of that can be asked by swapping
 *  numbers — the question is about the strategy, not the answer — so the
 *  generators drill the arithmetic and the authored bank carries the
 *  explain / compare / select half explicitly: g2-nbt5-02 selects a strategy,
 *  g2-nbt5-04 compares two and says why the total is unchanged, g2-nbt7-01
 *  ties base-ten blocks to the written algorithm, g2-nbt7-03 relates counting
 *  up to it, and g2-nbt7-04 selects between four strategies. This is the same
 *  division Grade 4 records for its own procedure standards in
 *  `../../grade4/templates/index.ts`.
 *
 *  BOTH OF THOSE STANDARDS SPLIT INTO TWO TEMPLATES, one per operation, and
 *  this is not a stylistic choice. A review key is seedless — it is
 *  `{kind:'generated', templateId}` and carries no seed
 *  (`../../../engine/questionModel.ts`) — so a single template drawing
 *  addition or subtraction by coin flip lets a child who failed a subtraction
 *  item be re-served an addition item under the IDENTICAL key, answer it, and
 *  have a real borrowing failure retired as mastered with the borrowing never
 *  retested. The two operations also emit disjoint misconception sets (carry
 *  errors against borrow errors, with an empty intersection in both standards),
 *  which is the design spec's own test for when one template id is really two
 *  skills. This follows the precedent already set on either side of Grade 2:
 *  Grade 3 splits NC.3.NBT.2 into `../../grade3/templates/nbt2-add-within-1000.ts`
 *  and `nbt2-subtract-within-1000.ts`, and Grade 4 splits NC.4.NBT.4 into
 *  `../../grade4/templates/nbt4-add.ts` and `nbt4-subtract.ts`, both citing
 *  exactly this seedless-review-key argument.
 *
 *  `./oa2-fluency-fact.ts` still draws both operations from one template, and
 *  that stays: it is single-digit fact recall within 20, where there is no
 *  regrouping procedure to fail at, and its two directions SHARE two of their
 *  three misconception tags (both count on by ones, one short and one too many)
 *  instead of partitioning into disjoint sets.
 *
 *  ── Measurement & Data ────────────────────────────────────────────────────
 *
 *  RULING 19-1 DECIDES WHICH CODE EACH OF THESE CARRIES. The Task 19 brief
 *  cycled three codes by one — time under MD.6, money under MD.7, the number
 *  line under MD.8 — and a clock generator filed as NC.2.MD.6 passes every
 *  test that only asks whether its code exists in the grade. The sourced text
 *  in `../standards.ts` is the ground truth: MD.6 is the NUMBER LINE, MD.7 is
 *  TIME, MD.8 is MONEY. `./index.test.ts` now checks every template id's
 *  middle against the code it is filed under, and `../authored.md.test.ts`
 *  reads the topic of every question back out of its own text.
 *
 *  Six of the nine NC.2.MD standards have a generator, each drilling ONE
 *  skill with ONE set of named errors, so a seedless review key re-tests
 *  exactly what was failed:
 *
 *    NC.2.MD.1   READING A RULER in inches or centimeters, the object never
 *                starting at 0. Choosing the tool is authored (g2-md1-01..03).
 *    NC.2.MD.2   the SAME OBJECT MEASURED IN TWO UNITS — which count is
 *                bigger. Its own template, never merged with MD.1 (ruling
 *                19-2): MD.2 is the inverse relationship, not a fixed unit.
 *    NC.2.MD.5   a COMPARE, SMALLER-UNKNOWN length problem within 100, with
 *                its ☐ + n = m equation printed. Put-together, start-unknown
 *                and choose-the-equation items are authored.
 *    NC.2.MD.7   TIME late in the hour (:35 to :55) to the nearest five
 *                minutes, a.m. or p.m. from the part of the day. The authored
 *                items read :00, :15, :25 and :30 and carry the a.m.-against-
 *                p.m. choice.
 *    NC.2.MD.8   COUNTING COINS within 99¢. Whole dollars, spending, and the
 *                ¢ and $ signs themselves are authored.
 *    NC.2.MD.10  "HOW MANY MORE" off a four-bar graph on a scale of one.
 *                Organizing a data set into a graph (ruling 19-4), and the
 *                put-together and take-apart problems, are authored.
 *
 *  NC.2.MD.3, NC.2.MD.4 and NC.2.MD.6 have NO generator, as ruling 19-1
 *  allows: estimating is a question about a real object and a benchmark, and
 *  fresh numbers turn it into guessing; comparing two lengths is the MD.1
 *  ruler twice plus MD.5's subtraction; and the number line is authored in
 *  four shapes (counting on, counting back, choosing a diagram, a length from
 *  0 on a line marked in 5s) whose errors differ from shape to shape. */
export const GRADE_2_TEMPLATES: QuestionTemplate[] = [
  oa1ChangeUnknown,
  oa2FluencyFact,
  oa3OddOrEven,
  oa4ArrayRepeatedAddition,
  nbt1VariousGroupings,
  nbt2SkipCount,
  nbt3ExpandedForm,
  nbt4CompareThreeDigit,
  nbt5AddWithin100,
  nbt5SubtractWithin100,
  nbt6ThreeAddendSum,
  nbt7AddWithin1000,
  nbt7SubtractWithin1000,
  nbt8TenOrHundred,
  md1ReadARuler,
  md2TwoUnits,
  md5ShorterLengthUnknown,
  md7ClockToFiveMinutes,
  md8CountCoins,
  md10BarGraphHowManyMore,
];

export {
  oa1ChangeUnknown,
  oa2FluencyFact,
  oa3OddOrEven,
  oa4ArrayRepeatedAddition,
  nbt1VariousGroupings,
  nbt2SkipCount,
  nbt3ExpandedForm,
  nbt4CompareThreeDigit,
  nbt5AddWithin100,
  nbt5SubtractWithin100,
  nbt6ThreeAddendSum,
  nbt7AddWithin1000,
  nbt7SubtractWithin1000,
  nbt8TenOrHundred,
  md1ReadARuler,
  md2TwoUnits,
  md5ShorterLengthUnknown,
  md7ClockToFiveMinutes,
  md8CountCoins,
  md10BarGraphHowManyMore,
};
