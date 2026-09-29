import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  assertGradeTwoReadable,
  GRADE_2_VOCAB_ALLOWLIST,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_MD_AUTHORED } from './authored.md';
import { GRADE_2_TEMPLATES } from './templates';
import { makeRng } from '../../engine/rng';
import type { StandardCode } from '../types';

const md = GRADE_2_DOMAINS.find((d) => d.id === 'MD')!;
const mdTemplates = GRADE_2_TEMPLATES.filter((t) => t.domainId === 'MD');

/** Everything a child can read in one question: prompt, figure and options. */
interface Readable {
  where: string;
  standardCode: StandardCode;
  prompt: string;
  promptDetails?: string;
  options: { text: string; isCorrect: boolean; misconception?: string }[];
}

const authored: Readable[] = GRADE_2_MD_AUTHORED.map((q) => ({ ...q, where: q.id }));

/** 200 draws of every MD generator, each labeled with the standard its
 *  template is filed under. */
const generated: Readable[] = mdTemplates.flatMap((t) =>
  Array.from({ length: 200 }, (_, seed) => {
    const g = t.generate(makeRng(seed));
    return { ...g, where: `${t.id} @ seed ${seed}`, standardCode: t.standardCode };
  }),
);

const shown = (q: Readable) =>
  [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
const asked = (q: Readable) => `${q.prompt} ${q.promptDetails ?? ''}`;
const key = (q: Readable) => q.options.find((o) => o.isCorrect)!.text;
const itemsFor = (code: string) => GRADE_2_MD_AUTHORED.filter((q) => q.standardCode === code);

/** A money option as a number of cents: "35¢" is 35, "$35" is 3,500. */
function centsOf(text: string): number | null {
  let m = /^(\d+)¢$/.exec(text);
  if (m) return Number(m[1]);
  m = /^\$(\d+)$/.exec(text);
  if (m) return 100 * Number(m[1]);
  return null;
}

/** A question is about TIME if it prints a clock time or talks about a
 *  clock's hands. Naming a clock as the wrong TOOL for measuring a rug does
 *  not make an MD.1 item a time item. */
const TIME_TOPIC = /\b\d{1,2}:\d{2}\b|\b(?:hour|minute) hand\b/i;
/** A question is in cents if it prints ¢ or names a coin. */
const COIN_WORD = /\b(?:quarters?|dimes?|nickels?|penny|pennies)\b/i;
const MONEY_TOPIC = /¢|\$|\b(?:quarters?|dimes?|nickels?|penny|pennies)\b/i;

const LENGTH_UNIT = /\b(inch(?:es)?|foot|feet|yards?|centimeters?|meters?)\b/g;
const unitName = (u: string) =>
  u.toLowerCase().replace(/^feet$/, 'foot').replace(/^inches$/, 'inch').replace(/s$/, '');

describe('grade 2 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_2_MD_AUTHORED, md);
  });

  // Fix 1 (whole-branch review, Important): see authored.oa.test.ts.
  it('keeps every prompt readable for a seven-year-old', () => {
    assertGradeTwoReadable(GRADE_2_MD_AUTHORED, { allowlist: GRADE_2_VOCAB_ALLOWLIST });
  });

  // Ruling 21-2: the separator after the grade prefix is a HYPHEN, and the
  // middle is the standard's own tail, so g2-md10-01 belongs to NC.2.MD.10.
  it('names every item g2-md<tail>-NN after its own standard', () => {
    for (const q of GRADE_2_MD_AUTHORED) {
      const tail = q.standardCode.split('.').slice(2).join('').toLowerCase();
      expect(q.id, `${q.id} is filed under ${q.standardCode}`).toMatch(
        new RegExp(`^g2-${tail}-\\d{2}$`),
      );
    }
  });

  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_2_MD_AUTHORED, mdTemplates);
  });

  it('gives every standard a mastery item and one above mastery', () => {
    for (const s of md.standards) {
      const mine = itemsFor(s.code);
      expect(mine.some((q) => q.difficulty === 'mastery'), `${s.code} has no mastery item`).toBe(
        true,
      );
      expect(
        mine.some((q) => q.difficulty === 'advanced' || q.difficulty === 'stretch'),
        `${s.code} has no item above mastery`,
      ).toBe(true);
    }
  });

  // Distinct text is not distinct amounts, and the shared numeric guard in
  // the testkit cannot read "35¢". So each item's options are either all
  // quantities this file can read — numbers, cents, or dollars — or none of
  // them, and no two readable options name the same amount.
  it('leaves no item half-guarded, and never offers one amount twice', () => {
    for (const q of GRADE_2_MD_AUTHORED) {
      const readable = q.options.filter(
        (o) => numericValue(o.text) !== null || centsOf(o.text) !== null,
      );
      expect(
        readable.length === 0 || readable.length === 4,
        `${q.id}: ${readable.length} of 4 options read as amounts, so the rest are compared by text only`,
      ).toBe(true);
      const money = q.options.map((o) => centsOf(o.text)).filter((v): v is number => v !== null);
      expect(new Set(money).size, `${q.id} offers one amount twice`).toBe(money.length);
    }
  });

  // ── Ruling 19-1 ──────────────────────────────────────────────────────────
  // MD.6 is the NUMBER LINE, MD.7 is TIME, MD.8 is MONEY. The brief cycled
  // all three by one, and every other test here would still pass if a clock
  // item were filed under MD.6: the code exists and belongs to the grade. So
  // the topic of every question — authored AND generated — is read off its
  // own text and checked against the code it is filed under, both ways.
  it('files every clock, coin and number-line question under its own code', () => {
    for (const q of [...authored, ...generated]) {
      const text = shown(q);
      if (TIME_TOPIC.test(text)) {
        expect(q.standardCode, `${q.where} is about time`).toBe('NC.2.MD.7');
      }
      if (MONEY_TOPIC.test(text)) {
        expect(q.standardCode, `${q.where} is about money`).toBe('NC.2.MD.8');
      }
      if (/number line/i.test(text)) {
        expect(q.standardCode, `${q.where} is about the number line`).toBe('NC.2.MD.6');
      }
    }
  });

  it('keeps each of MD.6, MD.7 and MD.8 on its own topic', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode === 'NC.2.MD.6') {
        expect(asked(q), `${q.where} is filed as the number line`).toMatch(/number line/i);
      }
      if (q.standardCode === 'NC.2.MD.7') {
        expect(key(q), `${q.where} is filed as time`).toMatch(/^\d{1,2}:\d{2} [ap]\.m\.$/);
      }
      if (q.standardCode === 'NC.2.MD.8') {
        expect(asked(q), `${q.where} is filed as money`).toMatch(MONEY_TOPIC);
      }
    }
  });

  it('has a time generator under MD.7 and a money generator under MD.8', () => {
    const codes = new Set(mdTemplates.map((t) => t.standardCode));
    for (const code of ['NC.2.MD.1', 'NC.2.MD.2', 'NC.2.MD.5', 'NC.2.MD.7', 'NC.2.MD.8', 'NC.2.MD.10']) {
      expect(codes.has(code as StandardCode), `no generator for ${code}`).toBe(true);
    }
  });

  // ── Ruling 19-2 ──────────────────────────────────────────────────────────
  // MD.2 is ONE object measured TWICE with units of different lengths. Three
  // ruler-reading items filed as MD.2 would clear every other test.
  it('measures the same object twice in every NC.2.MD.2 item', () => {
    const two = itemsFor('NC.2.MD.2');
    expect(two.length).toBeGreaterThanOrEqual(3);
    for (const q of two) {
      expect(q.prompt, `${q.id} does not measure one object twice`).toMatch(/\bthe same\b/);
      expect(
        q.options.some((o) => o.misconception === 'expected-a-longer-unit-to-give-a-bigger-count'),
        `${q.id} never offers the inverse-relationship error`,
      ).toBe(true);
    }
  });

  // ── Ruling 19-3 ──────────────────────────────────────────────────────────
  // NC Grade 2 is bi-systemic. NC.2.MD.3's keyConcepts are "estimating in
  // inches, feet, and yards" and "estimating in centimeters and meters", so an
  // MD.3 estimate is KEYED in each of the five units. This reads the correct
  // option only: a unit that appears solely as a rejected option, or in an
  // MD.1 tool name like "a centimeter ruler", does not count as estimating in
  // it.
  it('keys an MD.3 estimate in each of inches, feet, yards, centimeters and meters', () => {
    const keyed = new Set(
      itemsFor('NC.2.MD.3').flatMap((q) =>
        [...key({ ...q, where: q.id }).matchAll(LENGTH_UNIT)].map((m) => unitName(m[1])),
      ),
    );
    for (const unit of ['inch', 'foot', 'yard', 'centimeter', 'meter']) {
      expect(keyed.has(unit), `no MD.3 estimate is keyed in ${unit}`).toBe(true);
    }
  });

  // MD.4 expresses the difference "in terms of a standard length unit", and
  // MD.5's lengths are "given in the same units". The question itself names
  // one unit; a distractor may still mislabel it, which is the error it names.
  it('asks every MD.4 and MD.5 question in a single length unit', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode !== 'NC.2.MD.4' && q.standardCode !== 'NC.2.MD.5') continue;
      const units = new Set([...asked(q).matchAll(LENGTH_UNIT)].map((m) => unitName(m[1])));
      expect(units.size, `${q.where} names ${[...units].join(', ')}`).toBe(1);
    }
  });

  it('keeps MD.5 and MD.6 within 100', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode !== 'NC.2.MD.5' && q.standardCode !== 'NC.2.MD.6') continue;
      for (const n of (asked(q).match(/\d+/g) ?? []).map(Number)) {
        expect(n, `${q.where} prints ${n}`).toBeLessThanOrEqual(100);
      }
      const answer = key(q).match(/\d+/g) ?? [];
      for (const n of answer.map(Number)) {
        expect(n, `${q.where} answers ${n}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('writes a symbol for the unknown in every authored MD.5 item', () => {
    for (const q of itemsFor('NC.2.MD.5')) {
      expect(shown({ ...q, where: q.id }), `${q.id} has no equation with a ☐`).toMatch(/☐/);
    }
  });

  // "To the nearest five minutes, using a.m. and p.m." — the time asked for
  // is on a five-minute mark and every key carries a.m. or p.m. A distractor
  // may name another minute, because reading the 3 as 3 minutes is the error.
  it('keys every MD.7 question on a five-minute time with a.m. or p.m.', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode !== 'NC.2.MD.7') continue;
      const m = /^(\d{1,2}):(\d{2}) [ap]\.m\.$/.exec(key(q));
      expect(m, `${q.where}: key "${key(q)}" has no a.m. or p.m.`).not.toBe(null);
      expect(Number(m![2]) % 5, `${q.where}: ${key(q)}`).toBe(0);
      expect(Number(m![1]), `${q.where}: ${key(q)}`).toBeGreaterThanOrEqual(1);
      expect(Number(m![1]), `${q.where}: ${key(q)}`).toBeLessThanOrEqual(12);
    }
  });

  // The generator draws only :35 to :55. A standard titled "to five minutes"
  // needs at least one reading at a five-minute mark that is neither on the
  // hour, a quarter, nor a half — :05, :10, :20 or :25 — and only the
  // authored items can supply it.
  it('keys an authored MD.7 item on a five-minute mark that is not a quarter or half', () => {
    const minutes = itemsFor('NC.2.MD.7').map((q) =>
      Number(/:(\d{2}) /.exec(key({ ...q, where: q.id }))![1]),
    );
    expect(
      minutes.some((m) => [5, 10, 20, 25].includes(m)),
      `authored MD.7 keys only :${minutes.join(', :')}`,
    ).toBe(true);
  });

  // "Quarters, dimes, nickels, and pennies within 99¢, using ¢" and "whole
  // dollar amounts, using the $ symbol". A question is one or the other,
  // never $1.25, and never both in the same question.
  it('asks every MD.8 question in cents within 99¢ or in whole dollars, never both', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode !== 'NC.2.MD.8') continue;
      const text = asked(q);
      // A question in cents prints ¢ or names coins; one in dollars prints $.
      const inCents = /¢/.test(text) || COIN_WORD.test(text);
      const inDollars = /\$/.test(text);
      expect(inCents && inDollars, `${q.where} mixes cents and dollars`).toBe(false);
      expect(inCents || inDollars, `${q.where} is in neither cents nor dollars`).toBe(true);
      expect(shown(q), `${q.where} writes dollars and cents together`).not.toMatch(
        /\$\d+\.\d|\d+\.\d+¢/,
      );
      for (const m of text.matchAll(/(\d+)¢/g)) {
        expect(Number(m[1]), `${q.where} prints ${m[0]}`).toBeLessThanOrEqual(99);
      }
      const k = key(q);
      if (inCents) {
        expect(k, `${q.where}: a cents question keyed in dollars`).toMatch(/^\d+¢$/);
        expect(Number(k.slice(0, -1)), `${q.where}: ${k}`).toBeLessThanOrEqual(99);
      } else {
        expect(k, `${q.where}: a dollars question keyed in cents`).toMatch(/^\$\d+$/);
      }
    }
  });

  // "Data with up to four categories" on "a single-unit scale". NC Grade 2
  // has no line plots at all: NC.2.MD.9 does not exist in NC.
  it('keeps every MD.10 graph to four categories on a scale of one', () => {
    for (const q of [...authored, ...generated]) {
      if (q.standardCode !== 'NC.2.MD.10') continue;
      const figure = q.promptDetails ?? '';
      const categories = figure.match(/\b[A-Z][a-z]+(?: [a-z]+)?:/g) ?? [];
      expect(categories.length, `${q.where} has ${categories.length} categories`).toBeGreaterThan(0);
      expect(categories.length, `${q.where} has ${categories.length} categories`).toBeLessThanOrEqual(4);
      expect(figure, `${q.where} states no single-unit scale`).toMatch(
        /counts by ones|stands for 1\b|tally marks?/,
      );
    }
    for (const q of [...authored, ...generated]) {
      expect(shown(q), `${q.where} reaches for a line plot`).not.toMatch(/line plot/i);
    }
  });

  // ── Ruling 19-4 ──────────────────────────────────────────────────────────
  // "Organize, REPRESENT, and interpret." At least one item gives the data
  // and asks which graph shows it; the interpreting half covers put-together,
  // take-apart and compare, the three problem types the keyConcept names.
  it('covers representing data as well as reading it for NC.2.MD.10', () => {
    const ten = itemsFor('NC.2.MD.10');
    expect(
      ten.some((q) => q.options.every((o) => /bar to \d+/.test(o.text))),
      'no item asks which graph shows a data set',
    ).toBe(true);
    expect(ten.some((q) => /\bin all\b|\baltogether\b/i.test(q.prompt)), 'no put-together item').toBe(true);
    expect(ten.some((q) => /\bmissing\b/i.test(q.prompt)), 'no take-apart item').toBe(true);
    expect(
      ten.some((q) => /\bhow many (?:more|fewer)\b/i.test(q.prompt)),
      'no compare item',
    ).toBe(true);
  });

  // ── Ruling 19-5 ──────────────────────────────────────────────────────────
  it('offers candidate equations with a symbol for the unknown in an MD.5 item', () => {
    expect(
      itemsFor('NC.2.MD.5').some((q) => q.options.every((o) => /☐/.test(o.text) && /=/.test(o.text))),
      'no MD.5 item asks for the equation that represents the problem',
    ).toBe(true);
  });

  it('names the errors ruling 19-5 adds for MD.2, MD.5 and MD.6', () => {
    const tagsOf = (code: string) =>
      new Set(
        [...authored, ...generated]
          .filter((q) => q.standardCode === code)
          .flatMap((q) => q.options.map((o) => o.misconception)),
      );
    expect(tagsOf('NC.2.MD.2').has('expected-a-longer-unit-to-give-a-bigger-count')).toBe(true);
    expect(tagsOf('NC.2.MD.5').has('added-instead-of-subtracted')).toBe(true);
    expect(tagsOf('NC.2.MD.5').has('subtracted-instead-of-added')).toBe(true);
    expect(tagsOf('NC.2.MD.5').has('restated-a-known-number-instead-of-solving')).toBe(true);
    expect(tagsOf('NC.2.MD.6').has('counted-the-number-line-marks-not-the-jumps')).toBe(true);
  });

  // The brief's named errors, each placed on the standard it belongs to.
  it('names every Grade 2 measurement error the brief lists', () => {
    const tagsOf = (code: string) =>
      new Set(
        [...authored, ...generated]
          .filter((q) => q.standardCode === code)
          .flatMap((q) => q.options.map((o) => o.misconception)),
      );
    expect(tagsOf('NC.2.MD.1').has('read-the-end-mark-without-starting-at-zero')).toBe(true);
    expect(tagsOf('NC.2.MD.1').has('counted-the-ruler-marks-not-the-spaces')).toBe(true);
    expect(tagsOf('NC.2.MD.7').has('swapped-the-hour-and-minute-hands')).toBe(true);
    expect(tagsOf('NC.2.MD.8').has('counted-the-coins-not-their-value')).toBe(true);
    expect(tagsOf('NC.2.MD.3').has('chose-a-unit-of-the-wrong-size')).toBe(true);
  });
});
