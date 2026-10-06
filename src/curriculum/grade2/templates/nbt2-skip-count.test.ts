import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt2SkipCount, SKIP_STEPS } from './nbt2-skip-count';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

/** Reads the start and the step back out of the figure, independently of the
 *  code that produced them. */
function parse(details: string | undefined): { start: number; step: number } {
  const m = /^Start at (\d+) and count by (\d+)s$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { start: Number(m[1]), step: Number(m[2]) };
}

const numbersIn = (text: string) => text.split(', ').map(Number);

describe('g2.nbt2.skip-count', () => {
  // content-g2 audit (High): "Every number counted by 5s ... ends in the same two
  // digits" was false in 33,307 of 100,000 instances.
  it('High: counting by 5s alternates 0 and 5, and the explanation says so at every seed', () => {
    let fives = 0;
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt2SkipCount.generate(makeRng(seed));
      const text = g.explanation.stepByStep.join(' ');
      expect(text, `seed ${seed}`).not.toMatch(/same two digits/i);
      if (/count by 5s/.test(g.promptDetails ?? '')) {
        fives += 1;
        expect(text, `seed ${seed}`).toContain('ends in a 0 or a 5');
      }
    }
    expect(fives).toBeGreaterThan(50);
  });

  it('is sound at every seed', () => {
    assertTemplateSound(nbt2SkipCount);
  });

  it('is deterministic in its seed', () => {
    expect(nbt2SkipCount.generate(makeRng(42))).toEqual(nbt2SkipCount.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7 (by 5s)', () => {
    const g = nbt2SkipCount.generate(makeRng(7));
    expect(g.prompt).toBe('Skip-count. What are the next three numbers?');
    expect(g.promptDetails).toBe('Start at 140 and count by 5s');
    expect(g.answerText).toBe('145, 150, 155');
    expect(shape(g)).toEqual([
      ['A', '140, 145, 150', false, 'listed-the-starting-number-as-the-first-count'],
      ['B', '145, 150, 155', true, null],
      ['C', '141, 142, 143', false, 'counted-by-ones-instead-of-the-given-step'],
      ['D', '240, 340, 440', false, 'skip-counted-by-the-wrong-step'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The next three numbers are 145, 150, 155.');
  });

  it('emits exactly this question at seed 123 (by 100s)', () => {
    const g = nbt2SkipCount.generate(makeRng(123));
    expect(g.promptDetails).toBe('Start at 253 and count by 100s');
    expect(g.answerText).toBe('353, 453, 553');
    expect(shape(g)).toEqual([
      ['A', '353, 453, 553', true, null],
      ['B', '254, 255, 256', false, 'counted-by-ones-instead-of-the-given-step'],
      ['C', '258, 263, 268', false, 'skip-counted-by-the-wrong-step'],
      ['D', '253, 353, 453', false, 'listed-the-starting-number-as-the-first-count'],
    ]);
  });

  it('only ever counts by 5s, 10s or 100s — the three the standard names', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 600; seed++) {
      seen.add(parse(nbt2SkipCount.generate(makeRng(seed)).promptDetails).step);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([...SKIP_STEPS].sort((a, b) => a - b));
  });

  it('keeps every number it prints inside 100 and 1,000', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt2SkipCount.generate(makeRng(seed));
      const { start } = parse(g.promptDetails);
      const printed = [start, ...g.options.flatMap((o) => numbersIn(o.text))];
      for (const n of printed) {
        expect(Number.isInteger(n), `seed ${seed}: ${n}`).toBe(true);
        expect(n, `seed ${seed}: ${n} below 100`).toBeGreaterThanOrEqual(100);
        expect(n, `seed ${seed}: ${n} past 1,000`).toBeLessThanOrEqual(1000);
      }
    }
  });

  // A count by 10s or 100s from a round number is answerable by reciting the
  // multiples, which is not what the standard asks for.
  it('starts a 10s or 100s count on a number that is not a multiple of the step', () => {
    for (let seed = 0; seed < 600; seed++) {
      const { start, step } = parse(nbt2SkipCount.generate(makeRng(seed)).promptDetails);
      if (step === 10) expect(start % 10, `seed ${seed}: start ${start}`).not.toBe(0);
      if (step === 100) {
        expect(start % 10, `seed ${seed}: start ${start}`).not.toBe(0);
        expect(Math.floor(start / 10) % 10, `seed ${seed}: start ${start}`).not.toBe(0);
      }
      if (step === 5) expect(start % 5, `seed ${seed}: start ${start}`).toBe(0);
    }
  });

  it('gives each option the list its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt2SkipCount.generate(makeRng(seed));
      const { start, step } = parse(g.promptDetails);
      const byTag = (tag: string) => numbersIn(g.options.find((o) => o.misconception === tag)!.text);

      expect(numbersIn(g.answerText), `seed ${seed}`).toEqual([
        start + step,
        start + 2 * step,
        start + 3 * step,
      ]);
      expect(byTag('counted-by-ones-instead-of-the-given-step'), `seed ${seed}`).toEqual([
        start + 1,
        start + 2,
        start + 3,
      ]);
      expect(byTag('listed-the-starting-number-as-the-first-count'), `seed ${seed}`).toEqual([
        start,
        start + step,
        start + 2 * step,
      ]);
      const wrong = byTag('skip-counted-by-the-wrong-step');
      const w = wrong[0] - start;
      expect(SKIP_STEPS.includes(w as 5 | 10 | 100), `seed ${seed}: step ${w}`).toBe(true);
      expect(w, `seed ${seed}`).not.toBe(step);
      expect(wrong, `seed ${seed}`).toEqual([start + w, start + 2 * w, start + 3 * w]);
    }
  });
});
