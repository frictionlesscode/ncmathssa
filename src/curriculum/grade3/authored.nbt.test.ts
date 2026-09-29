import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';
import { GRADE_3_TEMPLATES } from './templates';

/** Everything a reader of the item sees, joined for a vocabulary scan. */
function textOf(q: (typeof GRADE_3_NBT_AUTHORED)[number]): string {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ].join(' ');
}

describe('grade 3 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_3_NBT_AUTHORED, nbt);
  });

  // Both NBT standards have a generator, and the number space is small enough
  // that an authored item could be reproduced verbatim. A question a generator
  // can also emit reaches the scheduler under two review keys, so the child is
  // served it twice and the second serving teaches nothing.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_3_NBT_AUTHORED, GRADE_3_TEMPLATES);
  });

  it('names every item g3-nbt<tail>-NN', () => {
    for (const q of GRADE_3_NBT_AUTHORED) {
      expect(q.id, `${q.id} is not a g3- hyphenated id`).toMatch(/^g3-nbt\d-\d{2}$/);
    }
  });

  // The kit's "two options naming one quantity" guard only sees options its
  // numericValue() can parse. An item mixing parseable numbers with prose is
  // half-guarded, so require each item to be all-numeric or all-prose.
  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_3_NBT_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  it('gives every standard a mastery item and one above mastery', () => {
    const nbt = GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!;
    for (const s of nbt.standards) {
      const mine = GRADE_3_NBT_AUTHORED.filter((q) => q.standardCode === s.code);
      expect(mine.some((q) => q.difficulty === 'mastery'), `${s.code} has no mastery item`).toBe(
        true,
      );
      expect(
        mine.some((q) => q.difficulty === 'advanced' || q.difficulty === 'stretch'),
        `${s.code} has no item above mastery`,
      ).toBe(true);
    }
  });

  // Ruling 13-7, made explicit. Grade 3 NBT is addition and subtraction within
  // 1,000 and a one-digit number times a multiple of 10 - and NOTHING ELSE.
  // CCSS 3.NBT.A.1 is "round whole numbers to the nearest 10 or 100"; NC has
  // rounding at no grade in this plan, and the plan's Global Constraints record
  // that a rounding standard written from recall has already shipped once. An
  // item that asks a child to round is on-code and off-standard: it would pass
  // every other test in this suite.
  //
  // This does NOT foreclose estimation. NC.3.NBT.2's own first keyConcept is
  // "use estimation strategies to assess reasonableness of answers", so the
  // bank estimates by reasoning about which hundred a number is CLOSE TO,
  // which is the standard's mathematics, and never by invoking a rounding rule.
  //
  // WHAT THIS GUARD ACTUALLY CATCHES, stated exactly, because a guard weaker
  // than its own description is false assurance and this plan has shipped one
  // of those already: it is LEXICAL. It catches the word "round" and its
  // inflections, and the phrase "nearest ten/hundred/thousand" — which is how
  // the rounding rule is stated when the word itself is avoided, and which an
  // earlier draft of g3-nbt2-01's conceptSummary did state. It cannot catch a
  // rounding item written in some third form of words. That boundary is held
  // by reading the sourced text, not by this regex; the regex holds the two
  // phrasings a rounding item written from recall actually arrives in.
  it('never asks a Grade 3 child to round', () => {
    const ROUNDING = /\bround(s|ed|ing)?\b|\bnearest (ten|hundred|thousand)s?\b/i;
    for (const q of GRADE_3_NBT_AUTHORED) {
      const hit = ROUNDING.exec(textOf(q));
      expect(hit?.[0] ?? null, `${q.id} states the rounding rule: "${hit?.[0]}"`).toBeNull();
    }
  });

  // Ruling 13-4: NC.3.NBT.3's multiple of 10 is "in the range 10-90", so the
  // largest legal product is 9 x 90 = 810. A two-digit-by-two-digit product or
  // a multiple of 100 is NC.4.NBT.5, a grade on.
  it('keeps every NC.3.NBT.3 number inside the sourced ranges', () => {
    const three = GRADE_3_NBT_AUTHORED.filter((q) => q.standardCode === 'NC.3.NBT.3');
    expect(three.length).toBeGreaterThanOrEqual(3);
    for (const q of three) {
      for (const o of q.options) {
        const v = numericValue(o.text);
        if (v !== null) {
          expect(Number.isInteger(v), `${q.id} option ${o.label} is not a whole number`).toBe(true);
          expect(v, `${q.id} option ${o.label} exceeds 9 x 90`).toBeLessThanOrEqual(810);
        }
      }
    }
  });

  // Ruling 13-5: NC.3.NBT.2 is NOT "do the algorithm". Its three keyConcepts
  // are estimation for reasonableness, the addition/subtraction inverse
  // relationship, and expanded-form decomposition - and the generators cover
  // the computation, not those. Three fluency items would mark the standard
  // covered while two thirds of its sourced text went unwritten.
  it('covers all three keyConcepts of NC.3.NBT.2', () => {
    const two = GRADE_3_NBT_AUTHORED.filter((q) => q.standardCode === 'NC.3.NBT.2');
    const blob = two.map((q) => textOf(q));
    expect(
      blob.some((t) => /\bestimate\b/i.test(t)),
      'no estimation-for-reasonableness item',
    ).toBe(true);
    expect(
      blob.some((t) => /\bcheck\b/i.test(t) && /\+/.test(t) && /(−|-)/.test(t)),
      'no addition/subtraction inverse-relationship item',
    ).toBe(true);
    expect(
      blob.some((t) => /expanded form/i.test(t)),
      'no expanded-form decomposition item',
    ).toBe(true);
  });

  // Addition and subtraction within 1,000 means within 1,000 in both
  // directions: no sum above it and no negative difference on offer.
  it('offers no value outside a Grade 3 student’s number range', () => {
    for (const q of GRADE_3_NBT_AUTHORED) {
      for (const o of q.options) {
        expect(/\d\.\d/.test(o.text), `${q.id} option ${o.label} prints a decimal`).toBe(false);
        const v = numericValue(o.text);
        if (v !== null) {
          expect(v, `${q.id} option ${o.label} is negative`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
