import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md3RectangleArea, RECTANGLES } from './md3-rectangle-area';

const bare = (s: string): number => Number(s.split(' ')[0]);

/** The rectangle the prompt describes, read back out of what the generator
 *  actually printed. */
function dimensions(prompt: string): { length: number; width: number } {
  const m = prompt.match(/measures (\d+) meters by (\d+) meters/);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { length: Number(m[1]), width: Number(m[2]) };
}

const taggedValue = (g: ReturnType<typeof md3RectangleArea.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.md3.rectangle-area', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md3RectangleArea);
  });

  it('is deterministic in its seed', () => {
    expect(md3RectangleArea.generate(makeRng(31))).toEqual(md3RectangleArea.generate(makeRng(31)));
  });

  // Literal, not derived from what the generator printed. A pin that reads the
  // dimensions back out of the prompt asserts only self-consistency and passes
  // for any rectangle the generator emits.
  it('produces a known question at a pinned seed', () => {
    const g = md3RectangleArea.generate(makeRng(6));
    expect(g.prompt).toBe(
      'A rectangular playground mat measures 4 meters by 2 meters. How many square meters is its area?',
    );
    expect(g.answerText).toBe('8 square meters');
    expect(g.options.map((o) => o.text)).toEqual([
      '10 square meters',
      '12 square meters',
      '8 square meters',
      '6 square meters',
    ]);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe('8 square meters');
  });

  it('produces a second known question at a pinned seed', () => {
    const g = md3RectangleArea.generate(makeRng(91));
    expect(g.prompt).toBe(
      'A rectangular playground mat measures 4 meters by 3 meters. How many square meters is its area?',
    );
    expect(g.answerText).toBe('12 square meters');
    expect(g.options.map((o) => o.text)).toEqual([
      '7 square meters',
      '12 square meters',
      '14 square meters',
      '11 square meters',
    ]);
  });

  it('asks for the area, and the key is the area', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectangleArea.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      expect(width, `seed ${seed}`).toBeLessThan(length);
      expect(bare(g.answerText), `seed ${seed}`).toBe(length * width);
      // Every option wears the unit of the KEY, so the label never gives the
      // answer away.
      for (const o of g.options) {
        expect(o.text.endsWith(' square meters'), `seed ${seed}: ${o.text}`).toBe(true);
      }
    }
  });

  it('gives each faulty method its own distractor, never the key', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectangleArea.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      expect(taggedValue(g, 'used-perimeter-formula'), `seed ${seed}`).toBe(2 * (length + width));
      expect(taggedValue(g, 'added-only-the-two-given-sides'), `seed ${seed}`).toBe(length + width);
      expect(taggedValue(g, 'doubled-only-one-dimension'), `seed ${seed}`).toBe(2 * length + width);
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectangleArea.generate(makeRng(seed));
      const worked = [
        g.prompt,
        g.promptDetails ?? '',
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        // 12 x 9 = 108 is the ceiling of everything this template can print.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(108);
      }
    }
  });

  // The sweep DRIVES generate() rather than recomputing what it ought to
  // print. (length, width) is the whole numeric space and the prompt names
  // both, so the pair is the coverage key.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 6000; seed++) {
      const g = md3RectangleArea.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      seen.add(`${length}x${width}`);
      const where = `seed ${seed} (${length} by ${width})`;

      const values = g.options.map((o) => bare(o.text));
      if (new Set(values).size !== 4) failures.push(`${where}: two options name one number`);
      if (bare(g.answerText) !== length * width) failures.push(`${where}: key is not the area`);
      // The one collision the pool excludes: area equal to perimeter, at 6 by 3.
      if (length * width === 2 * (length + width)) failures.push(`${where}: area equals perimeter`);
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(seen.size).toBe(RECTANGLES.length);
    // 51 rectangles with 2 <= width < length <= 12, less 6 by 3.
    expect(RECTANGLES.length).toBe(50);
  });
});
