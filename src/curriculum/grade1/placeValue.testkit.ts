import { expect } from 'vitest';
import type { Explanation } from '../../engine/questionModel';
import { evaluate } from './equations.testkit';

/**
 * Truth checks for the child-facing sentences of Grade 1 Base Ten content,
 * for TESTS.
 *
 * A worked solution that says "4 tens is 40" or "8 + 6 = 14" is making a
 * claim a six-year-old will copy, and a template makes that claim at every
 * seed it can draw. Rebuilding the template's own sentence in a test proves
 * nothing, so these read the sentences BACK and check them against arithmetic
 * instead: whatever the sentence says, it has to be true.
 *
 * One copy, shared by `authored.nbt.test.ts` and every NBT template test, so
 * the checks cannot drift apart (the reason `equations.testkit.ts` exists).
 */

/** Every sentence of a worked explanation, in one list. */
export function explanationTexts(e: Explanation): string[] {
  return [...e.stepByStep, e.conceptSummary, e.commonMisconception ?? ''];
}

/**
 * "1 ten", "4 tens", "1 one", "0 ones". A child reads "1 tens" as a mistake,
 * and so does their parent.
 */
export function assertCountWordsAgree(texts: string[], where: string): void {
  for (const text of texts) {
    expect(text, `${where}: "1 tens" or "1 ones" in "${text}"`).not.toMatch(/\b1 (?:tens|ones)\b/);
    expect(text, `${where}: a plural count written singular in "${text}"`).not.toMatch(
      /\b(?:0|[2-9]|\d{2,}) (?:ten|one)\b(?!s)/,
    );
  }
}

/**
 * Every place-value or arithmetic claim a sentence makes must be true:
 *
 *   "38 + 6 = 44", "70 − 30 = 40"          the arithmetic
 *   "47 is 4 tens and 7 ones"               the split
 *   "4 tens and 7 ones is 47"               the same split, the other way
 *   "4 tens is 40", "7 ones is 7"           one place on its own
 *   "70 is 7 tens"                          a multiple of 10 as tens
 *
 * Returns how many claims it checked, so a caller can prove it read some.
 */
export function assertStatedArithmeticHolds(texts: string[], where: string): number {
  let checked = 0;
  const check = (ok: boolean, claim: string, text: string) => {
    expect(ok, `${where}: "${claim}" is false, in "${text}"`).toBe(true);
    checked++;
  };
  for (const text of texts) {
    for (const m of text.matchAll(/(\d+(?: [+−] \d+)+) = (\d+)/g)) {
      check(evaluate(m[1]) === Number(m[2]), m[0], text);
    }
    for (const m of text.matchAll(/\b(\d+) is (\d+) tens? and (\d+) ones?\b/g)) {
      check(Number(m[1]) === 10 * Number(m[2]) + Number(m[3]), m[0], text);
    }
    for (const m of text.matchAll(/\b(\d+) tens? and (\d+) ones? is (?:written )?(\d+)\b/g)) {
      check(10 * Number(m[1]) + Number(m[2]) === Number(m[3]), m[0], text);
    }
    // Not after "and": in "5 tens and 6 ones is 56" the "6 ones is 56" is
    // part of the whole split above, not a claim on its own. Not before
    // "ten": "12 ones is 1 ten and 2 ones" is a trade, not "12 ones is 1".
    for (const m of text.matchAll(/(?<!and )\b(\d+) tens? is (\d+)\b(?! (?:tens?|ones?)\b)/g)) {
      check(10 * Number(m[1]) === Number(m[2]), m[0], text);
    }
    for (const m of text.matchAll(/(?<!and )\b(\d+) ones? is (\d+)\b(?! (?:tens?|ones?)\b)/g)) {
      check(Number(m[1]) === Number(m[2]), m[0], text);
    }
    for (const m of text.matchAll(/\b(\d+) is (\d+) tens?\b(?! and)/g)) {
      check(Number(m[1]) === 10 * Number(m[2]), m[0], text);
    }
  }
  return checked;
}
