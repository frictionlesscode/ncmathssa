import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md1ReadARuler, RULER_DRAWS } from './md1-read-a-ruler';

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

  // LITERAL pins, copied from a real run at these seeds (the standing ruling:
  // a pin that reads its numbers back out of the generator proves nothing).
  // Seeds 7 and 123 both draw the undercount, so seed 1 is pinned as well for
  // the overcount — one literal pin for each mark-counting error.
  it('emits exactly this question at seed 7', () => {
    const g = md1ReadARuler.generate(makeRng(7));
    expect(g.prompt).toBe('Use the ruler. How long is the ribbon?');
    expect(g.promptDetails).toBe(
      'A ruler marked in inches. The marks are numbered 0 to 12, one inch apart. The ribbon lies along the ruler. Its left end is at the 5 mark. Its right end is at the 12 mark.',
    );
    expect(g.answerText).toBe('7 inches');
    expect(shape(g)).toEqual([
      ['A', '6 inches', false, 'counted-only-the-marks-between-the-ends'],
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
      ['A', '6 inches', false, 'counted-only-the-marks-between-the-ends'],
      ['B', '13 inches', false, 'added-instead-of-subtracted'],
      ['C', '10 inches', false, 'read-the-end-mark-without-starting-at-zero'],
      ['D', '7 inches', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The leaf is 7 inches long.');
  });

  it('emits exactly this question at seed 1', () => {
    const g = md1ReadARuler.generate(makeRng(1));
    expect(g.prompt).toBe('Use the ruler. How long is the feather?');
    expect(g.promptDetails).toBe(
      'A ruler marked in inches. The marks are numbered 0 to 12, one inch apart. The feather lies along the ruler. Its left end is at the 4 mark. Its right end is at the 6 mark.',
    );
    expect(g.answerText).toBe('2 inches');
    expect(shape(g)).toEqual([
      ['A', '6 inches', false, 'read-the-end-mark-without-starting-at-zero'],
      ['B', '2 inches', true, null],
      ['C', '10 inches', false, 'added-instead-of-subtracted'],
      ['D', '3 inches', false, 'counted-the-ruler-marks-not-the-spaces'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The feather is 2 inches long.');
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
    for (const { s, d, over } of RULER_DRAWS) {
      const values = optionsFor(s, d, over);
      if (new Set(values).size !== 4) failures.push(`s=${s} d=${d}: ${values}`);
      if (Math.min(...values) < 1) failures.push(`s=${s} d=${d}: non-positive option`);
      if (s + d > 12) failures.push(`s=${s} d=${d}: past the end of the ruler`);
    }
    expect(failures).toEqual([]);
    // 4 start marks x 6 lengths x 2 flips = 48, less 19 figure collisions.
    expect(RULER_DRAWS.length).toBe(29);
    expect(RULER_DRAWS.filter((x) => x.over).length, 'overcount draws').toBe(15);
    expect(RULER_DRAWS.filter((x) => !x.over).length, 'undercount draws').toBe(14);
  });

  // The figure prints 0 and 12 at the ruler's ends and the start mark s. A
  // child who answers with one of those without measuring must not land on
  // the key, nor on a distractor whose tag names an error they did not make.
  // Only the end-mark reading may be a printed number (e), because reading it
  // IS that error.
  it('offers no number the figure prints except the end-mark reading', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md1ReadARuler.generate(makeRng(seed));
      const { s, e } = parse(g.promptDetails);
      for (const o of g.options) {
        if (o.misconception === 'read-the-end-mark-without-starting-at-zero') continue;
        expect([0, 12, s, e], `seed ${seed}: ${o.text}`).not.toContain(value(o.text));
      }
    }
  });

  // The counterfactual, over the space as it would be with no exclusions at
  // all. For start marks 2-5, a draw is kept exactly when its four options are
  // distinct AND none of the three that are not the end-mark reading is a
  // printed number. A start mark of 1 is out for both flips: with the
  // overcount it makes two options equal at every length (the end-mark reading
  // 1 + d is the counted-marks count d + 1), which is why the start marks
  // begin at 2.
  it('keeps exactly the draws with no option or figure collision', () => {
    let optionCollisions = 0;
    let figureCollisions = 0;
    for (let s = 1; s <= 5; s++) {
      for (let d = 2; d <= 7; d++) {
        for (const over of [true, false]) {
          const values = optionsFor(s, d, over);
          const [key, , added, tick] = values;
          const collides = new Set(values).size < 4;
          const onFigure = [key, added, tick].some((v) => [0, 12, s].includes(v));
          const kept = RULER_DRAWS.some((x) => x.s === s && x.d === d && x.over === over);
          if (s === 1) {
            expect(kept, `s=1 d=${d}`).toBe(false);
            if (over) {
              expect(collides, `s=1 d=${d} over`).toBe(true);
              optionCollisions++;
            }
            continue;
          }
          expect(collides, `s=${s} d=${d}: an option collision past s = 1`).toBe(false);
          expect(kept, `s=${s} d=${d} over=${over}`).toBe(!onFigure);
          if (onFigure) figureCollisions++;
        }
      }
    }
    expect(optionCollisions, 'every overcount draw at s = 1 collides').toBe(6);
    expect(figureCollisions, 'd = s: 8, overcount = s: 3, undercount = s: 4, added = 12: 4').toBe(19);
  });
});

/** The four option values the docstring's table gives — key, end-mark
 *  reading, added, and the mark-counting error — in that order. The
 *  "gives each distractor the value its tag names" test above checks these
 *  same formulas against what the generator actually emits, at 600 seeds. */
function optionsFor(s: number, d: number, over: boolean): number[] {
  return [d, s + d, 2 * s + d, over ? d + 1 : d - 1];
}
