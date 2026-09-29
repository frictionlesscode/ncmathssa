import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_MD_AUTHORED } from './authored.md';
import { GRADE_1_TEMPLATES } from './templates';

const md = GRADE_1_DOMAINS.find((d) => d.id === 'MD')!;
const itemsFor = (code: string) => GRADE_1_MD_AUTHORED.filter((q) => q.standardCode === code);

describe('grade 1 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_1_MD_AUTHORED, md, { itemsPerStandard: 3 });
  });

  // Brief's own step 1 assertion.
  it('keeps every prompt short enough for a six-year-old to read', () => {
    for (const q of GRADE_1_MD_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });

  // Ruling 22-7/E.3, extended per the Task 24 controller ruling to MD and G.
  it('keeps every prompt readable for a six-year-old', () => {
    assertGradeOneReadable(GRADE_1_MD_AUTHORED);
  });

  it('gives every standard a mastery item and an advanced-or-stretch item', () => {
    for (const s of md.standards) {
      const levels = new Set(itemsFor(s.code).map((q) => q.difficulty));
      expect(levels.has('mastery'), `${s.code} has no mastery item`).toBe(true);
      expect(levels.has('advanced') || levels.has('stretch'), `${s.code} has no item above mastery`).toBe(true);
    }
  });

  it('is never reproduced word for word by a Grade 1 MD generator', () => {
    assertNoGeneratorDuplicatesAuthored(
      GRADE_1_MD_AUTHORED,
      GRADE_1_TEMPLATES.filter((t) => t.domainId === 'MD'),
    );
  });

  // Ruling 24-1: NC.1.MD.3 is TIME and NC.1.MD.5 is COINS.
  it('files every clock-reading item under NC.1.MD.3 and every coin item under NC.1.MD.5', () => {
    for (const q of itemsFor('NC.1.MD.3')) {
      const text = [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
      expect(text, q.id).toMatch(/clock|hour hand|minute hand|digital/i);
      expect(text, q.id).not.toMatch(/penny|pennies|nickel|dime|quarter/i);
    }
    for (const q of itemsFor('NC.1.MD.5')) {
      const text = [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
      expect(text, q.id).toMatch(/penny|pennies|nickel|dime|quarter/i);
      expect(text, q.id).not.toMatch(/clock|hour hand|minute hand/i);
    }
  });

  // Ruling 24-4: NC.1.MD.5 relates coin values to pennies, and never uses $ or
  // ¢, adds coin values, or poses a money word problem (that's NC.2.MD.8).
  it('gives NC.1.MD.5 a value-in-pennies item and never uses $, ¢, or coin totals', () => {
    const items = itemsFor('NC.1.MD.5');
    const valueInPennies = items.filter((q) => /worth (?:how many|\d+) penn/i.test(q.prompt));
    expect(valueInPennies.length).toBeGreaterThanOrEqual(1);
    for (const q of items) {
      const text = [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
      expect(text, q.id).not.toMatch(/[$¢]/);
      expect(text, q.id).not.toMatch(/buys|spends|change|costs?/i);
    }
  });

  // Ruling 24-9: the NC.1.MD.1/2 figure lives in promptDetails, never in the
  // length-checked prompt.
  it('keeps NC.1.MD.1 and NC.1.MD.2 figures out of the prompt', () => {
    for (const q of [...itemsFor('NC.1.MD.1'), ...itemsFor('NC.1.MD.2')]) {
      if (q.promptDetails) {
        expect(q.prompt, q.id).not.toMatch(/longer than|shorter than|end to end/i);
      }
    }
  });

  // Ruling 24-1/24-5 named errors, checked on the specific item, not as a
  // bank-wide substring search.
  it('gives g1-md1-01 the "compared only two objects" founding error', () => {
    const q = GRADE_1_MD_AUTHORED.find((i) => i.id === 'g1-md1-01')!;
    expect(q.options.find((o) => o.text === 'The crayon')?.misconception).toBe('compared-only-two-of-three-objects');
  });

  it('gives g1-md2-01 the "leaving gaps" founding error', () => {
    const q = GRADE_1_MD_AUTHORED.find((i) => i.id === 'g1-md2-01')!;
    expect(q.options.find((o) => o.text.includes('gap'))?.misconception).toBe(
      'left-gaps-between-the-units-while-iterating',
    );
  });

  it('gives g1-md3-02 the "read the hour hand as exact" founding error', () => {
    const q = GRADE_1_MD_AUTHORED.find((i) => i.id === 'g1-md3-02')!;
    expect(q.options.find((o) => o.text === '7:00')?.misconception).toBe(
      'read-the-hour-hand-as-pointing-exactly-at-a-number',
    );
  });
});
