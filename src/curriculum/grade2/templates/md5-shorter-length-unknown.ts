import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.5 — "Use addition and subtraction, within 100, to solve word
 * problems involving lengths that are given in the same units, using
 * equations with a symbol for the unknown number to represent the problem."
 *
 * ONE problem type: COMPARE, SMALLER UNKNOWN — "The blue ribbon is 45 inches
 * long. It is 18 inches longer than the red ribbon. How long is the red
 * ribbon?" — printed with its equation, ☐ + 18 = 45. The word "longer" pulls a
 * child towards adding, which is ruling 19-5's first named MD.5 error
 * (operation choice); answering 18, the number the problem already gave, is
 * its second (solving for the wrong unknown). The equation is written with
 * the unknown FIRST, the way the story tells it (red + 18 = blue), so the
 * plus sign in it is part of the trap rather than a give-away.
 *
 * One problem type and not a coin flip between several, because a review key
 * is seedless (`{kind:'generated', templateId}`): a template that sometimes
 * asked a put-together problem would let a child who added where they should
 * have subtracted be re-served an addition item, answer it, and have the
 * failure retired as mastered. The other MD.5 shapes — put together, start
 * unknown, and choosing the equation itself — are authored in
 * `../authored.md.ts` (g2-md5-01..03).
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE — within 100, one unit, always one regrouping
 *
 * big = 10.tb + ob (the longer length), diff = 10.td + od (how much longer):
 *     tb > td >= 1, tb + td <= 8          so big + diff <= 97
 *     0 <= ob < od <= 9                   so the ones always regroup
 *
 * small = big - diff is the answer; it is at least 10 - 9 = 1.
 *
 *   answer                                  small = big - diff
 *   added-instead-of-subtracted             big + diff
 *   restated-a-known-number-instead-of-solving   diff
 *   subtracted-without-regrouping           NR = 10(tb - td) + (od - ob)
 *                                              = small + 2(od - ob)
 *
 * Pairwise distinctness:
 *
 *   small = big + diff  =>  diff = 0.              Never: td >= 1.
 *   small = diff        =>  big = 2.diff.          EXCLUDED (10 pairs).
 *   small = NR          =>  od = ob.               Never: ob < od.
 *   big + diff = diff   =>  big = 0.               Never.
 *   big + diff = NR     =>  2.diff = 2(od - ob)
 *                       =>  10.td = -ob.           Never: td >= 1.
 *   diff = NR           =>  10.td + od = 10(tb - td) + od - ob
 *                       =>  ob = 10(tb - 2.td), and 0 <= ob <= 8
 *                       =>  ob = 0 and tb = 2.td.  EXCLUDED (18 pairs).
 *
 * The two excluded families share no pair, so 12 tens pairs x 45 ones pairs
 * = 540 becomes 512. Both are removed when the list is built, never by
 * resampling, and the sibling test shows each removed pair really collides.
 *
 * NO SIZE TELL. NR and big + diff are always above small, but diff lands
 * above it when diff > big/2 and below it otherwise, so the key is sometimes
 * the smallest option and sometimes the second smallest.
 */
export interface LengthPair {
  /** The longer length. */
  big: number;
  /** How much longer it is. */
  diff: number;
}

export const LENGTH_PAIRS: LengthPair[] = [];
for (let tb = 2; tb <= 7; tb++) {
  for (let td = 1; td < tb && tb + td <= 8; td++) {
    for (let ob = 0; ob <= 8; ob++) {
      for (let od = ob + 1; od <= 9; od++) {
        const big = 10 * tb + ob;
        const diff = 10 * td + od;
        if (big === 2 * diff) continue; // small would equal diff
        if (ob === 0 && tb === 2 * td) continue; // NR would equal diff
        LENGTH_PAIRS.push({ big, diff });
      }
    }
  }
}

interface Context {
  noun: string;
  /** Adjective for the longer one. */
  longer: string;
  /** Adjective for the shorter one — the unknown. */
  shorter: string;
  unit: { singular: string; plural: string };
}

/** Pairs of things a seven-year-old would line up and compare, each in a unit
 *  that suits lengths from about 1 to 80 of it. One unit per story. */
const CONTEXTS: Context[] = [
  { noun: 'ribbon', longer: 'blue', shorter: 'red', unit: { singular: 'inch', plural: 'inches' } },
  { noun: 'scarf', longer: 'striped', shorter: 'plain', unit: { singular: 'inch', plural: 'inches' } },
  {
    noun: 'snake',
    longer: 'green',
    shorter: 'brown',
    unit: { singular: 'centimeter', plural: 'centimeters' },
  },
  {
    noun: 'kite string',
    longer: 'red',
    shorter: 'yellow',
    unit: { singular: 'meter', plural: 'meters' },
  },
  { noun: 'paper chain', longer: 'blue', shorter: 'green', unit: { singular: 'foot', plural: 'feet' } },
];

export const md5ShorterLengthUnknown: QuestionTemplate = {
  id: 'g2.md5.shorter-length-unknown',
  standardCode: 'NC.2.MD.5',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { big, diff } = rng.pick(LENGTH_PAIRS);
    const small = big - diff;

    const tb = Math.floor(big / 10);
    const ob = big % 10;
    const td = Math.floor(diff / 10);
    const od = diff % 10;
    const noRegroup = 10 * (tb - td) + (od - ob);

    const length = (n: number) => `${n} ${n === 1 ? ctx.unit.singular : ctx.unit.plural}`;
    const answerText = length(small);
    const longOne = `${ctx.longer} ${ctx.noun}`;
    const shortOne = `${ctx.shorter} ${ctx.noun}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // big + diff: "longer" read as "add".
      { text: length(big + diff), isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // diff: answered with how much longer, a number the story already gave.
      {
        text: length(diff),
        isCorrect: false,
        misconception: 'restated-a-known-number-instead-of-solving',
      },
      // NR: took the smaller ones digit from the larger instead of regrouping.
      { text: length(noRegroup), isCorrect: false, misconception: 'subtracted-without-regrouping' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md5.shorter-length-unknown: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `The ${longOne} is ${length(big)} long. It is ${length(diff)} longer than the ${shortOne}. The equation ☐ + ${diff} = ${big} shows this. How long is the ${shortOne}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The ☐ stands for the length of the ${shortOne}. The ${longOne} is the longer one, so the ${shortOne} is ${length(diff)} shorter.`,
          `Step 2: Take the extra ${diff} away from the ${big}: ${big} − ${diff}.`,
          `Step 3: Ones: ${ob} − ${od} will not go, so trade a ten: ${ob + 10} − ${od} = ${ob + 10 - od}. Tens: ${tb - 1} − ${td} = ${tb - 1 - td}. So ${big} − ${diff} = ${small}.`,
          `Step 4: The ${shortOne} is ${answerText} long.`,
        ],
        conceptSummary:
          'When one length is some amount longer than another, the shorter one is found by taking that amount away. Checking with the equation — the answer plus the difference must make the longer length — catches a wrong operation.',
        commonMisconception: `The word "longer" makes adding feel right, but ${big} + ${diff} = ${big + diff} would make the ${shortOne} longer than the ${longOne}.`,
      },
    };
  },
};
