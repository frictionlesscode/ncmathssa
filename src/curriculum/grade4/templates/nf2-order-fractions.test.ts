import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf2OrderFractions, TRIPLES, orderingsOf } from './nf2-order-fractions';

const listOf = (text: string): { n: number; d: number; v: number }[] =>
  text.split('; ').map((f) => {
    const [n, d] = f.split('/').map(Number);
    return { n, d, v: n / d };
  });

const tagged = (
  g: ReturnType<typeof nf2OrderFractions.generate>,
  tag: string,
): { n: number; d: number; v: number }[] =>
  listOf(g.options.find((o) => o.misconception === tag)!.text);

describe('g4.nf2.order-fractions', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf2OrderFractions);
  });

  it('is deterministic in its seed', () => {
    expect(nf2OrderFractions.generate(makeRng(11))).toEqual(
      nf2OrderFractions.generate(makeRng(11)),
    );
  });

  it('the correct option really is least to greatest', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf2OrderFractions.generate(makeRng(seed));
      const order = listOf(g.answerText);
      expect(order.length, `seed ${seed}`).toBe(3);
      expect(order[0].v, `seed ${seed}`).toBeLessThan(order[1].v);
      expect(order[1].v, `seed ${seed}`).toBeLessThan(order[2].v);
    }
  });

  it('no two options name the same ordering, and no fraction is repeated', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf2OrderFractions.generate(makeRng(seed));
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
      const order = listOf(g.answerText);
      // Distinct in VALUE, not merely in text: two options could never collide
      // if the three fractions themselves are three different quantities.
      expect(new Set(order.map((f) => f.v)).size, `seed ${seed}`).toBe(3);
    }
  });

  it('the fractions are presented in an order that matches no option', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf2OrderFractions.generate(makeRng(seed));
      const shown = g.promptDetails!;
      expect(
        g.options.map((o) => o.text).includes(shown),
        `seed ${seed}: presented in an order that is also an option`,
      ).toBe(false);
      expect(listOf(shown).map((f) => f.v).sort(), `seed ${seed}`).toEqual(
        listOf(g.answerText).map((f) => f.v).sort(),
      );
    }
  });

  // Bound every number the child sees, not only the answer. 120 is the largest
  // common denominator three of this template's denominators can require, and
  // it appears only in the worked solution.
  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf2OrderFractions.generate(makeRng(seed));
      for (const o of g.options) {
        for (const numeral of o.text.match(/\d+/g) ?? []) {
          expect(Number(numeral), `seed ${seed}`).toBeLessThanOrEqual(12);
        }
      }
      const worked = [g.prompt, g.promptDetails!, ...g.explanation.stepByStep,
        g.explanation.conceptSummary, g.explanation.commonMisconception ?? ''].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(120);
      }
    }
  });

  describe('every distractor is the ordering its tag names', () => {
    for (const seed of [5, 88, 1234, 40404, 777777]) {
      it(`seed ${seed}`, () => {
        const g = nf2OrderFractions.generate(makeRng(seed));

        const byNum = tagged(g, 'compared-numerators-only');
        expect(byNum.map((f) => f.n)).toEqual([...byNum.map((f) => f.n)].sort((x, y) => x - y));

        const denomBig = tagged(g, 'larger-denominator-means-larger-fraction');
        expect(denomBig.map((f) => f.d)).toEqual(
          [...denomBig.map((f) => f.d)].sort((x, y) => x - y),
        );

        const unitRule = tagged(g, 'applied-the-unit-fraction-rule-to-unlike-numerators');
        expect(unitRule.map((f) => f.d)).toEqual(
          [...unitRule.map((f) => f.d)].sort((x, y) => y - x),
        );

        // None of the three faulty rules stumbles onto the right answer.
        for (const wrong of [byNum, denomBig, unitRule]) {
          expect(wrong.map((f) => `${f.n}/${f.d}`).join('; ')).not.toBe(g.answerText);
        }
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // The parameter space IS the triple table: the only other draws a seed
    // makes are which of the two unused orderings to present and how to
    // shuffle the four options, and neither can change what the options say.
    const failures: string[] = [];
    for (const t of TRIPLES) {
      const where = t.map((f) => `${f.n}/${f.d}`).join(' ');
      const orders = orderingsOf(t);
      if (new Set(orders).size !== 4) failures.push(`collision ${where}`);
      if (!(t[0].v < t[1].v && t[1].v < t[2].v)) failures.push(`order ${where}`);
      if (t[1].v - t[0].v < 1 / 12 - 1e-12 || t[2].v - t[1].v < 1 / 12 - 1e-12) {
        failures.push(`gap ${where}`);
      }
      if (new Set(t.map((f) => f.n)).size !== 3) failures.push(`numerators ${where}`);
      if (new Set(t.map((f) => f.d)).size !== 3) failures.push(`denominators ${where}`);
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 23 proper fractions in lowest terms over the eight denominators, so
    // 23^3 = 12,167 ordered triples were examined to build this table.
    expect(TRIPLES.length).toBe(81);
  });
});
