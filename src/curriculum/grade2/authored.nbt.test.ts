import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  assertGradeTwoReadable,
  GRADE_2_VOCAB_ALLOWLIST,
} from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_NBT_AUTHORED } from './authored.nbt';
import { GRADE_2_TEMPLATES } from './templates';

describe('grade 2 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_2_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_2_NBT_AUTHORED, nbt);
  });

  // Fix 1 (whole-branch review, Important): see authored.oa.test.ts.
  it('keeps every prompt readable for a seven-year-old', () => {
    assertGradeTwoReadable(GRADE_2_NBT_AUTHORED, { allowlist: GRADE_2_VOCAB_ALLOWLIST });
  });

  // The whole domain is generated as well as authored, so a review key could
  // otherwise reach a child twice - once as {authored, id} and once as
  // {generated, templateId} - and the second serving would teach nothing.
  it('is never reproduced by one of the NBT generators', () => {
    assertNoGeneratorDuplicatesAuthored(
      GRADE_2_NBT_AUTHORED,
      GRADE_2_TEMPLATES.filter((t) => t.domainId === 'NBT'),
    );
  });

  // NC.2.NBT.1's third keyConcept is "compose and decompose numbers using
  // VARIOUS GROUPINGS of hundreds, tens, and ones" (ruling 18-2). It is the
  // hardest part of the standard and the easiest to leave out, so it is
  // asserted rather than trusted.
  it('covers various groupings, not just the standard one', () => {
    const items = GRADE_2_NBT_AUTHORED.filter((q) => q.standardCode === 'NC.2.NBT.1');
    const regrouped = items.filter((q) =>
      q.options.some((o) => /1[0-9] tens|12 tens|hundreds and 12 tens/.test(o.text)) ||
      /trade|12 tens/i.test(q.prompt),
    );
    expect(regrouped.length, 'NC.2.NBT.1 needs a various-groupings item').toBeGreaterThanOrEqual(2);
  });

  // NC.2.NBT.6 is "add up to THREE two-digit numbers". CCSS 2.NBT.B.6 says
  // four; NC cut it down, and a four-addend item would pass every other test
  // in this suite (ruling 18-1).
  it('never adds four numbers in an NC.2.NBT.6 item', () => {
    for (const q of GRADE_2_NBT_AUTHORED.filter((x) => x.standardCode === 'NC.2.NBT.6')) {
      const plusSigns = (`${q.prompt} ${q.promptDetails ?? ''}`.match(/\+/g) ?? []).length;
      expect(plusSigns, `${q.id} adds more than three numbers`).toBeLessThanOrEqual(2);
    }
  });

  // NC.2.NBT.4's sourced text is "using >, =, and < symbols" — all three. The
  // generator's construction always makes one number strictly greater, so = can
  // only ever be a distractor there; if it were only a distractor here too, a
  // child could answer every NC.2.NBT.4 item in the app by never picking the
  // one with an = in it.
  it('keys at least one NC.2.NBT.4 item on =', () => {
    const items = GRADE_2_NBT_AUTHORED.filter((q) => q.standardCode === 'NC.2.NBT.4');
    expect(items.length, 'NC.2.NBT.4 needs all three symbols covered').toBeGreaterThanOrEqual(4);
    // > and < are covered between these items and the generator, which draws
    // both orientations. = is the one no generator can produce, because its
    // construction always makes one number strictly greater.
    const keyedOnEquals = items.filter((q) => /=/.test(q.options.find((o) => o.isCorrect)!.text));
    expect(
      keyedOnEquals.length,
      'no NC.2.NBT.4 item is keyed on =, so "never pick the = option" answers them all',
    ).toBeGreaterThanOrEqual(1);
  });

  // NC.2.NBT.8 is "10 OR 100", not "10 and 100" (ruling 18-6): every item names
  // one amount at a time, and at least one of them makes the child tell the two
  // apart within a single question.
  it("keeps NC.2.NBT.8 inside the standard's own 100-900 range", () => {
    const items = GRADE_2_NBT_AUTHORED.filter((q) => q.standardCode === 'NC.2.NBT.8');
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (const q of items) {
      for (const n of (q.prompt.match(/\d+/g) ?? []).map(Number)) {
        if (n === 10 || n === 100) continue; // the amount being added or taken
        expect(n, `${q.id} names ${n}, outside 100-900`).toBeGreaterThanOrEqual(100);
        expect(n, `${q.id} names ${n}, outside 100-900`).toBeLessThanOrEqual(900);
      }
    }
  });

  // Rulings 18-7: NC.2.NBT.5 and NC.2.NBT.7 are strategy standards, and their
  // generators only drill the arithmetic. The explain / compare / select half
  // has to live here, or those standards ship two-thirds unwritten.
  it('carries the strategy half of NC.2.NBT.5 and NC.2.NBT.7', () => {
    for (const code of ['NC.2.NBT.5', 'NC.2.NBT.7'] as const) {
      const strategyItems = GRADE_2_NBT_AUTHORED.filter(
        (q) =>
          q.standardCode === code &&
          /which way|which sentence tells|quickest|easiest/i.test(q.prompt),
      );
      expect(
        strategyItems.length,
        `${code} has no item about the strategy itself`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
