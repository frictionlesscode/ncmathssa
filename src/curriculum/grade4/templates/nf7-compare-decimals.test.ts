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

  // The sweep DRIVES generate() rather than recomputing what generate() ought
  // to print. A sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence — the same defect the shared numericValue() guard had while a
  // domain test kept a private copy of its patterns.
  //
  // (w, t, e, z, q) is the whole space and the four option texts determine it,
  // so the set of texts serves as the coverage key. 3,150 combinations need
  // about 28,000 seeds to collect; 60,000 leaves room.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 60000; seed++) {
      const g = nf7CompareDecimals.generate(makeRng(seed));
      const texts = g.options.map((o) => o.text);
      seen.add([...texts].sort().join('|'));
      const where = `seed ${seed} (${texts.join(', ')})`;

      if (new Set(texts).size !== 4) failures.push(`${where}: duplicate option text`);
      const values = texts.map(Number);
      if (new Set(values.map((v) => v.toFixed(12))).size !== 4) {
        failures.push(`${where}: two options name one quantity`);
      }
      // The key is the greatest, uniquely, and is the shortest of the four.
      const answer = Number(g.answerText);
      if (Math.max(...values) !== answer) failures.push(`${where}: key is not the greatest`);
      if (values.filter((v) => v === answer).length !== 1) failures.push(`${where}: tied maximum`);
      if (g.answerText.split('.')[1].length !== 1) failures.push(`${where}: key is not one place`);
      for (const text of texts) {
        if (text.split('.')[1].length > 2) failures.push(`${where}: ${text} passes hundredths`);
        if (Number(text) >= 10) failures.push(`${where}: ${text} out of range`);
      }
      // Each faulty rule must pick its OWN distractor, uniquely, and never the
      // key — checked against the option the generator actually tagged.
      const rules: [string, (v: string) => number][] = [
        ['compared-by-digit-count', digitString],
        ['compared-decimals-right-to-left', lastDigit],
        ['omitted-placeholder-zero', withoutPlaceholderZero],
      ];
      for (const [tag, score] of rules) {
        const scores = texts.map(score);
        const best = Math.max(...scores);
        if (scores.filter((s) => s === best).length !== 1) {
          failures.push(`${where}: rule ${tag} ties`);
          continue;
        }
        const picked = texts[scores.indexOf(best)];
        const tagged = g.options.find((o) => o.misconception === tag);
        if (!tagged) failures.push(`${where}: no option tagged ${tag}`);
        else if (tagged.text !== picked) failures.push(`${where}: rule ${tag} picks ${picked}`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 35 admissible (t, e, z) triples x 9 values of q x 10 whole-number parts.
    expect(seen.size).toBe(3150);
  });
});
