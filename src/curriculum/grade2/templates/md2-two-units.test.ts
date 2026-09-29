import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md2TwoUnits, UNIT_PAIRS } from './md2-two-units';
import { md1ReadARuler } from './md1-read-a-ruler';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

/** The pair of units an emitted prompt measures in, found from the two
 *  "measures it in X" sentences. */
function unitsOf(prompt: string): { first: string; second: string } {
  const m = /First \w+ measures it in (\w+), then in (\w+)\./.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { first: m[1], second: m[2] };
}

function pairFor(first: string, second: string) {
  const pair = UNIT_PAIRS.find(
    (p) =>
      (p.shorter.plural === first && p.longer.plural === second) ||
      (p.shorter.plural === second && p.longer.plural === first),
  );
  if (!pair) throw new Error(`no unit pair for ${first}/${second}`);
  return pair;
}

describe('g2.md2.two-units', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md2TwoUnits);
  });

  it('is deterministic in its seed', () => {
    expect(md2TwoUnits.generate(makeRng(42))).toEqual(md2TwoUnits.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = md2TwoUnits.generate(makeRng(7));
    expect(g.prompt).toBe(
      'Rosa measures the same rug two times. First she measures it in centimeters, then in inches. Since centimeter is shorter than an inch, which sentence is true?',
    );
    expect(g.promptDetails).toBe(undefined);
    expect(g.answerText).toBe('Rosa counts more centimeters than inches.');
    expect(shape(g)).toEqual([
      [
        'A',
        'Rosa counts the same number of centimeters and inches.',
        false,
        'expected-the-count-to-stay-the-same-in-a-new-unit',
      ],
      [
        'B',
        'The rug is shorter when it is measured in inches.',
        false,
        'thought-the-object-changed-length-with-the-unit',
      ],
      ['C', 'Rosa counts more centimeters than inches.', true, null],
      [
        'D',
        'Rosa counts more inches than centimeters.',
        false,
        'expected-a-longer-unit-to-give-a-bigger-count',
      ],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: So the true sentence is: Rosa counts more centimeters than inches.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = md2TwoUnits.generate(makeRng(123));
    expect(g.prompt).toBe(
      'Nia measures the same rug two times. First she measures it in yards, then in feet. Since yard is longer than a foot, which sentence is true?',
    );
    expect(g.answerText).toBe('Nia counts more feet than yards.');
    expect(shape(g)).toEqual([
      ['A', 'Nia counts more feet than yards.', true, null],
      ['B', 'Nia counts more yards than feet.', false, 'expected-a-longer-unit-to-give-a-bigger-count'],
      [
        'C',
        'Nia counts the same number of yards and feet.',
        false,
        'expected-the-count-to-stay-the-same-in-a-new-unit',
      ],
      [
        'D',
        'The rug is longer when it is measured in feet.',
        false,
        'thought-the-object-changed-length-with-the-unit',
      ],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: So the true sentence is: Nia counts more feet than yards.',
    );
  });

  // Ruling 19-2: NC.2.MD.2 is measuring one object with TWO different units
  // and relating the counts to the unit size. It is its own standard and its
  // own review key, never folded into MD.1's ruler reading.
  it('is filed under NC.2.MD.2, separately from the MD.1 generator', () => {
    expect(md2TwoUnits.standardCode).toBe('NC.2.MD.2');
    expect(md2TwoUnits.id).not.toBe(md1ReadARuler.id);
  });

  it('measures the same object in two different units every time', () => {
    for (let seed = 0; seed < 300; seed++) {
      const { prompt } = md2TwoUnits.generate(makeRng(seed));
      expect(prompt, `seed ${seed}`).toMatch(/ measures the same \w+ two times\./);
      const { first, second } = unitsOf(prompt);
      expect(first, `seed ${seed}`).not.toBe(second);
      pairFor(first, second);
    }
  });

  // The standard's third keyConcept, word for word: "A smaller unit gives a
  // larger count for the same length." The key is always the sentence that
  // says so for the two units drawn.
  it('keys the sentence that gives the SHORTER unit the bigger count', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md2TwoUnits.generate(makeRng(seed));
      const { first, second } = unitsOf(g.prompt);
      const pair = pairFor(first, second);
      const name = g.prompt.split(' ')[0];
      expect(g.answerText, `seed ${seed}`).toBe(
        `${name} counts more ${pair.shorter.plural} than ${pair.longer.plural}.`,
      );
    }
  });

  // One template, one skill: the same three errors at every seed, so a review
  // re-serve always re-tests exactly what was failed.
  it('offers the same three named errors at every seed', () => {
    for (let seed = 0; seed < 300; seed++) {
      const tags = md2TwoUnits
        .generate(makeRng(seed))
        .options.filter((o) => !o.isCorrect)
        .map((o) => o.misconception)
        .sort();
      expect(tags, `seed ${seed}`).toEqual([
        'expected-a-longer-unit-to-give-a-bigger-count',
        'expected-the-count-to-stay-the-same-in-a-new-unit',
        'thought-the-object-changed-length-with-the-unit',
      ]);
    }
  });

  // No wording shortcut to the key. The unit measured first, the unit named
  // first in the "shorter / longer" hint, and the unit named in the "the
  // object changed length" distractor all vary, so none of them points at the
  // right sentence without the mathematics.
  it('lets no fixed piece of wording point at the answer', () => {
    const shorterMeasuredFirst = new Set<boolean>();
    const hintNamesShorterFirst = new Set<boolean>();
    const lengthDistractorForm = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const g = md2TwoUnits.generate(makeRng(seed));
      const { first, second } = unitsOf(g.prompt);
      const pair = pairFor(first, second);
      shorterMeasuredFirst.add(first === pair.shorter.plural);
      hintNamesShorterFirst.add(/ is shorter than /.test(g.prompt));
      const changed = g.options.find(
        (o) => o.misconception === 'thought-the-object-changed-length-with-the-unit',
      )!.text;
      lengthDistractorForm.add(/ is longer when /.test(changed) ? 'longer' : 'shorter');
    }
    expect([...shorterMeasuredFirst].sort()).toEqual([false, true]);
    expect([...hintNamesShorterFirst].sort()).toEqual([false, true]);
    expect([...lengthDistractorForm].sort()).toEqual(['longer', 'shorter']);
  });
});
