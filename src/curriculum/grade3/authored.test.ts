import { describe, it, expect } from 'vitest';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_AUTHORED } from './authored';
import { GRADE_3_OA_AUTHORED } from './authored.oa';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';
import { GRADE_3_NF_AUTHORED } from './authored.nf';
import { GRADE_3_MD_AUTHORED } from './authored.md';
import { GRADE_3_G_AUTHORED } from './authored.g';
import { GRADE_3_TEMPLATES } from './templates';

/**
 * The aggregate's own sibling test (ruling 14-7, the same ruling as Grade 4's
 * 9.4). Each domain bank is checked item by item in its own
 * `authored.<domain>.test.ts`; what can only go wrong HERE is a bank the
 * aggregator forgets to concatenate, or concatenates twice. Putting these
 * checks inside one domain's test file would mean deleting that domain
 * silently deletes the only proof that GRADE_3_AUTHORED is complete.
 */
const banks = {
  OA: GRADE_3_OA_AUTHORED,
  NBT: GRADE_3_NBT_AUTHORED,
  NF: GRADE_3_NF_AUTHORED,
  MD: GRADE_3_MD_AUTHORED,
  G: GRADE_3_G_AUTHORED,
};

describe('grade 3 authored aggregate', () => {
  it('carries every domain bank exactly once', () => {
    const ids = GRADE_3_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size, 'an item is concatenated twice').toBe(ids.length);
    for (const [domain, bank] of Object.entries(banks)) {
      for (const q of bank) {
        expect(ids, `${domain}'s ${q.id} is missing from GRADE_3_AUTHORED`).toContain(q.id);
      }
    }
    const total = Object.values(banks).reduce((n, bank) => n + bank.length, 0);
    expect(GRADE_3_AUTHORED.length, 'the aggregate holds items no domain bank does').toBe(total);
  });

  it('covers every grade 3 standard', () => {
    const covered = new Set(GRADE_3_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_3_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });

  it('assigns each item to the domain that owns its standard', () => {
    const ownerOf = new Map(
      GRADE_3_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d.id] as const)),
    );
    for (const q of GRADE_3_AUTHORED) {
      expect(q.domainId, `${q.id} claims domain ${q.domainId}`).toBe(ownerOf.get(q.standardCode));
    }
  });

  // Grade 3 is now content-complete across both halves: every standard has an
  // authored item, and the generators between them cover the standards whose
  // practice value is in fresh numbers. Task 16 flips `contentComplete` on the
  // strength of this.
  it('gives every authored item a unique id across the whole grade', () => {
    const ids = GRADE_3_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, `${id} is not a g3- id`).toMatch(/^g3-[a-z]+\d-\d{2}$/);
  });

  it('shares no prompt between any two authored items in the grade', () => {
    const seen = new Map<string, string>();
    for (const q of GRADE_3_AUTHORED) {
      const prior = seen.get(q.prompt.trim());
      expect(prior, `${q.id} repeats ${prior}'s prompt`).toBe(undefined);
      seen.set(q.prompt.trim(), q.id);
    }
  });

  it('has a generator or an authored item for every standard', () => {
    const generated = new Set(GRADE_3_TEMPLATES.map((t) => t.standardCode));
    const authored = new Set(GRADE_3_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_3_DOMAINS.flatMap((d) => d.standards)) {
      expect(
        authored.has(s.code) || generated.has(s.code),
        `${s.code} has no content at all`,
      ).toBe(true);
    }
  });
});
