import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt1CountPastATen, COUNT_DRAWS, ALL_COUNT_DRAWS, type CountDraw } from './nbt1-count-past-a-ten';

type G = ReturnType<typeof nbt1CountPastATen.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt1CountPastATen.generate(makeRng(seed));

function parse(prompt: string): number {
  const m = /^Count on from (\d+)\. What are the next three numbers\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return Number(m[1]);
}

const numbersIn = (text: string) => text.split(', ').map(Number);

/**
 * The six lists a count from `start` can offer, from the tag formulas and
 * nothing else. The multiple of 10 is wherever the correct count crosses it,
 * and every list after an error keeps counting on from that error.
 */
function expected(start: number) {
  const key = [start + 1, start + 2, start + 3];
  const at = key.findIndex((n) => n % 10 === 0);
  const ten = key[at];
  const from = (first: number) => key.map((n, i) => (i < at ? n : first + (i - at)));
  return {
    key,
    ten,
    back: from(ten - 10),
    skip: from(ten + 10),
    omit: from(ten + 1),
    early: [start, start + 1, start + 2],
    // Ten ones written beside the old tens: 119 -> "1110", then "1111".
    sideBySide: key.map((n, i) => (i < at ? `${n}` : `${ten / 10 - 1}${10 + (i - at)}`)).join(', '),
  };
}

const optionsOf = (d: CountDraw) => {
  const e = expected(d.ten - d.at);
  return [
    e.key.join(', '),
    (d.tenSlip === 'back' ? e.back : e.skip).join(', '),
    (d.countSlip === 'early' ? e.early : e.omit).join(', '),
    e.sideBySide,
  ];
};
/** Every number an option prints, except the side-by-side error form. */
const printed = (d: CountDraw) => optionsOf(d).slice(0, 3).flatMap(numbersIn);

