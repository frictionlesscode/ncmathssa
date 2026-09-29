import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  /** Plural noun for the thing being measured. */
  thing: string;
  /** Adjective for the shorter one, then the longer one. */
  small: string;
  large: string;
  unit: string;
  /** Adjective used in the question, e.g. "long" in "how long". */
  measure: string;
}

const CONTEXTS: Context[] = [
  { thing: 'climbing rope', small: 'blue', large: 'red', unit: 'feet', measure: 'long' },
  { thing: 'ribbon', small: 'green', large: 'yellow', unit: 'inches', measure: 'long' },
  { thing: 'garden path', small: 'gravel', large: 'brick', unit: 'meters', measure: 'long' },
  { thing: 'bookshelf', small: 'oak', large: 'pine', unit: 'centimeters', measure: 'tall' },
];

const FACTORS = [2, 3, 4, 5, 6, 7, 8, 9];

/**
 * The four option values, written in terms of the given length b = 10t + u and
 * the comparison factor k, with c = floor(u*k / 10) the carry out of the ones
 * column:
 *
 *   A (answer)                  = b * k
 *   B (confused-times-with-more)= b + k
 *   C (divided-instead-of-mult) = b / k          [whole, because b = k * m]
 *   D (added-carry-before-mult) = 10*((t + c)*k) + (u*k mod 10)
 *
 * Every pair is checked for collision, and exactly one exclusion falls out:
 *
 *   A = B  =>  b(k - 1) = k  =>  b = k/(k-1) <= 2, and b >= 10. Never.
 *   A = C  =>  k^2 = 1. Never.
 *   A = D  =>  t*k + c = (t + c)*k = t*k + c*k  =>  c(k - 1) = 0  =>  c = 0.
 *              EXCLUDED by requiring u*k >= 10, i.e. a real carry exists.
 *   B = C  =>  k*m + k = m  =>  m(k - 1) = -k, negative. Never.
 *   B = D  =>  D >= 10k(t + 1) >= 20t + 20 and B = 10t + u + k <= 10t + 18,
 *              so D > B for every t >= 0. Never.
 *   C = D  =>  C = b/k <= (10t + 9)/k and D >= 10k(t + 1); multiplying through
 *              by k gives 10k^2 t + 10k^2 > 10t + 9 for every k >= 2, so
 *              D > C. Never.
 *
 * So the single admissibility rule is (b mod 10) * k >= 10. It is applied by
 * construction below — the multiplier list for a given k is filtered once, and
 * a value is picked from what survives. Nothing is resampled.
 *
 * Every k in 2..9 keeps at least eight admissible multipliers, so the filtered
 * list is never empty.
 *
 * An exhaustive sweep of all 97 admissible (k, m) combinations finds no
 * collision; unconstrained, 67 of the 164 possible combinations collide. The
 * parameter space is small enough to check in full, so the 300-seed property
 * test is a regression guard rather than the argument.
 *
 * The four CONTEXTS multiply the surface but not the algebra: the option
 * VALUES depend only on (k, m), so a context never creates or removes a
 * collision. Note also that b is always two digits here, which is what keeps
 * the authored item g4-oa1-01 (three digits) out of this generator's reachable
 * output — authored and generated items carry different review keys, so a
 * question reachable both ways would reach a child twice under two identities.
 */
function admissibleMultipliers(k: number): number[] {
  const out: number[] = [];
  for (let m = 2; m * k <= 99; m++) {
    const b = m * k;
    if (b < 10) continue;
    if ((b % 10) * k >= 10) out.push(m);
  }
  return out;
}

/** Precomputed once so the filter is not rerun on every generate() call. */
const MULTIPLIERS: Record<number, number[]> = Object.fromEntries(
  FACTORS.map((k) => [k, admissibleMultipliers(k)]),
);

/**
 * NC.4.OA.1 — multiplicative comparison, unknown product.
 *
 * The standard's own language is the item: "k times as long as" must be read
 * multiplicatively, and the two headline distractors are the two ways a
 * student reads it wrong — additively (b + k) and in reverse (b / k). The
 * fourth is procedural rather than conceptual, so a student who sets the
 * comparison up correctly can still be caught by the carry, which is exactly
 * the diagnosis that item should produce.
 */
export const oa1TimesAsMany: QuestionTemplate = {
  id: 'g4.oa1.times-as-many',
  standardCode: 'NC.4.OA.1',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const k = rng.pick(FACTORS);
    const m = rng.pick(MULTIPLIERS[k]);

    const b = k * m;
    const t = Math.floor(b / 10);
    const u = b % 10;
    const carry = Math.floor((u * k) / 10);

    const product = b * k;
    const addedInstead = b + k;
    const dividedInstead = m;
    const carryBefore = 10 * ((t + carry) * k) + ((u * k) % 10);

    const answerText = `${product} ${ctx.unit}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // b + k: "k times as long" read as "k units longer than".
      {
        text: `${addedInstead} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'confused-times-with-more',
      },
      // b / k: compared by dividing, even though the given object is the
      // shorter one and is being scaled up.
      {
        text: `${dividedInstead} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'divided-instead-of-multiplied',
      },
      // The carry out of the ones column was added to the tens digit before
      // that digit was multiplied, instead of after.
      {
        text: `${carryBefore} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'added-carry-before-multiplying',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.oa1.times-as-many: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt:
        `The ${ctx.small} ${ctx.thing} is ${b} ${ctx.unit} ${ctx.measure}. ` +
        `The ${ctx.large} ${ctx.thing} is ${k} times as ${ctx.measure} as the ${ctx.small} ${ctx.thing}. ` +
        `How ${ctx.measure} is the ${ctx.large} ${ctx.thing}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: "${k} times as ${ctx.measure}" is a multiplicative comparison, so the ${b} ${ctx.unit} is multiplied by ${k}.`,
          `Step 2: Write the comparison with a symbol for the unknown: n = ${k} × ${b}.`,
          `Step 3: ${k} × ${b} = ${k} × ${t * 10} + ${k} × ${u} = ${k * t * 10} + ${k * u} = ${product}.`,
          `Step 4: The ${ctx.large} ${ctx.thing} is ${answerText} ${ctx.measure}.`,
        ],
        conceptSummary:
          '"Times as many" scales a quantity by a factor; "more than" adds to it. Telling those two comparisons apart before choosing an operation is what NC.4.OA.1 asks for.',
        commonMisconception:
          `Reading "${k} times as ${ctx.measure}" as "${k} ${ctx.unit} ${ctx.measure}er" turns the multiplication into an addition and gives ${addedInstead} instead of ${product}.`,
      },
    };
  },
};
