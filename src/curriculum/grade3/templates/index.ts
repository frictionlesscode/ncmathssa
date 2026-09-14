import type { QuestionTemplate } from '../../../engine/template';
import { oa1EqualGroupsArray } from './oa1-equal-groups-array';
import { oa2EqualShares } from './oa2-equal-shares';
import { oa3OneStepWordProblem } from './oa3-one-step-word-problem';
import { oa6MissingFactor } from './oa6-missing-factor';
import { oa7MultiplicationFact } from './oa7-multiplication-fact';

/** Every parameterized Grade 3 template. Generated items cover the standards
 *  whose practice value is in fresh numbers; reasoning standards and
 *  multi-step word problems stay hand-authored, because there the wording
 *  carries the mathematics.
 *
 *  Operations & Algebraic Thinking is the largest band at Grade 3 (32-36%) and
 *  five of its seven standards have a generator here. Each one has a DISTINCT
 *  QUESTION SHAPE, and that is load-bearing rather than decorative. A review
 *  key is seedless, so if two generators could emit the same question, one
 *  question would sit under two review keys and a child who answered it once
 *  would be credited with both standards. Grade 3 OA is the worst case for
 *  that in this curriculum: factors 1-10 is only 100 products in total, so
 *  every generator here is drawing from very nearly the same numbers. What
 *  keeps them apart is the shape of the question, not the arithmetic:
 *
 *    NC.3.OA.1  an ARRAY drawn in promptDetails, product unknown
 *    NC.3.OA.2  EQUAL GROUPS drawn in promptDetails, share unknown
 *    NC.3.OA.3  a one-step WORD PROBLEM, no figure and no equation printed
 *    NC.3.OA.6  a bare EQUATION WITH A BOX, `a × ☐ = p`
 *    NC.3.OA.7  a BARE FACT, `a × b`
 *
 *  Only OA.7 is bare-fact recall, because fluency is the only one of the five
 *  that is genuinely about recall with nothing attached. ./index.test.ts
 *  asserts the five prompt sets are pairwise disjoint over a seed sweep rather
 *  than leaving that to inspection.
 *
 *  Two OA standards have NO generator, and deliberately:
 *
 *  NC.3.OA.8 ("Solve two-step word problems using addition, subtraction, and
 *  multiplication") is a multi-step word problem, which the plan's Content
 *  Contract reserves for authoring throughout — Grade 4 decided the analogous
 *  NC.4.OA.3 the same way. Swapping the numbers in a two-step problem does not
 *  change what it teaches; the wording is the difficulty. Note also that NC's
 *  OA.8 is +, - and × only. CCSS 3.OA.8 says "the four operations", and that
 *  is the version a generator written from memory would produce.
 *
 *  NC.3.OA.9 ("Interpret patterns of multiplication on a hundreds board and/or
 *  multiplication table") is a reasoning standard whose own third keyConcept is
 *  "interpreting, not just spotting, the pattern found". A generator can vary
 *  which pattern is shown but not what makes explaining it hard, so the whole
 *  standard lives in ../authored.oa.ts, including the hundreds-board half that
 *  a times-table-only bank would quietly drop.
 *
 *  Tasks 13 and 14 append NBT, NF, MD and Geometry generators to this array. */
export const GRADE_3_TEMPLATES: QuestionTemplate[] = [
  oa1EqualGroupsArray,
  oa2EqualShares,
  oa3OneStepWordProblem,
  oa6MissingFactor,
  oa7MultiplicationFact,
];

export {
  oa1EqualGroupsArray,
  oa2EqualShares,
  oa3OneStepWordProblem,
  oa6MissingFactor,
  oa7MultiplicationFact,
};
