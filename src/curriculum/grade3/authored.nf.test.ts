import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NF_AUTHORED } from './authored.nf';
import { GRADE_3_TEMPLATES } from './templates';

/** Ruling 13-2: halves, thirds, fourths, sixths and eighths, and nothing else.
 *  Fifths, tenths, twelfths and hundredths are Grade 4. */
const LEGAL_DENOMINATORS = new Set([2, 3, 4, 6, 8]);

function textOf(q: (typeof GRADE_3_NF_AUTHORED)[number]): string {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ].join(' ');
}

/** Every `a/b` written anywhere in an item, as [numerator, denominator]. */
function fractionsIn(text: string): [number, number][] {
  return [...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

describe('grade 3 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_3_DOMAINS.find((d) => d.id === 'NF')!;
    assertAuthoredBankSound(GRADE_3_NF_AUTHORED, nf);
  });

  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_3_NF_AUTHORED, GRADE_3_TEMPLATES);
  });

  it('names every item g3-nf<tail>-NN', () => {
    for (const q of GRADE_3_NF_AUTHORED) {
      expect(q.id, `${q.id} is not a g3- hyphenated id`).toMatch(/^g3-nf\d-\d{2}$/);
    }
  });

  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_3_NF_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  it('gives every standard a mastery item and one above mastery', () => {
    const nf = GRADE_3_DOMAINS.find((d) => d.id === 'NF')!;
    for (const s of nf.standards) {
      const mine = GRADE_3_NF_AUTHORED.filter((q) => q.standardCode === s.code);
      expect(mine.some((q) => q.difficulty === 'mastery'), `${s.code} has no mastery item`).toBe(
        true,
      );
      expect(
        mine.some((q) => q.difficulty === 'advanced' || q.difficulty === 'stretch'),
        `${s.code} has no item above mastery`,
      ).toBe(true);
    }
  });

  // Ruling 13-2. Every one of the four NF standards names its denominators in
  // the sourced text, and the set is the same in all four: halves, thirds,
  // fourths, sixths and eighths. A fifth or a tenth anywhere - in a prompt, in
  // a distractor, or in a worked solution - is NC.4.NF content printed under a
  // Grade 3 code, which every other test in this file would pass.
  //
  // ONE carve-out, and it is narrow. Writing the fraction upside down puts the
  // COUNT underneath, and on a unit-fraction item the count is 1 — so
  // wrote-the-fraction-upside-down produces 8/1, and 8/1 is the error itself
  // rather than an out-of-grade denominator. A 1 in the denominator is not
  // next year's mathematics the way a fifth or a tenth is; NC.3.NF.3's own
  // third keyConcept is expressing whole numbers as fractions. So an item that
  // offers that distractor may write a denominator of 1, and no other item may.
  it('writes no fraction outside halves, thirds, fourths, sixths and eighths', () => {
    for (const q of GRADE_3_NF_AUTHORED) {
      const allowsOne = q.options.some(
        (o) => o.misconception === 'wrote-the-fraction-upside-down',
      );
      for (const [n, d] of fractionsIn(textOf(q))) {
        if (d === 1 && allowsOne) continue;
        expect(
          LEGAL_DENOMINATORS.has(d),
          `${q.id} writes ${n}/${d}, and ${d}ths are not a Grade 3 denominator`,
        ).toBe(true);
      }
    }
  });

  // The carve-out above is only safe if a 1 in the denominator really is
  // confined to that one distractor, so pin where it is allowed to appear.
  it('writes a denominator of 1 only as the upside-down distractor', () => {
    const withOne = GRADE_3_NF_AUTHORED.filter((q) =>
      fractionsIn(textOf(q)).some(([, d]) => d === 1),
    ).map((q) => q.id);
    expect(withOne).toEqual(['g3-nf1-02', 'g3-nf3-02']);
    for (const id of withOne) {
      const q = GRADE_3_NF_AUTHORED.find((x) => x.id === id)!;
      const option = q.options.find((o) => fractionsIn(o.text).some(([, d]) => d === 1))!;
      expect(option.misconception, `${id}: a 1 in the denominator outside the flipped option`).toBe(
        'wrote-the-fraction-upside-down',
      );
    }
  });

  // Ruling 13-1. NC.3.NF.4 is "Compare two fractions with the same NUMERATOR
  // or the same DENOMINATOR", with denominators drawn from the related
  // families halves/fourths/eighths and thirds/sixths. Comparing 2/3 to 3/4 is
  // NC.4.NF.2, which already has a landed Grade 4 generator. Any comparison
  // item whose two fractions share neither part is next year's mathematics.
  it('compares only fractions that share a numerator or a denominator', () => {
    const four = GRADE_3_NF_AUTHORED.filter((q) => q.standardCode === 'NC.3.NF.4');
    expect(four.length).toBeGreaterThanOrEqual(3);
    for (const q of four) {
      // The first fraction the item writes is the one everything else is
      // measured against, so every other fraction in the item must sit in the
      // same comparison family as that one.
      const fractions = fractionsIn(textOf(q));
      expect(fractions.length, `${q.id} is a comparison item with no fractions in it`).toBeGreaterThan(
        1,
      );
      const [rn, rd] = fractions[0];
      for (const [n, d] of fractions.slice(1)) {
        expect(
          n === rn || d === rd,
          `${q.id} compares ${n}/${d} against ${rn}/${rd}, sharing neither numerator nor denominator - that is NC.4.NF.2`,
        ).toBe(true);
      }
    }
  });

  // Ruling 13-3. NC.3.NF.3 has THREE keyConcepts, not one: equivalence within
  // the related families, "a fraction with the same numerator and denominator
  // equals one whole", and "expressing whole numbers as fractions". A floor of
  // three equivalence items would mark the standard covered with two thirds of
  // its sourced text unwritten.
  it('covers all three keyConcepts of NC.3.NF.3', () => {
    const three = GRADE_3_NF_AUTHORED.filter((q) => q.standardCode === 'NC.3.NF.3');
    const blob = three.map((q) => textOf(q));
    expect(
      blob.some((t) => /same amount|equivalent/i.test(t)),
      'no equivalence item',
    ).toBe(true);
    expect(
      blob.some((t) => fractionsIn(t).some(([n, d]) => n === d)),
      'no "same numerator and denominator equals one whole" item',
    ).toBe(true);
    expect(
      blob.some((t) => /whole number/i.test(t)),
      'no "whole numbers as fractions" item',
    ).toBe(true);
  });

  // Ruling 13-6. Reading 1/4 as "one and four" is a real first-year error, but
  // it has NO NUMERIC VALUE: there is no number a child who makes it arrives
  // at, so on "What is 1/4 of 8?" the tag can only ever be filed against a
  // number produced by some other mistake. The plan's Global Constraints call a
  // mis-filed tag worse than no tag - it tells a parent their child made a
  // mistake they did not make. So the tag must sit only where the error is
  // REACHABLE: an item whose options are models or statements about what the
  // symbol means, where "one and four" is something a child can actually pick.
  it('binds the "one and four" tag only where that error is reachable', () => {
    const tagged = GRADE_3_NF_AUTHORED.filter((q) =>
      q.options.some((o) => o.misconception === 'read-the-fraction-as-two-whole-numbers'),
    );
    expect(tagged.length, 'the tag is declared but no item offers it').toBeGreaterThan(0);
    for (const q of tagged) {
      const option = q.options.find(
        (o) => o.misconception === 'read-the-fraction-as-two-whole-numbers',
      )!;
      expect(
        numericValue(option.text),
        `${q.id} option ${option.label} files "one and four" against the number ${option.text}, which some other error produced`,
      ).toBeNull();
    }
  });

  // Equivalent fractions name the same number, so two options in different
  // form can be one answer. The shared kit checks this by value already; this
  // states it for the file that is most at risk of it, and catches the case
  // where a future edit makes every option prose and silently turns the kit's
  // guard off.
  it('never offers two options that name the same amount', () => {
    for (const q of GRADE_3_NF_AUTHORED) {
      const values = q.options
        .map((o) => numericValue(o.text))
        .filter((v): v is number => v !== null);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(
            Math.abs(values[i] - values[j]),
            `${q.id}: two options both equal ${values[i]}`,
          ).toBeGreaterThan(1e-9);
        }
      }
    }
  });
});
