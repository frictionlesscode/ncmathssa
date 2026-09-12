import type { QuestionTemplate } from '../../../engine/template';
import { nf1AddUnlike } from './nf1-add-unlike';
import { nbt1PowersOfTen } from './nbt1-powers-of-ten';
import { nbt3CompareDecimals } from './nbt3-compare-decimals';
import { nbt5MultiDigitMultiply } from './nbt5-multi-digit-multiply';
import { nbt6DivideTwoDigit } from './nbt6-divide-two-digit';
import { nbt7DecimalArithmetic } from './nbt7-decimal-arithmetic';
import { nf4MultiplyFractions } from './nf4-multiply-fractions';

/** Every parameterized Grade 5 template. Generated items cover the fluency
 *  standards, where fresh numbers each run are what make practice practice;
 *  reasoning and multi-step word problems stay hand-authored, because there
 *  the wording carries the mathematics. */
export const GRADE_5_TEMPLATES: QuestionTemplate[] = [
  nf1AddUnlike,
  nbt1PowersOfTen,
  nbt3CompareDecimals,
  nbt5MultiDigitMultiply,
  nbt6DivideTwoDigit,
  nbt7DecimalArithmetic,
  nf4MultiplyFractions,
];

export { nf1AddUnlike, nbt1PowersOfTen, nbt3CompareDecimals, nbt5MultiDigitMultiply, nbt6DivideTwoDigit, nbt7DecimalArithmetic, nf4MultiplyFractions };
