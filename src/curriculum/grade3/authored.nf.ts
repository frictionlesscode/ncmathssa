import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 3 Number & Operations — Fractions bank.
 *
 * This is a child's FIRST year of fractions, and it is a 28–32% band. Scope is
 * bounded by the sourced NCDPI wording in `./standards.ts`, which differs from
 * Common Core's Grade 3 in one place that matters enormously here:
 *
 *   NC.3.NF.1 — interpret UNIT fractions with denominators of 2, 3, 4, 6 and 8
 *               as the quantities formed when a whole is partitioned into
 *               EQUAL parts; area and length models.
 *   NC.3.NF.2 — interpret fractions with those same denominators using area
 *               and length models; on a number line, the NUMERATOR is the
 *               number of unit-fraction lengths from 0.
 *   NC.3.NF.3 — represent equivalent fractions with area and length models,
 *               with THREE keyConcepts: composing and decomposing into
 *               equivalent fractions using the RELATED families (halves,
 *               fourths and eighths; thirds and sixths); a fraction with the
 *               same numerator and denominator EQUALS ONE WHOLE; and
 *               EXPRESSING WHOLE NUMBERS AS FRACTIONS.
 *   NC.3.NF.4 — compare two fractions WITH THE SAME NUMERATOR OR THE SAME
 *               DENOMINATOR, by reasoning about their size using area and
 *               length models, recording with >, < and =, and only when the
 *               two fractions refer to the SAME WHOLE.
 *
 * Three boundaries, each of which a bank written from recall would cross:
 *
 *  - THE DENOMINATORS ARE {2, 3, 4, 6, 8} AND NOTHING ELSE. Fifths, tenths,
 *    twelfths and hundredths are Grade 4. The sibling test reads every
 *    fraction out of every prompt, option and worked solution and checks it,
 *    because a stray 1/5 in a distractor is Grade 4 content printed under a
 *    Grade 3 code, which passes every other test in the suite.
 *
 *  - NC.3.NF.4 COMPARES ONLY FRACTIONS THAT SHARE A NUMERATOR OR A
 *    DENOMINATOR. Comparing 2/3 to 3/4 is NC.4.NF.2, which already has a
 *    landed Grade 4 generator. The sibling test pins every fraction in an NF.4
 *    item to the comparison family of the first one.
 *
 *  - NC.3.NF.3 IS THREE THINGS. Equivalence is only its first keyConcept;
 *    `g3-nf3-02` is "the same numerator and denominator is one whole" and
 *    `g3-nf3-03` is "whole numbers as fractions". A bank of three equivalence
 *    items would clear the floor with two thirds of the standard unwritten.
 *
 * A note on one misconception in particular. Reading 1/4 as "one and four" is
 * a real and common first-year error, but it has NO NUMERIC VALUE — there is
 * no number a child who makes it arrives at. So it is tagged only on options
 * that are MODELS or STATEMENTS ABOUT WHAT THE SYMBOL MEANS, where a child can
 * actually pick it: `g3-nf1-01`, `g3-nf2-03`, `g3-nf3-04` and `g3-nf4-02`. On
 * a numeric item it could only ever be filed against a number some other error
 * made, and a mis-filed tag tells a parent their child made a mistake they did
 * not make. The sibling test holds that line.
 *
 * Equivalent fractions name the same number, so every option list here is
 * checked by VALUE and not by form: 4/8 and 1/2 are different strings and one
 * answer, and an item offering both marks a child wrong for being right.
 *
 * Age note: these are read by an eight-year-old. Short sentences, familiar
 * wholes (a pizza, a ribbon, a number line), and no item that needs a
 * paragraph read before the mathematics can start.
 */
