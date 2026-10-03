import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa9SubtractWithin10, SUBTRACT_DRAWS, ALL_SUBTRACT_FACTS } from './oa9-subtract-within-10';

type G = ReturnType<typeof oa9SubtractWithin10.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

function parse(prompt: string) {
  const m = /^What is (\d+) − (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  return { a, b, diff: a - b };
}

const values = (a: number, b: number, slip: 'hop' | 'over') => [
  a - b,
  a + b,
  b,
  slip === 'hop' ? a - b + 1 : a - b - 1,
];

const gen = (seed: number) => oa9SubtractWithin10.generate(makeRng(seed));

describe('g1.oa9.subtract-within-10', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa9SubtractWithin10);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run.
  it('emits exactly this question at seed 7 (hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('What is 4 − 3?');
    expect(g.answerText).toBe('1');
    expect(shape(g)).toEqual([
      ['A', '1', true, null],
      ['B', '7', false, 'added-instead-of-subtracted'],
      ['C', '3', false, 'restated-a-known-number-instead-of-solving'],
      ['D', '2', false, 'counted-the-start-number-as-a-hop'],
    ]);
    expect(g.explanation.stepByStep[1]).toBe('Step 2: Count on from 3 to 4: 4. That is 1 count.');
  });

  it('emits exactly this question at seed 123 (over-count)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('What is 6 − 1?');
    expect(g.answerText).toBe('5');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'counted-on-by-ones-one-too-many'],
      ['B', '1', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '5', true, null],
      ['D', '7', false, 'added-instead-of-subtracted'],
    ]);
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.9', () => {
    expect(oa9SubtractWithin10.standardCode).toBe('NC.1.OA.9');
  });

  // NC.1.OA.9 is fluency WITHIN 10 (ruling 22-1), and never below zero.
  it('only ever asks a subtraction fact from 10 or less, with a positive answer', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, diff } = parse(g.prompt);
      expect(a, `seed ${seed}`).toBeLessThanOrEqual(10);
      expect(b, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(diff, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(Number(g.answerText), `seed ${seed}`).toBe(diff);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, diff } = parse(g.prompt);
      expect(Number(byTag(g, 'added-instead-of-subtracted')!.text), `seed ${seed}`).toBe(a + b);
      expect(Number(byTag(g, 'restated-a-known-number-instead-of-solving')!.text), `seed ${seed}`).toBe(b);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(diff + 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(diff - 1);
    }
  });

  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, diff } = parse(g.prompt);
      const counts = Array.from({ length: diff }, (_, i) => b + 1 + i);
      expect(counts[counts.length - 1]).toBe(a);
      expect(g.explanation.stepByStep).toEqual([
        `Step 1: Think addition: ${b} + ☐ = ${a}.`,
        `Step 2: Count on from ${b} to ${a}: ${counts.join(', ')}. That is ${diff} ${diff === 1 ? 'count' : 'counts'}.`,
        `Step 3: ${a} − ${b} = ${diff}.`,
      ]);
      // Audit (Medium): oa9.subtract seed 1, "3 - 2", said "lands on 2" while
      // 2 was not an option. The named number must be on offer at every seed.
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      expect(g.explanation.commonMisconception, `seed ${seed}`).toBe(
        hop
          ? `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`
          : `Counting back one time too many from ${a} lands on ${diff - 1}. Stop after ${b} ${b === 1 ? 'count' : 'counts'} back, at ${diff}.`,
      );
      const named = Number(/lands on (\d+)/.exec(g.explanation.commonMisconception!)![1]);
      expect(g.options.map((o) => Number(o.text)), `seed ${seed}: names ${named}`).toContain(named);
    }
  });

  it('draws both counting slips', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      seen.add(byTag(gen(seed), 'counted-the-start-number-as-a-hop') ? 'hop' : 'over');
    }
    expect([...seen].sort()).toEqual(['hop', 'over']);
  });

  // No size tell: adding always overshoots, but the number taken away and the
  // counting slip each land on either side of the key.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([0, 1, 2]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const slip of ['hop', 'over'] as const) {
      for (const { a, b } of SUBTRACT_DRAWS[slip]) {
        const v = values(a, b, slip);
        if (new Set(v).size !== 4) failures.push(`${slip} ${a}−${b}: ${v}`);
        if (Math.min(...v) < 0) failures.push(`${slip} ${a}−${b}: a negative option`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 45 facts have 10 >= a > b >= 1. Five have a = 2.b, where
    // the number taken away IS the answer. The hop loses four more with
    // a = 2.b - 1 (5−3, 7−4, 9−5, 3−2), the over-count four with a = 2.b + 1
    // (3−1, 5−2, 7−3, 9−4).
    expect(ALL_SUBTRACT_FACTS.length).toBe(45);
    expect(SUBTRACT_DRAWS.hop.length).toBe(36);
    expect(SUBTRACT_DRAWS.over.length).toBe(36);
  });

  it('would collide on exactly the facts it excludes', () => {
    for (const slip of ['hop', 'over'] as const) {
      const kept = new Set(SUBTRACT_DRAWS[slip].map((f) => `${f.a}−${f.b}`));
      for (const { a, b } of ALL_SUBTRACT_FACTS) {
        if (kept.has(`${a}−${b}`)) continue;
        expect(new Set(values(a, b, slip)).size, `${slip} excluded ${a}−${b} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
