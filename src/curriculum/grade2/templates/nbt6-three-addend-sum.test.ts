import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt6ThreeAddendSum,
  TENS_PAIRS,
  ONES_PAIRS,
  TENS_TRIPLES,
  ONES_TRIPLES,
} from './nbt6-three-addend-sum';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const addendsIn = (details: string | undefined) => (details ?? '').split(' + ').map(Number);

describe('g2.nbt6.three-addend-sum', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt6ThreeAddendSum);
  });

  it('is deterministic in its seed', () => {
    expect(nbt6ThreeAddendSum.generate(makeRng(42))).toEqual(
      nbt6ThreeAddendSum.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds — one three-addend
  // draw and one two-addend draw.
  it('emits exactly this question at seed 7 (three addends)', () => {
    const g = nbt6ThreeAddendSum.generate(makeRng(7));
    expect(g.prompt).toBe('Add all of the numbers.');
    expect(g.promptDetails).toBe('19 + 75 + 43');
    expect(g.answerText).toBe('137');
    expect(shape(g)).toEqual([
      ['A', '94', false, 'left-one-of-the-addends-out'],
      ['B', '137', true, null],
      ['C', '127', false, 'added-without-carrying'],
      ['D', '227', false, 'carried-into-the-wrong-column'],
    ]);
    expect(g.explanation.stepByStep[0]).toBe('Step 1: Add the ones: 9 + 5 + 3 = 17.');
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 19 + 75 + 43 = 137.');
  });

  it('emits exactly this question at seed 123 (two addends)', () => {
    const g = nbt6ThreeAddendSum.generate(makeRng(123));
    expect(g.promptDetails).toBe('47 + 74');
    expect(g.answerText).toBe('121');
    expect(shape(g)).toEqual([
      ['A', '47', false, 'left-one-of-the-addends-out'],
      ['B', '211', false, 'carried-into-the-wrong-column'],
      ['C', '111', false, 'added-without-carrying'],
      ['D', '121', true, null],
    ]);
  });

  it('draws both two and three addends, and NEVER four', () => {
    const counts = new Set<number>();
    for (let seed = 0; seed < 300; seed++) {
      counts.add(addendsIn(nbt6ThreeAddendSum.generate(makeRng(seed)).promptDetails).length);
    }
    expect([...counts].sort()).toEqual([2, 3]);
  });

  // Every addend is two-digit (the standard's own words) and the total is above
  // 100, which is what keeps this item out of NC.2.NBT.5's territory.
  it('uses only two-digit addends and always totals more than 100', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt6ThreeAddendSum.generate(makeRng(seed));
      const addends = addendsIn(g.promptDetails);
      expect(addends.length, `seed ${seed}`).toBeLessThanOrEqual(3);
      for (const n of addends) {
        expect(n, `seed ${seed}: ${n} is not two-digit`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}: ${n} is not two-digit`).toBeLessThanOrEqual(99);
      }
      const total = addends.reduce((a, b) => a + b, 0);
      expect(Number(g.answerText), `seed ${seed}`).toBe(total);
      expect(total, `seed ${seed}: total ${total} is NC.2.NBT.5 territory`).toBeGreaterThan(100);
      expect(total, `seed ${seed}`).toBeLessThan(1000);
      // Exactly one ten carries out of the ones column.
      const onesSum = addends.reduce((a, b) => a + (b % 10), 0);
      expect(onesSum, `seed ${seed}: ones do not regroup`).toBeGreaterThanOrEqual(10);
      expect(onesSum, `seed ${seed}: ones carry more than one ten`).toBeLessThanOrEqual(19);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt6ThreeAddendSum.generate(makeRng(seed));
      const addends = addendsIn(g.promptDetails);
      const total = addends.reduce((a, b) => a + b, 0);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-without-carrying'), `seed ${seed}`).toBe(total - 10);
      expect(byTag('carried-into-the-wrong-column'), `seed ${seed}`).toBe(total + 90);
      expect(byTag('left-one-of-the-addends-out'), `seed ${seed}`).toBe(
        total - addends[addends.length - 1],
      );
    }
  });

  // Both draw spaces in full, with all four option values recomputed from the
  // digit lists.
  it('has no colliding option value anywhere in either draw space', () => {
    const failures: string[] = [];
    const check = (tens: number[], ones: number[], label: string) => {
      const addends = tens.map((t, i) => 10 * t + ones[i]);
      const total = addends.reduce((a, b) => a + b, 0);
      const values = [total, total - 10, total + 90, total - addends[addends.length - 1]];
      if (new Set(values).size !== 4) failures.push(`${label} collision ${addends}: ${values}`);
      if (total <= 100) failures.push(`${label} total ${total} not past 100`);
      if (Math.max(...values) >= 1000) failures.push(`${label} option past 1,000: ${values}`);
      if (Math.min(...values) < 0) failures.push(`${label} negative option: ${values}`);
    };
    let drawn = 0;
    for (const t of TENS_PAIRS) {
      for (const o of ONES_PAIRS) {
        check(t, o, 'pair');
        drawn++;
      }
    }
    for (const t of TENS_TRIPLES) {
      for (const o of ONES_TRIPLES) {
        check(t, o, 'triple');
        drawn++;
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
    // LITERAL pinned counts, like every sibling template test in this task. An
    // expected total recomputed from the same four lengths the loops iterate
    // cannot fail, so it is written out: 44 x 45 = 1,980 two-addend draws and
    // 480 x 525 = 252,000 three-addend draws.
    expect(TENS_PAIRS.length, 'two-addend tens lists').toBe(44);
    expect(ONES_PAIRS.length, 'two-addend ones lists').toBe(45);
    expect(TENS_TRIPLES.length, 'three-addend tens lists').toBe(480);
    expect(ONES_TRIPLES.length, 'three-addend ones lists').toBe(525);
    expect(drawn, 'combined draw space').toBe(253980);
  });
});
