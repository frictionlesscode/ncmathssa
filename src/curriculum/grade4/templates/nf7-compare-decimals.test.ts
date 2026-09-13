import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf7CompareDecimals } from './nf7-compare-decimals';

/** The decimal part read as a whole number, which is what the digit-count
 *  error does: "0.58" -> 58. */
const digitString = (v: string): number => Number(v.split('.')[1]);
const lastDigit = (v: string): number => Number(v[v.length - 1]);
/** What the number becomes if the placeholder zero after the point is
 *  skipped over: "3.07" -> 3.7. Anything without such a zero is unchanged. */
const withoutPlaceholderZero = (v: string): number => {
  const [w, frac] = v.split('.');
  return frac.startsWith('0') ? Number(`${w}.${frac.slice(1)}`) : Number(v);
};

describe('g4.nf7.compare-decimals', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf7CompareDecimals);
  });

  it('is deterministic in its seed', () => {
    expect(nf7CompareDecimals.generate(makeRng(29))).toEqual(
      nf7CompareDecimals.generate(makeRng(29)),
    );
  });

  it('the key really is the greatest, and every decimal stops at hundredths', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      const values = g.options.map((o) => Number(o.text));
      const answer = Number(g.answerText);
      expect(Math.max(...values), `seed ${seed}`).toBe(answer);
      // A unique maximum: a tie would mean two right answers.
      expect(values.filter((v) => v === answer).length, `seed ${seed}`).toBe(1);
      for (const o of g.options) {
        const frac = o.text.split('.')[1];
        expect(frac.length, `seed ${seed}: ${o.text} goes past hundredths`).toBeLessThanOrEqual(2);
      }
      // The key is the SHORTEST option, which is the whole point of the item.
      expect(g.answerText.split('.')[1].length, `seed ${seed}`).toBe(1);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      // By VALUE, not by text: "3.7" and "3.70" are different strings and the
      // same number, and an item offering both would have two right answers.
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

  it('the decimals listed are the decimals offered, in the same order', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      expect(g.promptDetails!.split(', '), `seed ${seed}`).toEqual(
        g.options.map((o) => o.text),
      );
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      for (const o of g.options) {
        expect(Number(o.text), `seed ${seed}`).toBeLessThan(10);
        expect(Number(o.text), `seed ${seed}`).toBeGreaterThanOrEqual(0);
      }
      const worked = [g.prompt, g.promptDetails!, ...g.explanation.stepByStep,
        g.explanation.conceptSummary, g.explanation.commonMisconception ?? ''].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        // Two-digit padded decimal parts are the largest numerals that appear.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(99);
      }
    }
  });

  it('each faulty rule picks its own distractor, and never the key', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      const texts = g.options.map((o) => o.text);
      const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;
      const uniqueMax = <T>(xs: T[], score: (x: T) => number, winner: T, where: string) => {
        const best = Math.max(...xs.map(score));
        expect(score(winner), where).toBe(best);
        expect(xs.filter((x) => score(x) === best).length, where).toBe(1);
      };

      uniqueMax(texts, digitString, tagged('compared-by-digit-count'), `seed ${seed}: digits`);
      uniqueMax(texts, lastDigit, tagged('compared-decimals-right-to-left'), `seed ${seed}: last`);
      uniqueMax(
        texts,
        withoutPlaceholderZero,
        tagged('omitted-placeholder-zero'),
        `seed ${seed}: zero`,
      );
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // (w, t, e, z, q) is the entire space; only the shuffle is left to the
    // seed, and it reorders the options without changing them.
    let checked = 0;
    const failures: string[] = [];
    for (let w = 0; w <= 9; w++) {
      for (let t = 3; t <= 7; t++) {
        for (let e = 1; e <= t - 2; e++) {
          for (let z = t + 1; z <= 8; z++) {
            for (let q = 0; q <= 8; q++) {
              const opts = [`${w}.${t}`, `${w}.${t - 1}${q}`, `${w}.${e}9`, `${w}.0${z}`];
              const where = `w=${w} t=${t} e=${e} z=${z} q=${q}`;
              if (new Set(opts).size !== 4) failures.push(`text collision ${where}`);
              const values = opts.map(Number);
              if (new Set(values).size !== 4) failures.push(`value collision ${where}`);
              if (Math.max(...values) !== values[0]) failures.push(`key not greatest ${where}`);
              // Each faulty rule must pick its own option, uniquely.
              const picks = [
                opts.map(digitString),
                opts.map(lastDigit),
                opts.map(withoutPlaceholderZero),
              ];
              picks.forEach((scores, i) => {
                const best = Math.max(...scores);
                if (scores.filter((s) => s === best).length !== 1) {
                  failures.push(`rule ${i} ties ${where}`);
                } else if (scores.indexOf(best) !== i + 1) {
                  failures.push(`rule ${i} picks the wrong option ${where}`);
                }
              });
              checked++;
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 35 admissible (t, e, z) triples x 9 values of q x 10 whole-number parts.
    expect(checked).toBe(3150);
  });
});
