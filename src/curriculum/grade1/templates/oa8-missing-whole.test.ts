import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa8MissingWhole, WHOLE_DRAWS, ALL_WHOLE_PAIRS } from './oa8-missing-whole';

type G = ReturnType<typeof oa8MissingWhole.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

function parse(prompt: string) {
  let m = /^What number makes ☐ − (\d+) = (\d+) true\?$/.exec(prompt);
  if (m) return { form: '☐ − b = c', b: Number(m[1]), c: Number(m[2]) };
  m = /^What number makes (\d+) = ☐ − (\d+) true\?$/.exec(prompt);
  if (m) return { form: 'c = ☐ − b', b: Number(m[2]), c: Number(m[1]) };
  throw new Error(`unparsable prompt: ${prompt}`);
}

const gen = (seed: number) => oa8MissingWhole.generate(makeRng(seed));

describe('g1.oa8.missing-whole', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa8MissingWhole);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run: the box first, then the equal sign
  // first.
  it('emits exactly this question at seed 7 (box first, hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('What number makes ☐ − 2 = 3 true?');
    expect(g.answerText).toBe('5');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'counted-the-start-number-as-a-hop'],
      ['B', '5', true, null],
      ['C', '1', false, 'subtracted-instead-of-added'],
      ['D', '3', false, 'restated-a-known-number-instead-of-solving'],
    ]);
  });

  it('emits exactly this question at seed 123 (equal sign first)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('What number makes 9 = ☐ − 11 true?');
    expect(g.answerText).toBe('20');
    expect(shape(g)).toEqual([
      ['A', '19', false, 'counted-the-start-number-as-a-hop'],
      ['B', '9', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '2', false, 'subtracted-instead-of-added'],
      ['D', '20', true, null],
    ]);
    expect(g.explanation.stepByStep[1]).toBe('Step 2: Put the two parts back together: 9 + 11 = 20.');
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.8', () => {
    expect(oa8MissingWhole.standardCode).toBe('NC.1.OA.8');
  });

  // The missing number is where a take-away STARTS, with the equal sign on
  // either side, and the whole stays within 20.
  it('hides the starting number of a take-away, on either side of the equal sign', () => {
    const forms = new Set<string>();
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { form, b, c } = parse(g.prompt);
      forms.add(form);
      expect(b, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(c, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(b + c, `seed ${seed}`).toBeLessThanOrEqual(20);
      expect(Number(g.answerText), `seed ${seed}`).toBe(b + c);
    }
    expect([...forms].sort()).toEqual(['c = ☐ − b', '☐ − b = c']);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { b, c } = parse(g.prompt);
      expect(Number(byTag(g, 'subtracted-instead-of-added')!.text), `seed ${seed}`).toBe(Math.abs(c - b));
      expect(Number(byTag(g, 'restated-a-known-number-instead-of-solving')!.text), `seed ${seed}`).toBe(c);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(b + c - 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(b + c + 1);
    }
  });

  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { b, c } = parse(g.prompt);
      const x = b + c;
      expect(g.explanation.stepByStep).toEqual([
        `Step 1: The ☐ is the number you start with. Take ${b} away and ${c} is left.`,
        `Step 2: Put the two parts back together: ${c} + ${b} = ${x}.`,
        `Step 3: Check: ${x} − ${b} = ${c}.`,
        `Step 4: The number in the ☐ is ${x}.`,
      ]);
      // "Bigger than both" is what makes the misconception sentence true.
      expect(x).toBeGreaterThan(b);
      expect(x).toBeGreaterThan(c);
      expect(g.explanation.commonMisconception).toBe(
        `The minus sign makes taking away feel right, but ${Math.max(b, c)} − ${Math.min(b, c)} = ${Math.abs(b - c)} cannot be the start: the ☐ has to be bigger than both ${b} and ${c}.`,
      );
    }
  });

  // The whole is always the biggest number in a take-away, so three of the
  // four options sit below it by construction; the counting slip that lands
  // above it half the time is what keeps "pick the biggest" from working.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([2, 3]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const { b, c } of WHOLE_DRAWS) {
      for (const slip of [b + c - 1, b + c + 1]) {
        const v = [b + c, Math.abs(c - b), c, slip];
        if (new Set(v).size !== 4) failures.push(`${b},${c}: ${v}`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 171 pairs have b >= 2, c >= 1 and b + c <= 20. Six have
    // b = 2.c (b = 2, 4, ... 12), where b − c is c again.
    expect(ALL_WHOLE_PAIRS.length).toBe(171);
    expect(WHOLE_DRAWS.length).toBe(165);
  });

  it('would collide on exactly the pairs it excludes', () => {
    const kept = new Set(WHOLE_DRAWS.map((p) => `${p.b},${p.c}`));
    for (const { b, c } of ALL_WHOLE_PAIRS) {
      if (kept.has(`${b},${c}`)) continue;
      expect(new Set([b + c, Math.abs(c - b), c]).size, `excluded ${b},${c} but it does not collide`).toBeLessThan(3);
    }
  });
});
