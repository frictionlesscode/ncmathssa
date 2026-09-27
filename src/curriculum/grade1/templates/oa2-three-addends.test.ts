import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa2ThreeAddends, ADDEND_TRIPLES } from './oa2-three-addends';

type G = ReturnType<typeof oa2ThreeAddends.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

const PROMPT =
  /^([A-Z][a-z]+) has (\d+) red, (\d+) blue, and (\d+) green ([a-z]+)\. How many ([a-z]+) does ([A-Z][a-z]+) have in all\?$/;

function parse(prompt: string) {
  const m = PROMPT.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  expect(m[7]).toBe(m[1]);
  expect(m[6]).toBe(m[5]);
  return { name: m[1], a: Number(m[2]), b: Number(m[3]), c: Number(m[4]), noun: m[5] };
}

/** The pair a worked solution should group first: the first two of the three
 *  that make 10, looked for in the order (a,b), (a,c), (b,c). */
function tenPair(a: number, b: number, c: number): [number, number, number] | null {
  if (a + b === 10) return [a, b, c];
  if (a + c === 10) return [a, c, b];
  if (b + c === 10) return [b, c, a];
  return null;
}

const gen = (seed: number) => oa2ThreeAddends.generate(makeRng(seed));

describe('g1.oa2.three-addends', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa2ThreeAddends);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run: one draw added in order, one that
  // groups a pair making 10.
  it('emits exactly this question at seed 7 (added in order, hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Zoe has 2 red, 2 blue, and 7 green kites. How many kites does Zoe have in all?');
    expect(g.answerText).toBe('11');
    expect(shape(g)).toEqual([
      ['A', '10', false, 'counted-the-start-number-as-a-hop'],
      ['B', '11', true, null],
      ['C', '4', false, 'left-one-of-the-addends-out'],
      ['D', '13', false, 'added-one-number-twice'],
    ]);
    expect(g.explanation.stepByStep).toEqual([
      'Step 1: Write it as 2 + 2 + 7 = ☐.',
      'Step 2: Add the first two: 2 + 2 = 4.',
      'Step 3: Add the last one: 4 + 7 = 11.',
      'Step 4: Zoe has 11 kites in all.',
    ]);
  });

  it('emits exactly this question at seed 2024 (makes 10 first, over-count)', () => {
    const g = gen(2024);
    expect(g.prompt).toBe('Mia has 7 red, 9 blue, and 3 green kites. How many kites does Mia have in all?');
    expect(g.answerText).toBe('19');
    expect(shape(g)).toEqual([
      ['A', '20', false, 'counted-on-by-ones-one-too-many'],
      ['B', '19', true, null],
      ['C', '16', false, 'left-one-of-the-addends-out'],
      ['D', '26', false, 'added-one-number-twice'],
    ]);
    expect(g.explanation.stepByStep).toEqual([
      'Step 1: Write it as 7 + 9 + 3 = ☐.',
      'Step 2: 7 + 3 = 10, so add those two first.',
      'Step 3: 10 + 9 = 19.',
      'Step 4: Mia has 19 kites in all.',
    ]);
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.2', () => {
    expect(oa2ThreeAddends.standardCode).toBe('NC.1.OA.2');
  });

  // Ruling 22-3: "three whole numbers whose sum is less than or equal to 20",
  // asserted over the whole 300-run sweep and not just the draw table.
  it('adds exactly three whole numbers whose sum is at most 20, across 300 runs', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = gen(seed);
      const { a, b, c } = parse(g.prompt);
      expect(a + b + c, `seed ${seed}: ${g.prompt}`).toBeLessThanOrEqual(20);
      expect(Number(g.answerText), `seed ${seed}`).toBe(a + b + c);
    }
  });

  it('draws both counting slips and both kinds of worked solution', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const g = gen(seed);
      seen.add(byTag(g, 'counted-the-start-number-as-a-hop') ? 'hop' : 'over');
      seen.add(g.explanation.stepByStep[1].includes('= 10, so add those two first') ? 'ten' : 'in-order');
    }
    expect([...seen].sort()).toEqual(['hop', 'in-order', 'over', 'ten']);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, c } = parse(g.prompt);
      const sum = a + b + c;
      expect(Number(byTag(g, 'left-one-of-the-addends-out')!.text), `seed ${seed}`).toBe(a + b);
      expect(Number(byTag(g, 'added-one-number-twice')!.text), `seed ${seed}`).toBe(sum + a);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(sum - 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(sum + 1);
    }
  });

  // The make-ten branch is chosen from the numbers drawn, so it is checked
  // against them: it appears exactly when two addends really make 10.
  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { name, a, b, c, noun } = parse(g.prompt);
      const sum = a + b + c;
      const steps = g.explanation.stepByStep;
      expect(steps[0]).toBe(`Step 1: Write it as ${a} + ${b} + ${c} = ☐.`);
      const pair = tenPair(a, b, c);
      if (pair) {
        const [x, y, z] = pair;
        expect(steps[1], `seed ${seed}`).toBe(`Step 2: ${x} + ${y} = 10, so add those two first.`);
        expect(steps[2], `seed ${seed}`).toBe(`Step 3: 10 + ${z} = ${sum}.`);
      } else {
        expect(steps[1], `seed ${seed}`).toBe(`Step 2: Add the first two: ${a} + ${b} = ${a + b}.`);
        expect(steps[2], `seed ${seed}`).toBe(`Step 3: Add the last one: ${a + b} + ${c} = ${sum}.`);
      }
      expect(steps[3]).toBe(`Step 4: ${name} has ${sum} ${noun} in all.`);
      expect(g.explanation.commonMisconception).toBe(
        `Adding only the red and blue ${noun}, ${a} + ${b} = ${a + b}, leaves out the ${c} green ones.`,
      );
    }
  });

  // No size tell: the left-out total is always lowest and the doubled one
  // highest, but the counting slip lands on either side of the key.
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
    for (const [a, b, c] of ADDEND_TRIPLES) {
      const sum = a + b + c;
      for (const slip of [sum - 1, sum + 1]) {
        const values = [sum, a + b, sum + a, slip];
        if (new Set(values).size !== 4) failures.push(`${a},${b},${c}: ${values}`);
      }
      if (sum > 20) failures.push(`${a},${b},${c}: sum ${sum} is past 20`);
      if (Math.min(a, b, c) < 2) failures.push(`${a},${b},${c}: an addend below 2`);
    }
    expect(failures).toEqual([]);
    // LITERAL: ordered triples of 2-9 with a sum of at most 20 — all 512 less
    // the 84 whose sum is 21 or more.
    expect(ADDEND_TRIPLES.length).toBe(428);
  });
});
