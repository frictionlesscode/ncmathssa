import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_MD_AUTHORED } from './authored.md';
import { GRADE_3_TEMPLATES } from './templates';
import { makeRng } from '../../engine/rng';
import { METRIC_UNIT, CUSTOMARY_UNIT } from './metricGuard';

/**
 * RULING 14-1, the most serious finding in the Grade 3 pre-flight.
 *
 * NC.3.MD.2 is CUSTOMARY measurement. A metric unit anywhere in this domain is
 * another curriculum's content printed under an NC code, in a 23–27% band, and
 * every other test in this suite would stay green. So this guard reads EVERY
 * string a child can see — the prompt, the figure, the options and the worked
 * solution — of every authored MD item AND of everything the MD generators can
 * emit.
 *
 * The patterns themselves live in ./metricGuard.ts, shared with the four MD
 * template tests. Five copies of a regex drift, and a copy that quietly stops
 * matching anything is exactly the failure this guard exists to prevent.
 */
const METRIC = METRIC_UNIT;
const CUSTOMARY = CUSTOMARY_UNIT;

const md = GRADE_3_DOMAINS.find((d) => d.id === 'MD')!;
const mdTemplates = GRADE_3_TEMPLATES.filter((t) => t.domainId === 'MD');

function textOf(q: (typeof GRADE_3_MD_AUTHORED)[number]): string {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ].join(' ');
}

