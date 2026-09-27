import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md1ReadARuler, RULER_SPANS } from './md1-read-a-ruler';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { s: number; e: number; unit: string } {
  const m =
    /^A ruler marked in (inches|centimeters)\. .* Its left end is at the (\d+) mark\. Its right end is at the (\d+) mark\.$/.exec(
      details ?? '',
    );
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { unit: m[1], s: Number(m[2]), e: Number(m[3]) };
}

const value = (text: string) => Number(text.split(' ')[0]);

describe('g2.md1.read-a-ruler', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md1ReadARuler);
  });

  it('is deterministic in its seed', () => {
    expect(md1ReadARuler.generate(makeRng(42))).toEqual(md1ReadARuler.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds (the standing
  // ruling: a pin that reads its numbers back out of the generator proves
  // nothing). Seed 7 draws the overcounting mark error, seed 123 the
  // undercount.
  it('emits exactly this question at seed 7', () => {
    const g = md1ReadARuler.generate(makeRng(7));
    expect(g.prompt).toBe('Use the ruler. How long is the ribbon?');
    expect(g.promptDetails).toBe(
      'A ruler marked in inches. The marks are numbered 0 to 12, one inch apart. The ribbon lies along the ruler. Its left end is at the 5 mark. Its right end is at the 12 mark.',
    );
    expect(g.answerText).toBe('7 inches');
    expect(shape(g)).toEqual([
      ['A', '8 inches', false, 'counted-the-ruler-marks-not-the-spaces'],
      ['B', '7 inches', true, null],
      ['C', '12 inches', false, 'read-the-end-mark-without-starting-at-zero'],
      ['D', '17 inches', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The ribbon is 7 inches long.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md1ReadARuler.generate(makeRng(123));
    expect(g.prompt).toBe('Use the ruler. How long is the leaf?');
    expect(g.promptDetails).toBe(
      'A ruler marked in inches. The marks are numbered 0 to 12, one inch apart. The leaf lies along the ruler. Its left end is at the 3 mark. Its right end is at the 10 mark.',
    );
    expect(g.answerText).toBe('7 inches');
    expect(shape(g)).toEqual([
      ['A', '7 inches', true, null],
      ['B', '6 inches', false, 'counted-only-the-marks-between-the-ends'],
      ['C', '13 inches', false, 'added-instead-of-subtracted'],
      ['D', '10 inches', false, 'read-the-end-mark-without-starting-at-zero'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The leaf is 7 inches long.');
  });

  it('is filed under NC.2.MD.1', () => {
    expect(md1ReadARuler.standardCode).toBe('NC.2.MD.1');
    expect(md1ReadARuler.domainId).toBe('MD');
  });

  // The object never starts at 0, so reading the mark at its right end is
  // always a live error — that is the brief's "measuring from the end of a
  // ruler rather than from zero".
  it('never starts the object at 0, and keeps it on a 12-unit ruler', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const { s, e } = parse(g.promptDetails);
      expect(s, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(s, `seed ${seed}`).toBeLessThanOrEqual(5);
      expect(e, `seed ${seed}`).toBeLessThanOrEqual(12);
      expect(value(g.answerText), `seed ${seed}`).toBe(e - s);
    }
  });

  // Ruling 19-3: one standard unit per item. Every option names the ruler's
  // own unit, so the unit is never what gives an option away.
  it('writes every option in the ruler’s own unit', () => {
    const singular: Record<string, string> = { inches: 'inch', centimeters: 'centimeter' };
    for (let seed = 0; seed < 300; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const { unit } = parse(g.promptDetails);
      for (const o of g.options) {
        const n = value(o.text);
        expect(o.text, `seed ${seed}`).toBe(`${n} ${n === 1 ? singular[unit] : unit}`);
      }
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    let over = 0;
    let under = 0;
    for (let seed = 0; seed < 600; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const { s, e } = parse(g.promptDetails);
      const d = e - s;
      const byTag = (tag: string) => g.options.find((o) => o.misconception === tag);
      expect(value(byTag('read-the-end-mark-without-starting-at-zero')!.text)).toBe(e);
      expect(value(byTag('added-instead-of-subtracted')!.text)).toBe(e + s);
      const marks = byTag('counted-the-ruler-marks-not-the-spaces');
      const between = byTag('counted-only-the-marks-between-the-ends');
      expect(!!marks !== !!between, `seed ${seed}: exactly one mark-counting error`).toBe(true);
      if (marks) {
        expect(value(marks.text)).toBe(d + 1);
        over++;
      } else {
        expect(value(between!.text)).toBe(d - 1);
        under++;
      }
    }
    // Both directions of the mark-counting error are drawn.
    expect(over).toBeGreaterThan(200);
    expect(under).toBeGreaterThan(200);
  });

  // The correct option must not be findable without reading the ruler. Every
  // other ruler error OVERSHOOTS, so with only those on offer the answer would
  // always be the smallest number. Drawing the undercount half the time moves
  // it between the smallest and the second smallest.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 300; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const sorted = g.options.map((o) => value(o.text)).sort((a, b) => a - b);
      ranks.add(sorted.indexOf(value(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([0, 1]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const { s, d } of RULER_SPANS) {
      for (const tick of [d + 1, d - 1]) {
        const e = s + d;
        const values = [d, e, tick, e + s];
        if (new Set(values).size !== 4) failures.push(`s=${s} d=${d}: ${values}`);
        if (Math.min(...values) < 1) failures.push(`s=${s} d=${d}: non-positive option`);
        if (e > 12) failures.push(`s=${s} d=${d}: past the end of the ruler`);
      }
    }
    expect(failures).toEqual([]);
    expect(RULER_SPANS.length, 'start marks 2-5 by lengths 2-7, less the 4 with d = s').toBe(20);
  });

  // The key is never a number the figure prints, so a child who answers with
  // the mark the object starts on cannot land on it by accident.
  it('never keys the start mark', () => {
    expect(RULER_SPANS.filter(({ s, d }) => s === d)).toEqual([]);
    for (let seed = 0; seed < 300; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const { s, e } = parse(g.promptDetails);
      expect(value(g.answerText), `seed ${seed}`).not.toBe(s);
      expect(value(g.answerText), `seed ${seed}`).not.toBe(e);
    }
  });

  // The one exclusion, shown to be real: with the object starting at the 1
  // mark, the end-mark reading 1 + d equals the counted-marks count d + 1.
  it('would collide on exactly the excluded start mark of 1', () => {
    const collided = [2, 3, 4, 5, 6, 7].filter((d) => 1 + d === d + 1);
    expect(collided).toEqual([2, 3, 4, 5, 6, 7]);
    expect(RULER_SPANS.some((x) => x.s === 1)).toBe(false);
  });
});
