import type { QuestionTemplate } from '../../../engine/template';
import { oa1ChangeUnknown } from './oa1-change-unknown';
import { oa2FluencyFact } from './oa2-fluency-fact';
import { oa3OddOrEven } from './oa3-odd-or-even';
import { oa4ArrayRepeatedAddition } from './oa4-array-repeated-addition';

/** Every parameterized Grade 2 template, from Task 17 (OA and Geometry).
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
 *  either, same reasoning). */
export const GRADE_2_TEMPLATES: QuestionTemplate[] = [
  oa1ChangeUnknown,
  oa2FluencyFact,
  oa3OddOrEven,
  oa4ArrayRepeatedAddition,
];

export { oa1ChangeUnknown, oa2FluencyFact, oa3OddOrEven, oa4ArrayRepeatedAddition };
