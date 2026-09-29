import { describe, it, expect } from 'vitest';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_AUTHORED } from './authored';
import { GRADE_4_OA_AUTHORED } from './authored.oa';
import { GRADE_4_NBT_AUTHORED } from './authored.nbt';
import { GRADE_4_NF_AUTHORED } from './authored.nf';
import { GRADE_4_MD_AUTHORED } from './authored.md';
import { GRADE_4_G_AUTHORED } from './authored.g';

/**
 * The aggregate's own sibling test (ruling 9.4). Each domain bank is checked
 * item by item in its own `authored.<domain>.test.ts`; what can only go wrong
 * HERE is a bank that the aggregator forgets to concatenate, or concatenates
 * twice. Burying these two checks inside one domain's test file would mean
 * deleting that domain silently deletes the only proof that GRADE_4_AUTHORED
 * is complete.
 */
const banks = {
  OA: GRADE_4_OA_AUTHORED,
  NBT: GRADE_4_NBT_AUTHORED,
  NF: GRADE_4_NF_AUTHORED,
  MD: GRADE_4_MD_AUTHORED,
  G: GRADE_4_G_AUTHORED,
};

describe('grade 4 authored aggregate', () => {
  it('carries every domain bank exactly once', () => {
    const ids = GRADE_4_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size, 'an item is concatenated twice').toBe(ids.length);
    for (const [domain, bank] of Object.entries(banks)) {
      for (const q of bank) {
        expect(ids, `${domain}'s ${q.id} is missing from GRADE_4_AUTHORED`).toContain(q.id);
      }
    }
    const total = Object.values(banks).reduce((n, bank) => n + bank.length, 0);
    expect(GRADE_4_AUTHORED.length, 'the aggregate holds items no domain bank does').toBe(total);
  });

  it('covers every grade 4 standard', () => {
    const covered = new Set(GRADE_4_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_4_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });

  it('assigns each item to the domain that owns its standard', () => {
    const ownerOf = new Map(
      GRADE_4_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d.id] as const)),
    );
    for (const q of GRADE_4_AUTHORED) {
      expect(q.domainId, `${q.id} claims domain ${q.domainId}`).toBe(ownerOf.get(q.standardCode));
    }
  });
});
