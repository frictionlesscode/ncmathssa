import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa6GetToTenSubtract, GET_TO_TEN_DRAWS, ALL_TEEN_FACTS } from './oa6-get-to-ten-subtract';

type G = ReturnType<typeof oa6GetToTenSubtract.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

function parse(prompt: string) {
  const m = /^Get to 10 first\. What is (\d+) − (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  const ones = a - 10;
  return { a, b, ones, rest: b - ones, diff: a - b };
}

/** The four option values for a fact, from the tag formulas. */
function values(a: number, b: number, slip: 'hop' | 'over'): number[] {
  const ones = a - 10;
  const rest = b - ones;
  return [a - b, 10 + rest, 10 - b, slip === 'hop' ? a - b + 1 : a - b - 1];
}

const gen = (seed: number) => oa6GetToTenSubtract.generate(makeRng(seed));

describe('g1.oa6.get-to-ten-subtract', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa6GetToTenSubtract);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run.
  it('emits exactly this question at seed 7 (hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Get to 10 first. What is 11 − 4?');
    expect(g.answerText).toBe('7');
    expect(shape(g)).toEqual([
      ['A', '7', true, null],
      ['B', '13', false, 'added-the-rest-after-getting-to-ten'],
      ['C', '6', false, 'used-the-whole-number-after-breaking-it-apart'],
      ['D', '8', false, 'counted-the-start-number-as-a-hop'],
    ]);
    expect(g.explanation.stepByStep).toEqual([
      'Step 1: Get to 10 first. Break 4 into 1 and 3.',
      'Step 2: 11 − 1 = 10.',
      'Step 3: 10 − 3 = 7.',
      'Step 4: 11 − 4 = 7.',
    ]);
  });

  it('emits exactly this question at seed 123 (over-count)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('Get to 10 first. What is 12 − 7?');
    expect(g.answerText).toBe('5');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'counted-on-by-ones-one-too-many'],
      ['B', '3', false, 'used-the-whole-number-after-breaking-it-apart'],
      ['C', '5', true, null],
      ['D', '15', false, 'added-the-rest-after-getting-to-ten'],
    ]);
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.6', () => {
    expect(oa6GetToTenSubtract.standardCode).toBe('NC.1.OA.6');
  });

  // A teen number take away a one-digit number, crossing back below 10, so
  // there is a ten to get to and the answer is never negative.
  it('takes a one-digit number from a teen number and lands below 10', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, ones, diff } = parse(g.prompt);
      expect(a, `seed ${seed}`).toBeGreaterThanOrEqual(11);
      expect(a, `seed ${seed}`).toBeLessThanOrEqual(18);
      expect(b, `seed ${seed}`).toBeLessThanOrEqual(9);
      expect(b, `seed ${seed}: ${g.prompt} does not cross ten`).toBeGreaterThan(ones);
      expect(diff, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(diff, `seed ${seed}`).toBeLessThan(10);
      expect(Number(g.answerText), `seed ${seed}`).toBe(diff);
    }
  });

  // Ruling 22-4: the explanation names its strategy — the sourced keyConcept
  // "decomposing a number leading to a ten", in a first-grader's words.
  it('names getting to 10 in every worked solution, and states only true arithmetic', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, ones, rest, diff } = parse(g.prompt);
      expect(g.explanation.stepByStep).toEqual([
        `Step 1: Get to 10 first. Break ${b} into ${ones} and ${rest}.`,
        `Step 2: ${a} − ${ones} = 10.`,
        `Step 3: 10 − ${rest} = ${diff}.`,
        `Step 4: ${a} − ${b} = ${diff}.`,
      ]);
      expect(ones + rest, `seed ${seed}`).toBe(b);
      expect(rest, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(g.explanation.commonMisconception).toBe(
        `Getting to 10 and then adding the ${rest} gives ${10 + rest}. The ${rest} is part of the ${b} being taken away, so it comes off too: 10 − ${rest} = ${diff}.`,
      );
    }
  });

  it('draws both counting slips', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      seen.add(byTag(gen(seed), 'counted-the-start-number-as-a-hop') ? 'hop' : 'over');
    }
    expect([...seen].sort()).toEqual(['hop', 'over']);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { b, rest, diff } = parse(g.prompt);
      expect(Number(byTag(g, 'added-the-rest-after-getting-to-ten')!.text), `seed ${seed}`).toBe(10 + rest);
      expect(Number(byTag(g, 'used-the-whole-number-after-breaking-it-apart')!.text), `seed ${seed}`).toBe(10 - b);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(diff + 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(diff - 1);
    }
  });

  // No size tell: taking all of b from 10 always undershoots and adding the
  // rest always overshoots, but the counting slip lands on either side.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([1, 2]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const slip of ['hop', 'over'] as const) {
      for (const { a, b } of GET_TO_TEN_DRAWS[slip]) {
        const v = values(a, b, slip);
        if (new Set(v).size !== 4) failures.push(`${slip} ${a}−${b}: ${v}`);
        if (Math.min(...v) < 1) failures.push(`${slip} ${a}−${b}: an option below 1`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 36 teen-minus-one-digit facts cross ten (a = 11-18,
    // b bigger than a's ones digit). The over-count loses the eight with a 1 in
    // the ones (11 − 2 ... 11 − 9), where 10 − b lands on the over-count.
    expect(ALL_TEEN_FACTS.length).toBe(36);
    expect(GET_TO_TEN_DRAWS.hop.length).toBe(36);
    expect(GET_TO_TEN_DRAWS.over.length).toBe(28);
  });

  it('would collide on exactly the facts it excludes', () => {
    for (const slip of ['hop', 'over'] as const) {
      const kept = new Set(GET_TO_TEN_DRAWS[slip].map((f) => `${f.a}−${f.b}`));
      for (const { a, b } of ALL_TEEN_FACTS) {
        if (kept.has(`${a}−${b}`)) continue;
        expect(new Set(values(a, b, slip)).size, `${slip} excluded ${a}−${b} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