export const GRADE_3_NF_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.3.NF.1 — Understand Unit Fractions
  // ==========================================
  {
    id: 'g3-nf1-01',
    standardCode: 'NC.3.NF.1',
    domainId: 'NF',
    // The standard's third keyConcept is "the whole is partitioned into EQUAL
    // parts". This is deliberately NOT the model-matching shape that
    // ./templates/nf1-unit-fraction-model.ts generates: it is a judgement about
    // one particular cut, and the child has to say whether a fraction has been
    // made at all. A picture-picking item here would be that generator's
    // question in different words, which puts one question under two review
    // keys just as surely as an identical prompt would — and the duplicate
    // guard, which compares prompts, would not see it.
    //
    // It is also one of the four items where "one and four" is reachable: the
    // third option is the reasoning of a child who reads 1/4 as two separate
    // whole numbers.
    prompt:
      'Kai cuts a sandwich into 4 pieces, but one piece is much bigger than the other three. Can one of the small pieces be called 1/4 of the sandwich?',
    options: labelOptions([
      {
        text: 'No. The 4 pieces have to be the same size before any one of them is 1/4 of the sandwich.',
        isCorrect: true,
      },
      // Four pieces counted, without checking that they are equal ones.
      {
        text: 'Yes. There are 4 pieces, so each piece is 1/4 of the sandwich.',
        isCorrect: false,
        misconception: 'counted-parts-without-checking-they-are-equal',
      },
      // 1/4 read as the two numbers 1 and 4 rather than as one amount.
      {
        text: 'Yes, because there is 1 piece and there are 4 pieces, which is what 1/4 says.',
        isCorrect: false,
        misconception: 'read-the-fraction-as-two-whole-numbers',
      },
      // The 4 read as four whole sandwiches instead of four parts of one.
      {
        text: 'No. 1/4 would have to mean 4 whole sandwiches with 1 of them eaten.',
        isCorrect: false,
        misconception: 'treated-the-denominator-as-a-count-of-wholes',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 1/4 means one of 4 EQUAL pieces of one whole sandwich.',
        'Step 2: Kai’s pieces are not equal — one of them is much bigger than the other three.',
        'Step 3: So none of his pieces is a fourth. They are just four pieces, and each small one is less than a fourth.',
        'Step 4: No. The 4 pieces have to be the same size before any one of them is 1/4 of the sandwich.',
      ],
      conceptSummary:
        'A unit fraction is one piece of a whole that has been cut into EQUAL pieces. Counting the pieces is not enough: until they are all the same size, no single piece has a fraction name at all.',
      commonMisconception:
        'Four pieces of different sizes are still four pieces, but they are not fourths — nothing is a fourth until every piece is the same size.',
    },
  },
  {
    id: 'g3-nf1-02',
    standardCode: 'NC.3.NF.1',
    domainId: 'NF',
    prompt: 'A ribbon is cut into 8 equal pieces. What fraction of the whole ribbon is 1 piece?',
    options: labelOptions([
      // 8 on top and 1 underneath: the two numbers swapped.
      { text: '8/1', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
      // 7/8: counted the 7 pieces that are NOT the one piece asked about.
      { text: '7/8', isCorrect: false, misconception: 'named-the-unshaded-part' },
      { text: '1/8', isCorrect: true },
      // 8/8: named the whole ribbon instead of one of its eight pieces.
      { text: '8/8', isCorrect: false, misconception: 'named-the-whole-not-one-part' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The whole ribbon was cut into 8 equal pieces, so the bottom number is 8.',
        'Step 2: The question asks about 1 of those pieces, so the top number is 1.',
        'Step 3: The top number counts pieces and the bottom number says how big each piece is.',
        'Step 4: One piece is 1/8 of the whole ribbon.',
      ],
      conceptSummary:
        'The bottom number of a fraction is not a count of anything owned — it is the size of each piece, written as how many of them fill one whole.',
      commonMisconception:
        'Writing 8/1 puts the size of the pieces on top and the count underneath, which names eight whole ribbons instead of one small piece of one.',
    },
  },
  {
    id: 'g3-nf1-03',
    standardCode: 'NC.3.NF.1',
    domainId: 'NF',
    // The size of a unit fraction, which is the idea NC.3.NF.4 is built on.
    prompt:
      'Two pizzas are exactly the same size. One is cut into 4 equal slices and the other into 8 equal slices. Which is bigger: one slice of the first pizza, or one slice of the second?',
    options: labelOptions([
      // The larger denominator read as the larger amount.
      {
        text: 'The slice from the pizza cut into 8, because 8 is a bigger number than 4.',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      {
        text: 'The slice from the pizza cut into 4, because 1/4 is a bigger piece than 1/8.',
        isCorrect: true,
      },
      // Both are "1 slice", so the numerators were read as the whole story.
      {
        text: 'They are the same size, because each one is 1 slice.',
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // The same-whole rule over-applied: the pizzas ARE the same size, and
      // being cut differently is exactly what is being compared.
      {
        text: 'You cannot tell, because the two pizzas were cut into different numbers of slices.',
        isCorrect: false,
        misconception: 'treated-different-cuts-as-different-wholes',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Both pizzas are the same size, so the two kinds of slice can be compared fairly.',
        'Step 2: The first pizza is shared among 4 slices; the second is shared among 8.',
        'Step 3: The more people a pizza is shared with, the less each one gets — so eighths are smaller pieces than fourths.',
        'Step 4: The slice from the pizza cut into 4, because 1/4 is a bigger piece than 1/8.',
      ],
      conceptSummary:
        'The bottom number tells how many pieces one whole is cut into. More pieces means each piece is smaller, so a bigger bottom number makes a smaller unit fraction.',
      commonMisconception:
        'Reading 8 as "more" is the natural move with whole numbers and the wrong one here: more pieces cut from the same pizza means each piece is smaller.',
    },
  },

  // ==========================================
  // Standard: NC.3.NF.2 — Fractions on Area & Length Models
  // ==========================================
  {
    id: 'g3-nf2-01',
    standardCode: 'NC.3.NF.2',
    domainId: 'NF',
    // Area model: the numerator counts how many of the equal parts.
    prompt:
      'A pan of cornbread is cut into 6 equal pieces. 4 of the pieces have been eaten. What fraction of the pan has been eaten?',
    options: labelOptions([
      // 6 on top and 4 underneath: the whole and the count swapped.
      { text: '6/4', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
      // 2/6: counted the 2 pieces still in the pan instead of the 4 eaten.
      { text: '2/6', isCorrect: false, misconception: 'named-the-unshaded-part' },
      // 4/2: the 4 eaten written against the 2 left over instead of against
      // the whole pan of 6.
      { text: '4/2', isCorrect: false, misconception: 'compared-the-part-to-the-rest' },
      { text: '4/6', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The whole pan was cut into 6 equal pieces, so each piece is 1/6 of the pan.',
        'Step 2: 4 of those pieces are gone.',
        'Step 3: 4 pieces of 1/6 each means 4 copies of 1/6.',
        'Step 4: So 4/6 of the pan has been eaten.',
      ],
      conceptSummary:
        'The numerator counts unit fractions. Once the whole is cut into sixths, every amount is just a number of sixths, and the number on top is that count.',
      commonMisconception:
        'Writing 4/2 compares the pieces eaten to the pieces left over. A fraction always compares a part to the WHOLE, which here is all 6 pieces.',
    },
  },
  {
    id: 'g3-nf2-02',
    standardCode: 'NC.3.NF.2',
    domainId: 'NF',
    // Length model. NC.3.NF.2's second keyConcept: on a number line the
    // numerator is the number of unit-fraction LENGTHS from 0 — which is why
    // counting the tick marks instead of the spaces gives 4/4.
    prompt: 'Point R is marked on the number line below. Which fraction does R name?',
    promptDetails: '0                   1\n|----|----|----|----|\n               R',
    options: labelOptions([
      { text: '3/4', isCorrect: true },
      // 4/4: counted the tick marks from 0 up to R, including the one at 0,
      // instead of the four equal spaces between them.
      { text: '4/4', isCorrect: false, misconception: 'counted-tick-marks-not-intervals' },
      // 1/4: counted the one space left between R and 1 instead of the spaces
      // from 0 up to R.
      { text: '1/4', isCorrect: false, misconception: 'counted-back-from-the-whole' },
      // 4/3: the number of parts in the whole written on top and the count
      // underneath.
      { text: '4/3', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The distance from 0 to 1 is cut into 4 equal spaces, so each space is 1/4 long.',
        'Step 2: Count the SPACES from 0 over to R, not the tick marks: there are 3 of them.',
        'Step 3: 3 spaces of 1/4 each is 3 copies of 1/4.',
        'Step 4: So point R names 3/4.',
      ],
      conceptSummary:
        'On a number line a fraction is a distance from 0, measured in unit-fraction steps. The bottom number says how long each step is and the top number says how many steps were taken.',
      commonMisconception:
        'There is always one more tick mark than there are spaces, because 0 gets a mark of its own. Counting marks instead of spaces makes every fraction come out one part too big.',
    },
  },
  {
    id: 'g3-nf2-03',
    standardCode: 'NC.3.NF.2',
    domainId: 'NF',
    // What the symbol MEANS, stated four ways. A generator cannot pose this,
    // and it is where the numerator-as-a-count idea is named out loud.
    prompt: 'Which statement is true about 5/8?',
    options: labelOptions([
      // The denominator used as the count instead of as the size of a part.
      {
        text: '5/8 means 8 copies of 1/8.',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-count',
      },
      // The 8 read as a number of whole things.
      {
        text: '5/8 means 8 whole things with 5 of them shaded.',
        isCorrect: false,
        misconception: 'treated-the-denominator-as-a-count-of-wholes',
      },
      { text: '5/8 means 5 copies of 1/8.', isCorrect: true },
      // 5/8 read as the two separate whole numbers 5 and 8.
      {
        text: '5/8 means the number 5 and the number 8.',
        isCorrect: false,
        misconception: 'read-the-fraction-as-two-whole-numbers',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The bottom number, 8, says one whole is cut into 8 equal parts, so each part is 1/8.',
        'Step 2: The top number, 5, says how many of those parts are counted.',
        'Step 3: Counting 5 parts that are each 1/8 is the same as adding 1/8 five times.',
        'Step 4: So 5/8 means 5 copies of 1/8.',
      ],
      conceptSummary:
        'Every fraction is a count of unit fractions. The bottom number names the unit and the top number counts it, which is why 5/8 and "five eighths" say exactly the same thing.',
      commonMisconception:
        'A fraction is ONE number, not two. Reading 5/8 as "five and eight" loses the only thing the symbol is for: saying how many parts of what size.',
    },
  },

  // ==========================================
  // Standard: NC.3.NF.3 — Equivalent Fractions with Models
  // ==========================================
  {
    id: 'g3-nf3-01',
    standardCode: 'NC.3.NF.3',
    domainId: 'NF',
    // keyConcept 1: composing and decomposing using the RELATED families.
    // Fourths and eighths, never fourths and thirds.
    prompt:
      'Two strips of paper are the same size. The first is cut into 4 equal parts and 2 of them are shaded. The second is cut into 8 equal parts. How much of the second strip must be shaded to show the same amount?',
    options: labelOptions([
      // 2/8: the strip was recut into eighths but the count of 2 was carried
      // straight over, which shades half as much.
      { text: '2/8', isCorrect: false, misconception: 'changed-the-denominator-but-not-the-numerator' },
      { text: '4/8', isCorrect: true },
      // 2 + 4 = 6 over 4 + 4 = 8: the same amount added to both numbers, which
      // does not keep the fraction the same size.
      { text: '6/8', isCorrect: false, misconception: 'added-to-both-parts-instead-of-multiplying' },
      // 8/4: the two numbers swapped.
      { text: '8/4', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Cutting the strip into 8 parts instead of 4 cuts every part in half, so there are twice as many parts.',
        'Step 2: Each shaded fourth becomes 2 shaded eighths.',
        'Step 3: There were 2 shaded fourths, so there are 2 × 2 = 4 shaded eighths.',
        'Step 4: 4/8 of the second strip must be shaded, which is the same amount as 2/4 of the first.',
      ],
      conceptSummary:
        'Equivalent fractions are the same amount described with different-sized parts. Cutting every part into two makes twice as many parts AND twice as many shaded ones, so both numbers double together.',
      commonMisconception:
        'Adding 4 to both numbers looks fair but is not: the parts got smaller, so the count has to grow by the same factor, not by the same amount.',
    },
  },
  {
    id: 'g3-nf3-02',
    standardCode: 'NC.3.NF.3',
    domainId: 'NF',
    // keyConcept 2: "a fraction with the same numerator and denominator equals
    // one whole" — absent from the brief, and a third of this standard.
    prompt:
      'A pizza is cut into 8 equal slices. Dana’s family eats every one of the 8 slices. What fraction of the pizza did they eat?',
    options: labelOptions([
      // 1/8: named one slice instead of counting all 8 of them.
      { text: '1/8', isCorrect: false, misconception: 'named-the-unit-fraction-not-the-count' },
      // 8/1: the two numbers swapped.
      { text: '8/1', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
      // 0/8: counted the slices still in the box instead of the slices eaten.
      { text: '0/8', isCorrect: false, misconception: 'named-the-unshaded-part' },
      { text: '8/8', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The pizza was cut into 8 equal slices, so each slice is 1/8 of it.',
        'Step 2: All 8 slices were eaten, so count 8 of those eighths.',
        'Step 3: 8 copies of 1/8 fills the whole pizza exactly.',
        'Step 4: They ate 8/8 of the pizza, which is one whole pizza.',
      ],
      conceptSummary:
        'When the top number and the bottom number are the same, every part of the whole has been counted — so the fraction is worth exactly 1. That is true of 2/2, 3/3, 4/4, 6/6 and 8/8 alike.',
      commonMisconception:
        'Answering 1/8 names one slice rather than counting how many slices were eaten; the top number is a count, and here the count is 8.',
    },
  },
  {
    id: 'g3-nf3-03',
    standardCode: 'NC.3.NF.3',
    domainId: 'NF',
    // keyConcept 3: "expressing whole numbers as fractions, and recognizing
    // fractions that are equivalent to whole numbers" — also absent from the
    // brief.
    prompt: 'Which of these fractions is equal to the whole number 3?',
    options: labelOptions([
      { text: '6/2', isCorrect: true },
      // 3/2: the whole number written on top and the parts in one whole
      // underneath, without counting how many halves 3 wholes actually take.
      { text: '3/2', isCorrect: false, misconception: 'wrote-the-whole-number-over-the-denominator' },
      // 2/6: the two numbers swapped.
      { text: '2/6', isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
      // 3/3: the 3 on top read as the value of the whole fraction.
      { text: '3/3', isCorrect: false, misconception: 'read-the-numerator-as-the-whole-number-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Cut each whole into halves. One whole is 2 halves.',
        'Step 2: 3 wholes is 3 groups of 2 halves.',
        'Step 3: 3 × 2 = 6, so 3 wholes is 6 halves.',
        'Step 4: 6 halves is written 6/2, so 6/2 is equal to 3.',
      ],
      conceptSummary:
        'A whole number can be written as a fraction by counting how many of the small parts it takes to build it. Three wholes take 6 halves, or 9 thirds, or 12 fourths — every one of them equal to 3.',
      commonMisconception:
        'Writing 3/2 keeps the 3 on top but never counts: 3/2 is only one and a half wholes, not three of them.',
    },
  },
  {
    id: 'g3-nf3-04',
    standardCode: 'NC.3.NF.3',
    domainId: 'NF',
    // The DECOMPOSING half of keyConcept 1, and the third item where "one and
    // four" is a thing a child can actually choose.
    prompt: 'Which one shows 3/4 broken into unit fractions?',
    options: labelOptions([
      // Copies of the whole fraction instead of copies of its unit fraction.
      {
        text: '3/4 + 3/4 + 3/4',
        isCorrect: false,
        misconception: 'repeated-the-whole-fraction-not-the-unit-fraction',
      },
      // Four fourths: the bottom number used as the count instead of the 3.
      {
        text: '1/4 + 1/4 + 1/4 + 1/4',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-count',
      },
      { text: '1/4 + 1/4 + 1/4', isCorrect: true },
      // 3/4 read as "three and one fourth": the two numbers pulled apart.
      {
        text: '3 + 1/4',
        isCorrect: false,
        misconception: 'read-the-fraction-as-two-whole-numbers',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The unit fraction for fourths is 1/4, because 4 of them make one whole.',
        'Step 2: The top number of 3/4 says how many fourths there are: 3.',
        'Step 3: So 3/4 is 1/4 counted three times.',
        'Step 4: That is 1/4 + 1/4 + 1/4.',
      ],
      conceptSummary:
        'Breaking a fraction apart means splitting it into its unit fractions. The pieces are always the unit fraction, and how many there are is always the top number.',
      commonMisconception:
        'Writing 3/4 three times adds up to more than two whole strips. The pieces are fourths, not three-fourths.',
    },
  },

  // ==========================================
  // Standard: NC.3.NF.4 — Compare Fractions with the Same Numerator
  //                       or the Same Denominator
  // ==========================================
  {
    id: 'g3-nf4-01',
    standardCode: 'NC.3.NF.4',
    domainId: 'NF',
    // SAME NUMERATOR, area model. Both fractions have a 3 on top, so the whole
    // comparison is about the size of the parts.
    prompt:
      'Ana and Beto have chocolate bars that are exactly the same size. Ana eats 3/4 of hers and Beto eats 3/8 of his. Who ate more chocolate?',
    options: labelOptions([
      // The larger bottom number read as the larger amount.
      {
        text: 'Beto, because 8 is a bigger number than 4.',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      {
        text: 'Ana, because fourths are bigger pieces than eighths, so 3 fourths is more than 3 eighths.',
        isCorrect: true,
      },
      // Both top numbers are 3, so the comparison was stopped there.
      {
        text: 'They ate the same, because they each ate 3 pieces.',
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // The same-whole rule over-applied: the bars ARE the same size.
      {
        text: 'You cannot tell, because their bars were cut into different numbers of pieces.',
        isCorrect: false,
        misconception: 'treated-different-cuts-as-different-wholes',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The bars are the same size, so the two amounts can be compared fairly.',
        'Step 2: Both children ate 3 pieces, so the only difference is how big a piece is.',
        'Step 3: A bar cut into 4 pieces has bigger pieces than the same bar cut into 8.',
        'Step 4: Ana, because fourths are bigger pieces than eighths, so 3 fourths is more than 3 eighths.',
      ],
      conceptSummary:
        'When two fractions have the same top number, they count the same number of pieces — so the one with the smaller bottom number, and therefore the bigger pieces, is the greater fraction.',
      commonMisconception:
        'With whole numbers 8 really is more than 4, and that habit is what makes 3/8 look bigger than 3/4. The bottom number is not a count; it is a size.',
    },
  },
  {
    id: 'g3-nf4-02',
    standardCode: 'NC.3.NF.4',
    domainId: 'NF',
    // The standard's fourth keyConcept: "comparisons are valid only when the
    // two fractions refer to the same whole." Also the third item where "one
    // and four" is reachable.
    prompt:
      'Lena has a small pizza and Omar has a large pizza. Each of them eats 1/2 of their own pizza. Omar says they must have eaten the same amount, because 1/2 is 1/2. Is Omar right?',
    options: labelOptions([
      // Two halves of different-sized wholes treated as one amount.
      {
        text: 'Yes, because 1/2 is always the same amount no matter what it is half of.',
        isCorrect: false,
        misconception: 'ignored-the-size-of-the-whole',
      },
      // Matching bottom numbers read as matching amounts.
      {
        text: 'Yes, because both pizzas were cut into 2 equal parts.',
        isCorrect: false,
        misconception: 'compared-denominators-only',
      },
      // 1/2 read as the two separate whole numbers 1 and 2.
      {
        text: 'No, because 1 is a smaller number than 2.',
        isCorrect: false,
        misconception: 'read-the-fraction-as-two-whole-numbers',
      },
      {
        text: 'No, because the pizzas are different sizes, so half of one is not half of the other.',
        isCorrect: true,
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A fraction is always a fraction OF something, and here the two somethings are different.',
        'Step 2: Half of the small pizza is half of a small amount.',
        'Step 3: Half of the large pizza is half of a larger amount, so it is more food.',
        'Step 4: No, because the pizzas are different sizes, so half of one is not half of the other.',
      ],
      conceptSummary:
        'Two fractions can only be compared when they refer to the same whole. The same fraction of a bigger whole is a bigger amount, which is why a half is not a fixed quantity.',
      commonMisconception:
        'Two fractions that look identical can still name different amounts. Before comparing, ask what each one is a fraction of.',
    },
  },
  {
    id: 'g3-nf4-03',
    standardCode: 'NC.3.NF.4',
    domainId: 'NF',
    // SAME NUMERATOR again, but a LENGTH model rather than an area one — the
    // standard names both, and a child who can reason about pieces of a bar
    // does not automatically reason about steps along a line.
    prompt:
      'Two number lines are the same length and both run from 0 to 1. One is cut into 4 equal parts and the other into 6 equal parts. Which point is farther from 0: 3/4 or 3/6?',
    options: labelOptions([
      {
        text: '3/4, because fourths are longer steps than sixths, so 3 of them reach farther.',
        isCorrect: true,
      },
      // The larger bottom number read as the larger amount.
      {
        text: '3/6, because 6 parts fit in the line and only 4 do.',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      // Both top numbers are 3, so the comparison was stopped there.
      {
        text: 'They are the same distance, because both are 3 steps from 0.',
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // The same-whole rule over-applied: the two lines ARE the same length.
      {
        text: 'You cannot tell, because the lines are cut into different numbers of parts.',
        isCorrect: false,
        misconception: 'treated-different-cuts-as-different-wholes',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Both lines are the same length and both run from 0 to 1, so the two distances can be compared fairly.',
        'Step 2: The line cut into 4 parts has longer steps than the line cut into 6 parts.',
        'Step 3: Each point is 3 steps from 0, so the one with the longer steps has travelled farther.',
        'Step 4: 3/4, because fourths are longer steps than sixths, so 3 of them reach farther.',
      ],
      conceptSummary:
        'On a number line a fraction is a distance, and the bottom number sets the length of one step. Three long steps go farther than three short ones.',
      commonMisconception:
        'Cutting a line into more parts does not make the line longer; it makes each step shorter. More parts means each one covers less ground.',
    },
  },
  {
    id: 'g3-nf4-04',
    standardCode: 'NC.3.NF.4',
    domainId: 'NF',
    // SAME DENOMINATOR, which is the standard's other half. Every option
    // shares a top number or a bottom number with 4/6, so nothing here asks
    // for the general comparison NC.4.NF.2 owns.
    prompt: 'Which fraction is greater than 4/6?',
    options: labelOptions([
      // 2/6: fewer sixths, so less — the comparison was answered backwards.
      { text: '2/6', isCorrect: false, misconception: 'compared-in-the-wrong-direction' },
      // 4/8: same count, smaller pieces, so less — picked because 8 is the
      // bigger number.
      { text: '4/8', isCorrect: false, misconception: 'larger-denominator-means-larger-fraction' },
      { text: '5/6', isCorrect: true },
      // 1/6: named a single sixth instead of counting how many are needed.
      { text: '1/6', isCorrect: false, misconception: 'named-the-unit-fraction-not-the-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 4/6 is 4 sixths, so anything greater than it must be more than 4 sixths.',
        'Step 2: 2/6 and 1/6 are fewer sixths than 4/6, so both are smaller.',
        'Step 3: 4/8 counts 4 pieces too, but eighths are smaller pieces than sixths, so 4/8 is smaller than 4/6.',
        'Step 4: 5/6 is 5 sixths, one more sixth than 4/6, so 5/6 is the greater fraction.',
      ],
      conceptSummary:
        'Two fractions with the same bottom number are counting pieces of the same size, so whichever counts more pieces is greater. Two fractions with the same top number are counting the same number of pieces, so whichever has the bigger pieces is greater.',
      commonMisconception:
        'Picking 4/8 uses the whole-number habit that 8 beats 6. With the same count on top, the bigger bottom number makes the smaller fraction.',
    },
  },
];
