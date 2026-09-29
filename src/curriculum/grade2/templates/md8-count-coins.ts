import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.8 — "Solve word problems involving money." keyConcepts: "Quarters,
 * dimes, nickels, and pennies within 99¢, using ¢ symbols appropriately" and
 * "Whole dollar amounts, using the $ symbol appropriately".
 *
 * RULING 19-1: this is MD.8. The brief filed money under MD.7, which is time.
 *
 * This generator is the COINS half: a child has a handful of coins, named in
 * words, and finds how much money that is. Every amount it prints — the key
 * and every distractor — is a whole number of cents from 1¢ to 99¢, written
 * with ¢ and never with $ (ruling 19-3: coins within 99¢, whole dollars with
 * $, never mixed). The whole-dollar half, and money word problems that go on
 * to spend or compare, are authored in `../authored.md.ts` (g2-md8-01..04).
 * One template, one skill: counting coins by value.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE
 *
 *   q quarters 0..3, d dimes 0..4, n nickels 0..4, p pennies 1..4,
 *   at least one quarter, dime or nickel, and n != d,
 *   keeping all four option values at 99 or below.
 *
 * Coins are counted biggest first — quarters, dimes, nickels, pennies — which
 * is the order the prompt lists them in. Write V for the value and v for the
 * value of the smallest silver coin present (5 if there are nickels, else 10
 * if there are dimes, else 25).
 *
 *   answer                                      V = 25q + 10d + 5n + p
 *   counted-the-coins-not-their-value           C = q + d + n + p
 *   mixed-up-the-values-of-a-nickel-and-a-dime  S = 25q + 5d + 10n + p
 *                                                 = V + 5(n - d)
 *   kept-counting-by-the-last-coins-value       K = V - p + p.v
 *                                                 (the pennies counted on by
 *                                                 the last silver coin's
 *                                                 value)
 *
 * Pairwise distinctness:
 *
 *   V = C  =>  24q + 9d + 4n = 0.        Never: at least one silver coin.
 *   V = S  =>  n = d.                    EXCLUDED.
 *   V = K  =>  p(v - 1) = 0.             Never: p >= 1 and v >= 5.
 *   C = S  =>  24q + 4d + 9n = 0.        Never: at least one silver coin.
 *   C = K  =>  24q + 9d + 4n + p(v - 1) = 0.  Never.
 *   S = K  =>  5(n - d) = p(v - 1):
 *                v = 5  needs 5(n - d) = 4p, so p a multiple of 5.
 *                       Never: p <= 4.
 *                v = 10 means n = 0, so -5d = 9p. Never: the left side is
 *                       not positive.
 *                v = 25 means n = d = 0, so 0 = 24p. Never.
 *
 * So the single exclusion is as many nickels as dimes — including none of
 * either — where swapping the two values changes nothing and the swapped
 * total IS the answer. p <= 4 is what keeps S off K. Both are bounds on the
 * list, built once; nothing is resampled. 206 coin sets remain.
 *
 * NO SIZE TELL. C is always the smallest option and K always overshoots V,
 * but S lands above V when there are more nickels than dimes and below it
 * when there are fewer, so the key is sometimes second and sometimes third.
 */
export interface CoinSet {
  q: number;
  d: number;
  n: number;
  p: number;
}

function valueOf({ q, d, n, p }: CoinSet): number {
  return 25 * q + 10 * d + 5 * n + p;
}

/** What a child who keeps counting by the last silver coin's value adds for
 *  each penny. */
function lastSilverValue({ q, d, n }: CoinSet): number {
  if (n > 0) return 5;
  if (d > 0) return 10;
  if (q > 0) return 25;
  throw new Error('a coin set with no silver coin');
}

export const COIN_SETS: CoinSet[] = [];
for (let q = 0; q <= 3; q++) {
  for (let d = 0; d <= 4; d++) {
    for (let n = 0; n <= 4; n++) {
      for (let p = 1; p <= 4; p++) {
        if (q + d + n < 1) continue;
        if (n === d) continue; // swapping nickel and dime values would change nothing
        const set = { q, d, n, p };
        const v = valueOf(set);
        const swapped = 25 * q + 5 * d + 10 * n + p;
        const keptCounting = v - p + p * lastSilverValue(set);
        if (Math.max(v, swapped, keptCounting) > 99) continue; // within 99¢
        COIN_SETS.push(set);
      }
    }
  }
}

