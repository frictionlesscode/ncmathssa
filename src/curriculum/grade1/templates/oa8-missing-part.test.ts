import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa8MissingPart, PART_DRAWS, ALL_PART_PAIRS } from './oa8-missing-part';

type G = ReturnType<typeof oa8MissingPart.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

/** The six places a missing PART can sit, as a pattern over the equation with
 *  its numbers replaced by W (the whole) and K (the known part). */
const FORMS = ['K + ☐ = W', '☐ + K = W', 'W = K + ☐', 'W = ☐ + K', 'W − ☐ = K', 'K = W − ☐'];

function parse(prompt: string) {
  const m = /^What number makes (.+) true\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const equation = m[1];
  const nums = (equation.match(/\d+/g) ?? []).map(Number);
  expect(nums.length).toBe(2);
  const whole = Math.max(...nums);
  const known = Math.min(...nums);
  const form = equation.replace(`${whole}`, 'W').replace(new RegExp(`\\b${known}\\b`), 'K');
  return { equation, whole, known, missing: whole - known, form };
}

/** Every whole number 0-40 that makes the equation true. */
function solutions(equation: string): number[] {
  const side = (s: string) => {
    const t = s.trim().split(' ');
    let v = Number(t[0]);
    for (let i = 1; i < t.length; i += 2) v = t[i] === '+' ? v + Number(t[i + 1]) : v - Number(t[i + 1]);
    return v;
  };
  const out: number[] = [];
  for (let n = 0; n <= 40; n++) {
    const [l, r] = equation.replace('☐', `${n}`).split('=');
    if (side(l) === side(r)) out.push(n);
  }
  return out;
}

const gen = (seed: number) => oa8MissingPart.generate(makeRng(seed));

describe('g1.oa8.missing-part', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa8MissingPart);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run. Seed 123 is the brief's own
  // equal-sign trap, W = K + ☐, where adding everything gives 17.
  it('emits exactly this question at seed 7 (take-away form, hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('What number makes 5 = 8 − ☐ true?');
    expect(g.answerText).toBe('3');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'counted-the-start-number-as-a-hop'],
      ['B', '3', true, null],
      ['C', '13', false, 'added-every-number-in-the-equation'],
      ['D', '5', false, 'restated-a-known-number-instead-of-solving'],
    ]);
    expect(g.explanation.stepByStep[0]).toBe('Step 1: 8 take away the ☐ leaves 5, so 5 and the ☐ make 8.');
  });

  it('emits exactly this question at seed 123 (equal sign first, short count)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('What number makes 11 = 6 + ☐ true?');
    expect(g.answerText).toBe('5');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['B', '6', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '17', false, 'added-every-number-in-the-equation'],
      ['D', '5', true, null],
    ]);
    expect(g.explanation.stepByStep[0]).toBe('Step 1: 6 and the ☐ make 11.');
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.8', () => {
    expect(oa8MissingPart.standardCode).toBe('NC.1.OA.8');
  });

  // "The unknown can be in any position" and "addition and subtraction
  // equations alike": all six places a missing part can sit, the equal sign on
  // either side, and the keyed answer the equation's only solution.
  it('puts the missing part in every position, and keys the only solution', () => {
    const forms = new Set<string>();
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { equation, whole, missing, form } = parse(g.prompt);
      forms.add(form);
      expect(FORMS, `seed ${seed}: ${equation}`).toContain(form);
      expect(whole, `seed ${seed}`).toBeLessThanOrEqual(20);
      expect(missing, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(solutions(equation), `seed ${seed}: ${equation}`).toEqual([Number(g.answerText)]);
    }
    expect([...forms].sort()).toEqual([...FORMS].sort());
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { whole, known, missing } = parse(g.prompt);
      expect(Number(byTag(g, 'added-every-number-in-the-equation')!.text), `seed ${seed}`).toBe(whole + known);
      expect(Number(byTag(g, 'restated-a-known-number-instead-of-solving')!.text), `seed ${seed}`).toBe(known);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const short = byTag(g, 'counted-on-by-ones-and-stopped-one-short');
      expect(!!hop !== !!short, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(missing + 1);
      if (short) expect(Number(short.text), `seed ${seed}`).toBe(missing - 1);
    }
  });

  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { whole, known, missing, form } = parse(g.prompt);
      const first = form.includes('−')
        ? `Step 1: ${whole} take away the ☐ leaves ${known}, so ${known} and the ☐ make ${whole}.`
        : `Step 1: ${known} and the ☐ make ${whole}.`;
      expect(g.explanation.stepByStep).toEqual([
        first,
        `Step 2: Count on from ${known} up to ${whole}. The first number to say is ${known + 1}.`,
        `Step 3: That is ${missing} counts, so ${whole} − ${known} = ${missing}.`,
        `Step 4: The number in the ☐ is ${missing}.`,
      ]);
      expect(g.explanation.commonMisconception).toBe(
        `Adding every number, ${whole} + ${known} = ${whole + known}, makes the ☐ bigger than ${whole}, the whole.`,
      );
    }
  });

  // No size tell: adding everything always overshoots, but the restated part
  // and the counting slip each land on either side of the key.
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
    for (const slip of ['hop', 'short'] as const) {
      for (const { whole, known } of PART_DRAWS[slip]) {
        const x = whole - known;
        const v = [x, whole + known, known, slip === 'hop' ? x + 1 : x - 1];
        if (new Set(v).size !== 4) failures.push(`${slip} ${whole},${known}: ${v}`);
        if (Math.min(...v) < 1) failures.push(`${slip} ${whole},${known}: an option below 1`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 153 (whole, known) pairs have whole <= 20 and both parts
    // at least 2. Nine have whole = 2.known (the restated part IS the answer);
    // the hop loses eight more with whole = 2.known - 1, the short count eight
    // with whole = 2.known + 1.
    expect(ALL_PART_PAIRS.length).toBe(153);
    expect(PART_DRAWS.hop.length).toBe(136);
    expect(PART_DRAWS.short.length).toBe(136);
  });

  it('would collide on exactly the pairs it excludes', () => {
    for (const slip of ['hop', 'short'] as const) {
      const kept = new Set(PART_DRAWS[slip].map((p) => `${p.whole},${p.known}`));
      for (const { whole, known } of ALL_PART_PAIRS) {
        if (kept.has(`${whole},${known}`)) continue;
        const x = whole - known;
        const v = [x, whole + known, known, slip === 'hop' ? x + 1 : x - 1];
        expect(new Set(v).size, `${slip} excluded ${whole},${known} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
