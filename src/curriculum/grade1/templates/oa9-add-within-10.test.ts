import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa9AddWithin10, ADD_DRAWS, ALL_ADD_FACTS } from './oa9-add-within-10';

type G = ReturnType<typeof oa9AddWithin10.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

function parse(prompt: string) {
  const m = /^What is (\d+) \+ (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  return { a, b, big: Math.max(a, b), small: Math.min(a, b), sum: a + b };
}

const values = (a: number, b: number, slip: 'hop' | 'over') => [
  a + b,
  Math.abs(a - b),
  Math.max(a, b),
  slip === 'hop' ? a + b - 1 : a + b + 1,
];

const gen = (seed: number) => oa9AddWithin10.generate(makeRng(seed));

describe('g1.oa9.add-within-10', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa9AddWithin10);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run.
  it('emits exactly this question at seed 7 (hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('What is 2 + 3?');
    expect(g.answerText).toBe('5');
    expect(shape(g)).toEqual([
      ['A', '5', true, null],
      ['B', '1', false, 'subtracted-instead-of-added'],
      ['C', '3', false, 'restated-a-known-number-instead-of-solving'],
      ['D', '4', false, 'counted-the-start-number-as-a-hop'],
    ]);
    expect(g.explanation.stepByStep[1]).toBe('Step 2: Count on 2 more: 4, 5.');
  });

  // Seed 0 is the double the review caught saying "Start at the bigger
  // number, 2." Pinned from a real run after the fix.
  it('emits exactly this question at seed 0 (a double, hop)', () => {
    const g = gen(0);
    expect(g.prompt).toBe('What is 2 + 2?');
    expect(g.answerText).toBe('4');
    expect(shape(g)).toEqual([
      ['A', '0', false, 'subtracted-instead-of-added'],
      ['B', '2', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '3', false, 'counted-the-start-number-as-a-hop'],
      ['D', '4', true, null],
    ]);
    expect(g.explanation.stepByStep).toEqual([
      'Step 1: Both numbers are 2. Start at 2.',
      'Step 2: Count on 2 more: 3, 4.',
      'Step 3: 2 + 2 = 4.',
    ]);
  });

  it('emits exactly this question at seed 123 (a +1 fact, over-count)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('What is 1 + 9?');
    expect(g.answerText).toBe('10');
    expect(shape(g)).toEqual([
      ['A', '11', false, 'counted-on-by-ones-one-too-many'],
      ['B', '9', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '10', true, null],
      ['D', '8', false, 'subtracted-instead-of-added'],
    ]);
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.9', () => {
    expect(oa9AddWithin10.standardCode).toBe('NC.1.OA.9');
  });

  // NC.1.OA.9 is fluency WITHIN 10 — not NC.1.OA.6's within 20 (ruling 22-1).
  it('only ever asks an addition fact whose sum is 10 or less', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, sum } = parse(g.prompt);
      expect(Math.min(a, b), `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(sum, `seed ${seed}`).toBeLessThanOrEqual(10);
      expect(Number(g.answerText), `seed ${seed}`).toBe(sum);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, big, sum } = parse(g.prompt);
      expect(Number(byTag(g, 'subtracted-instead-of-added')!.text), `seed ${seed}`).toBe(Math.abs(a - b));
      expect(Number(byTag(g, 'restated-a-known-number-instead-of-solving')!.text), `seed ${seed}`).toBe(big);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const over = byTag(g, 'counted-on-by-ones-one-too-many');
      expect(!!hop !== !!over, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(sum - 1);
      if (over) expect(Number(over.text), `seed ${seed}`).toBe(sum + 1);
    }
  });

  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const { a, b, big, small, sum } = parse(g.prompt);
      const counts = Array.from({ length: small }, (_, i) => big + 1 + i);
      expect(counts[counts.length - 1]).toBe(sum);
      expect(g.explanation.stepByStep.slice(1)).toEqual([
        `Step 2: Count on ${small} more: ${counts.join(', ')}.`,
        `Step 3: ${a} + ${b} = ${sum}.`,
      ]);
      // Audit (Medium): the explanation must describe the distractor that is
      // actually on offer, and the number it names must be one of the options.
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      expect(g.explanation.commonMisconception, `seed ${seed}`).toBe(
        hop
          ? `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`
          : `Counting one more time than ${small} lands on ${sum + 1}, one too far. Stop after ${small} ${small === 1 ? 'count' : 'counts'}, at ${sum}.`,
      );
      const named = Number(/lands on (\d+)/.exec(g.explanation.commonMisconception!)![1]);
      expect(g.options.map((o) => Number(o.text)), `seed ${seed}: names ${named}`).toContain(named);
    }
  });

  // Review finding I2: "Start at the bigger number, 2." shipped for 2 + 2.
  // Checked against the numbers, not against a copy of the template's own
  // string, and over a seed range long enough to draw every fact in both draw
  // lists, so no fact is left unread.
  it('never calls a number "bigger" in a double, and names the real bigger one otherwise', () => {
    const seen = { hop: new Set<string>(), over: new Set<string>() };
    let doubles = 0;
    for (let seed = 0; seed < 5000; seed++) {
      const g = gen(seed);
      const { a, b } = parse(g.prompt);
      seen[byTag(g, 'counted-the-start-number-as-a-hop') ? 'hop' : 'over'].add(`${a}+${b}`);
      const text = [...g.explanation.stepByStep, g.explanation.conceptSummary, g.explanation.commonMisconception ?? ''];
      if (a === b) {
        doubles++;
        for (const s of text) expect(s, `seed ${seed}: ${g.prompt}`).not.toMatch(/bigger/i);
        expect(g.explanation.stepByStep[0]).toBe(`Step 1: Both numbers are ${a}. Start at ${a}.`);
      } else {
        const named = /the bigger number, (\d+)\./.exec(g.explanation.stepByStep[0]);
        expect(named, `seed ${seed}: ${g.explanation.stepByStep[0]}`).not.toBeNull();
        expect(Number(named![1]), `seed ${seed}`).toBe(Math.max(a, b));
      }
    }
    expect(doubles).toBeGreaterThan(0);
    expect([...seen.hop].sort()).toEqual(ADD_DRAWS.hop.map((f) => `${f.a}+${f.b}`).sort());
    expect([...seen.over].sort()).toEqual(ADD_DRAWS.over.map((f) => `${f.a}+${f.b}`).sort());
  });

  // A sum is always the biggest of its own parts, so two options sit below it
  // by construction; the over-count above it half the time keeps "pick the
  // biggest" from working.
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
    for (const slip of ['hop', 'over'] as const) {
      for (const { a, b } of ADD_DRAWS[slip]) {
        const v = values(a, b, slip);
        if (new Set(v).size !== 4) failures.push(`${slip} ${a}+${b}: ${v}`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 45 ordered facts have both addends at least 1 and a sum
    // of at most 10. The hop loses the 17 with a 1 in them, where the bigger
    // addend is one less than the sum and so equals the hop's value.
    expect(ALL_ADD_FACTS.length).toBe(45);
    expect(ADD_DRAWS.hop.length).toBe(28);
    expect(ADD_DRAWS.over.length).toBe(45);
  });

  it('would collide on exactly the facts it excludes', () => {
    for (const slip of ['hop', 'over'] as const) {
      const kept = new Set(ADD_DRAWS[slip].map((f) => `${f.a}+${f.b}`));
      for (const { a, b } of ALL_ADD_FACTS) {
        if (kept.has(`${a}+${b}`)) continue;
        expect(new Set(values(a, b, slip)).size, `${slip} excluded ${a}+${b} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
