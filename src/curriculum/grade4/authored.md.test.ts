import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_MD_AUTHORED } from './authored.md';
import { GRADE_4_TEMPLATES } from './templates';
import { makeRng } from '../../engine/rng';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

/** How many of the smallest unit in each family one of the named unit makes.
 *  Lengths canonicalise to centimetres, masses to grams, capacities to
 *  millilitres. Every unit NC.4.MD.1 names is here and nothing else is. */
const METRIC: Record<string, { family: string; factor: number }> = {
  centimeter: { family: 'length', factor: 1 },
  centimeters: { family: 'length', factor: 1 },
  meter: { family: 'length', factor: 100 },
  meters: { family: 'length', factor: 100 },
  gram: { family: 'mass', factor: 1 },
  grams: { family: 'mass', factor: 1 },
  kilogram: { family: 'mass', factor: 1000 },
  kilograms: { family: 'mass', factor: 1000 },
  milliliter: { family: 'capacity', factor: 1 },
  milliliters: { family: 'capacity', factor: 1 },
  liter: { family: 'capacity', factor: 1000 },
  liters: { family: 'capacity', factor: 1000 },
};

/**
 * The quantity an option names, as a comparable key, or null if the option is
 * prose.
 *
 * This is deliberately STRONGER than the shared kit's numericValue(), which
 * strips the unit word and compares bare numbers. That reading is blind in
 * both directions for a measurement bank: it calls "1.5 kilograms" and
 * "1,500 grams" different (they are one quantity, so an item offering both has
 * two right answers) and it calls "6 meters" and "6 centimeters" the same
 * (they are different lengths, so an item offering both is fine). Metric
 * quantities are therefore converted into one unit per family before they are
 * compared, and quantities from different families never compare equal.
 *
 * Durations and clock times both reduce to minutes so that "1 hour 35 minutes"
 * and "95 minutes" could not sit in one item unnoticed.
 *
 * ONE DELIBERATE EXCEPTION, and it is the reason this returns a key rather
 * than a number: "4:95 p.m." is not a clock time. As an instant it is the same
 * moment as 5:35 p.m., which sits beside it as the key of g4-md8-01, but no
 * clock shows 4:95 — it is exactly the artifact of never trading 60 minutes
 * for an hour, which is the whole of NC.4.MD.8. A reading with 60 or more
 * minutes in it is therefore keyed by its own text, not normalised away.
 */
export function canonicalQuantity(raw: string): string | null {
  const s = raw.trim();

  // "6 meters by 4 meters" — a rectangle, compared as an unordered pair of
  // dimensions so that "4 meters by 6 meters" would be caught as the same pen.
  const rect = /^(\d+) ([a-z]+) by (\d+) ([a-z]+)$/.exec(s);
  if (rect) {
    const a = METRIC[rect[2]];
    const b = METRIC[rect[4]];
    if (!a || !b || a.family !== 'length' || b.family !== 'length') return null;
    const dims = [Number(rect[1]) * a.factor, Number(rect[3]) * b.factor].sort((x, y) => x - y);
    return `rect:${dims[0]}x${dims[1]}`;
  }

  // "4:45 p.m." — minutes since midnight, unless the minutes field is not a
  // real one. Noon and midnight are not among the times this bank uses.
  const clock = /^(\d{1,2}):(\d{2}) ([ap])\.m\.$/.exec(s);
  if (clock) {
    const hh = Number(clock[1]);
    const mm = Number(clock[2]);
    if (mm >= 60) return `literal:${s}`;
    const h24 = clock[3] === 'a' ? hh % 12 : (hh % 12) + 12;
    return `minutes:${h24 * 60 + mm}`;
  }

  // "1 hour 35 minutes" / "45 minutes".
  const hm = /^(\d+) hours? (\d+) minutes?$/.exec(s);
  if (hm) return `minutes:${Number(hm[1]) * 60 + Number(hm[2])}`;
  const mOnly = /^(\d+) minutes?$/.exec(s);
  if (mOnly) return `minutes:${Number(mOnly[1])}`;

  // "700 centimeters", "43 square meters", "85 degrees", "10 students".
  const q = /^([\d,]+(?:\.\d+)?) ([a-z]+(?: [a-z]+)*)$/.exec(s);
  if (!q) return null;
  const value = bare(q[1]);
  const unit = q[2];
  const metric = METRIC[unit];
  if (metric) return `${metric.family}:${value * metric.factor}`;
  // Anything else — square meters, degrees, students, cans — is compared
  // within its own unit word. Nothing in this bank converts between them.
  return `${unit}:${value}`;
}

