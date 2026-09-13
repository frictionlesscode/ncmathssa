import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md1MetricWordProblem, PAIRS } from './md1-metric-word-problem';

const bare = (s: string): number => Number(s.replace(/[^\d.]/g, ''));

/** The two quantities the word problem states, read back out of the prompt the
 *  generator actually printed. Every context frame states the per-item
 *  measurement first and the number of items second. */
function stated(prompt: string): { each: number; count: number } {
  const nums = (prompt.match(/\d[\d,]*/g) ?? []).map(bare);
  if (nums.length !== 2) throw new Error(`expected two numbers in: ${prompt}`);
  return { each: nums[0], count: nums[1] };
}

const taggedValue = (
  g: ReturnType<typeof md1MetricWordProblem.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

/** The six units NC.4.MD.1 names, and nothing else. */
const UNITS = ['centimeters', 'meters', 'grams', 'kilograms', 'liters', 'milliliters'];

describe('g4.md1.metric-word-problem', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md1MetricWordProblem);
  });

  it('is deterministic in its seed', () => {
    expect(md1MetricWordProblem.generate(makeRng(11))).toEqual(
      md1MetricWordProblem.generate(makeRng(11)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = md1MetricWordProblem.generate(makeRng(5));
    const { each, count } = stated(g.prompt);
    expect(g.answerText.startsWith(`${each * count} `)).toBe(true);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('produces a second known question at a pinned seed', () => {
    const g = md1MetricWordProblem.generate(makeRng(77));
    const { each, count } = stated(g.prompt);
    expect(g.answerText.startsWith(`${each * count} `)).toBe(true);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('multiplies equal groups, and every option wears the same metric unit', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md1MetricWordProblem.generate(makeRng(seed));
      const { each, count } = stated(g.prompt);
      expect(each % 10, `seed ${seed}: ${each} is not a whole number of tens`).toBe(0);
      expect(bare(g.answerText), `seed ${seed}`).toBe(each * count);

      const units = new Set(g.options.map((o) => o.text.split(' ').slice(1).join(' ')));
      expect(units.size, `seed ${seed}: options wear ${[...units].join(', ')}`).toBe(1);
      const unit = [...units][0];
      expect(UNITS, `seed ${seed}`).toContain(unit);
      // A label that named a unit not in the prompt would give the answer away.
      expect(g.prompt.includes(unit), `seed ${seed}: ${unit} is not in the prompt`).toBe(true);
    }
  });

  it('gives each faulty method its own distractor, never the key', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md1MetricWordProblem.generate(makeRng(seed));
      const { each, count } = stated(g.prompt);
      expect(taggedValue(g, 'added-instead-of-multiplied'), `seed ${seed}`).toBe(each + count);
      expect(taggedValue(g, 'subtracted-instead-of-multiplied'), `seed ${seed}`).toBe(each - count);
      // The tens digit multiplied on its own, so the product is ten times too
      // small: 30 x 6 read as 3 x 6.
      expect(taggedValue(g, 'wrong-power-of-ten'), `seed ${seed}`).toBe((each / 10) * count);
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md1MetricWordProblem.generate(makeRng(seed));
      const worked = [
        g.prompt,
        g.promptDetails ?? '',
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      for (const numeral of worked.match(/\d[\d,]*/g) ?? []) {
        // 90 x 9 = 810 is the ceiling of everything this template can print.
        expect(bare(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(810);
      }
    }
  });

  // The sweep DRIVES generate() rather than recomputing what it ought to
  // print, so a drift between the generator and this file's arithmetic cannot
  // hide. (each, count) is the whole numeric space and the prompt names both.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 6000; seed++) {
      const g = md1MetricWordProblem.generate(makeRng(seed));
      const { each, count } = stated(g.prompt);
      seen.add(`${each}x${count}`);
      const where = `seed ${seed} (${each} x ${count})`;

      const values = g.options.map((o) => bare(o.text));
      if (new Set(values).size !== 4) failures.push(`${where}: two options name one amount`);
      if (bare(g.answerText) !== each * count) failures.push(`${where}: key is not the product`);
      if (each - count <= 0) failures.push(`${where}: the subtraction distractor is not positive`);
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 8 values of the tens digit x 7 counts, less the two pairs where the
    // wrong-power-of-ten value would collide with the subtraction one.
    expect(seen.size).toBe(PAIRS.length);
    expect(PAIRS.length).toBe(54);
  });
});
