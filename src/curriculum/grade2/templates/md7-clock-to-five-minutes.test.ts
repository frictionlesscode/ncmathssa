import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md7ClockToFiveMinutes, CLOCK_READINGS } from './md7-clock-to-five-minutes';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parseClock(details: string | undefined): { hour: number; hand: number } {
  const m =
    /^A clock with two hands\. The short hour hand is between the (\d+) and the (\d+), closer to the (\d+)\. The long minute hand points straight at the (\d+)\.$/.exec(
      details ?? '',
    );
  if (!m) throw new Error(`unparsable clock: ${details}`);
  expect(Number(m[2])).toBe(Number(m[1]) + 1);
  expect(Number(m[3])).toBe(Number(m[1]) + 1);
  return { hour: Number(m[1]), hand: Number(m[4]) };
}

function parseTime(text: string): { h: number; m: number; sfx: string } {
  const m = /^(\d{1,2}):(\d{2}) ([ap]\.m\.)$/.exec(text);
  if (!m) throw new Error(`unparsable time: ${text}`);
  return { h: Number(m[1]), m: Number(m[2]), sfx: m[3] };
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

describe('g2.md7.clock-to-five-minutes', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md7ClockToFiveMinutes);
  });

  it('is deterministic in its seed', () => {
    expect(md7ClockToFiveMinutes.generate(makeRng(42))).toEqual(
      md7ClockToFiveMinutes.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = md7ClockToFiveMinutes.generate(makeRng(7));
    expect(g.prompt).toBe('It is morning. Ava looks at the clock. What time is it?');
    expect(g.promptDetails).toBe(
      'A clock with two hands. The short hour hand is between the 6 and the 7, closer to the 7. The long minute hand points straight at the 10.',
    );
    expect(g.answerText).toBe('6:50 a.m.');
    expect(shape(g)).toEqual([
      ['A', '6:50 a.m.', true, null],
      ['B', '6:10 a.m.', false, 'read-the-minute-hand-as-the-number-it-points-to'],
      ['C', '10:30 a.m.', false, 'swapped-the-hour-and-minute-hands'],
      ['D', '7:50 a.m.', false, 'read-the-next-hour-from-the-hour-hand'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The clock shows 6:50 a.m.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md7ClockToFiveMinutes.generate(makeRng(123));
    expect(g.prompt).toBe('It is morning. Mei looks at the clock. What time is it?');
    expect(g.promptDetails).toBe(
      'A clock with two hands. The short hour hand is between the 8 and the 9, closer to the 9. The long minute hand points straight at the 9.',
    );
    expect(g.answerText).toBe('8:45 a.m.');
    expect(shape(g)).toEqual([
      ['A', '9:45 a.m.', false, 'read-the-next-hour-from-the-hour-hand'],
      ['B', '9:40 a.m.', false, 'swapped-the-hour-and-minute-hands'],
      ['C', '8:45 a.m.', true, null],
      ['D', '8:09 a.m.', false, 'read-the-minute-hand-as-the-number-it-points-to'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The clock shows 8:45 a.m.');
  });

  // Ruling 19-1: NC.2.MD.7 is TIME. The brief filed the clock generator under
  // MD.6, which is the number line.
  it('is filed under NC.2.MD.7', () => {
    expect(md7ClockToFiveMinutes.standardCode).toBe('NC.2.MD.7');
  });

  // Ruling 19-3: "to the nearest five minutes, using a.m. and p.m." The time
  // shown is always on a five-minute mark, every option carries a.m. or p.m.,
  // and it is the one the part of the day calls for.
  it('reads to five minutes and labels every option a.m. or p.m. correctly', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md7ClockToFiveMinutes.generate(makeRng(seed));
      const part = /^It is (morning|afternoon|evening)\./.exec(g.prompt)![1];
      const expected = part === 'morning' ? 'a.m.' : 'p.m.';
      const key = parseTime(g.answerText);
      expect(key.m % 5, `seed ${seed}`).toBe(0);
      for (const o of g.options) {
        const t = parseTime(o.text);
        expect(t.sfx, `seed ${seed}: ${o.text}`).toBe(expected);
        expect(t.h, `seed ${seed}: ${o.text}`).toBeGreaterThanOrEqual(1);
        expect(t.h, `seed ${seed}: ${o.text}`).toBeLessThanOrEqual(12);
        expect(t.m, `seed ${seed}: ${o.text}`).toBeLessThan(60);
      }
    }
  });

  it('shows the hour the hand has passed and five times the minute-hand number', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md7ClockToFiveMinutes.generate(makeRng(seed));
      const { hour, hand } = parseClock(g.promptDetails);
      const key = parseTime(g.answerText);
      expect(key.h, `seed ${seed}`).toBe(hour);
      expect(key.m, `seed ${seed}`).toBe(5 * hand);
      // Late in the hour, where the hour hand sits nearer the NEXT number.
      expect(hand, `seed ${seed}`).toBeGreaterThanOrEqual(7);
      expect(hand, `seed ${seed}`).toBeLessThanOrEqual(11);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md7ClockToFiveMinutes.generate(makeRng(seed));
      const { hour, hand } = parseClock(g.promptDetails);
      const sfx = parseTime(g.answerText).sfx;
      const byTag = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;
      expect(byTag('read-the-minute-hand-as-the-number-it-points-to')).toBe(
        `${hour}:${pad(hand)} ${sfx}`,
      );
      expect(byTag('swapped-the-hour-and-minute-hands')).toBe(`${hand}:${pad(5 * hour)} ${sfx}`);
      expect(byTag('read-the-next-hour-from-the-hour-hand')).toBe(
        `${hour + 1}:${pad(5 * hand)} ${sfx}`,
      );
    }
  });

  // By clock order the key is never first or last in any fixed way: the
  // swapped-hands reading lands before it when the minute-hand number is
  // smaller than the hour, and after it otherwise.
  it('does not always put the correct time at the same place in clock order', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = md7ClockToFiveMinutes.generate(makeRng(seed));
      const minutesOf = (text: string) => {
        const t = parseTime(text);
        return 60 * t.h + t.m;
      };
      const sorted = g.options.map((o) => minutesOf(o.text)).sort((a, b) => a - b);
      ranks.add(sorted.indexOf(minutesOf(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([1, 2]);
  });

  it('has no colliding option anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const { hour, hand } of CLOCK_READINGS) {
      const texts = [
        `${hour}:${pad(5 * hand)}`,
        `${hour}:${pad(hand)}`,
        `${hand}:${pad(5 * hour)}`,
        `${hour + 1}:${pad(5 * hand)}`,
      ];
      if (new Set(texts).size !== 4) failures.push(`${hour}/${hand}: ${texts}`);
    }
    expect(failures).toEqual([]);
    // morning 6-10 x hands 7-11, less 4 where hand = hour: 21
    // afternoon 1-4 x hands 7-11: 20
    // evening 5-8 x hands 7-11, less 2 where hand = hour: 18
    expect(CLOCK_READINGS.length).toBe(59);
  });

  // The counterfactual, over the space as it would be with no exclusion: every
  // part of the day, every hour in it, every minute-hand number 7-11. A reading
  // is kept exactly when its four options are distinct, and the readings whose
  // options collide are exactly the six with the minute hand on the hour's own
  // number, where swapping the hands reads back the right time.
  it('keeps exactly the readings whose four options are distinct', () => {
    const parts = [
      { part: 'morning', from: 6, to: 10 },
      { part: 'afternoon', from: 1, to: 4 },
      { part: 'evening', from: 5, to: 8 },
    ];
    let unconstrained = 0;
    const collided: string[] = [];
    for (const { part, from, to } of parts) {
      for (let hour = from; hour <= to; hour++) {
        for (let hand = 7; hand <= 11; hand++) {
          unconstrained++;
          const collides = new Set(clockOptions(hour, hand)).size < 4;
          const kept = CLOCK_READINGS.some(
            (r) => r.part === part && r.hour === hour && r.hand === hand,
          );
          expect(kept, `${part} ${hour} / hand ${hand}`).toBe(!collides);
          expect(collides, `${part} ${hour} / hand ${hand}`).toBe(hand === hour);
          if (collides) collided.push(`${part} ${hour}:${pad(5 * hand)}`);
        }
      }
    }
    expect(unconstrained).toBe(65);
    expect(collided).toEqual([
      'morning 7:35',
      'morning 8:40',
      'morning 9:45',
      'morning 10:50',
      'evening 7:35',
      'evening 8:40',
    ]);
  });
});

/** The four readings the docstring's table gives — key, minute-hand number,
 *  swapped hands, next hour — in that order. The "gives each distractor the
 *  value its tag names" test above checks these same formulas against what
 *  the generator actually emits, at 600 seeds. */
function clockOptions(hour: number, hand: number): string[] {
  return [
    `${hour}:${pad(5 * hand)}`,
    `${hour}:${pad(hand)}`,
    `${hand}:${pad(5 * hour)}`,
    `${hour + 1}:${pad(5 * hand)}`,
  ];
}
