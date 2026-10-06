import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_OA_AUTHORED } from './authored.oa';
import { GRADE_1_TEMPLATES } from './templates';
import { evaluate, holds, solutions } from './equations.testkit';

const oa = GRADE_1_DOMAINS.find((d) => d.id === 'OA')!;
const itemsFor = (code: string) => GRADE_1_OA_AUTHORED.filter((q) => q.standardCode === code);
const correctText = (q: (typeof GRADE_1_OA_AUTHORED)[number]) => q.options.find((o) => o.isCorrect)!.text;
const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe('grade 1 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_1_OA_AUTHORED, oa);
  });

  // Ruling 22-7 / E.3: one shared guard, not a local copy of the numbers.
  it('keeps every prompt readable for a six-year-old', () => {
    assertGradeOneReadable(GRADE_1_OA_AUTHORED);
  });

  // The Content Contract asks this per STANDARD; the kit only checks the bank.
  it('gives every standard a mastery item and an advanced item', () => {
    for (const s of oa.standards) {
      const levels = new Set(itemsFor(s.code).map((q) => q.difficulty));
      expect(levels.has('mastery'), `${s.code} has no mastery item`).toBe(true);
      expect(levels.has('advanced'), `${s.code} has no advanced item`).toBe(true);
    }
  });

  it('keeps every number in every prompt within 20', () => {
    for (const q of GRADE_1_OA_AUTHORED) {
      for (const n of numbersIn(q.prompt)) {
        expect(n, `${q.id}: ${n} is outside Grade 1's range`).toBeLessThanOrEqual(20);
      }
    }
  });

  it('is never reproduced word for word by a Grade 1 OA generator', () => {
    assertNoGeneratorDuplicatesAuthored(
      GRADE_1_OA_AUTHORED,
      GRADE_1_TEMPLATES.filter((t) => t.domainId === 'OA'),
    );
  });

  // Solving every item cold, mechanically. Wherever the question is an
  // equation, a sum, or a choice between expressions, the keyed answer is
  // recomputed from the question itself and must be the ONLY option that
  // works.
  it('keys the one option that actually solves each computable item', () => {
    let checked = 0;
    for (const q of GRADE_1_OA_AUTHORED) {
      const key = correctText(q);
      const box = [...q.prompt.matchAll(/(?:\d+|☐)(?: [+−=] (?:\d+|☐))+/g)]
        .map((m) => m[0])
        .find((eq) => eq.includes('☐') && eq.includes('='));
      const whatIs = /What is (\d+ [+−] \d+)\?/.exec(q.prompt);
      const sameAs = /Which is the same as (.+)\?$/.exec(q.prompt);
      if (box) {
        expect(solutions(box), `${q.id}`).toEqual([Number(key)]);
      } else if (whatIs) {
        expect(evaluate(whatIs[1]), `${q.id}`).toBe(Number(key));
      } else if (sameAs) {
        const target = evaluate(sameAs[1]);
        const equal = q.options.filter((o) => evaluate(o.text) === target).map((o) => o.text);
        expect(equal, `${q.id}`).toEqual([key]);
      } else if (q.prompt === 'Which equation is true?') {
        const trueOnes = q.options.filter((o) => holds(o.text)).map((o) => o.text);
        expect(trueOnes, `${q.id}`).toEqual([key]);
      } else {
        continue;
      }
      checked++;
    }
    // LITERAL: the count of items the solver can read. A prompt reworded out
    // of these shapes drops out of the check, and this number says so.
    expect(checked).toBe(18);
  });

  // Ruling 22-2: the three named problem types ARE the standard.
  it('gives NC.1.OA.1 one item of each named problem type', () => {
    const prompts = itemsFor('NC.1.OA.1').map((q) => q.prompt);
    expect(prompts.some((p) => /had \d+ [a-z]+ and now has \d+\. How many did [a-z]+ eat\?/.test(p)), 'Take from, Change Unknown').toBe(true);
    expect(prompts.some((p) => /some red and some blue/.test(p)), 'Take Apart, Addend Unknown').toBe(true);
    expect(prompts.some((p) => /How many more .+ than/.test(p)), 'Compare, Difference Unknown').toBe(true);
  });

  // Review finding M6: NC.1.OA.1 is solved "using ... equations with a symbol
  // for the unknown number", so every worked solution writes one — and it has
  // to be an equation whose only solution is the key.
  it('writes a ☐ equation in every NC.1.OA.1 worked solution, solved by the key', () => {
    for (const q of itemsFor('NC.1.OA.1')) {
      const step = q.explanation.stepByStep.find((st) => /Write it as .+☐/.test(st));
      expect(step, `${q.id} never writes its equation`).toBeDefined();
      const equation = /Write it as ([\d ☐+−=]+)\./.exec(step!)![1];
      expect(solutions(equation), `${q.id}: ${equation}`).toEqual([Number(correctText(q))]);
    }
  });

  // Ruling 22-3: three addends, sum at most 20, and the key is that sum.
  it('gives every NC.1.OA.2 item three addends that sum to 20 or less', () => {
    for (const q of itemsFor('NC.1.OA.2')) {
      const addends = numbersIn(q.prompt);
      expect(addends.length, `${q.id}`).toBe(3);
      const sum = addends.reduce((a, b) => a + b, 0);
      expect(sum, `${q.id}`).toBeLessThanOrEqual(20);
      expect(Number(correctText(q)), `${q.id}`).toBe(sum);
    }
  });

  // Ruling 22-5: the associative half needs three addends, and the source
  // says strategy, "not just naming them".
  it('regroups three addends in NC.1.OA.3 and never asks for a property by name', () => {
    const items = itemsFor('NC.1.OA.3');
    expect(items.some((q) => (q.prompt.match(/\+/g) ?? []).length >= 2 && numbersIn(q.prompt).length === 3)).toBe(true);
    for (const q of items) {
      const text = [q.prompt, ...q.options.map((o) => o.text)].join(' ');
      expect(text, `${q.id}`).not.toMatch(/commutative|associative|property|order rule|grouping rule/i);
    }
  });

  // Ruling 22-8: unknown addend within 20.
  it('keeps every NC.1.OA.4 unknown addend within 20', () => {
    for (const q of itemsFor('NC.1.OA.4')) {
      expect(Number(correctText(q)), `${q.id}`).toBeLessThanOrEqual(20);
    }
  });

  // Review finding I1: NC.1.OA.4's second keyConcept, "Rewriting an
  // unknown-addend problem as a subtraction problem". The item has to START
  // as an unknown addend (K + ☐ = W) and be solved as W − K — the other way
  // round is NC.1.OA.6's addition-and-subtraction link, not this standard.
  it('rewrites an NC.1.OA.4 unknown addend as a take-away', () => {
    const rewrites = itemsFor('NC.1.OA.4').filter((q) => {
      const m = /(\d+) \+ ☐ = (\d+)/.exec(q.prompt);
      if (!m) return false;
      const [known, whole] = [m[1], m[2]];
      return q.explanation.stepByStep.some((st) => /take-away/.test(st) && st.includes(`${whole} − ${known}`));
    });
    expect(rewrites.map((q) => q.id)).toEqual(['g1-oa4-01']);
  });

  // Ruling 22-4: the standard IS its strategies, so each explanation names the
  // one it uses, in the words of the sourced keyConcepts.
  it('names a strategy in every NC.1.OA.6 explanation, including making ten and counting on', () => {
    const STRATEGY = /\b(?:counting on|making ten|get to 10|think addition|doubles fact|number line)\b/i;
    const items = itemsFor('NC.1.OA.6');
    for (const q of items) {
      expect(q.explanation.stepByStep.join(' '), `${q.id} names no strategy`).toMatch(STRATEGY);
    }
    const all = items.map((q) => q.explanation.stepByStep.join(' ')).join(' ');
    expect(all).toMatch(/\bmaking ten\b/i);
    expect(all).toMatch(/\bcounting on\b/i);
  });

  it('keeps NC.1.OA.9 inside 10', () => {
    for (const q of itemsFor('NC.1.OA.9')) {
      for (const n of numbersIn(q.prompt)) expect(n, `${q.id}`).toBeLessThanOrEqual(10);
    }
  });

  // Ruling 22-6: a true/false standard asked as four candidate equations.
  it('asks NC.1.OA.7 as "Which equation is true?" with four equations', () => {
    const shaped = itemsFor('NC.1.OA.7').filter((q) => q.prompt === 'Which equation is true?');
    expect(shaped.length).toBeGreaterThanOrEqual(3);
    for (const q of shaped) {
      for (const o of q.options) expect(o.text, `${q.id}`).toMatch(/^[\d +−]+=[\d +−]+$/);
    }
  });

  // Review finding M5: "9 = 5 + 4" was the only option written answer-first,
  // so its shape alone gave it away. The key's shape — how many numbers sit on
  // each side of the equal sign — must be shared by at least one false option.
  it('never keys the only equation of its shape', () => {
    const shapeOf = (eq: string) => eq.split('=').map((side) => side.trim().split(/\s+/).length).join('|');
    for (const q of itemsFor('NC.1.OA.7').filter((i) => i.prompt === 'Which equation is true?')) {
      const key = shapeOf(correctText(q));
      const alike = q.options.filter((o) => !o.isCorrect && shapeOf(o.text) === key);
      expect(alike.length, `${q.id}: no false option shaped like the key (${key})`).toBeGreaterThan(0);
    }
  });

  // Review finding M4. A counting slip always lands next to the key, so every
  // item offering one puts the key in a ±1 pair; before this fix the key sat
  // in the ONLY ±1 pair in 20 of 21 numeric items, and was the LOWER of it in
  // 14. A child who learned "pick the lower of the two neighbours" scored 68%
  // on the numeric half of the bank. The slips are now spread across counting
  // the start number, stopping short and counting one too many, and several
  // items put another honest error beside the slip or offer none at all.
  it('does not key the numeric items by answer shape', () => {
    let numeric = 0;
    let lower = 0;
    let upper = 0;
    for (const q of GRADE_1_OA_AUTHORED) {
      if (!q.options.every((o) => /^\d+$/.test(o.text))) continue;
      numeric++;
      const values = q.options.map((o) => Number(o.text)).sort((a, b) => a - b);
      const key = Number(correctText(q));
      const pairs = values.slice(1).map((v, i) => [values[i], v]).filter(([a, b]) => b - a === 1);
      if (pairs.length !== 1) continue;
      if (pairs[0][0] === key) lower++;
      if (pairs[0][1] === key) upper++;
    }
    // Lower and upper within one of each other, so "pick the lower" or "pick
    // the upper" of a lone ±1 pair does no better than a coin toss on it...
    expect(Math.abs(lower - upper), `lower ${lower}, upper ${upper}`).toBeLessThanOrEqual(1);
    // ...and the key sits in a lone ±1 pair in at most 3 numeric items in 5.
    expect(lower + upper, `${lower + upper} of ${numeric} keyed in a lone ±1 pair`).toBeLessThanOrEqual(
      Math.floor((3 * numeric) / 5),
    );
  });
});
