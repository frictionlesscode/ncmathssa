import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt8TenOrHundred } from './nbt8-ten-or-hundred';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { delta: number; isMore: boolean; n: number } {
  const m = /^What is (\d+) (more|less) than (\d+)\?$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { delta: Number(m[1]), isMore: m[2] === 'more', n: Number(m[3]) };
}

describe('g2.nbt8.ten-or-hundred', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt8TenOrHundred);
  });

  it('is deterministic in its seed', () => {
    expect(nbt8TenOrHundred.generate(makeRng(42))).toEqual(nbt8TenOrHundred.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt8TenOrHundred.generate(makeRng(7));
    expect(g.prompt).toBe('Do this in your head. No counting on.');
    expect(g.promptDetails).toBe('What is 10 less than 207?');
    expect(g.answerText).toBe('197');
    expect(shape(g)).toEqual([
      ['A', '198', false, 'counted-by-ones-and-lost-the-count'],
      ['B', '197', true, null],
      ['C', '107', false, 'wrong-power-of-ten'],
      ['D', '217', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[1]).toBe('Step 2: 207 is 2 hundreds, 0 tens, and 7 ones.');
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 10 less than 207 is 197.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt8TenOrHundred.generate(makeRng(123));
    expect(g.promptDetails).toBe('What is 10 more than 673?');
    expect(g.answerText).toBe('683');
    expect(shape(g)).toEqual([
      ['A', '682', false, 'counted-by-ones-and-lost-the-count'],
      ['B', '663', false, 'subtracted-instead-of-added'],
      ['C', '773', false, 'wrong-power-of-ten'],
      ['D', '683', true, null],
    ]);
  });

  // "10 OR 100", both directions: all four combinations must be reachable, and
  // no other amount may ever be asked for.
  it('asks for all four of 10 more, 10 less, 100 more and 100 less, and nothing else', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 400; seed++) {
      const { delta, isMore } = parse(nbt8TenOrHundred.generate(makeRng(seed)).promptDetails);
      expect([10, 100].includes(delta), `seed ${seed}: delta ${delta}`).toBe(true);
      seen.add(`${delta}${isMore ? '+' : '-'}`);
    }
    expect([...seen].sort()).toEqual(['10+', '10-', '100+', '100-']);
  });

  // The standard says "a given number 100-900". Everything printed — the given
  // number, the answer, and all three distractors — is itself in that range.
  it('keeps the given number and every option inside 100 and 900', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt8TenOrHundred.generate(makeRng(seed));
      const { delta, isMore, n } = parse(g.promptDetails);
      for (const v of [n, ...g.options.map((o) => Number(o.text))]) {
        expect(v, `seed ${seed}: ${v} below 100`).toBeGreaterThanOrEqual(100);
        expect(v, `seed ${seed}: ${v} above 900`).toBeLessThanOrEqual(900);
      }
      expect(Number(g.answerText), `seed ${seed}`).toBe(isMore ? n + delta : n - delta);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt8TenOrHundred.generate(makeRng(seed));
      const { delta, isMore, n } = parse(g.promptDetails);
      const sign = isMore ? 1 : -1;
      const other = delta === 10 ? 100 : 10;
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('wrong-power-of-ten'), `seed ${seed}`).toBe(n + sign * other);
      expect(byTag('counted-by-ones-and-lost-the-count'), `seed ${seed}`).toBe(
        n + sign * (delta - 1),
      );
      expect(
        byTag(isMore ? 'subtracted-instead-of-added' : 'added-instead-of-subtracted'),
        `seed ${seed}`,
      ).toBe(n - sign * delta);
    }
  });

  // The full draw space: every start, amount and direction the generator can
  // pick, with all four values recomputed.
  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (let n = 200; n <= 800; n++) {
      for (const delta of [10, 100]) {
        for (const sign of [1, -1]) {
          const other = delta === 10 ? 100 : 10;
          const values = [
            n + sign * delta,
            n + sign * other,
            n - sign * delta,
            n + sign * (delta - 1),
          ];
          if (new Set(values).size !== 4) failures.push(`collision at ${n} ${sign * delta}`);
          if (Math.min(...values) < 100 || Math.max(...values) > 900) {
            failures.push(`out of 100-900 at ${n} ${sign * delta}: ${values}`);
          }
          drawn++;
        }
      }
    }
    expect(failures).toEqual([]);
    expect(drawn, 'draw space size').toBe(2404);
  });
});