describe('grade 3 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_3_MD_AUTHORED, md);
  });

  it('names every item g3-md<tail>-NN', () => {
    for (const q of GRADE_3_MD_AUTHORED) {
      expect(q.id, `${q.id} is not a g3- hyphenated id`).toMatch(/^g3-md\d-\d{2}$/);
    }
  });

  it('holds the eighteen-item floor the whole 23–27% band needs', () => {
    expect(GRADE_3_MD_AUTHORED.length).toBeGreaterThanOrEqual(18);
  });

  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_3_MD_AUTHORED, GRADE_3_TEMPLATES);
  });

  it('gives every standard a mastery item and one above mastery', () => {
    for (const s of md.standards) {
      const mine = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === s.code);
      expect(mine.some((q) => q.difficulty === 'mastery'), `${s.code} has no mastery item`).toBe(
        true,
      );
      expect(
        mine.some((q) => q.difficulty === 'advanced' || q.difficulty === 'stretch'),
        `${s.code} has no item above mastery`,
      ).toBe(true);
    }
  });

  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_3_MD_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  // ── Ruling 14-1 ──────────────────────────────────────────────────────────
  it('writes no metric unit anywhere in the authored bank', () => {
    for (const q of GRADE_3_MD_AUTHORED) {
      const hit = METRIC.exec(textOf(q));
      expect(hit?.[0], `${q.id} writes the metric unit "${hit?.[0]}", which is NC.4.MD.1`).toBe(
        undefined,
      );
    }
  });

  it('writes no metric unit anywhere a generator can reach', () => {
    expect(mdTemplates.length, 'no MD generators found to check').toBeGreaterThan(0);
    for (const t of mdTemplates) {
      for (let seed = 0; seed < 400; seed++) {
        const g = t.generate(makeRng(seed));
        const blob = [
          g.prompt,
          g.promptDetails ?? '',
          ...g.options.map((o) => o.text),
          ...g.explanation.stepByStep,
          g.explanation.conceptSummary,
          g.explanation.commonMisconception ?? '',
        ].join(' ');
        const hit = METRIC.exec(blob);
        expect(hit?.[0], `${t.id} @ seed ${seed} writes the metric unit "${hit?.[0]}"`).toBe(
          undefined,
        );
      }
    }
  });

  // A guard is only worth having if it is tested in BOTH directions. Half of
  // this test is the false negatives - the whole metric vocabulary a Grade 3
  // MD bank could reach for, spelled every way NC's Grade 4 standards and
  // Common Core spell it, so that a future edit which narrows the pattern into
  // one that matches nothing goes red here. The other half is the false
  // positives: Measurement & Data cannot be written without "perimeter" and
  // "diameter", and both contain "meter".
  it('catches every metric unit and no word this domain needs', () => {
    for (const caught of [
      'The mass is 4 grams.',
      'a 3 gram weight',
      'It weighs 2 kilograms.',
      'a 5 kg bag',
      'a 2 liter bottle',
      'two liters of water',
      'a 2 litre bottle',
      'It holds 250 milliliters.',
      'It holds 250 millilitres.',
      'a 250 mL cup',
      '12 centimeters',
      '12 centimetres',
      'a 30 cm ruler',
      '4 millimeters',
      '4 millimetres',
      'a 7 mm mark',
      'It is 3 kilometers away.',
      'It is 3 kilometres away.',
      'a 5 km run',
      'The rope is 6 meters long.',
      'The rope is 6 metres long.',
    ]) {
      expect(METRIC.test(caught), `missed the metric unit in "${caught}"`).toBe(true);
    }
    for (const allowed of [
      'What is the perimeter of the rectangle?',
      'the diameter of the circle',
      'A pentagon with all five of its sides labeled.',
      'Each bag of apples weighs 3 pounds.',
      'The cooler holds 24 quarts of water.',
      'The ribbon is 4 3/4 inches long.',
      'a running lane 68 yards long',
    ]) {
      expect(METRIC.test(allowed), `wrongly flagged "${allowed}"`).toBe(false);
    }
  });

  // Ruling 14-2. NC.3.MD.2 has a LENGTH strand as well as capacity and weight,
  // and it is specific: quarter- and half-inches, then feet and yards to the
  // whole unit. A bank of nothing but cups and pounds would clear the
  // three-item floor with a third of the standard unwritten.
  it('covers length, capacity and weight for NC.3.MD.2', () => {
    const two = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === 'NC.3.MD.2');
    expect(two.length).toBeGreaterThanOrEqual(3);
    const blob = two.map((q) => textOf(q));
    expect(
      blob.some((t) => /\binch(es)?\b/i.test(t) && /\b(1\/4|3\/4|1\/2|quarter-inch|half-inch)\b/i.test(t)),
      'no item reads a length to the quarter- or half-inch',
    ).toBe(true);
    expect(blob.some((t) => /\bfeet\b|\bfoot\b/i.test(t)), 'no item measures in feet').toBe(true);
    expect(blob.some((t) => /\byards?\b/i.test(t)), 'no item measures in yards').toBe(true);
    expect(
      blob.some((t) => /\b(cups?|pints?|quarts?|gallons?)\b/i.test(t)),
      'no capacity item',
    ).toBe(true);
    expect(blob.some((t) => /\b(ounces?|pounds?)\b/i.test(t)), 'no weight item').toBe(true);
  });

  // Ruling 14-1's third bullet: "in the SAME customary units". Converting
  // between customary units is NC.4.MD.1. No MD.2 item may ask for one.
  it('keeps every NC.3.MD.2 item inside one customary unit', () => {
    for (const q of GRADE_3_MD_AUTHORED.filter((x) => x.standardCode === 'NC.3.MD.2')) {
      // The unit-choice item is the deliberate exception: its whole question is
      // WHICH unit fits, so it must be allowed to print several.
      if (/Which is the best estimate/i.test(q.prompt)) continue;
      const units = new Set(
        [...`${q.prompt} ${q.promptDetails ?? ''}`.matchAll(new RegExp(CUSTOMARY, 'gi'))].map((m) =>
          m[0].toLowerCase().replace(/e?s$/, '').replace(/^feet$/, 'foot'),
        ),
      );
      expect(
        units.size,
        `${q.id} mixes customary units ${[...units].join(', ')} — converting between them is NC.4.MD.1`,
      ).toBeLessThanOrEqual(1);
    }
  });

  // Ruling 14-4. NC.3.MD.1 is "time intervals WITHIN THE SAME HOUR". An
  // interval that crosses the hour is NC.4.MD.8, which already has its own
  // Grade 4 content and its own misconception tags.
  //
  // The mathematics an item ASKS is its question and its worked solution, so
  // those are what this reads. A DISTRACTOR may legitimately name another
  // hour - reading the short hand as the long one turns 2:43 into 8:10, and
  // that wrong hour is the error itself rather than an interval crossing into
  // it. Every time anywhere in the bank is still checked for being a time a
  // clock could show.
  it('keeps every NC.3.MD.1 item inside a single hour', () => {
    const one = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === 'NC.3.MD.1');
    expect(one.length).toBeGreaterThanOrEqual(3);
    for (const q of one) {
      const asked = [q.prompt, q.promptDetails ?? '', ...q.explanation.stepByStep].join(' ');
      const hours = new Set([...asked.matchAll(/\b(\d{1,2}):(\d{2})\b/g)].map((m) => m[1]));
      expect(
        hours.size,
        `${q.id} asks about clock times in hours ${[...hours].join(', ')} — crossing the hour is NC.4.MD.8`,
      ).toBeLessThanOrEqual(1);
      for (const m of textOf(q).matchAll(/\b(\d{1,2}):(\d{2})\b/g)) {
        expect(Number(m[2]), `${q.id} prints ${m[0]}, which no clock shows`).toBeLessThan(60);
      }
    }
  });

  // The same ruling, for the generator: there a wrong hour has no excuse at
  // all, because the generator prints both times itself. Both clock times in
  // every question it can emit must name the same hour, and the end must come
  // after the start.
  it('keeps every generated NC.3.MD.1 interval inside a single hour', () => {
    const one = mdTemplates.filter((t) => t.standardCode === 'NC.3.MD.1');
    expect(one.length, 'no NC.3.MD.1 generator found').toBeGreaterThan(0);
    for (const t of one) {
      for (let seed = 0; seed < 600; seed++) {
        const g = t.generate(makeRng(seed));
        const times = [...g.prompt.matchAll(/\b(\d{1,2}):(\d{2})\b/g)].map((m) => ({
          h: Number(m[1]),
          m: Number(m[2]),
        }));
        expect(times.length, `${t.id} @ seed ${seed}: expected two clock times`).toBe(2);
        expect(times[0].h, `${t.id} @ seed ${seed} crosses the hour`).toBe(times[1].h);
        expect(times[1].m, `${t.id} @ seed ${seed}: end is not after start`).toBeGreaterThan(
          times[0].m,
        );
        expect(times[1].m, `${t.id} @ seed ${seed}: ${times[1].m} is no minute of any hour`)
          .toBeLessThan(60);
        // The answer is the difference between two minute readings in one
        // hour, so it can never reach an hour's worth of minutes.
        expect(Number(g.answerText.split(' ')[0])).toBe(times[1].m - times[0].m);
      }
    }
  });

  // Ruling 14-4's second half: "tell and write time to the nearest minute" is
  // the first of NC.3.MD.1's three keyConcepts, and a bank of nothing but
  // elapsed-time problems would mark it covered.
  it('reads a clock to the nearest minute for NC.3.MD.1', () => {
    const one = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === 'NC.3.MD.1');
    expect(
      one.some((q) => /hour hand/i.test(textOf(q)) && /minute hand/i.test(textOf(q))),
      'no item asks a child to read a clock face',
    ).toBe(true);
  });

  // Ruling 14-5. NC.3.MD.5 is tile-and-COUNT: the answer is a count of unit
  // squares read off a figure. NC.3.MD.7 is area by MULTIPLYING side lengths.
  // "6 × 4 = 24 square units" satisfies both as a string and neither as a
  // skill, so no MD.5 item may hand a child the two side lengths as numbers
  // and let a single multiplication finish it.
  it('never gives an NC.3.MD.5 item its side lengths as numbers to multiply', () => {
    for (const q of GRADE_3_MD_AUTHORED.filter((x) => x.standardCode === 'NC.3.MD.5')) {
      expect(
        /\bunit squares?\b/i.test(textOf(q)),
        `${q.id} never mentions unit squares`,
      ).toBe(true);
      expect(
        /×/.test(`${q.prompt} ${q.promptDetails ?? ''}`),
        `${q.id} prints a multiplication in its question — that is NC.3.MD.7`,
      ).toBe(false);
    }
  });

  // Ruling 14-5's other half: NC.3.MD.7's THIRD keyConcept is decomposing a
  // rectangle into two smaller ones and adding their areas. The brief never
  // mentions it, and three "length times width" items would clear the floor.
  it('covers the two-rectangle decomposition for NC.3.MD.7', () => {
    const seven = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === 'NC.3.MD.7');
    expect(seven.length).toBeGreaterThanOrEqual(3);
    expect(
      seven.some((q) => /two smaller rectangles|split into two/i.test(textOf(q))),
      'no item decomposes a rectangle into two smaller rectangles',
    ).toBe(true);
  });

  // Ruling 14-6. NC.3.MD.8's second keyConcept is finding an UNKNOWN SIDE
  // LENGTH given the perimeter. The two directions go wrong differently.
  it('covers both directions of NC.3.MD.8', () => {
    const eight = GRADE_3_MD_AUTHORED.filter((q) => q.standardCode === 'NC.3.MD.8');
    expect(eight.length).toBeGreaterThanOrEqual(3);
    const blob = eight.map((q) => textOf(q));
    expect(blob.some((t) => /perimeter of/i.test(t)), 'no find-the-perimeter item').toBe(true);
    expect(
      blob.some((t) => /How long is the third side|unknown side|third side/i.test(t)),
      'no unknown-side-length item',
    ).toBe(true);
  });

  // NC does not have CCSS 3.MD.A.2's metric mass and volume, and it does not
  // have CCSS 3.NBT.A.1's rounding either. Neither word belongs in this bank.
  it('does not reach for Common Core vocabulary NC has at no grade here', () => {
    for (const q of GRADE_3_MD_AUTHORED) {
      expect(/\bround(ed|ing)? to the nearest (ten|hundred)\b/i.test(textOf(q)), q.id).toBe(false);
      expect(/\bmass\b/i.test(textOf(q)), `${q.id} says "mass"; NC.3.MD.2 says weight`).toBe(false);
    }
  });
});
