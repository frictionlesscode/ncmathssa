import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf2FractionOnANumberLine, POINTS } from './nf2-fraction-on-a-number-line';

/** Ruling 13-2: halves, thirds, fourths, sixths and eighths, and nothing else. */
const LEGAL_DENOMINATORS = new Set([2, 3, 4, 6, 8]);

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function textOf(g: ReturnType<typeof nf2FractionOnANumberLine.generate>): string {
  return [
    g.prompt,
    g.promptDetails ?? '',
    ...g.options.map((o) => o.text),
    ...g.explanation.stepByStep,
    g.explanation.conceptSummary,
    g.explanation.commonMisconception ?? '',
  ].join(' ');
}

/** Reads the line back out of the FIGURE, independently of the generator: how
 *  many spaces it is cut into, and which one the marker sits on. */
function readFigure(details: string | undefined): { d: number; n: number } {
  const [labels, ticks, marker] = (details ?? '').split('\n');
  if (!labels || !ticks || !marker) throw new Error(`unparsable figure: ${details}`);
  const spaces = (ticks.match(/----/g) ?? []).length;
  const column = marker.indexOf('P');
  expect(ticks.length, 'the tick row must be 5d + 1 characters').toBe(5 * spaces + 1);
  expect(labels, 'the 0 and the 1 must sit over the end ticks').toBe(
    `0${' '.repeat(5 * spaces - 1)}1`,
  );
  expect(column % 5, 'the marker must sit exactly on a tick').toBe(0);
  return { d: spaces, n: column / 5 };
}

const value = (text: string): number => {
  const m = /^(\d+)\/(\d+)$/.exec(text)!;
  return Number(m[1]) / Number(m[2]);
};

describe('g3.nf2.fraction-on-a-number-line', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf2FractionOnANumberLine);
  });

  it('is deterministic in its seed', () => {
    expect(nf2FractionOnANumberLine.generate(makeRng(42))).toEqual(
      nf2FractionOnANumberLine.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run. Everything else here reads the line
  // back out of the generator's own figure, so none of it would notice a change
  // to the seed -> point mapping or to rng.pick ordering.
  it('emits exactly this question at seed 7', () => {
    const g = nf2FractionOnANumberLine.generate(makeRng(7));
    expect(g.prompt).toBe('Which fraction does point P name?');
    expect(g.promptDetails).toBe('0              1\n|----|----|----|\n          P');
    expect(g.answerText).toBe('2/3');
    expect(shape(g)).toEqual([
      ['A', '3/2', false, 'wrote-the-fraction-upside-down'],
      ['B', '3/3', false, 'counted-tick-marks-not-intervals'],
      ['C', '1/3', false, 'started-the-count-at-the-first-tick-not-at-zero'],
      ['D', '2/3', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: So point P names 2/3.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nf2FractionOnANumberLine.generate(makeRng(123));
    expect(g.promptDetails).toBe(
      '0                                       1\n|----|----|----|----|----|----|----|----|\n               P',
    );
    expect(g.answerText).toBe('3/8');
    expect(shape(g)).toEqual([
      ['A', '2/8', false, 'started-the-count-at-the-first-tick-not-at-zero'],
      ['B', '8/3', false, 'wrote-the-fraction-upside-down'],
      ['C', '4/8', false, 'counted-tick-marks-not-intervals'],
      ['D', '3/8', true, null],
    ]);
  });

  // The figure IS the question here, so it has to be right: the marker must sit
  // on the tick that names the answer, and not one space either side of it.
  it('marks the point the answer names', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf2FractionOnANumberLine.generate(makeRng(seed));
      const { d, n } = readFigure(g.promptDetails);
      expect(g.answerText, `seed ${seed}`).toBe(`${n}/${d}`);
      expect(n, `seed ${seed}: P is at or past 1`).toBeLessThan(d);
      expect(n, `seed ${seed}: P is at 0`).toBeGreaterThan(0);
    }
  });

  // Ruling 13-2, swept. Note that the upside-down distractor puts the NUMERATOR
  // in the denominator, so restricting n is as load-bearing as restricting d:
  // an option printed as 8/5 or 6/7 would teach fifths and sevenths.
  it('writes no denominator outside halves, thirds, fourths, sixths and eighths', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf2FractionOnANumberLine.generate(makeRng(seed));
      for (const m of textOf(g).matchAll(/(\d+)\s*\/\s*(\d+)/g)) {
        expect(
          LEGAL_DENOMINATORS.has(Number(m[2])),
          `seed ${seed}: ${m[0]} is not a Grade 3 denominator`,
        ).toBe(true);
      }
    }
  });

  // Two fractions that name one amount are two right answers. Different STRINGS
  // is not enough - 2/4 and 1/2 are different strings - so this compares the
  // four options by value.
  it('never offers two options that name the same amount', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf2FractionOnANumberLine.generate(makeRng(seed));
      const values = g.options.map((o) => value(o.text));
      expect(new Set(values).size, `seed ${seed}: ${g.options.map((o) => o.text).join(' | ')}`).toBe(
        4,
      );
    }
  });

  // The full 10-point draw space, not a sample.
  it('has no colliding option values anywhere in its draw space', () => {
    for (const { d, n } of POINTS) {
      const values = [n / d, (n + 1) / d, (n - 1) / d, d / n];
      expect(new Set(values).size, `(${n}/${d}) collides: ${values.join(', ')}`).toBe(4);
      for (const denominator of [d, n]) {
        expect(
          LEGAL_DENOMINATORS.has(denominator),
          `(${n}/${d}) would print a denominator of ${denominator}`,
        ).toBe(true);
      }
      expect(n, `(${n}/${d}) would print 0 as a numerator`).toBeGreaterThanOrEqual(2);
      expect(n, `(${n}/${d}) is not below 1`).toBeLessThanOrEqual(d - 1);
    }
    expect(POINTS.length, 'draw space size').toBe(10);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nf2FractionOnANumberLine.generate(makeRng(seed));
        const { d, n } = readFigure(g.promptDetails);
        const by = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        // One mark too many: 0 gets a tick of its own, so counting marks from 0
        // to P gives n + 1 where counting spaces gives n.
        expect(by('counted-tick-marks-not-intervals')).toBe(`${n + 1}/${d}`);
        // One space too few: the count began at the first tick after 0.
        expect(by('started-the-count-at-the-first-tick-not-at-zero')).toBe(`${n - 1}/${d}`);
        expect(by('wrote-the-fraction-upside-down')).toBe(`${d}/${n}`);
      });
    }
  });
});
