import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { METRIC_UNIT } from '../metricGuard';
import {
  md2CustomaryCapacityWordProblem,
  POUR_PAIRS,
} from './md2-customary-capacity-word-problem';

/** Reads the two amounts and the unit back out of the prompt. */
function parse(prompt: string): { A: number; B: number; unit: string } {
  const m = /holds (\d+) (\w+) of [a-z ]+\. \w+ pours out (\d+) (\w+)\./.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  if (m[2] !== m[4]) throw new Error(`two different units in: ${prompt}`);
  return { A: Number(m[1]), B: Number(m[3]), unit: m[2] };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md2CustomaryCapacityWordProblem.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};


/** The only capacity units this generator may print. */
const ALLOWED = new Set(['gallons', 'quarts', 'pints', 'cups', 'gallon', 'quart', 'pint', 'cup']);

describe('g3.md2.customary-capacity-word-problem', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md2CustomaryCapacityWordProblem);
  });

  it('is deterministic in its seed', () => {
    expect(md2CustomaryCapacityWordProblem.generate(makeRng(42))).toEqual(
      md2CustomaryCapacityWordProblem.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = md2CustomaryCapacityWordProblem.generate(makeRng(7));
    expect(g.prompt).toBe(
      'A water tank holds 90 gallons of water. Maya pours out 89 gallons. How many gallons of water are left in the water tank?',
    );
    expect(g.answerText).toBe('1 gallon');
    expect(shape(g)).toEqual([
      ['A', '11 gallons', false, 'borrowed-without-reducing-the-next-column'],
      ['B', '1 gallon', true, null],
      ['C', '179 gallons', false, 'added-instead-of-subtracted'],
      ['D', '19 gallons', false, 'subtracted-without-regrouping'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: Both amounts are already in gallons, so the answer keeps that unit: 1 gallon left.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = md2CustomaryCapacityWordProblem.generate(makeRng(123));
    expect(g.prompt).toBe(
      'A soup kettle holds 71 quarts of soup. Omar pours out 48 quarts. How many quarts of soup are left in the soup kettle?',
    );
    expect(g.answerText).toBe('23 quarts');
    expect(shape(g)).toEqual([
      ['A', '33 quarts', false, 'borrowed-without-reducing-the-next-column'],
      ['B', '37 quarts', false, 'subtracted-without-regrouping'],
      ['C', '119 quarts', false, 'added-instead-of-subtracted'],
      ['D', '23 quarts', true, null],
    ]);
  });

  // content-g3 audit (Medium): "soup pot holds 87 quarts", "juice jug 93 pints".
  it('F: every vessel is one that can hold 30 to 99 of its unit', () => {
    const CAN_HOLD: Record<string, string> = {
      'water tank': 'gallons',
      'rain barrel': 'gallons',
      'fish tank': 'gallons',
      cooler: 'quarts',
      'soup kettle': 'quarts',
      'juice dispenser': 'pints',
    };
    for (let seed = 0; seed < 600; seed++) {
      const { prompt } = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
      const m = /^An? (.+) holds \d+ (\w+) of /.exec(prompt);
      expect(m, `seed ${seed}: ${prompt}`).not.toBeNull();
      expect(CAN_HOLD[m![1]], `seed ${seed}: ${m![1]}`).toBe(m![2]);
    }
  });

  // content-g3 audit (Medium): "1 ones" in 797 of 2000 seeds, "1 tens" in 383.
  it('F: never writes "1 tens", "1 ones", "0 tens" as singular or "1 is" as "1 are"', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
      const text = [...g.explanation.stepByStep, g.explanation.commonMisconception ?? ''].join(' ');
      expect(text, `seed ${seed}`).not.toMatch(/\b1 (?:tens|ones)\b/);
      expect(text, `seed ${seed}`).not.toMatch(/\b1 are\b/);
      expect(text, `seed ${seed}`).not.toMatch(/\bare only 1 one\b/);
    }
  });

  // RULING 14-1, the most serious finding in the Grade 3 pre-flight. A metric
  // unit here is another curriculum's content under an NC code, and it would
  // pass every other test in this file.
  it('never prints a metric unit', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
      const blob = [
        g.prompt,
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      expect(METRIC_UNIT.exec(blob)?.[0], `seed ${seed}`).toBe(undefined);
    }
  });

  // "...in the SAME customary units" is the standard's own third bullet.
  // Converting between two customary units is NC.4.MD.1, so one unit word is
  // drawn once and used everywhere in the question and in every option.
  it('keeps one customary unit through the whole question', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
      const { unit } = parse(g.prompt);
      expect(ALLOWED.has(unit), `seed ${seed}: ${unit} is not a customary capacity unit`).toBe(true);
      for (const o of g.options) {
        const own = o.text.split(' ')[1];
        expect(ALLOWED.has(own), `seed ${seed}: option "${o.text}"`).toBe(true);
        // Singular only when the amount really is one.
        expect(own.replace(/s$/, ''), `seed ${seed}: option "${o.text}" changes unit`).toBe(
          unit.replace(/s$/, ''),
        );
      }
    }
  });

  // The whole draw space. The one collision the algebra predicts is
  // b0 - a0 = 5, and nothing else may be missing from the list either: a pair
  // silently dropped would narrow the practice without anything going red.
  it('excludes exactly the pairs the algebra says it must', () => {
    const kept = new Set(POUR_PAIRS.map(({ A, B }) => `${A}-${B}`));
    let expected = 0;
    for (let a1 = 3; a1 <= 9; a1++) {
      for (let b1 = 1; b1 < a1; b1++) {
        for (let a0 = 0; a0 <= 8; a0++) {
          for (let b0 = a0 + 1; b0 <= 9; b0++) {
            const A = 10 * a1 + a0;
            const B = 10 * b1 + b0;
            const values = [A - B, A + B, 10 * (a1 - b1) + (b0 - a0), A - B + 10];
            const distinct = new Set(values).size === 4;
            expect(distinct, `(${A}, ${B}) collides iff b0-a0 is 5`).toBe(b0 - a0 !== 5);
            if (b0 - a0 === 5) continue;
            expected++;
            expect(kept.has(`${A}-${B}`), `(${A}, ${B}) is legal but missing`).toBe(true);
          }
        }
      }
    }
    expect(POUR_PAIRS.length, 'draw space size').toBe(expected);
  });

  it('always needs a regroup, which is what the distractors diagnose', () => {
    for (const { A, B } of POUR_PAIRS) {
      expect(A % 10, `${A} - ${B} needs no regroup`).toBeLessThan(B % 10);
      expect(A, `${A} - ${B} is negative`).toBeGreaterThan(B);
      expect(B, `${B} is not a two-digit amount`).toBeGreaterThanOrEqual(10);
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
        const { A, B } = parse(g.prompt);
        expect(Number(g.answerText.split(' ')[0])).toBe(A - B);
        expect(optionValue(g, 'added-instead-of-subtracted')).toBe(A + B);
        expect(optionValue(g, 'subtracted-without-regrouping')).toBe(
          10 * (Math.floor(A / 10) - Math.floor(B / 10)) + ((B % 10) - (A % 10)),
        );
        expect(optionValue(g, 'borrowed-without-reducing-the-next-column')).toBe(A - B + 10);
      });
    }
  });
});
