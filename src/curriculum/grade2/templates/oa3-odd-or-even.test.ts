import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa3OddOrEven, EVEN_DRAWS, ODD_DRAWS } from './oa3-odd-or-even';

const gen = (seed: number) => oa3OddOrEven.generate(makeRng(seed));

/** Reads the group size back out of the prompt, independently of the generator. */
function groupSize(prompt: string): number {
  const m = /^[A-Z][a-z]+ has (\d+) [a-z]+\. [A-Z][a-z]+ puts them into pairs\. Which sentence is true\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return Number(m[1]);
}

const byTag = (g: ReturnType<typeof gen>, tag: string) => g.options.find((o) => o.misconception === tag)!;

describe('g2.oa3.odd-or-even', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa3OddOrEven);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('bumps its content version: it was rebuilt around objects', () => {
    expect(oa3OddOrEven.contentVersion).toBe(2);
  });

  // LITERAL pins, copied from a real run.
  it('emits exactly this question at seed 7 (even)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Omar has 2 buttons. Omar puts them into pairs. Which sentence is true?');
    expect(g.answerText).toBe('They pair up with none left over, so 2 is even.');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', 'They make 1 pair, and 1 is odd, so 2 is odd.', false, 'judged-the-total-by-the-count-of-pairs'],
      ['B', 'They pair up with none left over, so 2 is even.', true, null],
      ['C', 'They pair up with none left over, so 2 is odd.', false, 'swapped-the-words-odd-and-even'],
      ['D', 'They pair up with 1 left over, so 2 is even.', false, 'miscounted-while-pairing-the-objects'],
    ]);
  });

  it('emits exactly this question at seed 123 (odd)', () => {
    const g = gen(123);
    expect(g.prompt).toBe('Maya has 5 stickers. Maya puts them into pairs. Which sentence is true?');
    expect(g.answerText).toBe('They pair up with 1 left over, so 5 is odd.');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', 'They pair up with 1 left over, so 5 is odd.', true, null],
      ['B', 'They make 2 pairs, and 2 is even, so 5 is even.', false, 'judged-the-total-by-the-count-of-pairs'],
      ['C', 'They pair up with none left over, so 5 is odd.', false, 'miscounted-while-pairing-the-objects'],
      ['D', 'They pair up with 1 left over, so 5 is even.', false, 'swapped-the-words-odd-and-even'],
    ]);
  });

  // content-g2 audit (Medium): the old item was four bare numerals, so all three
  // distractors carried one generic tag and a last-digit rule answered it.
  it('F: is about a group of objects, and each distractor has its own tag', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const tags = g.options.filter((o) => !o.isCorrect).map((o) => o.misconception);
      expect(new Set(tags).size, `seed ${seed}: ${tags.join(', ')}`).toBe(3);
      expect(g.prompt, `seed ${seed}`).not.toMatch(/Which of these numbers/);
    }
  });

  it('F: exactly one option is true, and two end in "even", two in "odd"', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const n = groupSize(g.prompt);
      const pairs = Math.floor(n / 2);
      const leftOver = n % 2;
      // Evaluate every sentence from the numbers in the prompt alone.
      const truth = g.options.map((o) => {
        const conclusion = /so \d+ is (even|odd)\.$/.exec(o.text)![1];
        const claimsLeft = /with (none|1) left over/.exec(o.text);
        const claimsPairs = /make (\d+) pairs?, and (\d+) is (even|odd)/.exec(o.text);
        let premiseTrue = true;
        if (claimsLeft) premiseTrue = (claimsLeft[1] === '1') === (leftOver === 1);
        if (claimsPairs) premiseTrue = Number(claimsPairs[1]) === pairs && (claimsPairs[3] === 'even') === (pairs % 2 === 0);
        const conclusionTrue = conclusion === (n % 2 === 0 ? 'even' : 'odd');
        // The pairs-count sentence reasons from the parity of the pairs, so its
        // conclusion is only sound if that parity matches: it never does here.
        const sound = claimsPairs ? claimsPairs[3] === conclusion && conclusionTrue : conclusionTrue;
        return premiseTrue && sound;
      });
      expect(truth.filter(Boolean).length, `seed ${seed}: ${g.options.map((o) => o.text).join(' | ')}`).toBe(1);
      expect(g.options[truth.indexOf(true)].isCorrect, `seed ${seed}`).toBe(true);
      const endsEven = g.options.filter((o) => o.text.endsWith('is even.')).length;
      expect(endsEven, `seed ${seed}`).toBe(2);
    }
  });

  it('F: the draw space keeps the parity of the pairs opposite to the parity of the group', () => {
    for (const n of EVEN_DRAWS) {
      expect(n % 2).toBe(0);
      expect((n / 2) % 2, `${n}`).toBe(1);
    }
    for (const n of ODD_DRAWS) {
      expect(n % 2).toBe(1);
      expect(((n - 1) / 2) % 2, `${n}`).toBe(0);
    }
    expect(Math.max(...EVEN_DRAWS, ...ODD_DRAWS)).toBeLessThanOrEqual(20); // NC.2.OA.3: within 20
  });

  // content-g2 audit (Medium): "2 objects pair up into exactly 1 pairs".
  it('F: never writes "1 pairs" or "1 objects" in a worked solution', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const text = [...g.options.map((o) => o.text), ...g.explanation.stepByStep, g.explanation.commonMisconception ?? ''].join(' ');
      expect(text, `seed ${seed}`).not.toMatch(/\b1 (?:pairs|buttons|stickers|shells|pencils|marbles)\b/);
    }
  });

  it('the correct option matches the group, never the size of the number', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const n = groupSize(g.prompt);
      expect(g.answerText, `seed ${seed}`).toBe(
        `They pair up with ${n % 2 === 0 ? 'none' : '1'} left over, so ${n} is ${n % 2 === 0 ? 'even' : 'odd'}.`,
      );
      expect(byTag(g, 'miscounted-while-pairing-the-objects').text, `seed ${seed}`).toContain(
        n % 2 === 0 ? 'with 1 left over' : 'with none left over',
      );
    }
  });
});