describe('grade 4 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_4_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_4_MD_AUTHORED, md);
  });

  // The trap this domain sets is a SECOND RIGHT ANSWER hiding behind a unit.
  // The kit's numericValue() cannot see it, so every option is re-parsed into
  // a canonical quantity here and the four are required to be distinct AS
  // QUANTITIES.
  it('never offers one quantity under two labels', () => {
    for (const q of GRADE_4_MD_AUTHORED) {
      const keys = q.options
        .map((o) => canonicalQuantity(o.text))
        .filter((k): k is string => k !== null);
      expect(new Set(keys).size, `${q.id}: two options name one quantity`).toBe(keys.length);
    }
  });

  // An item mixing parseable and unparseable options is silently half-guarded:
  // the prose options would be compared by text alone. Require all-or-nothing,
  // the same rule the NF bank holds itself to.
  it('leaves no item half-guarded', () => {
    for (const q of GRADE_4_MD_AUTHORED) {
      const parsed = q.options.filter((o) => canonicalQuantity(o.text) !== null).length;
      expect(
        parsed === 0 || parsed === 4,
        `${q.id}: ${parsed} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  // Metric only, per the sourced keyConcepts of NC.4.MD.1 and NC.4.MD.2. A
  // customary unit here would be Common Core's grade 4, not North Carolina's.
  it('measures in no unit outside the six the standards name', () => {
    // "cup" is deliberately absent. It is a customary unit of capacity, but it
    // is also an ordinary object, and g4-md1-01 pours a jug into 8 cups - eight
    // containers, not eight times 237 millilitres. Banning the word would fail
    // an item that measures in millilitres throughout.
    const banned =
      /\b(inch|inches|foot|feet|yard|yards|ounce|ounces|pound|pounds|pint|pints|quart|quarts|gallon|gallons|mile|miles|kilometer|kilometers)\b/i;
    for (const q of GRADE_4_MD_AUTHORED) {
      const text = [
        q.prompt,
        q.promptDetails ?? '',
        ...q.options.map((o) => o.text),
        ...q.explanation.stepByStep,
        q.explanation.conceptSummary,
        q.explanation.commonMisconception ?? '',
      ].join(' ');
      expect(banned.test(text), `${q.id} uses a unit outside NC.4.MD.1's six`).toBe(false);
    }
  });

  // NC.4.MD.4 is "represent and interpret data using WHOLE NUMBERS". Common
  // Core's 4.MD.B.4 puts fractional measurements on a line plot; NC does not.
  it('puts no fractional measurement on a data display', () => {
    for (const q of GRADE_4_MD_AUTHORED.filter((x) => x.standardCode === 'NC.4.MD.4')) {
      const text = [q.prompt, q.promptDetails ?? '', ...q.options.map((o) => o.text)].join(' ');
      expect(/\d\s*\/\s*\d|\d\.\d|\bhalf|\bquarter|\beighth/i.test(text), `${q.id}`).toBe(false);
    }
  });

  // Four of the six standards also have a generator. An item a generator can
  // reproduce reaches the scheduler under two review keys - {authored, id} and
  // {generated, templateId} - and a child is served it twice.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_4_MD_AUTHORED, GRADE_4_TEMPLATES);
  });

  // The kit compares PROMPTS. In this domain the figure, the table and the
  // conversion itself live in promptDetails, so two items can carry different
  // stems over identical details and slip past that check as different
  // questions when a child would see the same one twice.
  it('shares no figure or table with the generators', () => {
    const authored = new Set(
      GRADE_4_MD_AUTHORED.map((q) => q.promptDetails?.trim()).filter((d): d is string => !!d),
    );
    for (const t of GRADE_4_TEMPLATES) {
      for (let seed = 0; seed < 2000; seed++) {
        const details = t.generate(makeRng(seed)).promptDetails?.trim();
        if (!details) continue;
        expect(
          authored.has(details),
          `${t.id} at seed ${seed} reproduces an authored item's details: "${details}"`,
        ).toBe(false);
      }
    }
  });
});
