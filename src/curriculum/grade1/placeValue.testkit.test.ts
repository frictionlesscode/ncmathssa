import { describe, it, expect } from 'vitest';
import { assertCountWordsAgree, assertStatedArithmeticHolds } from './placeValue.testkit';

// Checking the checker: each guard must pass a true sentence and fail a false
// one, or a green template test would prove nothing.
describe('grade 1 place-value testkit', () => {
  it('accepts true claims and counts them', () => {
    const texts = [
      'Step 1: 47 is 4 tens and 7 ones.',
      'Step 2: 12 ones is 1 ten and 2 ones, so now there are 5 tens and 2 ones.',
      'Step 3: 5 tens and 2 ones is 52. 4 tens is 40. 7 ones is 7.',
      'Step 4: 70 is 7 tens and 30 is 3 tens. Check: 30 + 40 = 70, so 70 − 30 = 40.',
      'Fourteen is written 14, and 1 ten and 4 ones is written 14.',
    ];
    // LITERAL: 1 split, 0 (the trade in step 2 is not a claim), 3 (join,
    // tens, ones), 3 (two sums, "30 is 3 tens"), 1 join.
    expect(assertStatedArithmeticHolds(texts, 'true')).toBe(8);
  });

  it.each([
    ['a false sum', 'Step 3: 38 + 6 = 45.'],
    ['a false difference', 'So 70 − 30 = 30.'],
    ['a false split', '47 is 7 tens and 4 ones.'],
    ['a false join', '4 tens and 7 ones is 74.'],
    ['a false place', '4 tens is 4.'],
    ['a false ones count', '7 ones is 70.'],
    ['a false multiple of ten', '70 is 3 tens.'],
  ])('rejects %s', (_label, text) => {
    expect(() => assertStatedArithmeticHolds([text], 'false')).toThrow();
  });

  it('accepts count words that agree with their number', () => {
    expect(() =>
      assertCountWordsAgree(['1 ten and 1 one', '0 tens and 4 ones', '12 ones make one new ten'], 'ok'),
    ).not.toThrow();
  });

  it.each([['1 tens and 4 ones'], ['4 tens and 1 ones'], ['4 ten and 3 ones'], ['0 one']])(
    'rejects "%s"',
    (text) => {
      expect(() => assertCountWordsAgree([text], 'bad')).toThrow();
    },
  );
});
