import { describe, it, expect } from 'vitest';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_AUTHORED } from './authored';
import { GRADE_2_OA_AUTHORED } from './authored.oa';
import { GRADE_2_NBT_AUTHORED } from './authored.nbt';
import { GRADE_2_MD_AUTHORED } from './authored.md';
import { GRADE_2_G_AUTHORED } from './authored.g';
import { GRADE_2_TEMPLATES } from './templates';

/**
 * The aggregate's own sibling test (ruling 19-6, the same ruling as Grade 4's
 * 9.4 and Grade 3's 14-7). Each domain bank is checked item by item in its own
 * `authored.<domain>.test.ts`; what can only go wrong HERE is a bank the
 * aggregator forgets to concatenate, or concatenates twice. Putting these
 * checks inside one domain's test file would mean deleting that domain
 * silently deletes the only proof that GRADE_2_AUTHORED is complete.
 */
const banks = {
  OA: GRADE_2_OA_AUTHORED,
  NBT: GRADE_2_NBT_AUTHORED,
  MD: GRADE_2_MD_AUTHORED,
  G: GRADE_2_G_AUTHORED,
};

const allStandards = GRADE_2_DOMAINS.flatMap((d) => d.standards);

describe('grade 2 authored aggregate', () => {
  it('carries every domain bank exactly once', () => {
    const ids = GRADE_2_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size, 'an item is concatenated twice').toBe(ids.length);
    for (const [domain, bank] of Object.entries(banks)) {
      expect(bank.length, `${domain} bank is empty`).toBeGreaterThan(0);
      for (const q of bank) {
        expect(ids, `${domain}'s ${q.id} is missing from GRADE_2_AUTHORED`).toContain(q.id);
      }
    }
    const total = Object.values(banks).reduce((n, bank) => n + bank.length, 0);
    expect(GRADE_2_AUTHORED.length, 'the aggregate holds items no domain bank does').toBe(total);
  });

  it('keeps the domains in OA, NBT, MD, G order', () => {
    expect(GRADE_2_AUTHORED.map((q) => q.id)).toEqual(
      Object.values(banks).flatMap((bank) => bank.map((q) => q.id)),
    );
  });

  // All 23 of them: OA 4, NBT 8, MD 9 (there is no NC.2.MD.9) and G 2 (there
  // is no NC.2.G.2).
  it('covers every grade 2 standard', () => {
    expect(allStandards.length, 'grade 2 has 23 standards').toBe(23);
    const covered = new Set(GRADE_2_AUTHORED.map((q) => q.standardCode));
    for (const s of allStandards) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });

  it('assigns each item to the domain that owns its standard', () => {
    const ownerOf = new Map(
      GRADE_2_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d.id] as const)),
    );
    for (const q of GRADE_2_AUTHORED) {
      expect(q.domainId, `${q.id} claims domain ${q.domainId}`).toBe(ownerOf.get(q.standardCode));
    }
  });

  // Ruling 21-2: a HYPHEN after the grade prefix — g2-md7-03, never g2.md7-03.
  it('gives every authored item a unique g2- id across the whole grade', () => {
    const ids = GRADE_2_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, `${id} is not a g2- id`).toMatch(/^g2-[a-z]+\d+-\d{2}$/);
  });

  // Keyed on prompt AND figure together: g2-oa4-01 and g2-oa4-04 share a
  // prompt over two different arrays, which are two different questions.
  it('shares no question — prompt and figure together — between any two authored items', () => {
    const seen = new Map<string, string>();
    for (const q of GRADE_2_AUTHORED) {
      const prompt = `${q.prompt.trim()}\n${(q.promptDetails ?? '').trim()}`;
      const prior = seen.get(prompt);
      expect(prior, `${q.id} repeats ${prior}'s question`).toBe(undefined);
      seen.set(prompt, q.id);
    }
  });

  it('has a generator or an authored item for every standard', () => {
    const generated = new Set(GRADE_2_TEMPLATES.map((t) => t.standardCode));
    const authored = new Set(GRADE_2_AUTHORED.map((q) => q.standardCode));
    for (const s of allStandards) {
      expect(
        authored.has(s.code) || generated.has(s.code),
        `${s.code} has no content at all`,
      ).toBe(true);
    }
  });
});