describe('g1.nbt1.count-past-a-ten', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt1CountPastATen);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  // Ruling 23-1: NC.1.NBT.1 is COUNTING. Writing numerals is NC.1.NBT.7.
  it('is filed under NC.1.NBT.1', () => {
    expect(nbt1CountPastATen.standardCode).toBe('NC.1.NBT.1');
  });

  // Ruling 23-3 and the standard's own text: "Count to 150, starting at any
  // number less than 150", "across decade boundaries".
  it('starts below 150, crosses exactly one ten, and never counts past 150', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      const start = parse(g.prompt);
      expect(start, `seed ${seed}`).toBeLessThan(150);
      const key = numbersIn(g.answerText);
      expect(key, `seed ${seed}`).toEqual([start + 1, start + 2, start + 3]);
      expect(key.filter((n) => n % 10 === 0).length, `seed ${seed}: ${g.answerText}`).toBe(1);
      expect(Math.max(...key), `seed ${seed}`).toBeLessThanOrEqual(150);
    }
  });

  // 150 is NC's number; 120 is the Common Core's (ruling 23-3).
  it('counts across every ten from 20 up to and including 150', () => {
    expect([...new Set(COUNT_DRAWS.map((d) => d.ten))].sort((x, y) => x - y)).toEqual([
      20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
    ]);
    const reached = new Set<number>();
    for (let seed = 0; seed < 3000; seed++) reached.add(Math.max(...numbersIn(gen(seed).answerText)));
    expect(reached.has(150)).toBe(true);
  });

  it('gives each distractor the list its tag names, at every seed', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      const e = expected(parse(g.prompt));
      expect(g.answerText, `seed ${seed}`).toBe(e.key.join(', '));
      const back = byTag(g, 'restarted-the-count-at-the-start-of-the-ten');
      const skip = byTag(g, 'skipped-a-ten-while-counting');
      expect(!!back !== !!skip, `seed ${seed}: exactly one ten slip`).toBe(true);
      if (back) expect(back.text, `seed ${seed}`).toBe(e.back.join(', '));
      if (skip) expect(skip.text, `seed ${seed}`).toBe(e.skip.join(', '));
      const early = byTag(g, 'listed-the-starting-number-as-the-first-count');
      const omit = byTag(g, 'skipped-a-number-while-counting');
      expect(!!early !== !!omit, `seed ${seed}: exactly one count slip`).toBe(true);
      if (early) expect(early.text, `seed ${seed}`).toBe(e.early.join(', '));
      if (omit) expect(omit.text, `seed ${seed}`).toBe(e.omit.join(', '));
      expect(byTag(g, 'wrote-the-digits-side-by-side-instead-of-adding-the-values')!.text, `seed ${seed}`).toBe(
        e.sideBySide,
      );
    }
  });

  it('states only true things in its worked solution, at every seed', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      const e = expected(parse(g.prompt));
      const texts = explanationTexts(g.explanation);
      assertStatedArithmeticHolds(texts, `seed ${seed}`);
      assertCountWordsAgree(texts, `seed ${seed}`);
      // The crossing it describes is the one this count really makes.
      expect(g.explanation.stepByStep[1], `seed ${seed}`).toContain(`${e.ten - 1} is followed by ${e.ten}`);
      // The trap it warns about is the ten slip on offer, with its real value.
      if (byTag(g, 'restarted-the-count-at-the-start-of-the-ten')) {
        expect(g.explanation.commonMisconception, `seed ${seed}`).toContain(`going back to ${e.ten - 10}`);
      } else {
        expect(g.explanation.commonMisconception, `seed ${seed}`).toContain(`jumping to ${e.ten + 10}`);
      }
    }
  });

  it('has no colliding option anywhere in its draw space', () => {
    const failures = COUNT_DRAWS.filter((d) => new Set(optionsOf(d)).size !== 4);
    expect(failures).toEqual([]);
    // LITERAL counts. 14 tens (20..150) x 3 places the ten can fall x 2 ten
    // slips x 2 count slips = 168; 15 of them would print a number past 150.
    expect(ALL_COUNT_DRAWS.length).toBe(168);
    expect(COUNT_DRAWS.length).toBe(153);
  });

  it('leaves out exactly the draws that would print a number past 150', () => {
    const kept = new Set(COUNT_DRAWS);
    for (const d of ALL_COUNT_DRAWS) {
      const over = printed(d).some((n) => n > 150);
      expect(over, `${JSON.stringify(d)} ${kept.has(d) ? 'kept' : 'left out'}`).toBe(!kept.has(d));
    }
  });

  // Every counting slip lands one away from the key, and a ten slip lands ten
  // away. Each has to fall on both sides of the key, or "pick the higher of
  // the two" would find it without counting.
  it('puts both kinds of slip on both sides of the correct count', () => {
    const count = (f: (d: CountDraw) => boolean) => COUNT_DRAWS.filter(f).length;
    expect(count((d) => d.countSlip === 'early')).toBe(77);
    expect(count((d) => d.countSlip === 'omit')).toBe(76);
    // Skipping a ten near the top prints a number past 150 (139, 150, 151 or
    // 148, 149, 160), so the top of the range leans on going back.
    expect(count((d) => d.tenSlip === 'back')).toBe(79);
    expect(count((d) => d.tenSlip === 'skip')).toBe(74);
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 7', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Count on from 19. What are the next three numbers?');
    expect(g.answerText).toBe('20, 21, 22');
    expect(g.options.map((o) => o.text)).toEqual(['110, 111, 112', '10, 11, 12', '21, 22, 23', '20, 21, 22']);
  });

  it('pins seed 100', () => {
    const g = gen(100);
    expect(g.prompt).toBe('Count on from 38. What are the next three numbers?');
    expect(g.answerText).toBe('39, 40, 41');
    expect(g.options.map((o) => o.text)).toEqual(['39, 40, 41', '39, 41, 42', '39, 310, 311', '39, 50, 51']);
  });
});
