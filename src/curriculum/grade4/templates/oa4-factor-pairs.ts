import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** Every factor pair a × b of n with a <= b, in ascending order of a. */
function factorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) {
    if (n % a === 0) pairs.push([a, n / a]);
  }
  return pairs;
}

const render = (pairs: [number, number][]): string =>
  pairs.map(([a, b]) => `${a} × ${b}`).join(', ');

/**
 * The smallest whole number from 2 to 9 that does NOT divide n but still fits
 * inside it at least twice. It is the divisor a student is most likely to try
 * next, get a remainder from, and record anyway.
 */
function firstNonDivisor(n: number): number {
  for (let d = 2; d <= 9; d++) {
    if (n % d !== 0 && Math.floor(n / d) >= 2) return d;
  }
  throw new Error(`no non-divisor in 2..9 for ${n}`);
}

/**
 * NC.4.OA.4 — all factor pairs of a whole number up to and including 50.
 *
 * The four options are four LISTS, and the distinctness argument is structural
 * rather than numeric, so no algebra over the parameters is needed:
 *
 *   A (answer)      = the complete list, P entries.
 *   B (stopped)     = A with its last pair removed, P - 1 entries. A strict
 *                     prefix of A, so it can never render as the same string.
 *   C (remainder)   = A with one bogus pair d × floor(n/d) added, P + 1
 *                     entries. Its extra entry can never coincide with a real
 *                     pair: a real pair's first factor divides n and d does
 *                     not, by the definition of firstNonDivisor.
 *   D (multiples)   = "n, 2n, 3n, 4n" — no "×" anywhere, so it cannot match
 *                     any of the other three at any seed.
 *
 * Lengths P - 1, P and P + 1 are pairwise different, which settles A/B/C, and
 * the format settles D. The one thing that could break it is P being too
 * small, so the candidate pool is filtered by construction to numbers with at
 * least three factor pairs — B then always keeps at least two entries and is
 * never the empty string. Nothing is resampled.
 *
 * The upper bound of 50 is the standard's own: "Find all factor pairs for
 * whole numbers up to and including 50."
 *
 * An exhaustive sweep of the admissible pool — all 15 numbers that survive the
 * filter (12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50) — finds
 * no collision. The pool is small enough to check in full, so the 300-seed
 * property test is a regression guard rather than the argument.
 *
 * 49 is absent from that pool (two factor pairs, not three), and the authored
 * item g4-oa4-02 uses 49 for exactly that reason: authored and generated items
 * carry different review keys, so a question reachable both ways would reach a
 * child twice under two identities.
 */
const CANDIDATES: number[] = (() => {
  const out: number[] = [];
  for (let n = 12; n <= 50; n++) {
    if (factorPairs(n).length >= 3) out.push(n);
  }
  return out;
})();

export const oa4FactorPairs: QuestionTemplate = {
  id: 'g4.oa4.factor-pairs',
  standardCode: 'NC.4.OA.4',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const n = rng.pick(CANDIDATES);
    const pairs = factorPairs(n);
    const last = pairs[pairs.length - 1];

    const d = firstNonDivisor(n);
    const q = Math.floor(n / d);
    const remainder = n - d * q;
    const withBogus = [...pairs, [d, q] as [number, number]].sort((x, y) => x[0] - y[0]);

    const answerText = render(pairs);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The divisor search stopped one step early, so the pair a × b with the
      // largest a was never found.
      {
        text: render(pairs.slice(0, -1)),
        isCorrect: false,
        misconception: 'stopped-the-divisor-check-early',
      },
      // n ÷ d leaves a remainder, but the leftover was dropped and d × q was
      // written down as if the division had come out even.
      {
        text: render(withBogus),
        isCorrect: false,
        misconception: 'counted-an-uneven-division-as-a-factor',
      },
      // The first multiples of n, listed where its factors were asked for:
      // the two ends of the factor/multiple relationship swapped.
      {
        text: `${n}, ${2 * n}, ${3 * n}, ${4 * n}`,
        isCorrect: false,
        misconception: 'confused-factor-with-multiple',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.oa4.factor-pairs: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which list shows ALL of the factor pairs of ${n}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Test whole numbers in order to see which ones divide ${n} evenly, starting with 1 × ${n}.`,
          `Step 2: ${d} is not a factor: ${n} ÷ ${d} is ${q} with ${remainder} left over, so ${d} × ${q} is not a pair.`,
          `Step 3: The largest pair before the factors start repeating in the other order is ${last[0]} × ${last[1]}.`,
          `Step 4: All of the factor pairs of ${n} are ${answerText}.`,
        ],
        conceptSummary:
          'Testing divisors in order is what guarantees no pair is missed, and the search can stop once a pair would repeat one already found in the other order.',
        commonMisconception:
          'A division that leaves anything over does not give a factor pair; the two numbers have to multiply back to exactly the number you started with.',
      },
    };
  },
};
