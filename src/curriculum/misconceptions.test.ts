import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { listCurricula, standardsOf } from './registry';
import { makeRng } from '../engine/rng';

/** Tags used anywhere in any registered grade: authored items plus every
 *  misconception a generator can emit, sampled across many seeds so a rare
 *  distractor still counts as "used." Registry-driven so a new grade's tags
 *  count the moment that grade registers. */
function allUsedTags(): Set<string> {
  const used = new Set<string>();
  for (const c of listCurricula()) {
    for (const s of standardsOf(c)) {
      for (const ref of c.source.authoredFor(s.code)) {
        for (const o of c.source.resolve(ref).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
    }
    for (const t of c.source.templates()) {
      for (let seed = 0; seed < 100; seed++) {
        for (const o of t.generate(makeRng(seed)).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
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
