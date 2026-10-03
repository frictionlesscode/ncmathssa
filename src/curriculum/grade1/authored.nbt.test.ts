import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from './placeValue.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_NBT_AUTHORED } from './authored.nbt';
import { GRADE_1_TEMPLATES } from './templates';

const nbt = GRADE_1_DOMAINS.find((d) => d.id === 'NBT')!;
const itemsFor = (code: string) => GRADE_1_NBT_AUTHORED.filter((q) => q.standardCode === code);
const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe('grade 1 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_1_NBT_AUTHORED, nbt);
  });

  // Brief's own step 1 assertion.
  it('keeps every prompt short enough for a six-year-old to read', () => {
    for (const q of GRADE_1_NBT_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });

  // Ruling 22-7 / E.3: the shared, tighter guard, not a local copy.
  it('keeps every prompt readable for a six-year-old', () => {
    assertGradeOneReadable(GRADE_1_NBT_AUTHORED);
  });

  it('gives every standard a mastery item and an advanced item', () => {
    for (const s of nbt.standards) {
      const levels = new Set(itemsFor(s.code).map((q) => q.difficulty));
      expect(levels.has('mastery'), `${s.code} has no mastery item`).toBe(true);
      expect(levels.has('advanced'), `${s.code} has no advanced item`).toBe(true);
    }
  });

  // Ruling 23-9: authored items are never reproduced word for word by a
  // Grade 1 NBT generator.
  it('is never reproduced word for word by a Grade 1 NBT generator', () => {
    assertNoGeneratorDuplicatesAuthored(
      GRADE_1_NBT_AUTHORED,
      GRADE_1_TEMPLATES.filter((t) => t.domainId === 'NBT'),
    );
  });

  // Every child-facing sentence in every worked solution must be true.
  it('states only true things in every worked solution', () => {
    let claims = 0;
    for (const q of GRADE_1_NBT_AUTHORED) {
      const texts = explanationTexts(q.explanation);
      claims += assertStatedArithmeticHolds(texts, q.id);
      assertCountWordsAgree(texts, q.id);
    }
    expect(claims).toBeGreaterThan(0);
  });

  // Ruling 23-3: NC.1.NBT.1 counts to 150, not the Common Core's 120.
  it('keeps every NC.1.NBT.1 number below or at 150', () => {
    for (const q of itemsFor('NC.1.NBT.1')) {
      for (const n of numbersIn(q.prompt)) {
        expect(n, `${q.id}: ${n}`).toBeLessThanOrEqual(150);
      }
    }
  });

  // Ruling 23-4: NC.1.NBT.7 numerals are 0-100, never inheriting NBT.1's 150.
  it('keeps every NC.1.NBT.7 correct numeral within 0-100', () => {
    for (const q of itemsFor('NC.1.NBT.7')) {
      const correct = q.options.find((o) => o.isCorrect)!;
      expect(Number(correct.text), `${q.id}`).toBeGreaterThanOrEqual(0);
      expect(Number(correct.text), `${q.id}`).toBeLessThanOrEqual(100);
    }
  });

  // Ruling 23-2: NC.1.NBT.4's second addend is a one-digit number or a
  // multiple of 10, and the sum stays within 100. Reads a and b from the
  // LIVE bank, so an edit that breaks the ruling fails here.
  it('keeps every NC.1.NBT.4 item within the standard\'s addend shape', () => {
    for (const q of itemsFor('NC.1.NBT.4')) {
      const [a, b] = numbersIn(q.prompt);
      const isOneDigit = b >= 1 && b <= 9;
      const isMultipleOfTen = b >= 10 && b % 10 === 0;
      expect(isOneDigit || isMultipleOfTen, `${q.id}: b=${b}`).toBe(true);
      expect(a + b, `${q.id}: ${a} + ${b}`).toBeLessThanOrEqual(100);
      const correct = q.options.find((o) => o.isCorrect)!;
      expect(Number(correct.text), `${q.id}`).toBe(a + b);
    }
  });

  // Ruling 23-5: NC.1.NBT.6 stays within 10-90 and never offers a negative
  // option.
  it('keeps every NC.1.NBT.6 option non-negative', () => {
    for (const q of itemsFor('NC.1.NBT.6')) {
      for (const o of q.options) {
        if (/^\d+$/.test(o.text)) expect(Number(o.text), `${q.id}: ${o.text}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // Ruling 23-8: NC.1.NBT.5 draws two-digit numbers, and the bank includes
  // both the top of the range and a drop into single digits. content-g1
  // audit: no result reaches 100, because trading 10 tens for a hundred is
  // Grade 2 place value.
  it('covers both edges of NC.1.NBT.5s range, all below 100', () => {
    const correctValues = itemsFor('NC.1.NBT.5').map((q) => Number(q.options.find((o) => o.isCorrect)!.text));
    expect(correctValues.some((v) => v >= 90 && v <= 99)).toBe(true);
    expect(correctValues.some((v) => v < 10)).toBe(true);
    expect(correctValues.every((v) => v < 100)).toBe(true);
  });

  // The brief's own founding errors, named verbatim. Each is checked on the
  // SPECIFIC item and option it lives on, not as a bank-wide substring
  // search - a substring search for "31" or "24" is satisfied by unrelated
  // numbers elsewhere in the bank (131 in g1-nbt1-02, for instance) and would
  // stay green even if the intended item were rewritten to drop the error.
  const optionTag = (id: string, text: string): string | undefined =>
    GRADE_1_NBT_AUTHORED.find((q) => q.id === id)!.options.find((o) => o.text === text)?.misconception;

  it('gives g1-nbt2-01 the "13 read as 31" founding error', () => {
    expect(optionTag('g1-nbt2-01', '31')).toBe('swapped-the-tens-and-the-ones');
  });

  it('gives g1-nbt7-01 the "13 read as 31" founding error', () => {
    expect(optionTag('g1-nbt7-01', '31')).toBe('swapped-the-tens-and-the-ones');
  });

  it('gives g1-nbt2-03 the "4 tens and 2 ones written 24" founding error', () => {
    expect(optionTag('g1-nbt2-03', '24')).toBe('swapped-the-tens-and-the-ones');
  });

  it('gives g1-nbt4-01 the "19 + 1 believed to be 110" founding error', () => {
    expect(optionTag('g1-nbt4-01', '110')).toBe('wrote-the-digits-side-by-side-instead-of-adding-the-values');
  });

  it('gives g1-nbt3-01 the "compared by the ones digit" founding error', () => {
    expect(optionTag('g1-nbt3-01', '38')).toBe('compared-the-wrong-place-first');
  });
});
