import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md8CountCoins, COIN_SETS } from './md8-count-coins';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

interface Coins {
  q: number;
  d: number;
  n: number;
  p: number;
}

function parseCoins(prompt: string): Coins {
  const count = (re: RegExp) => Number(re.exec(prompt)?.[1] ?? 0);
  return {
    q: count(/(\d+) quarters?\b/),
    d: count(/(\d+) dimes?\b/),
    n: count(/(\d+) nickels?\b/),
    p: count(/(\d+) penn(?:y|ies)\b/),
  };
}

const cents = (text: string) => {
  const m = /^(\d+)¢$/.exec(text);
  if (!m) throw new Error(`not a cents amount: ${text}`);
  return Number(m[1]);
};

/** Value of the smallest non-penny coin in the set: what a child who keeps
 *  counting by the last coin's value adds for each penny. */
function lastCoinValue({ q, d, n }: Coins): number {
  if (n > 0) return 5;
  if (d > 0) return 10;
  if (q > 0) return 25;
  throw new Error('no silver coin');
}

describe('g2.md8.count-coins', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md8CountCoins);
  });

  it('is deterministic in its seed', () => {
    expect(md8CountCoins.generate(makeRng(42))).toEqual(md8CountCoins.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = md8CountCoins.generate(makeRng(7));
    expect(g.prompt).toBe('Ella has 4 nickels and 1 penny. How much money does she have?');
    expect(g.answerText).toBe('21¢');
    expect(shape(g)).toEqual([
      ['A', '21¢', true, null],
      ['B', '5¢', false, 'counted-the-coins-not-their-value'],
      ['C', '41¢', false, 'mixed-up-the-values-of-a-nickel-and-a-dime'],
      ['D', '25¢', false, 'kept-counting-by-the-last-coins-value'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: Ella has 21¢.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md8CountCoins.generate(makeRng(123));
    expect(g.prompt).toBe('Zoe has 2 dimes, 1 nickel, and 1 penny. How much money does she have?');
    expect(g.answerText).toBe('26¢');
    expect(shape(g)).toEqual([
      ['A', '30¢', false, 'kept-counting-by-the-last-coins-value'],
      ['B', '21¢', false, 'mixed-up-the-values-of-a-nickel-and-a-dime'],
      ['C', '26¢', true, null],
      ['D', '4¢', false, 'counted-the-coins-not-their-value'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: Zoe has 26¢.');
  });

  // Ruling 19-1: NC.2.MD.8 is MONEY. The brief filed the money generator
  // under MD.7, which is time.
  it('is filed under NC.2.MD.8', () => {
    expect(md8CountCoins.standardCode).toBe('NC.2.MD.8');
  });

  // Ruling 19-3: "Quarters, dimes, nickels, and pennies within 99¢, using ¢
  // symbols appropriately" — and never a $ amount mixed in. Every option, the
  // wrong ones included, is a whole number of cents from 1 to 99.
  it('stays within 99¢, written with ¢, never with $', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md8CountCoins.generate(makeRng(seed));
      expect(g.prompt, `seed ${seed}`).not.toMatch(/\$/);
      for (const o of g.options) {
        const v = cents(o.text);
        expect(v, `seed ${seed}: ${o.text}`).toBeGreaterThanOrEqual(1);
        expect(v, `seed ${seed}: ${o.text}`).toBeLessThanOrEqual(99);
      }
    }
  });

  it('keys the value of the coins', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md8CountCoins.generate(makeRng(seed));
      const { q, d, n, p } = parseCoins(g.prompt);
      expect(cents(g.answerText), `seed ${seed}`).toBe(25 * q + 10 * d + 5 * n + p);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md8CountCoins.generate(makeRng(seed));
      const c = parseCoins(g.prompt);
      const total = 25 * c.q + 10 * c.d + 5 * c.n + c.p;
      const byTag = (tag: string) => cents(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('counted-the-coins-not-their-value'), `seed ${seed}`).toBe(
        c.q + c.d + c.n + c.p,
      );
      expect(byTag('mixed-up-the-values-of-a-nickel-and-a-dime'), `seed ${seed}`).toBe(
        25 * c.q + 5 * c.d + 10 * c.n + c.p,
      );
      expect(byTag('kept-counting-by-the-last-coins-value'), `seed ${seed}`).toBe(
        total - c.p + c.p * lastCoinValue(c),
      );
    }
  });

  // The count of coins is always the smallest option and the keep-counting
  // error always overshoots, but the nickel/dime swap lands above the key when
  // there are more nickels than dimes and below it otherwise.
  it('does not always put the correct amount at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = md8CountCoins.generate(makeRng(seed));
      const sorted = g.options.map((o) => cents(o.text)).sort((a, b) => a - b);
      ranks.add(sorted.indexOf(cents(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([1, 2]);
  });

  it('has no colliding or out-of-range option anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const c of COIN_SETS) {
      const total = 25 * c.q + 10 * c.d + 5 * c.n + c.p;
      const values = [
        total,
        c.q + c.d + c.n + c.p,
        25 * c.q + 5 * c.d + 10 * c.n + c.p,
        total - c.p + c.p * lastCoinValue(c),
      ];
      const tag = JSON.stringify(c);
      if (new Set(values).size !== 4) failures.push(`${tag}: ${values}`);
      if (values.some((v) => v < 1 || v > 99)) failures.push(`${tag}: out of 1-99 ${values}`);
      if (c.p < 1 || c.p > 4) failures.push(`${tag}: pennies`);
      if (c.n === c.d) failures.push(`${tag}: as many nickels as dimes`);
    }
    expect(failures).toEqual([]);
    expect(COIN_SETS.length).toBe(COIN_SET_COUNT);
  });

  // The one exclusion, shown to be real: with as many nickels as dimes,
  // swapping their values changes nothing, so that option IS the answer.
  it('would collide on exactly the excluded nickels = dimes', () => {
    for (let k = 0; k <= 4; k++) {
      const c = { q: 1, d: k, n: k, p: 1 };
      expect(25 * c.q + 5 * c.d + 10 * c.n + c.p).toBe(25 * c.q + 10 * c.d + 5 * c.n + c.p);
    }
    expect(COIN_SETS.some((c) => c.n === c.d)).toBe(false);
  });
});

/** Pinned from an enumeration of the stated bounds (see the template's
 *  docstring): 0-3 quarters, 0-4 dimes, 0-4 nickels, 1-4 pennies, at least
 *  one silver coin, nickels != dimes, and every option at most 99¢. A change
 *  to the bounds changes this number. */
const COIN_SET_COUNT = 206;
