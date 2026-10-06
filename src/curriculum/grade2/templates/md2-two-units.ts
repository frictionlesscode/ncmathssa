import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.2 — "Measure the length of an object twice, using length units of
 * different lengths for the two measurements; describe how the two
 * measurements relate to the size of the unit chosen."
 *
 * Ruling 19-2: this is NOT a fixed-unit standard and must not share a
 * template with NC.2.MD.1. Its whole content is the inverse relationship in
 * its third keyConcept — "a smaller unit gives a larger count for the same
 * length" — and this generator asks exactly that, for a fresh object, unit
 * pair and order every time.
 *
 * The prompt STATES which unit is shorter. Knowing that a centimeter is
 * shorter than an inch is a benchmark fact that belongs to estimating
 * (NC.2.MD.3); what this standard asks is what follows from it, and a child
 * who has not yet memorised the cm/inch pair should not fail an MD.2 item on
 * MD.3's account.
 *
 * The four options, for a shorter unit S and a longer unit L:
 *
 *   answer   "<Name> counts more S than L."
 *   expected-a-longer-unit-to-give-a-bigger-count
 *            "<Name> counts more L than S."
 *   expected-the-count-to-stay-the-same-in-a-new-unit
 *            "<Name> counts the same number of <first> and <second>."
 *   thought-the-object-changed-length-with-the-unit
 *            "The <object> is longer when it is measured in S."  or
 *            "The <object> is shorter when it is measured in L."
 *
 * S and L are always different words, so the four texts are distinct at every
 * seed by construction and nothing is excluded.
 *
 * NO WORDING POINTS AT THE KEY. Three things are drawn independently so that
 * no surface pattern answers the question without the mathematics: which unit
 * is measured first (so "the unit measured second" is not the answer), whether
 * the hint says "S is shorter than L" or "L is longer than S" (so "copy the
 * order of the hint" is not the answer), and which of the two wordings the
 * changed-length distractor takes (so the unit it names does not mark the
 * key's first word). The sibling test asserts all three vary.
 */
interface UnitName {
  singular: string;
  plural: string;
  /** "A" or "An", for the start of the hint sentence. */
  article: string;
}

export interface UnitPair {
  shorter: UnitName;
  longer: UnitName;
}

const INCH: UnitName = { singular: 'inch', plural: 'inches', article: 'An' };
const FOOT: UnitName = { singular: 'foot', plural: 'feet', article: 'A' };
const YARD: UnitName = { singular: 'yard', plural: 'yards', article: 'A' };
const CENTIMETER: UnitName = { singular: 'centimeter', plural: 'centimeters', article: 'A' };
const METER: UnitName = { singular: 'meter', plural: 'meters', article: 'A' };

/** Every pair a Grade 2 child measures in: customary with customary, metric
 *  with metric, and the one cross-system pair a ruler's two edges show. */
export const UNIT_PAIRS: UnitPair[] = [
  { shorter: INCH, longer: FOOT },
  { shorter: FOOT, longer: YARD },
  { shorter: CENTIMETER, longer: METER },
  { shorter: CENTIMETER, longer: INCH },
];

/** Objects long enough to measure sensibly in every pair above. */
const OBJECTS = ['rug', 'table', 'rope', 'bench', 'board'];

const PEOPLE = [
  { name: 'Rosa', pronoun: 'she' },
  { name: 'Kai', pronoun: 'he' },
  { name: 'Maya', pronoun: 'she' },
  { name: 'Leo', pronoun: 'he' },
  { name: 'Nia', pronoun: 'she' },
  { name: 'Omar', pronoun: 'he' },
];

export const md2TwoUnits: QuestionTemplate = {
  id: 'g2.md2.two-units',
  standardCode: 'NC.2.MD.2',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { name, pronoun } = rng.pick(PEOPLE);
    const object = rng.pick(OBJECTS);
    const { shorter: S, longer: L } = rng.pick(UNIT_PAIRS);
    const shorterFirst = rng.int(0, 1) === 1;
    const hintFromShorter = rng.int(0, 1) === 1;
    const changedSaysLonger = rng.int(0, 1) === 1;

    const [first, second] = shorterFirst ? [S, L] : [L, S];
    // Lowercase, period-free clause, for folding the hint into one question
    // sentence below (Fix 1, whole-branch review, Important).
    const hintClause = hintFromShorter
      ? `${S.article.toLowerCase()} ${S.singular} is shorter than ${L.article.toLowerCase()} ${L.singular}`
      : `${L.article.toLowerCase()} ${L.singular} is longer than ${S.article.toLowerCase()} ${S.singular}`;

    const answerText = `${name} counts more ${S.plural} than ${L.plural}.`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The inverse relationship run forwards: the longer unit is "bigger",
      // so its number must be bigger too.
      {
        text: `${name} counts more ${L.plural} than ${S.plural}.`,
        isCorrect: false,
        misconception: 'expected-a-longer-unit-to-give-a-bigger-count',
      },
      // The count belongs to the object, so it cannot change.
      {
        text: `${name} counts the same number of ${first.plural} and ${second.plural}.`,
        isCorrect: false,
        misconception: 'expected-the-count-to-stay-the-same-in-a-new-unit',
      },
      // A bigger number means a longer object — said either way round.
      {
        text: changedSaysLonger
          ? `The ${object} is longer when it is measured in ${S.plural}.`
          : `The ${object} is shorter when it is measured in ${L.plural}.`,
        isCorrect: false,
        misconception: 'thought-the-object-changed-length-with-the-unit',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md2.two-units: option collision [${texts.join(' | ')}]`);
    }

    // Fix 1 (whole-branch review, Important): the original four-sentence
    // prompt reached up to 171 characters at some seeds. Folding the second
    // measurement and the hint into fewer sentences keeps the leading
    // sentence the `templates/index.test.ts` sentinel pins
    // ("Name measures the same object two times.") untouched.
    return {
      prompt: `${name} measures the same ${object} two times. First ${pronoun} uses ${first.plural}, then ${second.plural}. Since ${hintClause}, which sentence is true?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: It is the same ${object} both times, so it stays the same length. Only the unit changes.`,
          `Step 2: ${S.article} ${S.singular} is shorter than ${L.article.toLowerCase()} ${L.singular}, so each ${S.singular} covers less of the ${object}.`,
          `Step 3: It takes more of a shorter unit to cover the same length, so the number of ${S.plural} is bigger than the number of ${L.plural}.`,
          `Step 4: So the true sentence is: ${answerText}`,
        ],
        conceptSummary:
          'Measuring the same thing with a smaller unit gives a bigger number, and with a bigger unit a smaller number. The thing being measured does not change — only how many units fit along it.',
        commonMisconception: `It is easy to think the longer unit gives the bigger number. It is the other way round: fewer ${L.plural} fit along the ${object}, because each one covers more of it.`,
      },
    };
  },
};
