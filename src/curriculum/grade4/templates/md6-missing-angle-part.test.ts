import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md6MissingAnglePart, ANGLE_PAIRS } from './md6-missing-angle-part';

const degrees = (s: string): number => Number(s.replace(' degrees', ''));

/** The whole angle and the given part, read back out of the figure the
 *  generator actually printed rather than recomputed from the draw. */
function figure(details: string): { whole: number; part: number } {
  const m = details.match(/measures (\d+) degrees\..*measures (\d+) degrees\.$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { whole: Number(m[1]), part: Number(m[2]) };
}

const taggedValue = (
  g: ReturnType<typeof md6MissingAnglePart.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return degrees(opt.text);
};

/** Subtracting column by column and always taking the smaller digit from the
 *  larger, which is the error `subtracted-without-regrouping` names. */
const noRegroup = (whole: number, part: number): number =>
  10 * Math.abs(Math.floor(whole / 10) - Math.floor(part / 10)) + Math.abs((whole % 10) - (part % 10));

describe('g4.md6.missing-angle-part', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md6MissingAnglePart);
  });

  it('is deterministic in its seed', () => {
    expect(md6MissingAnglePart.generate(makeRng(17))).toEqual(
      md6MissingAnglePart.generate(makeRng(17)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = md6MissingAnglePart.generate(makeRng(3));
    const { whole, part } = figure(g.promptDetails!);
    expect(g.answerText).toBe(`${whole - part} degrees`);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('produces a second known question at a pinned seed', () => {
    const g = md6MissingAnglePart.generate(makeRng(104));
    const { whole, part } = figure(g.promptDetails!);
    expect(g.answerText).toBe(`${whole - part} degrees`);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('always asks for the part of the angle the figure leaves unknown', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md6MissingAnglePart.generate(makeRng(seed));
      const { whole, part } = figure(g.promptDetails!);
      // The part given must really sit inside the whole, and the part asked
      // for must be a usable angle rather than a sliver.
      expect(part, `seed ${seed}`).toBeLessThan(whole);
      expect(whole - part, `seed ${seed}`).toBeGreaterThanOrEqual(11);
      expect(degrees(g.answerText), `seed ${seed}`).toBe(whole - part);
      // Regrouping is always genuinely required, or the
      // subtracted-without-regrouping distractor would equal the key.
      expect(whole % 10, `seed ${seed}`).toBeLessThan(part % 10);
    }
  });

  it('gives each faulty method its own distractor, never the key', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md6MissingAnglePart.generate(makeRng(seed));
      const { whole, part } = figure(g.promptDetails!);
      expect(taggedValue(g, 'added-instead-of-subtracted'), `seed ${seed}`).toBe(whole + part);
      expect(taggedValue(g, 'subtracted-without-regrouping'), `seed ${seed}`).toBe(
        noRegroup(whole, part),
      );
      expect(taggedValue(g, 'assumed-a-straight-angle'), `seed ${seed}`).toBe(180 - part);
    }
  });

  it('keeps every number it prints inside a protractor', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md6MissingAnglePart.generate(makeRng(seed));
      const worked = [
        g.prompt,
        g.promptDetails ?? '',
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(180);
      }
    }
  });

  // The sweep DRIVES generate() rather than recomputing what it ought to
  // print: a sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence.
  //
  // (whole, part) is the whole numeric space and the figure names both, so the
  // pair is the coverage key. 1,208 pairs need about 8,600 draws to collect;
  // 30,000 leaves room.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 30000; seed++) {
      const g = md6MissingAnglePart.generate(makeRng(seed));
      const { whole, part } = figure(g.promptDetails!);
      seen.add(`${whole}-${part}`);
      const where = `seed ${seed} (${whole} - ${part})`;

      const values = g.options.map((o) => degrees(o.text));
      if (new Set(values).size !== 4) failures.push(`${where}: two options name one angle`);
      if (degrees(g.answerText) !== whole - part) failures.push(`${where}: key is not the part`);
      if (whole % 10 >= part % 10) failures.push(`${where}: no regrouping needed`);
      const rules: [string, number][] = [
        ['added-instead-of-subtracted', whole + part],
        ['subtracted-without-regrouping', noRegroup(whole, part)],
        ['assumed-a-straight-angle', 180 - part],
      ];
      for (const [tag, value] of rules) {
        const opt = g.options.find((o) => o.misconception === tag);
        if (!opt) failures.push(`${where}: no option tagged ${tag}`);
        else if (degrees(opt.text) !== value) failures.push(`${where}: ${tag} is ${opt.text}`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(seen.size).toBe(ANGLE_PAIRS.length);
    expect(ANGLE_PAIRS.length).toBe(1208);
  });
});
