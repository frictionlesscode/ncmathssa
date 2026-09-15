import type { QuestionTemplate } from '../../../engine/template';
import { oa1ChangeUnknown } from './oa1-change-unknown';
import { oa2FluencyFact } from './oa2-fluency-fact';
import { oa3OddOrEven } from './oa3-odd-or-even';
import { oa4ArrayRepeatedAddition } from './oa4-array-repeated-addition';
import { nbt1VariousGroupings } from './nbt1-various-groupings';
import { nbt2SkipCount } from './nbt2-skip-count';
import { nbt3ExpandedForm } from './nbt3-expanded-form';
import { nbt4CompareThreeDigit } from './nbt4-compare-three-digit';
import { nbt5Within100 } from './nbt5-within-100';
import { nbt6ThreeAddendSum } from './nbt6-three-addend-sum';
import { nbt7Within1000 } from './nbt7-within-1000';
import { nbt8TenOrHundred } from './nbt8-ten-or-hundred';

/** Every parameterized Grade 2 template, from Task 17 (OA and Geometry) and
 *  Task 18 (Base Ten).
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
 *  Every one of the eight NC.2.NBT standards has a generator here, because
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
 *    NC.2.NBT.2  SKIP-COUNTING by 5s, 10s or 100s from a start that is never
 *                a multiple of the step. Plain counting within 1,000 is
 *                authored (g2-nbt2-01), because the only interesting case is
 *                the moment a hundred rolls over and a random start almost
 *                never lands on it.
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
 *    NC.2.NBT.5  addition and subtraction WITHIN 100, one regrouping each.
 *    NC.2.NBT.6  two or three TWO-DIGIT addends — never four, whatever the
 *                Common Core standard of the same number says (ruling 18-1) —
 *                with the total held above 100 so the item is not something
 *                NC.2.NBT.5 already owns.
 *    NC.2.NBT.7  addition and subtraction WITHIN 1,000.
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
 *  Unlike Grade 4 (and Grade 3's NC.3.NBT.2), no standard here splits into two
 *  templates. Grade 2's house style, set by `./oa2-fluency-fact.ts` in Task
 *  17, is one generator per standard with both operations drawn inside it, and
 *  Base Ten follows it. */
export const GRADE_2_TEMPLATES: QuestionTemplate[] = [
  oa1ChangeUnknown,
  oa2FluencyFact,
  oa3OddOrEven,
  oa4ArrayRepeatedAddition,
  nbt1VariousGroupings,
  nbt2SkipCount,
  nbt3ExpandedForm,
  nbt4CompareThreeDigit,
  nbt5Within100,
  nbt6ThreeAddendSum,
  nbt7Within1000,
  nbt8TenOrHundred,
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
  nbt5Within100,
  nbt6ThreeAddendSum,
  nbt7Within1000,
  nbt8TenOrHundred,
};
