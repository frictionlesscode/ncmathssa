import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { GRADE_5_AUTHORED } from './grade5/authored';
import { makeRng } from '../engine/rng';
import { nf1AddUnlike } from './grade5/templates/nf1-add-unlike';

const GENERATED_TEMPLATES = [nf1AddUnlike];

/** Tags used anywhere in content: authored items plus every misconception a
 *  generator can emit, sampled across many seeds so a rare distractor still
 *  counts as "used." */
function allUsedTags(): Set<string> {
  const used = new Set<string>();
  for (const q of GRADE_5_AUTHORED) {
    for (const o of q.options) if (o.misconception) used.add(o.misconception);
  }
  for (const t of GENERATED_TEMPLATES) {
    for (let seed = 0; seed < 100; seed++) {
      const g = t.generate(makeRng(seed));
      for (const o of g.options) if (o.misconception) used.add(o.misconception);
    }
  }
  return used;
}

describe('misconception registry', () => {
  it('declares every tag used by authored content', () => {
    const used = allUsedTags();
    const undeclared = [...used].filter((t) => !MISCONCEPTIONS[t]);
    expect(undeclared, `undeclared tags: ${undeclared.join(', ')}`).toEqual([]);
  });

  it('declares no tag that nothing uses', () => {
    const used = allUsedTags();
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
