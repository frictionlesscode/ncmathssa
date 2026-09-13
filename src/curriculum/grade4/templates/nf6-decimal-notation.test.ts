import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf6DecimalNotation, admissiblePairs } from './nf6-decimal-notation';

/** Draws barred because `../authored.nf.ts` already asks them with the same
 *  four numbers — not because the options would collide. */
const OWNED_BY_AUTHORED_BANK = new Set(['1,8']);

describe('g4.nf6.decimal-notation', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf6DecimalNotation);
  });

  it('is deterministic in its seed', () => {
    expect(nf6DecimalNotation.generate(makeRng(37))).toEqual(
      nf6DecimalNotation.generate(makeRng(37)),
    );
  });

  it('the key really is the shaded fraction, written to hundredths', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6DecimalNotation.generate(makeRng(seed));
      const shaded = Number(g.promptDetails!.match(/^(\d+) of the 100/)![1]);
      expect(shaded, `seed ${seed}`).toBeGreaterThanOrEqual(12);
      expect(shaded, `seed ${seed}`).toBeLessThanOrEqual(98);
      expect(Number(g.answerText), `seed ${seed}`).toBeCloseTo(shaded / 100, 12);
      // Hundredths, never thousandths: exactly two decimal places.
      expect(g.answerText.split('.')[1].length, `seed ${seed}`).toBe(2);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6DecimalNotation.generate(makeRng(seed));
      const values = g.options.map((o) => Number(o.text));
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(
            Math.abs(values[i] - values[j]),
            `seed ${seed}: ${g.options[i].text} and ${g.options[j].text}`,
          ).toBeGreaterThan(1e-9);
        }
      }
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6DecimalNotation.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? ''].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        // 100 is the number of squares in the grid, and nothing is larger.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(100);
      }
      for (const o of g.options) {
        expect(Number(o.text), `seed ${seed}`).toBeLessThan(10);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [8, 140, 6400, 30303, 515151]) {
      it(`seed ${seed}`, () => {
        const g = nf6DecimalNotation.generate(makeRng(seed));
        const shaded = Number(g.promptDetails!.match(/^(\d+) of the 100/)![1]);
        const t = Math.floor(shaded / 10);
        const u = shaded % 10;
        const texts = g.options.map((o) => o.text);

        expect(g.answerText).toBe(`0.${t}${u}`);
        // Two options share wrong-power-of-ten, one shifted each way, so they
        // are checked as a set rather than by tag lookup.
        const shifted = g.options
          .filter((o) => o.misconception === 'wrong-power-of-ten')
          .map((o) => o.text)
          .sort();
        expect(shifted).toEqual([`0.0${t}${u}`, `${t}.${u}`].sort());
        expect(
          g.options.find((o) => o.misconception === 'swapped-the-decimal-place-values')!.text,
        ).toBe(`0.${u}${t}`);
        expect(new Set(texts).size).toBe(4);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // (t, u) is the entire space; only the option shuffle is left to the seed,
    // and that cannot change what the options say.
    const admissible = new Set(admissiblePairs().map(([t, u]) => `${t},${u}`));
    let inRange = 0;
    let barredByCollision = 0;
    let barredByAuthoredBank = 0;
    const failures: string[] = [];
    for (let t = 1; t <= 9; t++) {
      for (let u = 1; u <= 9; u++) {
        inRange++;
        const texts = [`0.${t}${u}`, `0.0${t}${u}`, `${t}.${u}`, `0.${u}${t}`];
        const values = texts.map(Number);
        const collides =
          new Set(values.map((v) => v.toFixed(12))).size !== 4 || new Set(texts).size !== 4;
        const where = `t=${t} u=${u}`;
        const owned = OWNED_BY_AUTHORED_BANK.has(`${t},${u}`);
        if (!admissible.has(`${t},${u}`)) {
          if (owned) {
            barredByAuthoredBank++;
            continue;
          }
          barredByCollision++;
          if (!collides) failures.push(`barred but sound: ${where}`);
          continue;
        }
        if (owned) failures.push(`authored-bank draw not barred: ${where}`);
        if (collides) failures.push(`collision: ${where}`);
        if (10 * t + u > 100) failures.push(`out of range: ${where}`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(inRange).toBe(81);
    expect(admissible.size).toBe(71);
    expect(barredByCollision).toBe(9);
    expect(barredByAuthoredBank).toBe(1);
  });
});
