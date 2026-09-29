import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt7DecimalArithmetic } from './nbt7-decimal-arithmetic';

/** Exact cents from printed decimal text — no parseFloat, so the test
 *  cannot drift the way the code under test must not. */
function toCents(text: string): number {
  const [whole, frac] = text.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

const money = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;

/** Column addition with every carry dropped. */
function addWithoutCarrying(a: number, b: number): number {
  let out = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    out += (((a % 10) + (b % 10)) % 10) * place;
    place *= 10;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return out;
}

/** Column subtraction that always takes the smaller digit from the larger,
 *  instead of regrouping. */
function subtractWithoutRegrouping(a: number, b: number): number {
  let out = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    out += Math.abs((a % 10) - (b % 10)) * place;
    place *= 10;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return out;
}

function parse(details: string) {
  const m = details.match(/^(\d+\.\d+) ([+-]) (\d+\.\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, left, op, right] = m;
  return { left, right, op, leftCents: toCents(left), rightCents: toCents(right) };
}

const places = (text: string) => text.length - text.indexOf('.') - 1;

const optionText = (g: ReturnType<typeof nbt7DecimalArithmetic.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt7DecimalArithmetic', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nbt7DecimalArithmetic);
  });

  it('is deterministic in its seed', () => {
    const a = nbt7DecimalArithmetic.generate(makeRng(777));
    const b = nbt7DecimalArithmetic.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('always requires a regroup, and never a negative difference', () => {
    // An item where no column carries or borrows does not exercise the hard
    // part of NC.5.NBT.7 — and the no-regroup distractor would equal the
    // correct answer.
    let sawAdd = false;
    let sawSubtract = false;
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt7DecimalArithmetic.generate(makeRng(seed));
      const { left, right, op, leftCents, rightCents } = parse(g.promptDetails ?? '');
      // One operand is printed to tenths and the other to hundredths, which
      // is what makes right-alignment a distinguishable error.
      expect(new Set([places(left), places(right)]), `seed ${seed}`).toEqual(new Set([1, 2]));

      const leftTenths = Math.floor(leftCents / 10) % 10;
      const rightTenths = Math.floor(rightCents / 10) % 10;
      if (op === '+') {
        sawAdd = true;
        expect(leftTenths + rightTenths, `seed ${seed}: no carry in ${left} + ${right}`)
          .toBeGreaterThanOrEqual(10);
        expect(g.answerText).toBe(money(leftCents + rightCents));
      } else {
        sawSubtract = true;
        expect(leftCents - rightCents, `seed ${seed}: negative difference`).toBeGreaterThan(0);
        expect(leftTenths, `seed ${seed}: no borrow in ${left} - ${right}`)
          .toBeLessThan(rightTenths);
        expect(g.answerText).toBe(money(leftCents - rightCents));
      }
      expect(places(g.answerText)).toBe(2);
    }
    expect(sawAdd && sawSubtract).toBe(true);
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [4, 31, 512, 4912, 20250911]) {
      it(`seed ${seed}`, () => {
        const g = nbt7DecimalArithmetic.generate(makeRng(seed));
        const { left, op, leftCents, rightCents } = parse(g.promptDetails ?? '');
        // The operand printed to tenths is the one that slides a place when
        // the columns are aligned on their last digit instead of the point.
        const shortIsLeft = places(left) === 1;

        if (op === '+') {
          const answer = leftCents + rightCents;
          expect(g.answerText).toBe(money(answer));
          expect(optionText(g, 'decimal-point-misplaced')).toBe(`${answer}`);
          expect(optionText(g, 'place-value-shift-wrong-direction')).toBe(
            money(shortIsLeft ? leftCents / 10 + rightCents : leftCents + rightCents / 10),
          );
          expect(optionText(g, 'added-without-carrying')).toBe(
            money(addWithoutCarrying(leftCents, rightCents)),
          );
        } else {
          const answer = leftCents - rightCents;
          expect(shortIsLeft).toBe(false);
          expect(g.answerText).toBe(money(answer));
          expect(optionText(g, 'decimal-point-misplaced')).toBe(`${answer}`);
          expect(optionText(g, 'place-value-shift-wrong-direction')).toBe(
            money(leftCents - rightCents / 10),
          );
          expect(optionText(g, 'subtracted-without-regrouping')).toBe(
            money(subtractWithoutRegrouping(leftCents, rightCents)),
          );
        }
      });
    }
  });
});
