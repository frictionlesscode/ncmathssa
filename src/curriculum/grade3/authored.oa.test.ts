import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_OA_AUTHORED } from './authored.oa';
import { GRADE_3_TEMPLATES } from './templates';

describe('grade 3 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_3_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_3_OA_AUTHORED, oa);
  });

  // Five of the seven OA standards have a generator, and the number space they
  // draw from is tiny: factors 1-10 is 100 products in total. An authored item
  // a generator can also emit reaches the scheduler under two review keys -
  // {authored, id} and {generated, templateId} - so a child is served the same
  // question twice and the second serving teaches nothing. At this density a
  // collision is near-certain rather than hypothetical, which is why this runs
  // here rather than being left to inspection.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_3_OA_AUTHORED, GRADE_3_TEMPLATES);
  });

  // The kit's "two options naming one quantity" guard only sees options its
  // numericValue() can parse. An item mixing parseable numbers with prose is
  // half-guarded: three options checked, the fourth compared by text alone.
  // Require every item to be all-numeric or all-prose, as Grade 4 NF does.
  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_3_OA_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  // Content Contract: every standard needs a mastery item AND one above it.
  // The shared kit only checks that the BANK as a whole holds both tiers, so a
  // standard whose three items are all 'mastery' passes it silently.
  it('gives every standard a mastery item and one above mastery', () => {
    const oa = GRADE_3_DOMAINS.find((d) => d.id === 'OA')!;
    for (const s of oa.standards) {
      const mine = GRADE_3_OA_AUTHORED.filter((q) => q.standardCode === s.code);
      expect(
        mine.some((q) => q.difficulty === 'mastery'),
        `${s.code} has no mastery item`,
      ).toBe(true);
      expect(
        mine.some((q) => q.difficulty === 'advanced' || q.difficulty === 'stretch'),
        `${s.code} has no item above mastery`,
      ).toBe(true);
    }
  });

  // Ruling 12-8: Grade 4 shipped 84 ids with a HYPHEN after the grade, and
  // Task 16 registers Grade 3 against `id.startsWith('g3-')`.
  it('names every item g3-<tail>-NN', () => {
    for (const q of GRADE_3_OA_AUTHORED) {
      expect(q.id, `${q.id} is not a g3- hyphenated id`).toMatch(/^g3-oa\d-\d{2}$/);
    }
  });

  // Ruling 12-2: NC.3.OA.8 is "using addition, subtraction, and multiplication".
  // CCSS 3.OA.8 says "the four operations" - that is the version written from
  // recall, and it would put division into a standard NC's text excludes.
  it('keeps division out of NC.3.OA.8', () => {
    const eight = GRADE_3_OA_AUTHORED.filter((q) => q.standardCode === 'NC.3.OA.8');
    expect(eight.length).toBeGreaterThanOrEqual(3);
    for (const q of eight) {
      const text = [
        q.prompt,
        q.promptDetails ?? '',
        ...q.options.map((o) => o.text),
        ...q.explanation.stepByStep,
        q.explanation.conceptSummary,
        q.explanation.commonMisconception ?? '',
      ].join(' ');
      expect(/÷|\bdivid|\bquotient\b|shared? equally/i.test(text), `${q.id} uses division`).toBe(
        false,
      );
    }
  });

  // Ruling 12-6: NC.3.OA.9 is "a hundreds board AND/OR multiplication table".
  // A bank of nothing but times-table items covers half the sourced text.
  it('covers both halves of NC.3.OA.9', () => {
    const nine = GRADE_3_OA_AUTHORED.filter((q) => q.standardCode === 'NC.3.OA.9');
    const blob = (q: (typeof nine)[number]) => `${q.prompt} ${q.promptDetails ?? ''}`;
    expect(nine.some((q) => /hundreds board/i.test(blob(q))), 'no hundreds-board item').toBe(true);
    expect(
      nine.some((q) => /multiplication table/i.test(blob(q))),
      'no multiplication-table item',
    ).toBe(true);
  });

  // Ruling 12-3: `12 / 3` answered as if `3 / 12` is 0.25, and a Grade 3 child
  // has no decimals - so it is not a value a student reaches and must never be
  // printed as an option. Nothing in this bank may offer a non-integer.
  it('offers no option a Grade 3 student could not write', () => {
    for (const q of GRADE_3_OA_AUTHORED) {
      for (const o of q.options) {
        expect(/\d\.\d/.test(o.text), `${q.id} option ${o.label} prints a decimal`).toBe(false);
        const v = numericValue(o.text);
        if (v !== null) {
          expect(Number.isInteger(v), `${q.id} option ${o.label} is not a whole number`).toBe(true);
          expect(v, `${q.id} option ${o.label} is negative`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
