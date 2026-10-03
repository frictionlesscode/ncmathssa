import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { getCurriculum } from '../registry';

/** Every Grade 5 item (and, below, template) whose key, options or math
 *  changed in Plan B2 and now carries contentVersion 2. g3-02 (trapezoid) is Plan B1's and is excluded
 *  from both sides of the check. */
const BUMPED_BY_B2 = [
  'g3-03',
  'md1-02', 'md1-03', 'md2-01', 'md2-02', 'md5-03',
  'nbt1-02', 'nbt7-04',
  'nf1-01', 'nf1-02', 'nf1-04', 'nf4-02', 'nf4-03', 'nf7-03',
  'oa2-01', 'oa2-02', 'oa2-03',
];

/** Generators whose math changed at the same templateId#seed. Explanation-only
 *  edits (md1-unit-conversion) do not bump. */
const BUMPED_TEMPLATES = ['g5.nbt1.powers-of-ten', 'g5.nf1.add-unlike', 'g5.nf4.multiply-fractions'];

describe('Grade 5 content versions', () => {
  it('the three generators whose math changed are version 2', () => {
    const c = getCurriculum(5);
    for (const templateId of BUMPED_TEMPLATES) {
      expect(c.source.versionOf({ kind: 'generated', templateId, seed: 1 }), templateId).toBe(2);
    }
  });

  it('audit ledger: exactly the 17 rewritten items carry contentVersion 2', () => {
    expect(BUMPED_BY_B2).toHaveLength(17);
    for (const id of BUMPED_BY_B2) {
      const q = GRADE_5_AUTHORED.find((x) => x.id === id);
      expect(q, `${id} exists`).toBeTruthy();
      expect(q!.contentVersion, id).toBe(2);
    }
  });

  it('no other Grade 5 item was bumped by this plan (a bump on an unchanged key re-grades saved answers)', () => {
    for (const q of GRADE_5_AUTHORED) {
      if (BUMPED_BY_B2.includes(q.id) || q.id === 'g3-02') continue;
      expect(q.contentVersion ?? 1, q.id).toBe(1);
    }
  });
});
