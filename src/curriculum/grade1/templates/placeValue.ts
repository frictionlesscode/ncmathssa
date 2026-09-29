/**
 * Grade 1 place-value words, shared by every NBT template: how a count of
 * tens or ones is said out loud, how a two-digit number splits into its
 * tens and ones, and how a two-digit number is named ("forty-seven").
 *
 * One copy so a template and its test read the same words the same way —
 * the reason `placeValue.testkit.ts` reads worked-solution sentences back
 * against arithmetic instead of re-deriving them.
 */

/** "1 ten", "4 tens", "1 one", "0 ones". Pluralizes everything except 1. */
export function unitCount(n: number, unit: 'ten' | 'one'): string {
  const word = n === 1 ? unit : `${unit}s`;
  return `${n} ${word}`;
}

/** Splits a number below 100 into its tens and its ones, e.g. "4 tens and 7 ones". */
export function tensAndOnes(n: number): string {
  if (n < 0 || n >= 100) throw new Error(`tensAndOnes: out of range: ${n}`);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${unitCount(tens, 'ten')} and ${unitCount(ones, 'one')}`;
}

const TENS_WORDS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ONES_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/** The number-name for 20-99, e.g. "forty-seven", "seventy". No CCSS teens
 *  (11-19 are not "ten-one", "ten-two"), and nothing at or above 100. */
export function numberName(n: number): string {
  if (n < 20 || n > 99) throw new Error(`numberName: out of range: ${n}`);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensWord = TENS_WORDS[tens - 2];
  if (ones === 0) return tensWord;
  return `${tensWord}-${ONES_WORDS[ones - 1]}`;
}
