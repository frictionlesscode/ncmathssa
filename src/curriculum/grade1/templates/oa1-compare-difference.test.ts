import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { oa1CompareDifference, COMPARE_DRAWS, ALL_COMPARE_PAIRS } from './oa1-compare-difference';

type G = ReturnType<typeof oa1CompareDifference.generate>;

const shape = (g: G) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);

const PROMPT =
  /^([A-Z][a-z]+) has (\d+) ([a-z]+) and ([A-Z][a-z]+) has (\d+)\. How many (more|fewer) ([a-z]+) does ([A-Z][a-z]+) have than ([A-Z][a-z]+)\?$/;

function parse(prompt: string) {
  const m = PROMPT.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const amounts = new Map([
    [m[1], Number(m[2])],
    [m[4], Number(m[5])],
  ]);
  return {
    noun: m[3],
    nounAgain: m[7],
    mode: m[6] as 'more' | 'fewer',
    asked: m[8],
    other: m[9],
    amounts,
    first: m[1],
    second: m[4],
  };
}

const gen = (seed: number) => oa1CompareDifference.generate(makeRng(seed));

describe('g1.oa1.compare-difference', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa1CompareDifference);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  // LITERAL pins, copied from a real run: a "more" question with the hop, and
  // a "fewer" question with the short count.
  it('emits exactly this question at seed 7 ("more", hop)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Max has 20 beads and Kim has 16. How many more beads does Max have than Kim?');
    expect(g.answerText).toBe('4');
    expect(shape(g)).toEqual([
      ['A', '5', false, 'counted-the-start-number-as-a-hop'],
      ['B', '20', false, 'gave-an-amount-instead-of-the-difference'],
      ['C', '36', false, 'added-instead-of-subtracted'],
      ['D', '4', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: Max has 4 more beads than Kim.');
  });

  it('emits exactly this question at seed 2024 ("fewer", short count)', () => {
    const g = gen(2024);
    expect(g.prompt).toBe('Max has 15 beads and Mia has 9. How many fewer beads does Mia have than Max?');
    expect(g.answerText).toBe('6');
    expect(shape(g)).toEqual([
      ['A', '5', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['B', '9', false, 'gave-an-amount-instead-of-the-difference'],
      ['C', '24', false, 'added-instead-of-subtracted'],
      ['D', '6', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: Mia has 6 fewer beads than Max.');
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.OA.1', () => {
    expect(oa1CompareDifference.standardCode).toBe('NC.1.OA.1');
  });

  // Compare, Difference Unknown: two amounts within 20, asked the gap between
  // them, and the question always asks about the child it is true of.
  it('asks a compare, difference-unknown question within 20, about the right child', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const p = parse(g.prompt);
      expect(p.noun, `seed ${seed}`).toBe(p.nounAgain);
      expect(p.asked, `seed ${seed}`).not.toBe(p.other);
      expect(new Set([p.first, p.second]), `seed ${seed}`).toEqual(new Set([p.asked, p.other]));
      const askedN = p.amounts.get(p.asked)!;
      const otherN = p.amounts.get(p.other)!;
      const big = Math.max(askedN, otherN);
      const small = Math.min(askedN, otherN);
      expect(big, `seed ${seed}`).toBeLessThanOrEqual(20);
      expect(small, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(big - small, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      // "more" asks about the child with more; "fewer" about the child with fewer.
      expect(askedN === big, `seed ${seed}: ${g.prompt}`).toBe(p.mode === 'more');
      expect(Number(g.answerText), `seed ${seed}`).toBe(big - small);
    }
  });

  it('draws both questions, both mention orders, and both counting slips', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const g = gen(seed);
      const p = parse(g.prompt);
      seen.add(p.mode);
      seen.add(p.first === p.asked ? 'asked-first' : 'asked-second');
      seen.add(byTag(g, 'counted-the-start-number-as-a-hop') ? 'hop' : 'short');
    }
    expect([...seen].sort()).toEqual(['asked-first', 'asked-second', 'fewer', 'hop', 'more', 'short']);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const p = parse(g.prompt);
      const askedN = p.amounts.get(p.asked)!;
      const otherN = p.amounts.get(p.other)!;
      const d = Math.abs(askedN - otherN);
      expect(Number(byTag(g, 'added-instead-of-subtracted')!.text), `seed ${seed}`).toBe(askedN + otherN);
      expect(Number(byTag(g, 'gave-an-amount-instead-of-the-difference')!.text), `seed ${seed}`).toBe(askedN);
      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
      const short = byTag(g, 'counted-on-by-ones-and-stopped-one-short');
      expect(!!hop !== !!short, `seed ${seed}: exactly one counting slip`).toBe(true);
      if (hop) expect(Number(hop.text), `seed ${seed}`).toBe(d + 1);
      if (short) expect(Number(short.text), `seed ${seed}`).toBe(d - 1);
    }
  });

  // Every sentence of the explanation, checked against the numbers drawn.
  it('states only true arithmetic in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = gen(seed);
      const p = parse(g.prompt);
      const askedN = p.amounts.get(p.asked)!;
      const otherN = p.amounts.get(p.other)!;
      const big = Math.max(askedN, otherN);
      const small = Math.min(askedN, otherN);
      const [s1, s2, s3, s4] = g.explanation.stepByStep;
      const bigName = askedN === big ? p.asked : p.other;
      const smallName = askedN === big ? p.other : p.asked;
      expect(s1).toBe(`Step 1: ${bigName} has ${big} ${p.noun}. ${smallName} has ${small} ${p.noun}.`);
      expect(s2).toBe(`Step 2: Count on from ${small} up to ${big}. The first number to say is ${small + 1}.`);
      expect(s3).toBe(`Step 3: That is ${big - small} counts, so ${big} − ${small} = ${big - small}.`);
      expect(s4).toBe(
        p.mode === 'more'
          ? `Step 4: ${bigName} has ${big - small} more ${p.noun} than ${smallName}.`
          : `Step 4: ${smallName} has ${big - small} fewer ${p.noun} than ${bigName}.`,
      );
      expect(g.explanation.commonMisconception).toBe(
        `Adding ${small} + ${big} = ${small + big} finds how many ${p.noun} there are in all, not how many ${p.mode} one child has than the other.`,
      );
    }
  });

  // No size tell: the added and the amount distractors sit above the key, but
  // the counting slip lands on either side of it, and in a "fewer" question the
  // amount given back is the smaller one, which can fall below the key too.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Map<number, number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((a, b) => a - b);
      const r = sorted.indexOf(Number(g.answerText));
      ranks.set(r, (ranks.get(r) ?? 0) + 1);
    }
    expect([...ranks.keys()].sort()).toEqual([0, 1, 2]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const [key, pairs] of Object.entries(COMPARE_DRAWS)) {
      const [mode, slip] = key.split('-');
      for (const { small, big } of pairs) {
        const d = big - small;
        const values = [d, small + big, mode === 'more' ? big : small, slip === 'hop' ? d + 1 : d - 1];
        if (new Set(values).size !== 4) failures.push(`${key} ${small},${big}: ${values}`);
        if (Math.min(...values) < 1) failures.push(`${key} ${small},${big}: below 1`);
      }
    }
    expect(failures).toEqual([]);
    // LITERAL counts. 153 pairs have 2 <= small, small + 2 <= big <= 20. A
    // "more" question gives back the BIGGER amount and never collides; a
    // "fewer" question gives back the smaller one and loses the pairs where it
    // equals the difference (big = 2.small, small 2-10: 9 pairs) or the
    // slip's value (big = 2.small - 1 for the hop, small 3-10: 8 pairs;
    // big = 2.small + 1 for the short count, small 2-9: 8 pairs).
    expect(ALL_COMPARE_PAIRS.length).toBe(153);
    expect(COMPARE_DRAWS['more-hop'].length).toBe(153);
    expect(COMPARE_DRAWS['more-short'].length).toBe(153);
    expect(COMPARE_DRAWS['fewer-hop'].length).toBe(136);
    expect(COMPARE_DRAWS['fewer-short'].length).toBe(136);
  });

  it('would collide on exactly the pairs it excludes', () => {
    for (const [key, pairs] of Object.entries(COMPARE_DRAWS)) {
      const [mode, slip] = key.split('-');
      const kept = new Set(pairs.map((p) => `${p.small},${p.big}`));
      for (const { small, big } of ALL_COMPARE_PAIRS) {
        if (kept.has(`${small},${big}`)) continue;
        const d = big - small;
        const values = [d, small + big, mode === 'more' ? big : small, slip === 'hop' ? d + 1 : d - 1];
        expect(new Set(values).size, `${key} excluded ${small},${big} but it does not collide`).toBeLessThan(4);
      }
    }
  });
});