const PEOPLE = [
  { name: 'Ella', pronoun: 'she' },
  { name: 'Marcus', pronoun: 'he' },
  { name: 'Priya', pronoun: 'she' },
  { name: 'Theo', pronoun: 'he' },
  { name: 'Zoe', pronoun: 'she' },
  { name: 'Diego', pronoun: 'he' },
];

const COIN_NAMES: { key: keyof CoinSet; one: string; many: string; worth: number }[] = [
  { key: 'q', one: 'quarter', many: 'quarters', worth: 25 },
  { key: 'd', one: 'dime', many: 'dimes', worth: 10 },
  { key: 'n', one: 'nickel', many: 'nickels', worth: 5 },
  { key: 'p', one: 'penny', many: 'pennies', worth: 1 },
];

/** "2 quarters, 1 dime, and 3 pennies" / "1 dime and 3 pennies". */
function listCoins(set: CoinSet): string {
  const parts = COIN_NAMES.filter((c) => set[c.key] > 0).map(
    (c) => `${set[c.key]} ${set[c.key] === 1 ? c.one : c.many}`,
  );
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/** "Quarters: 25, 50. Dimes: 60. Pennies: 61, 62, 63." — counting on by each
 *  coin's value, biggest coins first. */
function countOn(set: CoinSet): string {
  let running = 0;
  const groups: string[] = [];
  for (const c of COIN_NAMES) {
    const count = set[c.key];
    if (count === 0) continue;
    const steps: number[] = [];
    for (let i = 0; i < count; i++) {
      running += c.worth;
      steps.push(running);
    }
    const label = c.many.charAt(0).toUpperCase() + c.many.slice(1);
    groups.push(`${label}: ${steps.join(', ')}.`);
  }
  return groups.join(' ');
}

export const md8CountCoins: QuestionTemplate = {
  id: 'g2.md8.count-coins',
  standardCode: 'NC.2.MD.8',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { name, pronoun } = rng.pick(PEOPLE);
    const set = rng.pick(COIN_SETS);
    const { q, d, n, p } = set;

    const value = valueOf(set);
    const coinCount = q + d + n + p;
    const swapped = 25 * q + 5 * d + 10 * n + p;
    const lastValue = lastSilverValue(set);
    const keptCounting = value - p + p * lastValue;
    const answerText = `${value}¢`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Counted the coins, one each, instead of what each is worth.
      {
        text: `${coinCount}¢`,
        isCorrect: false,
        misconception: 'counted-the-coins-not-their-value',
      },
      // A dime counted as 5¢ and a nickel as 10¢.
      {
        text: `${swapped}¢`,
        isCorrect: false,
        misconception: 'mixed-up-the-values-of-a-nickel-and-a-dime',
      },
      // Reached the pennies and kept counting on by the last coin's value.
      {
        text: `${keptCounting}¢`,
        isCorrect: false,
        misconception: 'kept-counting-by-the-last-coins-value',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md8.count-coins: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `${name} has ${listCoins(set)}. How much money does ${pronoun} have?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          'Step 1: Count each coin by what it is worth: a quarter is 25¢, a dime is 10¢, a nickel is 5¢, and a penny is 1¢.',
          'Step 2: Start with the coins worth the most and count on.',
          `Step 3: ${countOn(set)}`,
          `Step 4: ${name} has ${answerText}.`,
        ],
        conceptSummary:
          'Coins are counted by their values, not by how many there are. Counting on from the biggest coin, and changing the counting step each time the coin changes, gives the total in cents.',
        commonMisconception: `When the count reaches the pennies, switch to counting by ones. Keeping on by ${lastValue}s gives ${keptCounting}¢ instead of ${value}¢.`,
      },
    };
  },
};
