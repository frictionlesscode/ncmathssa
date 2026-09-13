import type { QuestionTemplate } from '../../../engine/template';
import { oa1TimesAsMany } from './oa1-times-as-many';
import { oa4FactorPairs } from './oa4-factor-pairs';
import { nbt1TenTimes } from './nbt1-ten-times';
import { nbt2ExpandedForm } from './nbt2-expanded-form';
import { nbt7CompareNumbers } from './nbt7-compare-numbers';
import { nbt4AddSubtract } from './nbt4-add-subtract';
import { nbt5TwoDigitMultiply } from './nbt5-two-digit-multiply';
import { nbt6DivideOneDigit } from './nbt6-divide-one-digit';

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
 *  the addition and subtraction algorithm, multiplication and division. These
 *  are procedures, and a procedure is learned on numbers a student has not
 *  seen before. The authored NBT bank sits alongside them doing what they
 *  cannot — word problems, error analysis, and choosing what a remainder
 *  means — and is held clear of their output by prompt shape.
 *
 *  Tasks 7 through 9 append this grade's NF, MD and G templates here. */
export const GRADE_4_TEMPLATES: QuestionTemplate[] = [
  oa1TimesAsMany,
  oa4FactorPairs,
  nbt1TenTimes,
  nbt2ExpandedForm,
  nbt7CompareNumbers,
  nbt4AddSubtract,
  nbt5TwoDigitMultiply,
  nbt6DivideOneDigit,
];

export {
  oa1TimesAsMany,
  oa4FactorPairs,
  nbt1TenTimes,
  nbt2ExpandedForm,
  nbt7CompareNumbers,
  nbt4AddSubtract,
  nbt5TwoDigitMultiply,
  nbt6DivideOneDigit,
};
