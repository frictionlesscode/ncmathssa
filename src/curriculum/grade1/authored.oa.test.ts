import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_OA_AUTHORED } from './authored.oa';
import { GRADE_1_TEMPLATES } from './templates';

const oa = GRADE_1_DOMAINS.find((d) => d.id === 'OA')!;
const itemsFor = (code: string) => GRADE_1_OA_AUTHORED.filter((q) => q.standardCode === code);
const correctText = (q: (typeof GRADE_1_OA_AUTHORED)[number]) => q.options.find((o) => o.isCorrect)!.text;
const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

/** Evaluates a Grade 1 expression: whole numbers joined by + and −, nothing
 *  else. Throws on anything it does not recognise, so a typo in an option
 *  cannot quietly evaluate to something. */
function evaluate(expr: string): number {
  const tokens = expr.trim().split(/\s+/);
  if (tokens.length % 2 === 0) throw new Error(`not an expression: "${expr}"`);
  let total = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const n = Number(tokens[i + 1]);
    if (!/^\d+$/.test(tokens[i + 1])) throw new Error(`not a number in "${expr}"`);
    if (tokens[i] === '+') total += n;
    else if (tokens[i] === '−') total -= n;
    else throw new Error(`unknown operator "${tokens[i]}" in "${expr}"`);
  }
  if (!/^\d+$/.test(tokens[0])) throw new Error(`not a number in "${expr}"`);
  return total;
}

/** True if an equation's two sides name the same amount. */
function holds(equation: string): boolean {
  const sides = equation.split('=');
  if (sides.length !== 2) throw new Error(`not an equation: "${equation}"`);
  return evaluate(sides[0]) === evaluate(sides[1]);
}

/** Every whole number 0-40 that makes an equation with one ☐ true. */
function solutions(equation: string): number[] {
  const out: number[] = [];
  for (let n = 0; n <= 40; n++) if (holds(equation.replace('☐', `${n}`))) out.push(n);
  return out;
}

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
    expect(checked).toBe(17);
  });

  // Ruling 22-2: the three named problem types ARE the standard.
  it('gives NC.1.OA.1 one item of each named problem type', () => {
    const prompts = itemsFor('NC.1.OA.1').map((q) => q.prompt);
    expect(prompts.some((p) => /and ate some, so \d+ are left/.test(p)), 'Take from, Change Unknown').toBe(true);
    expect(prompts.some((p) => /some red and some blue/.test(p)), 'Take Apart, Addend Unknown').toBe(true);
    expect(prompts.some((p) => /How many more .+ than/.test(p)), 'Compare, Difference Unknown').toBe(true);
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
});
