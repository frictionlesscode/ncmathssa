import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { everyAuthoredQuestion, everyTemplate } from './allContent';
import { makeRng } from '../engine/rng';

/** Tags used anywhere in any grade's content, registered or not: authored items
 *  plus every misconception a generator can emit, sampled across many seeds so
 *  a rare distractor still counts as "used."
 *
 *  Deliberately NOT registry-driven. A grade's content lands several tasks
 *  before that grade registers, and scoping this to registered grades made
 *  every new tag an orphan during that window - which pushed the first Grade 4
 *  author into reusing tags that named the wrong error rather than going red. */
function allUsedTags(): Set<string> {
  const used = new Set<string>();
  for (const q of everyAuthoredQuestion()) {
    for (const o of q.options) if (o.misconception) used.add(o.misconception);
  }
  for (const t of everyTemplate()) {
    for (let seed = 0; seed < 100; seed++) {
      for (const o of t.generate(makeRng(seed)).options) {
        if (o.misconception) used.add(o.misconception);
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
