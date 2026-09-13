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
import { nf6DecimalNotation } from './nf6-decimal-notation';
import { nf7CompareDecimals } from './nf7-compare-decimals';
import { md1MetricWordProblem } from './md1-metric-word-problem';
import { md2MetricConvert } from './md2-metric-convert';
import { md3RectangleArea } from './md3-rectangle-area';
import { md3RectanglePerimeter } from './md3-rectangle-perimeter';
import { md6MissingAnglePart } from './md6-missing-angle-part';

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
 *  NC.4.NF.6 gets two for the same reason again, and this time the standard
 *  itself makes the split: its keyConcepts hold decimal NOTATION for tenths
 *  and hundredths and, separately, ADDING two fractions with denominators of
 *  10 or 100. Writing 47/100 as 0.47 and adding 4/10 to 7/100 are different
 *  procedures that go wrong in different ways.
 *
 *  Measurement & Data adds five, and the splits are the same rule again.
 *  NC.4.MD.1 (metric word problems) and NC.4.MD.2 (converting a larger unit to
 *  a smaller one) are SEPARATE templates even though both are "measurement in
 *  metric units": solving a one-step word problem and applying a conversion
 *  factor are different skills, and a seedless review key would let a child who
 *  failed at one be reviewed with the other. NC.4.MD.3 splits into area and
 *  perimeter for the reason set out in ./md3-rectangle-area.ts, and NC.4.MD.6
 *  contributes only the decomposition half of its standard - see
 *  ./md6-missing-angle-part.ts.
 *
 *  NC.4.MD.8 (time intervals) and NC.4.MD.4 (representing and interpreting
 *  data) have NO generator, and deliberately. What they teach lives in the
 *  wording - what "crosses the hour" means in a real afternoon, and which
 *  survey question yields numerical data - not in the numbers, so fresh
 *  numbers would add nothing a hand-written item does not already do better.
 *
 *  Geometry adds NOTHING here, and never will: Grade 4 Geometry is
 *  authored-only by design. All three of its standards are classification and
 *  vocabulary - what a ray is, whether a pair of lines is parallel or
 *  perpendicular, which quadrilateral or triangle a figure is, where a fold
 *  line falls - and swapping the numbers in such an item changes nothing about
 *  what it asks. A generator would only vary the letters naming the points,
 *  producing exactly the interchangeable item this plan set out to get away
 *  from, so the whole domain lives in ../authored.g.ts and CurriculumView
 *  badges it "Fixed Question Set". */
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
  nf6DecimalNotation,
  nf7CompareDecimals,
  md1MetricWordProblem,
  md2MetricConvert,
  md3RectangleArea,
  md3RectanglePerimeter,
  md6MissingAnglePart,
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
  nf6DecimalNotation,
  nf7CompareDecimals,
  md1MetricWordProblem,
  md2MetricConvert,
  md3RectangleArea,
  md3RectanglePerimeter,
  md6MissingAnglePart,
};
