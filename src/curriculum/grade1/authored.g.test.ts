import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  GRADE_1_G_VOCAB_ALLOWLIST,
} from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_G_AUTHORED } from './authored.g';
import { GRADE_1_MD_AUTHORED } from './authored.md';
import { GRADE_1_OA_AUTHORED } from './authored.oa';
import { GRADE_1_NBT_AUTHORED } from './authored.nbt';
import { GRADE_1_AUTHORED } from './authored';

const g = GRADE_1_DOMAINS.find((d) => d.id === 'G')!;
const itemsFor = (code: string) => GRADE_1_G_AUTHORED.filter((q) => q.standardCode === code);

describe('grade 1 Geometry authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_1_G_AUTHORED, g, { itemsPerStandard: 3 });
  });

  // Brief's own step 1 assertion.
  it('keeps every prompt short enough for a six-year-old to read', () => {
    for (const q of GRADE_1_G_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });

  it('keeps every prompt readable for a six-year-old', () => {
    assertGradeOneReadable(GRADE_1_G_AUTHORED, { allowlist: GRADE_1_G_VOCAB_ALLOWLIST });
  });

  it('gives every standard a mastery item and an advanced-or-stretch item', () => {
    for (const s of g.standards) {
      const levels = new Set(itemsFor(s.code).map((q) => q.difficulty));
      expect(levels.has('mastery'), `${s.code} has no mastery item`).toBe(true);
      expect(levels.has('advanced') || levels.has('stretch'), `${s.code} has no item above mastery`).toBe(true);
    }
  });

  // Ruling 24-6: NC.1.G.1 includes at least one 3-D item.
  it('gives NC.1.G.1 at least one 3-D item', () => {
    const threeD = itemsFor('NC.1.G.1').filter((q) =>
      /cube|rectangular prism|cone|sphere|cylinder|solid|faces/i.test(
        [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' '),
      ),
    );
    expect(threeD.length).toBeGreaterThanOrEqual(1);
  });

  // Ruling 24-7: NC.1.G.2 includes half-circles, a 3-D composite, and a
  // "naming the components" item.
  it('gives NC.1.G.2 a half-circle item, a 3-D composite item, and a naming-the-components item', () => {
    const items = itemsFor('NC.1.G.2');
    const text = (q: (typeof items)[number]) => [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
    expect(items.some((q) => /half-circle/i.test(text(q)))).toBe(true);
    expect(items.some((q) => /cube|cone|cylinder|sphere/i.test(text(q)))).toBe(true);
    expect(items.some((q) => /which shapes make (?:it|the toy) up/i.test(q.prompt))).toBe(true);
  });

  // Ruling 24-8: two and four equal shares only, and the "more shares are
  // smaller" bullet, with no thirds anywhere in this file.
  it('keeps NC.1.G.3 to two and four equal shares, including the "more shares, smaller shares" bullet', () => {
    const items = itemsFor('NC.1.G.3');
    for (const q of GRADE_1_G_AUTHORED) {
      const text = [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
      expect(text, q.id).not.toMatch(/\bthird[s]?\b/i);
    }
    expect(items.some((q) => /bigger pieces|smaller/i.test(q.prompt))).toBe(true);
  });

  it('gives g1-g3-01 the "unequal parts called equal shares" founding error', () => {
    const q = GRADE_1_G_AUTHORED.find((i) => i.id === 'g1-g3-01')!;
    expect(q.options.find((o) => o.text === 'Yes, because there are two pieces')?.misconception).toBe(
      'called-unequal-parts-equal-shares',
    );
  });

  it('gives g1-g1-02 the "four sides makes a rectangle" founding error', () => {
    const q = GRADE_1_G_AUTHORED.find((i) => i.id === 'g1-g1-02')!;
    expect(q.options.find((o) => o.text.startsWith('Yes, any 4-sided'))?.misconception).toBe(
      'confused-a-defining-attribute-with-a-partial-one',
    );
  });

  it('gives g1-g2-04 the "composite keeps a part\'s name" founding error', () => {
    const q = GRADE_1_G_AUTHORED.find((i) => i.id === 'g1-g2-04')!;
    expect(q.options.filter((o) => o.misconception === 'expected-a-composite-shape-to-keep-its-parts-names').length).toBe(2);
  });
});

describe('grade 1 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_1_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 1 standard', () => {
    const covered = new Set(GRADE_1_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_1_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });

  it('joins OA, NBT, MD and G, in that order, and nothing else', () => {
    expect(GRADE_1_AUTHORED).toEqual([
      ...GRADE_1_OA_AUTHORED,
      ...GRADE_1_NBT_AUTHORED,
      ...GRADE_1_MD_AUTHORED,
      ...GRADE_1_G_AUTHORED,
    ]);
  });
});
