import type { QuestionTemplate } from '../../../engine/template';
import { oa1TimesAsMany } from './oa1-times-as-many';
import { oa4FactorPairs } from './oa4-factor-pairs';
import { nbt1TenTimes } from './nbt1-ten-times';
import { nbt2ExpandedForm } from './nbt2-expanded-form';
import { nbt7CompareNumbers } from './nbt7-compare-numbers';
import { nbt4Add } from './nbt4-add';
import { nbt4Subtract } from './nbt4-subtract';
import { nbt5TwoDigitMultiply } from './nbt5-two-digit-multiply';
import { nbt6DivideOneDigit } from './nbt6-divide-one-digit';
import { nf1EquivalentFraction } from './nf1-equivalent-fraction';
import { nf2OrderFractions } from './nf2-order-fractions';
import { nf3AddLike } from './nf3-add-like';
import { nf3SubtractMixed } from './nf3-subtract-mixed';
import { nf4MultiplyByWhole } from './nf4-multiply-by-whole';
import { nf6AddTenthsHundredths } from './nf6-add-tenths-hundredths';
import { nf7CompareDecimals } from './nf7-compare-decimals';

/** Every parameterized Grade 4 template. Generated items cover the
 *  computational standards, where fresh numbers each run are what make
 *  practice practice; reasoning, multi-step word problems and pattern items
 *  stay hand-authored, because there the wording carries the mathematics.
 *
 *  NC.4.OA.3 (two-step word problems) and NC.4.OA.5 (patterns) are authored
 *  for exactly that reason: swapping the numbers in a two-step problem does
 *  not change what it teaches, and a pattern item's difficulty lives in how
 *  the rule is phrased, not in the values it produces.
 *
 *  Base Ten is the opposite case, and every one of its six standards has a
 *  generator here: place value, reading and writing numerals, comparing,
 *  addition, subtraction, multiplication and division. These are procedures,
 *  and a procedure is learned on numbers a student has not seen before. The
 *  authored NBT bank sits alongside them doing what they cannot — word
 *  problems, error analysis, and choosing what a remainder means — and is held
 *  clear of their output by prompt shape.
 *
 *  NC.4.NBT.4 gets TWO templates, not one, even though it is one standard.
 *  A review key is seedless, so one template spanning addition and subtraction
 *  would let a child who failed at borrowing be reviewed with an addition item,
 *  promoted for answering it, and retired as mastered with the borrowing never
 *  retested. One template, one skill — see the docstring on ./nbt4-subtract.ts.
 *
 *  Fractions is the same case again, and the heaviest: NF carries 30-34% of
 *  the assessment, and equivalence, comparison, addition, subtraction,
 *  multiplication by a whole number and decimal notation are all procedures
 *  that have to be practised on numbers a student has not seen before. Six of
 *  its standards have a generator here; the authored NF bank sits alongside
 *  doing what they cannot - word problems, error analysis, and the two places
 *  the standards themselves ask a child to explain WHY (NC.4.NF.1's models,
 *  and the rule that a comparison is only valid against the same whole).
 *
 *  NC.4.NF.3 gets TWO templates for the same reason NC.4.NBT.4 does. Adding
 *  like denominators and subtracting mixed numbers with regrouping are two
 *  procedures with disjoint misconception sets, and a review key is seedless:
 *  one template spanning both would let a child who failed at regrouping be
 *  reviewed with an addition item and retired as mastered. One template, one
 *  skill - see the docstring on ./nf3-subtract-mixed.ts.
 *
 *  Tasks 8 and 9 append this grade's MD and G templates here. */
export const GRADE_4_TEMPLATES: QuestionTemplate[] = [
  oa1TimesAsMany,
  oa4FactorPairs,
  nbt1TenTimes,
  nbt2ExpandedForm,
  nbt7CompareNumbers,
  nbt4Add,
  nbt4Subtract,
  nbt5TwoDigitMultiply,
  nbt6DivideOneDigit,
  nf1EquivalentFraction,
  nf2OrderFractions,
  nf3AddLike,
  nf3SubtractMixed,
  nf4MultiplyByWhole,
  nf6AddTenthsHundredths,
  nf7CompareDecimals,
];

export {
  oa1TimesAsMany,
  oa4FactorPairs,
  nbt1TenTimes,
  nbt2ExpandedForm,
  nbt7CompareNumbers,
  nbt4Add,
  nbt4Subtract,
  nbt5TwoDigitMultiply,
  nbt6DivideOneDigit,
  nf1EquivalentFraction,
  nf2OrderFractions,
  nf3AddLike,
  nf3SubtractMixed,
  nf4MultiplyByWhole,
  nf6AddTenthsHundredths,
  nf7CompareDecimals,
};
