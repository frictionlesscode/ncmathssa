import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt3WhichSentenceIsTrue, COMPARE_DRAWS } from './nbt3-which-sentence-is-true';

type G = ReturnType<typeof nbt3WhichSentenceIsTrue.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt3WhichSentenceIsTrue.generate(makeRng(seed));

function parse(prompt: string) {
  const m = /^Which sentence about (\d+) and (\d+) is true\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const first = Number(m[1]);
  const second = Number(m[2]);
  return { first, second, greater: Math.max(first, second), less: Math.min(first, second) };
}

/** Reads a comparison sentence and says whether it is true. */
function isTrue(sentence: string): boolean {
  const m = /^(\d+) ([<>=]) (\d+)$/.exec(sentence);
  if (!m) throw new Error(`not a comparison sentence: "${sentence}"`);
  const [a, b] = [Number(m[1]), Number(m[3])];
  return m[2] === '>' ? a > b : m[2] === '<' ? a < b : a === b;
}

describe('g1.nbt3.which-sentence-is-true', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt3WhichSentenceIsTrue);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.NBT.3', () => {
    expect(nbt3WhichSentenceIsTrue.standardCode).toBe('NC.1.NBT.3');
  });

  // "Two-digit numbers only", and the same two digits in both, so comparing
  // the ones first or reading the digits alone goes wrong every time.
  it('compares two two-digit numbers made of the same two digits', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const { first, second } = parse(gen(seed).prompt);
      for (const n of [first, second]) {
        expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}`).toBeLessThanOrEqual(99);
      }
      expect(second, `seed ${seed}`).toBe(10 * (first % 10) + Math.floor(first / 10));
      expect(second, `seed ${seed}`).not.toBe(first);
    }
  });

  // Ruling 23-6: four complete comparison sentences, exactly one true, and
  // the symbols >, = and < all on offer — the recording the standard asks for.
  it('offers four complete sentences about the two numbers, exactly one of them true', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { first, second } = parse(g.prompt);
      const trueOnes = g.options.filter((o) => isTrue(o.text));
      expect(trueOnes.map((o) => o.text), `seed ${seed}`).toEqual([g.answerText]);
      const symbols = new Set(g.options.map((o) => o.text.split(' ')[1]));
      expect([...symbols].sort(), `seed ${seed}`).toEqual(['<', '=', '>']);
      for (const o of g.options) {
        const [a, , b] = o.text.split(' ').map((t) => Number(t));
        expect([a, b].sort(), `seed ${seed}: ${o.text}`).toEqual([first, second].sort());
      }
    }
  });

  it('gives each false sentence the error its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { first, second, greater, less } = parse(g.prompt);
      // The smaller number has the bigger ones digit, so comparing ones first
      // calls it the greater one.
      expect(byTag(g, 'compared-the-wrong-place-first')!.text, `seed ${seed}`).toBe(`${less} > ${greater}`);
      // The greater number named first, with the symbol that says it is less.
      expect(byTag(g, 'reversed-the-inequality-symbol')!.text, `seed ${seed}`).toBe(`${greater} < ${less}`);
      // Same two digits, so "the same number" — in the order the question names them.
      expect(byTag(g, 'same-digits-read-as-the-same-number')!.text, `seed ${seed}`).toBe(`${first} = ${second}`);
    }
  });

  // A generator must not make the key always `>`, nor always the sentence
  // that starts with the number the question names first.
  it('keys > and < about equally, and starts the key with either number', () => {
    let greaterThan = 0;
    let startsWithFirst = 0;
    const runs = 2000;
    for (let seed = 0; seed < runs; seed++) {
      const g = gen(seed);
      const { first } = parse(g.prompt);
      if (g.answerText.includes('>')) greaterThan++;
      if (g.answerText.startsWith(`${first} `)) startsWithFirst++;
    }
    expect(greaterThan / runs).toBeGreaterThan(0.4);
    expect(greaterThan / runs).toBeLessThan(0.6);
    expect(startsWithFirst / runs).toBeGreaterThan(0.4);
    expect(startsWithFirst / runs).toBeLessThan(0.6);
  });

  it('states only true things in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { greater, less } = parse(g.prompt);
      const texts = explanationTexts(g.explanation);
      assertStatedArithmeticHolds(texts, `seed ${seed}`);
      assertCountWordsAgree(texts, `seed ${seed}`);
      const tensOf = (n: number) => Math.floor(n / 10);
      const tens = (n: number) => `${tensOf(n)} ${tensOf(n) === 1 ? 'ten' : 'tens'}`;
      expect(g.explanation.stepByStep[0], `seed ${seed}`).toContain(`${greater} has ${tens(greater)} and ${less} has ${tens(less)}`);
      expect(g.explanation.stepByStep[1], `seed ${seed}`).toContain(`so ${greater} is greater than ${less}`);
    }
  });

  it('has no colliding option anywhere in its draw space', () => {
    // LITERAL: 36 pairs of different digits 1-9, x 2 orders in the question
    // x 2 ways of writing the true sentence.
    expect(COMPARE_DRAWS.length).toBe(144);
    const seen = new Set<string>();
    for (let seed = 0; seed < 6000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
      seen.add(`${g.prompt} ${g.answerText}`);
    }
    // The sweep reached every draw, so the check above covered them all.
    expect(seen.size).toBe(144);
  });
});
