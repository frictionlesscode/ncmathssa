import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  md10BarGraphHowManyMore,
  SURVEYS,
  SCALE_TOP,
  BAR_TRIPLES,
} from './md10-bar-graph-how-many-more';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

/** Category -> bar height, read back out of the figure description. */
function parseBars(details: string | undefined): Map<string, number> {
  const bars = new Map<string, number>();
  for (const m of (details ?? '').matchAll(/([A-Z][a-z]+(?: [a-z]+)?): the bar reaches (\d+)\./g)) {
    bars.set(m[1].toLowerCase(), Number(m[2]));
  }
  return bars;
}

function parseQuestion(prompt: string): { a: string; b: string } {
  const m = /^Use the bar graph\. How many more [a-z]+ chose ([a-z ]+) than ([a-z ]+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { a: m[1], b: m[2] };
}

const value = (text: string) => Number(text.split(' ')[0]);

describe('g2.md10.bar-graph-how-many-more', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md10BarGraphHowManyMore);
  });

  it('is deterministic in its seed', () => {
    expect(md10BarGraphHowManyMore.generate(makeRng(42))).toEqual(
      md10BarGraphHowManyMore.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = md10BarGraphHowManyMore.generate(makeRng(7));
    expect(g.prompt).toBe('Use the bar graph. How many more students chose oranges than apples?');
    expect(g.promptDetails).toBe(
      'Bar graph titled "Our Favorite Fruit". The scale counts by ones, from 0 to 15. Apples: the bar reaches 2. Bananas: the bar reaches 3. Grapes: the bar reaches 15. Oranges: the bar reaches 8.',
    );
    expect(g.answerText).toBe('6 students');
    expect(shape(g)).toEqual([
      ['A', '8 students', false, 'forgot-the-final-step'],
      ['B', '5 students', false, 'used-the-wrong-given-quantity'],
      ['C', '6 students', true, null],
      ['D', '10 students', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: The difference is 6 students. That is how many more students chose oranges than apples.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = md10BarGraphHowManyMore.generate(makeRng(123));
    expect(g.prompt).toBe('Use the bar graph. How many more kids chose hopscotch than jump rope?');
    expect(g.promptDetails).toBe(
      'Bar graph titled "Our Favorite Recess Games". The scale counts by ones, from 0 to 15. Tag: the bar reaches 8. Soccer: the bar reaches 9. Jump rope: the bar reaches 3. Hopscotch: the bar reaches 10.',
    );
    expect(g.answerText).toBe('7 kids');
    expect(shape(g)).toEqual([
      ['A', '7 kids', true, null],
      ['B', '13 kids', false, 'added-instead-of-subtracted'],
      ['C', '10 kids', false, 'forgot-the-final-step'],
      ['D', '1 kid', false, 'used-the-wrong-given-quantity'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: The difference is 7 kids. That is how many more kids chose hopscotch than jump rope.',
    );
  });

  it('is filed under NC.2.MD.10', () => {
    expect(md10BarGraphHowManyMore.standardCode).toBe('NC.2.MD.10');
  });

  // Ruling 19-3: "up to four categories" and "a single-unit scale". A scale
  // of 2 or 5 is Grade 3's NC.3.MD.3; a fifth bar is outside the standard.
  it('draws at most four bars on a scale that counts by ones', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = md10BarGraphHowManyMore.generate(makeRng(seed));
      expect(g.promptDetails, `seed ${seed}`).toMatch(/The scale counts by ones, from 0 to 15\./);
      const bars = parseBars(g.promptDetails);
      expect(bars.size, `seed ${seed}`).toBeLessThanOrEqual(4);
      expect(bars.size, `seed ${seed}`).toBeGreaterThanOrEqual(3);
      for (const v of bars.values()) {
        expect(v, `seed ${seed}`).toBeGreaterThanOrEqual(1);
        expect(v, `seed ${seed}`).toBeLessThanOrEqual(SCALE_TOP);
      }
    }
  });

  it('keys the difference between the two bars asked about', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = md10BarGraphHowManyMore.generate(makeRng(seed));
      const bars = parseBars(g.promptDetails);
      const { a, b } = parseQuestion(g.prompt);
      expect(bars.get(a)! - bars.get(b)!, `seed ${seed}`).toBeGreaterThan(0);
      expect(value(g.answerText), `seed ${seed}`).toBe(bars.get(a)! - bars.get(b)!);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md10BarGraphHowManyMore.generate(makeRng(seed));
      const bars = parseBars(g.promptDetails);
      const { a, b } = parseQuestion(g.prompt);
      const va = bars.get(a)!;
      const vb = bars.get(b)!;
      const byTag = (tag: string) => value(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-instead-of-subtracted'), `seed ${seed}`).toBe(va + vb);
      expect(byTag('forgot-the-final-step'), `seed ${seed}`).toBe(va);
      // Subtracted a bar the question did not ask about: a third category,
      // shorter than the first one named, stood in for the second.
      const wrongBar = va - byTag('used-the-wrong-given-quantity');
      const others = [...bars.entries()].filter(([k]) => k !== a && k !== b).map(([, v]) => v);
      expect(others, `seed ${seed}`).toContain(wrongBar);
      expect(wrongBar, `seed ${seed}`).toBeLessThan(va);
    }
  });

  // The two subtractions sit below the first bar and the sum above it, and
  // which of the two subtractions is smaller depends on which bar is shorter,
  // so the key moves between the smallest and the second smallest.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = md10BarGraphHowManyMore.generate(makeRng(seed));
      const sorted = g.options.map((o) => value(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(value(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([0, 1]);
  });

  // No option but the forgot-the-final-step reading is the height of a bar on
  // the graph. Otherwise a child who read the wrong bar could land on the key
  // by accident, or on a distractor tagged with an error they did not make.
  it('never offers a bar height except the one bar read and stopped at', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md10BarGraphHowManyMore.generate(makeRng(seed));
      const heights = new Set(parseBars(g.promptDetails).values());
      expect(heights.size, `seed ${seed}: two bars the same height`).toBe(4);
      for (const o of g.options) {
        if (o.misconception === 'forgot-the-final-step') continue;
        expect(heights.has(value(o.text)), `seed ${seed}: ${o.text} is a bar on the graph`).toBe(
          false,
        );
      }
    }
  });

  it('has no colliding option anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const { a, b, c } of BAR_TRIPLES) {
      const values = [a - b, a + b, a, a - c];
      if (new Set(values).size !== 4) failures.push(`${a},${b},${c}: ${values}`);
      if (b >= a || c >= a || b === c) failures.push(`${a},${b},${c}: not a valid triple`);
      for (const v of [a - b, a - c]) {
        if ([a, b, c].includes(v)) failures.push(`${a},${b},${c}: ${v} is a bar`);
      }
      const taken = new Set([a, b, c, a - b, a - c, a + b]);
      const spare = Array.from({ length: SCALE_TOP }, (_, i) => i + 1).filter((h) => !taken.has(h));
      if (spare.length < 9) failures.push(`${a},${b},${c}: only ${spare.length} spare heights`);
    }
    expect(failures).toEqual([]);
    // 910 ordered triples with b, c < a <= 15 and b != c, less 98 with
    // a = b + c and 84 more with a = 2b or a = 2c.
    expect(BAR_TRIPLES.length).toBe(728);
  });

  // Both exclusions, shown to be real.
  it('would put an option on a bar for exactly the excluded triples', () => {
    for (let a = 2; a <= SCALE_TOP; a++) {
      for (let b = 1; b < a; b++) {
        for (let c = 1; c < a; c++) {
          if (b === c) continue;
          const kept = BAR_TRIPLES.some((t) => t.a === a && t.b === b && t.c === c);
          const lands = [a - b, a - c].some((v) => v === b || v === c);
          expect(kept, `${a},${b},${c}`).toBe(!lands);
        }
      }
    }
  });

  it('gives every survey four distinct categories and a singular voter noun', () => {
    for (const s of SURVEYS) {
      expect(new Set(s.categories).size, s.title).toBe(4);
      expect(s.voterSingular.length, s.title).toBeGreaterThan(0);
    }
  });
});
