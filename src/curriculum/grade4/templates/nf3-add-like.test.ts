import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf3AddLike, admissibleAddends } from './nf3-add-like';

const DENOMINATORS = [3, 4, 5, 6, 8, 10, 12];

const valueOf = (text: string): number => {
  const [n, d] = text.split('/').map(Number);
  return n / d;
};

describe('g4.nf3.add-like', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf3AddLike);
  });

  it('is deterministic in its seed', () => {
    expect(nf3AddLike.generate(makeRng(23))).toEqual(nf3AddLike.generate(makeRng(23)));
  });

  it('the key really is the sum, over the denominator both addends share', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      const [a, d] = left.split('/').map(Number);
      const [b, d2] = right.split('/').map(Number);
      expect(d2, `seed ${seed}: denominators must match`).toBe(d);
      expect(g.answerText, `seed ${seed}`).toBe(`${a + b}/${d}`);
      // The sum stays a proper fraction, so no Grade 4 child is asked to
      // convert an improper result they have not been taught to write.
      expect(a + b, `seed ${seed}`).toBeLessThanOrEqual(d);
      expect(a, `seed ${seed}`).toBeGreaterThan(b);
    }
  });

  // The key is left as d/d when the parts fill the whole - NC.4.NF.3 never
  // asks for simplest form - so the worked solution has to say what that means
  // rather than leave a child wondering whether the answer is finished.
  it('says what a sum of one whole means, when it reaches one', () => {
    let wholes = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
      const [n, d] = g.answerText.split('/').map(Number);
      const steps = g.explanation.stepByStep;
      if (n === d) {
        wholes++;
        expect(steps.length, `seed ${seed}`).toBe(5);
        expect(steps[4], `seed ${seed}`).toContain('exactly 1');
        expect(steps[4], `seed ${seed}`).toContain(g.answerText);
      } else {
        expect(steps.length, `seed ${seed}`).toBe(4);
      }
    }
    expect(wholes, 'no seed in 2,000 reached a sum of one whole').toBeGreaterThan(0);
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
      const values = g.options.map((o) => valueOf(o.text));
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
      const g = nf3AddLike.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        // 144 is 12 x 12, the largest denominator the multiplied-denominators
        // distractor can reach.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(144);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [1, 64, 3000, 51234, 999999]) {
      it(`seed ${seed}`, () => {
        const g = nf3AddLike.generate(makeRng(seed));
        const [left, right] = g.promptDetails!.split(' + ');
        const [a, d] = left.split('/').map(Number);
        const b = Number(right.split('/')[0]);
        const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(tagged('operated-on-the-like-denominators-too')).toBe(`${a + b}/${2 * d}`);
        expect(tagged('multiplied-the-denominators-instead-of-keeping-them')).toBe(
          `${a + b}/${d * d}`,
        );
        expect(tagged('subtracted-instead-of-added')).toBe(`${a - b}/${d}`);
      });
    }
  });

  // The sweep DRIVES generate() rather than recomputing what generate() ought
  // to print. A sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence — the same defect the shared numericValue() guard had while a
  // domain test kept a private copy of its patterns.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const admissible = new Set(admissibleAddends().map(([d, a, b]) => `${d},${a},${b}`));
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 2000; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      const [a, d] = left.split('/').map(Number);
      const [b, d2] = right.split('/').map(Number);
      const key = `${d},${a},${b}`;
      seen.add(key);
      const where = `seed ${seed} (${g.promptDetails})`;
      if (!admissible.has(key)) {
        failures.push(`${where}: drew a barred combination`);
        continue;
      }
      if (d2 !== d) failures.push(`${where}: denominators differ`);
      // Solved from the prompt, not rebuilt from the generator's expressions.
      if (g.answerText !== `${a + b}/${d}`) failures.push(`${where}: key is ${g.answerText}`);
      const texts = g.options.map((o) => o.text);
      if (new Set(texts).size !== 4) failures.push(`${where}: duplicate option text`);
      const values = texts.map(valueOf);
      if (new Set(values.map((v) => v.toFixed(12))).size !== 4) {
        failures.push(`${where}: two options name one quantity`);
      }
      for (const numeral of texts.join(' ').match(/\d+/g) ?? []) {
        if (Number(numeral) > 144) failures.push(`${where}: ${numeral} out of range`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 75 (d, a, b) combinations are in range and 63 survive the two
    // exclusions — and 2,000 seeds reach every one of the 63.
    expect(admissible.size).toBe(63);
    expect(seen.size).toBe(63);
  });

  // This one has to recompute, and says so: the generator never emits these
  // combinations, so there is no output to check them against. What it proves
  // is that nothing was excluded merely for tidiness.
  it('excludes only combinations that really would have collided', () => {
    const admissible = new Set(admissibleAddends().map(([d, a, b]) => `${d},${a},${b}`));
    let inRange = 0;
    let barred = 0;
    const failures: string[] = [];
    for (const d of DENOMINATORS) {
      for (let a = 2; a <= d - 1; a++) {
        for (let b = 1; b < a; b++) {
          if (a + b > d) continue;
          inRange++;
          if (admissible.has(`${d},${a},${b}`)) continue;
          barred++;
          const values = [(a + b) / d, (a + b) / (2 * d), (a + b) / (d * d), (a - b) / d];
          if (new Set(values.map((v) => v.toFixed(12))).size === 4) {
            failures.push(`barred but sound: d=${d} a=${a} b=${b}`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
    expect(inRange).toBe(75);
    expect(barred).toBe(12);
  });
});
