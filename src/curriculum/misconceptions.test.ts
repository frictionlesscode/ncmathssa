import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { GRADE_5_AUTHORED } from './grade5/authored';

describe('misconception registry', () => {
  it('declares every tag used by authored content', () => {
    const used = new Set<string>();
    for (const q of GRADE_5_AUTHORED) {
      for (const o of q.options) if (o.misconception) used.add(o.misconception);
    }
    const undeclared = [...used].filter((t) => !MISCONCEPTIONS[t]);
    expect(undeclared, `undeclared tags: ${undeclared.join(', ')}`).toEqual([]);
  });

  it('declares no tag that nothing uses', () => {
    const used = new Set<string>();
    for (const q of GRADE_5_AUTHORED) {
      for (const o of q.options) if (o.misconception) used.add(o.misconception);
    }
    const orphans = Object.keys(MISCONCEPTIONS).filter((t) => !used.has(t));
    expect(orphans, `declared but unused: ${orphans.join(', ')}`).toEqual([]);
  });

  it('gives every entry a family and a non-empty description', () => {
    for (const [tag, info] of Object.entries(MISCONCEPTIONS)) {
      expect(info.tag, `${tag} tag mismatch`).toBe(tag);
      expect(info.family).toBeTruthy();
      expect(info.description.trim().length).toBeGreaterThan(0);
    }
  });
});
