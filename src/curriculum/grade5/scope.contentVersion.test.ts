import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';

/** Every Grade 5 item whose key, options or math changed in Plan B2 and now
 *  carries contentVersion 2. g3-02 (trapezoid) is Plan B1's and is excluded
 *  from both sides of the check. */
const BUMPED_BY_B2 = [
  'g3-03',
  'md1-02', 'md1-03', 'md2-01', 'md2-02', 'md5-03',
  'nbt1-02', 'nbt7-04',
  'nf1-01', 'nf1-02', 'nf1-04', 'nf4-02', 'nf4-03', 'nf7-03',
  'oa2-01', 'oa2-02', 'oa2-03',
];

describe('Grade 5 content versions', () => {
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
