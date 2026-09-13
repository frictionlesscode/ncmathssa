import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md3RectanglePerimeter } from './md3-rectangle-perimeter';
import { md3RectangleArea, RECTANGLES } from './md3-rectangle-area';

const bare = (s: string): number => Number(s.split(' ')[0]);

function dimensions(prompt: string): { length: number; width: number } {
  const m = prompt.match(/measures (\d+) meters by (\d+) meters/);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { length: Number(m[1]), width: Number(m[2]) };
}

const taggedValue = (
  g: ReturnType<typeof md3RectanglePerimeter.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.md3.rectangle-perimeter', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md3RectanglePerimeter);
  });

  it('is deterministic in its seed', () => {
    expect(md3RectanglePerimeter.generate(makeRng(44))).toEqual(
      md3RectanglePerimeter.generate(makeRng(44)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = md3RectanglePerimeter.generate(makeRng(6));
    const { length, width } = dimensions(g.prompt);
    expect(g.answerText).toBe(`${2 * (length + width)} meters`);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('produces a second known question at a pinned seed', () => {
    const g = md3RectanglePerimeter.generate(makeRng(91));
    const { length, width } = dimensions(g.prompt);
    expect(g.answerText).toBe(`${2 * (length + width)} meters`);
  });

  it('asks for the perimeter, and the key is the perimeter', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectanglePerimeter.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      expect(width, `seed ${seed}`).toBeLessThan(length);
      expect(bare(g.answerText), `seed ${seed}`).toBe(2 * (length + width));
      for (const o of g.options) {
        expect(o.text.endsWith(' meters'), `seed ${seed}: ${o.text}`).toBe(true);
        expect(o.text.endsWith(' square meters'), `seed ${seed}: ${o.text}`).toBe(false);
      }
    }
  });

  it('gives each faulty method its own distractor, never the key', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectanglePerimeter.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      expect(taggedValue(g, 'used-area-formula-for-perimeter'), `seed ${seed}`).toBe(
        length * width,
      );
      expect(taggedValue(g, 'added-only-the-two-given-sides'), `seed ${seed}`).toBe(length + width);
      expect(taggedValue(g, 'doubled-only-one-dimension'), `seed ${seed}`).toBe(2 * length + width);
    }
  });

  // The two halves of NC.4.MD.3 are separate templates, which only stays
  // diagnostic if a child's record can tell which way round they went wrong.
  // Confusing area for perimeter is tagged one way here and the other way
  // there, and neither tag may appear in both.
  it('mirrors the area template rather than sharing its confusion tag', () => {
    expect(md3RectanglePerimeter.id).not.toBe(md3RectangleArea.id);
    const perimeterTags = new Set<string>();
    const areaTags = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      for (const o of md3RectanglePerimeter.generate(makeRng(seed)).options) {
        if (o.misconception) perimeterTags.add(o.misconception);
      }
      for (const o of md3RectangleArea.generate(makeRng(seed)).options) {
        if (o.misconception) areaTags.add(o.misconception);
      }
    }
    expect(perimeterTags.has('used-area-formula-for-perimeter')).toBe(true);
    expect(perimeterTags.has('used-perimeter-formula')).toBe(false);
    expect(areaTags.has('used-perimeter-formula')).toBe(true);
    expect(areaTags.has('used-area-formula-for-perimeter')).toBe(false);
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md3RectanglePerimeter.generate(makeRng(seed));
      const worked = [
        g.prompt,
        g.promptDetails ?? '',
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        // The area distractor at 12 x 9 = 108 is the ceiling.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(108);
      }
    }
  });

  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 6000; seed++) {
      const g = md3RectanglePerimeter.generate(makeRng(seed));
      const { length, width } = dimensions(g.prompt);
      seen.add(`${length}x${width}`);
      const where = `seed ${seed} (${length} by ${width})`;

      const values = g.options.map((o) => bare(o.text));
      if (new Set(values).size !== 4) failures.push(`${where}: two options name one number`);
      if (bare(g.answerText) !== 2 * (length + width)) {
        failures.push(`${where}: key is not the perimeter`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // The same pool as the area template, imported rather than restated so the
    // two exclusion rules cannot drift apart.
    expect(seen.size).toBe(RECTANGLES.length);
  });
});
