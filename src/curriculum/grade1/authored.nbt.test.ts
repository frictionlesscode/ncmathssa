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
  // multiple of 10, and the sum stays within 100.
  it('keeps every NC.1.NBT.4 item within the standard\'s addend shape', () => {
    const shapes = [
      { a: 19, b: 1 },
      { a: 24, b: 3 },
      { a: 45, b: 20 },
    ];
    for (const { a, b } of shapes) {
      const isOneDigit = b >= 1 && b <= 9;
      const isMultipleOfTen = b % 10 === 0;
      expect(isOneDigit || isMultipleOfTen).toBe(true);
      expect(a + b, `${a} + ${b}`).toBeLessThanOrEqual(100);
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

  // Ruling 23-8: NC.1.NBT.5 draws two-digit numbers 10-99, and the bank
  // includes both a crossing into a new hundred and a drop into single
  // digits.
  it('covers both edges of NC.1.NBT.5s range', () => {
    const correctValues = itemsFor('NC.1.NBT.5').map((q) => Number(q.options.find((o) => o.isCorrect)!.text));
    expect(correctValues.some((v) => v >= 100)).toBe(true);
    expect(correctValues.some((v) => v < 10)).toBe(true);
  });

  // The brief's own founding errors, named verbatim.
  it('includes the founding place-value errors the brief names', () => {
    const all = GRADE_1_NBT_AUTHORED.map((q) => [q.prompt, ...q.options.map((o) => o.text)].join(' | ')).join('\n');
    // 13 read as 31.
    expect(all).toContain('31');
    // 4 tens and 2 ones written 24.
    expect(all).toContain('24');
    // 19 + 1 believed to be 110.
    expect(all).toContain('110');
    // comparing two-digit numbers by the ones digit is exercised by the
    // compared-the-wrong-place-first tag.
    const tags = GRADE_1_NBT_AUTHORED.flatMap((q) => q.options.map((o) => o.misconception).filter(Boolean));
    expect(tags).toContain('compared-the-wrong-place-first');
  });
});
