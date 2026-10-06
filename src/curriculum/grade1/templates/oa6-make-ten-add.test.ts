import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa6MakeTenAdd, MAKE_TEN_DRAWS, ALL_MAKE_TEN_FACTS } from './oa6-make-ten-add';

type G = ReturnType<typeof oa6MakeTenAdd.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

function parse(prompt: string) {
  const m = /^Make a ten to help\. What is (\d+) \+ (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return { a, b, big, small, need: 10 - big, rest: a + b - 10, sum: a + b };
}

/** The four option values for a fact, from the tag formulas. */
function values(a: number, b: number, slip: 'hop' | 'over'): number[] {
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return [a + b, 20 - big, 10 + small, slip === 'hop' ? a + b - 1 : a + b + 1];
}

const gen = (seed: number) => oa6MakeTenAdd.generate(makeRng(seed));

describe('g1.oa6.make-ten-add', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa6MakeTenAdd);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run.
  it('emits exactly this question at seed 7 (smaller number first, hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Make a ten to help. What is 4 + 7?');
    expect(g.answerText).toBe('11');
    expect(shape(g)).toEqual([
      ['A', '11', true, null],
      ['B', '13', false, 'used-the-wrong-part-after-making-ten'],
      ['C', '14', false, 'used-the-whole-number-after-breaking-it-apart'],
      ['D', '10', false, 'counted-the-start-number-as-a-hop'],
    ]);
    expect(g.explanation.stepByStep).toEqual([
      'Step 1: Use making ten. Start with 7: it needs 3 more to make 10.',
      'Step 2: Break 4 into 3 and 1.',
      'Step 3: 7 + 3 = 10, and 10 + 1 = 11.',
      'Step 4: 4 + 7 = 11.',
    ]);
  });

  it('emits exactly this question at seed 123 (over-count)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('Make a ten to help. What is 5 + 8?');
    expect(g.answerText).toBe('13');
    expect(shape(g)).toEqual([
      ['A', '14', false, 'counted-on-by-ones-one-too-many'],
      ['B', '15', false, 'used-the-whole-number-after-breaking-it-apart'],
      ['C', '13', true, null],
      ['D', '12', false, 'used-the-wrong-part-after-making-ten'],
    ]);
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.6', () => {
    expect(oa6MakeTenAdd.standardCode).toBe('NC.1.OA.6');
  });

  // Within 20 and always crossing ten, or there is no ten to make.
  it('adds two one-digit numbers whose sum crosses 10 and stays within 20', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, sum } = parse(g.prompt);
      expect(Math.min(a, b), `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(Math.max(a, b), `seed ${seed}`).toBeLessThanOrEqual(9);
      expect(sum, `seed ${seed}`).toBeGreaterThanOrEqual(11);
      expect(sum, `seed ${seed}`).toBeLessThanOrEqual(20);
      expect(Number(g.answerText), `seed ${seed}`).toBe(sum);
    }
  });

  // Ruling 22-4: the explanation names its strategy, every time.
  it('names making ten in every worked solution, and states only true arithmetic', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, big, small, need, rest, sum } = parse(g.prompt);
      expect(g.explanation.stepByStep).toEqual([
        `Step 1: Use making ten. Start with ${big}: it needs ${need} more to make 10.`,
        `Step 2: Break ${small} into ${need} and ${rest}.`,
        `Step 3: ${big} + ${need} = 10, and 10 + ${rest} = ${sum}.`,
        `Step 4: ${a} + ${b} = ${sum}.`,
      ]);
      // The break-apart is real: both parts are at least 1 and add to small.
      expect(need, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(rest, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(need + rest, `seed ${seed}`).toBe(small);
      expect(g.explanation.commonMisconception).toBe(
        `Making the ten uses ${need} of the ${small}, so only ${rest} is left to add. Adding all ${small} again gives ${10 + small}.`,
      );
    }
  });

  // The same class as review finding I2: a double (6 + 6 ... 9 + 9) is
  // drawable here, and has no "bigger" number for any sentence to name.
  it('never calls a number "bigger" when both numbers are the same', () => {
    let doubles = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { a, b } = parse(g.prompt);
      if (a !== b) continue;
      doubles++;
      const text = [...g.explanation.stepByStep, g.explanation.conceptSummary, g.explanation.commonMisconception ?? ''];
      for (const s of text) expect(s, `seed ${seed}: ${g.prompt}`).not.toMatch(/bigger/i);
    }
    expect(doubles).toBeGreaterThan(0);
  });

  it('draws the bigger number first and second, and both counting slips', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const g = gen(seed);
      const { a, b } = parse(g.prompt);
      if (a !== b) seen.add(a > b ? 'bigger-first' : 'bigger-second');
      seen.add(byTag(g, 'counted-the-start-number-as-a-hop') ? 'hop' : 'over');
    }
    expect([...seen].sort()).toEqual(['bigger-first', 'bigger-second', 'hop', 'over']);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { big, small, need, sum } = parse(g.prompt);
      expect(Number(byTag(g, 'used-the-wrong-part-after-making-ten')!.text), `seed ${seed}`).toBe(10 + need);
      expect(Number(byTag(g, 'used-the-wrong-part-after-making-ten')!.text), `seed ${seed}`).toBe(20 - big);
      expect(Number(byTag(g, 'used-the-whole-number-after-breaking-it-apart')!.text), `seed ${seed}`).toBe(10 + small);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(sum - 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(sum + 1);
    }
  });

  // No size tell: adding all of the smaller number always overshoots, but the
  // wrong part lands above or below the key, and so does the counting slip.
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
      for (const { a, b } of MAKE_TEN_DRAWS[slip]) {
        const v = values(a, b, slip);
        if (new Set(v).size !== 4) failures.push(`${slip} ${a}+${b}: ${v}`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 36 ordered facts of 2-9 cross ten. Six always collide
    // (the smaller number is twice what the bigger needs: 9+2, 8+4, 7+6 both
    // ways round). The hop loses five more (smaller = 2.need + 1: 9+3, 8+5
    // both ways, 7+7); the over-count loses every fact with a 9 (15, two of
    // them already gone) and four more (smaller = 2.need - 1: 8+3, 7+5 both
    // ways).
    expect(ALL_MAKE_TEN_FACTS.length).toBe(36);
    expect(MAKE_TEN_DRAWS.hop.length).toBe(25);
    expect(MAKE_TEN_DRAWS.over.length).toBe(13);
  });

  it('would collide on exactly the facts it excludes', () => {
    for (const slip of ['hop', 'over'] as const) {
      const kept = new Set(MAKE_TEN_DRAWS[slip].map((f) => `${f.a}+${f.b}`));
      for (const { a, b } of ALL_MAKE_TEN_FACTS) {
        if (kept.has(`${a}+${b}`)) continue;
        expect(new Set(values(a, b, slip)).size, `${slip} excluded ${a}+${b} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
