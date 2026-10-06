import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md1ElapsedTimeWithinTheHour, TIME_PAIRS } from './md1-elapsed-time-within-the-hour';

/** Reads the two clock times back out of the prompt, independently of the
 *  generator's own arithmetic. */
function parse(prompt: string): { h: number; s: number; e: number } {
  const m = /started at (\d{1,2}):(\d{2}) and ended at (\d{1,2}):(\d{2})\./.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  if (m[1] !== m[3]) throw new Error(`two different hours in: ${prompt}`);
  return { h: Number(m[1]), s: Number(m[2]), e: Number(m[4]) };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md1ElapsedTimeWithinTheHour.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g3.md1.elapsed-time-within-the-hour', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md1ElapsedTimeWithinTheHour);
  });

  it('is deterministic in its seed', () => {
    expect(md1ElapsedTimeWithinTheHour.generate(makeRng(42))).toEqual(
      md1ElapsedTimeWithinTheHour.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run. A pin that reads the numbers back out
  // of the prompt and checks the answer against them asserts only that the
  // generator agrees with itself; it survives a change to the context list, to
  // the seed-to-pair mapping and to the whole wording of the question, which
  // is the only thing a pin is for.
  it('emits exactly this question at seed 7', () => {
    const g = md1ElapsedTimeWithinTheHour.generate(makeRng(7));
    expect(g.prompt).toBe('Art class started at 1:40 and ended at 1:54. How many minutes long was it?');
    expect(g.promptDetails).toBe(undefined);
    expect(g.answerText).toBe('14 minutes');
    expect(shape(g)).toEqual([
      ['A', '10 minutes', false, 'read-the-clock-to-the-nearest-five-minutes'],
      ['B', '14 minutes', true, null],
      ['C', '54 minutes', false, 'read-the-clock-time-as-the-interval'],
      ['D', '94 minutes', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 10 + 4 = 14, so it lasted 14 minutes.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md1ElapsedTimeWithinTheHour.generate(makeRng(123));
    expect(g.prompt).toBe('Gym class started at 3:15 and ended at 3:49. How many minutes long was it?');
    expect(g.answerText).toBe('34 minutes');
    expect(shape(g)).toEqual([
      ['A', '30 minutes', false, 'read-the-clock-to-the-nearest-five-minutes'],
      ['B', '64 minutes', false, 'added-instead-of-subtracted'],
      ['C', '49 minutes', false, 'read-the-clock-time-as-the-interval'],
      ['D', '34 minutes', true, null],
    ]);
  });

  // RULING 14-4, which is what this generator is shaped around. An interval
  // that crosses the hour is NC.4.MD.8 - a whole grade on, with shipped Grade 4
  // content of its own. The hour is substituted into both printed times, so
  // this cannot fail by accident; the point of checking it is that a later
  // edit which starts drawing two hours goes red here instead of silently
  // teaching next year's standard under a Grade 3 code.
  it('never lets an interval cross the hour', () => {
    for (let seed = 0; seed < 800; seed++) {
      const g = md1ElapsedTimeWithinTheHour.generate(makeRng(seed));
      const { h, s, e } = parse(g.prompt);
      expect(h, `seed ${seed}: hour ${h}`).toBeGreaterThanOrEqual(1);
      expect(h, `seed ${seed}: hour ${h}`).toBeLessThanOrEqual(12);
      expect(e, `seed ${seed}: ${e} is no minute of any hour`).toBeLessThan(60);
      expect(e, `seed ${seed}: end does not follow start`).toBeGreaterThan(s);
      // The answer is a difference of two minute readings inside one hour, so
      // it is always less than a full hour and never needs an hour traded.
      expect(Number(g.answerText.split(' ')[0])).toBe(e - s);
      expect(Number(g.answerText.split(' ')[0])).toBeLessThan(60);
      // Nothing is ever traded from minutes into hours, which is the arithmetic
      // that makes NC.4.MD.8 a different standard.
      expect(g.explanation.stepByStep.join(' ')).not.toMatch(/60 minutes|next hour/i);
    }
  });

  // "Tell and write time to the NEAREST MINUTE" is the standard's first
  // keyConcept, so the end time must not sit on a five-minute mark - otherwise
  // reading the clock only to the nearest five would give the right answer and
  // the read-to-the-nearest-five distractor would collide with the key.
  it('always ends off a five-minute mark and starts on one', () => {
    for (const { s, e } of TIME_PAIRS) {
      expect(s % 5, `start ${s} is not on a five-minute mark`).toBe(0);
      expect(e % 5, `end ${e} sits on a five-minute mark`).not.toBe(0);
      expect(e - s, `interval ${e - s} is too short to be worth asking`).toBeGreaterThanOrEqual(10);
      expect(e).toBeLessThanOrEqual(59);
      expect(s).toBeGreaterThanOrEqual(5);
    }
  });

  // The whole draw space, not a sample: the four option values must be four
  // different numbers at every pair the generator can pick, and all positive.
  it('has no colliding option values anywhere in its draw space', () => {
    for (const { s, e } of TIME_PAIRS) {
      const r = e % 5;
      const values = [e - s, e, s + e, e - s - r];
      expect(new Set(values).size, `(s=${s}, e=${e}) collides: ${values.join(', ')}`).toBe(4);
      expect(Math.min(...values), `(s=${s}, e=${e}) has a non-positive option`).toBeGreaterThan(0);
    }
    expect(TIME_PAIRS.length, 'draw space size').toBe(176);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md1ElapsedTimeWithinTheHour.generate(makeRng(seed));
        const { s, e } = parse(g.prompt);
        expect(Number(g.answerText.split(' ')[0])).toBe(e - s);
        expect(optionValue(g, 'read-the-clock-time-as-the-interval')).toBe(e);
        expect(optionValue(g, 'added-instead-of-subtracted')).toBe(s + e);
        expect(optionValue(g, 'read-the-clock-to-the-nearest-five-minutes')).toBe(e - (e % 5) - s);
      });
    }
  });
});
