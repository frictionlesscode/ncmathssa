import type { QuestionTemplate } from '../../../engine/template';
import { oa1TimesAsMany } from './oa1-times-as-many';
import { oa4FactorPairs } from './oa4-factor-pairs';

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
 *  Tasks 6 through 9 append this grade's NBT, NF, MD and G templates here. */
export const GRADE_4_TEMPLATES: QuestionTemplate[] = [oa1TimesAsMany, oa4FactorPairs];

export { oa1TimesAsMany, oa4FactorPairs };
