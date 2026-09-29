import { describe, it, expect } from 'vitest';
import { unitCount, tensAndOnes, numberName } from './placeValue';

describe('grade 1 place-value words', () => {
  // A six-year-old reads these, so "1 tens" and "4 ten" are wrong answers too.
  it('says "1 ten" and "1 one", and pluralises every other count', () => {
    expect(unitCount(1, 'ten')).toBe('1 ten');
    expect(unitCount(1, 'one')).toBe('1 one');
    expect(unitCount(0, 'one')).toBe('0 ones');
    expect(unitCount(0, 'ten')).toBe('0 tens');
    expect(unitCount(4, 'ten')).toBe('4 tens');
    expect(unitCount(12, 'one')).toBe('12 ones');
  });

  it('splits a number below 100 into its tens and its ones', () => {
    expect(tensAndOnes(47)).toBe('4 tens and 7 ones');
    expect(tensAndOnes(11)).toBe('1 ten and 1 one');
    expect(tensAndOnes(70)).toBe('7 tens and 0 ones');
    expect(tensAndOnes(4)).toBe('0 tens and 4 ones');
    expect(tensAndOnes(91)).toBe('9 tens and 1 one');
    expect(() => tensAndOnes(100)).toThrow();
  });

  it('names every number from 20 to 99', () => {
    expect(numberName(20)).toBe('twenty');
    expect(numberName(21)).toBe('twenty-one');
    expect(numberName(47)).toBe('forty-seven');
    expect(numberName(70)).toBe('seventy');
    expect(numberName(88)).toBe('eighty-eight');
    expect(numberName(99)).toBe('ninety-nine');
    // Spelling traps: "forty", not "fourty"; "eighty", not "eightty".
    expect(numberName(40)).toBe('forty');
    expect(numberName(80)).toBe('eighty');
    expect(() => numberName(19)).toThrow();
    expect(() => numberName(100)).toThrow();
  });

  it('builds every name from one tens word and at most one ones word', () => {
    const TENS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    for (let n = 20; n <= 99; n++) {
      const [tens, ones, ...rest] = numberName(n).split('-');
      expect(rest, `${n}`).toEqual([]);
      expect(tens, `${n}`).toBe(TENS[Math.floor(n / 10) - 2]);
      expect(ones, `${n}`).toBe(n % 10 === 0 ? undefined : ONES[(n % 10) - 1]);
    }
  });
});
