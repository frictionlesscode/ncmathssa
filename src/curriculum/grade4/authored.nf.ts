import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 4 Number & Operations — Fractions bank.
 *
 * NF carries the largest published band at Grade 4 — 30–34%, more than any
 * other domain — and it is where the misconception vocabulary earns its keep,
 * because fraction errors are procedural and nameable. Every incorrect option
 * below is the number a Grade 4 student actually arrives at by ONE specific
 * error, the `//` comment above it shows the arithmetic that produces it, and
 * the `misconception` tag names the procedure the app should tell the student
 * to repair. Nothing here is filler, and nothing is the key nudged by one.
 *
 * Scope is bounded by the sourced NCDPI wording in `./standards.ts`:
 *   NC.4.NF.1 — explain equivalence with AREA and LENGTH models, attending to
 *               how the number and the size of the parts both change.
 *   NC.4.NF.2 — compare two fractions with different numerators AND different
 *               denominators, drawn from 2, 3, 4, 5, 6, 8, 10, 12 and 100;
 *               comparisons are valid only against the same whole.
 *   NC.4.NF.3 — decompose, add and subtract fractions (and mixed numbers) with
 *               LIKE denominators from that same list.
 *   NC.4.NF.4 — multiply a whole number by a unit fraction, and by any
 *               fraction less than one.
 *   NC.4.NF.6 — decimal notation for tenths and hundredths, the equivalence
 *               between denominators of 10 and 100, and adding two fractions
 *               with denominators of 10 or 100.
 *   NC.4.NF.7 — compare two decimals to HUNDREDTHS; comparisons are valid only
 *               against the same whole.
 * Nothing here asks beyond that text. In particular no item multiplies two
 * fractions together (NC.5.NF.4), divides by a fraction (NC.5.NF.7), or adds
 * unlike denominators outside the 10/100 pair NC.4.NF.6 names (NC.5.NF.1) —
 * every one of those is a grade above. Every fraction printed anywhere in this
 * bank uses a denominator from NC.4.NF.2's sourced list; NC.4.NF.1 names no
 * list of its own, and rather than let one standard's items contradict the
 * generator filed under the same standard, they follow NF.2's.
 *
 * Nothing in this domain REQUIRES working in thousandths, which is
 * NC.5.NBT.3. Thousandths are nevertheless PRINTED, always as a distractor and
 * always on purpose: `0.018 m` in g4-nf6-01, `0.009` in g4-nf6-04, and the
 * `0.0tu` option that `./templates/nf6-decimal-notation.ts` emits on every one
 * of its 71 draws. Writing 18/100 with three decimal places is exactly the
 * shifted-place error NC.4.NF.6 exists to catch, and ruling it out needs no
 * arithmetic in thousandths at all — only the knowledge that hundredths live
 * in the second decimal place.
 *
 * This paragraph has been wrong twice, both times because content was added
 * after it was written and not because the content was wrong. Anything added
 * to this domain that prints a third decimal place belongs in the list above.
 *
 * THE TRAP THIS DOMAIN SETS. In a fractions bank the likeliest single defect
 * is not a wrong answer, it is a SECOND right one: an unsimplified equivalent
 * of the key — 4/8 offered beside 1/2, 6/4 beside 1 1/2, 0.50 beside 0.5 — is
 * not a distractor, and a child who picks it is marked wrong for being right.
 * Every item here was checked by VALUE, not by appearance: no two options in
 * any item name the same quantity. Two traps that bite specifically:
 *   - `multiplied-the-denominator-too` on w × n/d gives (wn)/(wd), which is
 *     exactly n/d. It can therefore NEVER share an item with
 *     `forgot-to-scale-by-the-whole-number`, whose value is also n/d. See
 *     g4-nf4-03, which uses the second tag and not the first for that reason.
 *   - `operated-on-the-like-denominators-too` on a/d + b/d gives (a+b)/2d,
 *     which is half the key, so it is safe; the same error on a mixed-number
 *     sum is not, because carrying an improper fraction part unreduced
 *     (3 7/5) names the same number as the reduced answer (4 2/5).
 * `authored.nf.test.ts` checks this with the shared kit's numericValue() guard
 * rather than trusting this paragraph.
 *
 * Thirteen tags used here are new, declared in `../misconceptions.ts`, all in
 * the `fraction-operations` family. The existing fraction vocabulary was
 * written for Grade 5, where every operation has unlike denominators: it has
 * good names for failing to find a common denominator, and no name at all for
 * the errors that define Grade 4 — adding denominators that already match,
 * judging 1/8 greater than 1/3, comparing by numerator alone, multiplying a
 * fraction's denominator by the whole number, or splitting a denominator while
 * decomposing. Stretching a Grade 5 tag over those would tell a parent their
 * child has a problem they do not have.
 *
 * Every one of these standards also has at least one generator (see
 * ./templates), so the two have to stay out of each other's way: the scheduler
 * keys authored items as {authored, id} and generated ones as {generated,
 * templateId}, and a question reachable both ways is served to a child twice
 * under two identities. Every generator emits one fixed computational stem —
 * 'Which fraction names the same amount, written in smaller parts?', 'These
 * fractions all describe parts of the same size whole. Order them from LEAST
 * to GREATEST.', 'Add the fractions.', 'Subtract the mixed numbers.',
 * 'Multiply the whole number by the fraction.', 'Add the fractions. Write the
 * sum in hundredths.', 'A 10 by 10 grid represents 1 whole. Which decimal
 * names the shaded part of the grid?', and 'Which of these decimals is the
 * greatest?'. Every item below is a word problem, an error analysis, or a
 * differently worded stem, so no prompt can coincide; the test checks that
 * against 2,000 seeds of every Grade 4 template rather than trusting it.
 *
 * Prompt shape is not the only separation. Where a generator could emit an
 * authored item's exact option SET as well — g4-nf6-02 and g4-nf1-02, both
 * renamings the NF.1 generator can also draw — that generator bars the
 * specific parameters, so the two banks cannot converge on one question by
 * two routes.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_4_NF_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.4.NF.1 — Explain Fraction Equivalence with Models
  // ==========================================
  {
    id: 'g4-nf1-01',
    standardCode: 'NC.4.NF.1',
    domainId: 'NF',
    prompt:
      'A rectangle is divided into 4 equal parts, and 3 of them are shaded. Sofia draws one more line that splits every part in half, so the same rectangle now has 8 equal parts. How many of the 8 parts are shaded?',
    options: labelOptions([
      // The parts doubled but the count of shaded parts was carried over
      // unchanged: 3/4 rewritten as 3/8.
      { text: '3 parts', isCorrect: false, misconception: 'scaled-the-denominator-only' },
      // 8 - 4 = 4 was added to both parts of the fraction instead of
      // multiplying both by 2: 3 + 4 = 7 shaded out of 4 + 4 = 8.
      {
        text: '7 parts',
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
      { text: '6 parts', isCorrect: true },
      // The original denominator, 4, written down as the new count of shaded
      // parts.
      {
        text: '4 parts',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Splitting every part in half doubles the number of parts: 4 parts become 8, so each new part is half the size of an old one.',
        'Step 2: Every shaded part was split too, so each of the 3 shaded parts became 2 shaded parts.',
        'Step 3: 3 × 2 = 6, which is the same as rescaling 3/4 by 2/2 to get 6/8.',
        'Step 4: 6 parts of the 8 are shaded, and 6/8 covers exactly as much rectangle as 3/4 did.',
      ],
      conceptSummary:
        'Equivalent fractions name the same amount with parts of a different size. Splitting each part multiplies BOTH the number of parts and the number of shaded parts by the same factor, which is why the shaded area does not change.',
      commonMisconception:
        'Answering 3 keeps the old count against the new parts, which shades only half as much rectangle as before — the line Sofia drew cannot have removed any shading.',
    },
  },
  {
    id: 'g4-nf1-02',
    standardCode: 'NC.4.NF.1',
    domainId: 'NF',
    prompt: 'Which fraction with a denominator of 12 names the same amount as 2/3?',
    options: labelOptions([
      { text: '8/12', isCorrect: true },
      // 3 × 4 = 12 for the denominator, but the numerator was copied across
      // unchanged: 2/12.
      { text: '2/12', isCorrect: false, misconception: 'scaled-the-denominator-only' },
      // 12 - 3 = 9 added to both parts instead of multiplying both by 4:
      // 2 + 9 = 11 over 3 + 9 = 12.
      {
        text: '11/12',
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
      // The original denominator, 3, used as the new numerator.
      {
        text: '3/12',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Thirds have to be cut into smaller parts to become twelfths: 12 / 3 = 4, so each third splits into 4 equal parts.',
        'Step 2: Cutting each part into 4 also cuts each of the 2 shaded thirds into 4 pieces: 2 × 4 = 8.',
        'Step 3: Both parts of the fraction were multiplied by the same factor, 4/4, which is one whole and so changes nothing about the amount.',
        'Step 4: 2/3 = 8/12.',
      ],
      conceptSummary:
        'Renaming a fraction means multiplying the numerator and the denominator by the SAME number, because that factor is really a form of 1. Doing it to only one of them changes the amount instead of renaming it.',
      commonMisconception:
        'Adding 9 to both parts gives 11/12, which is nearly a whole, while 2/3 is only a little over half. Adding the same amount to both parts does not preserve a fraction; only multiplying does.',
    },
  },
  {
    id: 'g4-nf1-03',
    standardCode: 'NC.4.NF.1',
    domainId: 'NF',
    prompt:
      'Two identical paper strips are folded. The first is folded into 2 equal parts and 1 part is shaded. The second is folded into 6 equal parts and 3 parts are shaded. Which statement about 1/2 and 3/6 is true?',
    options: labelOptions([
      // 6 > 2, so the fraction written with the bigger denominator was called
      // the bigger fraction.
      {
        text: '3/6 is greater, because 6 is greater than 2.',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      {
        text: 'They are the same size, but 3/6 is made of more parts and each of those parts is smaller.',
        isCorrect: true,
      },
      // Counted 3 shaded parts against 1 shaded part and stopped, never asking
      // how big those parts are.
      {
        text: '3/6 is greater, because 3 shaded parts is more than 1 shaded part.',
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // Judged by the size of the parts alone — halves really are bigger parts
      // than sixths — without counting that there are three of the sixths.
      {
        text: '1/2 is greater, because halves are bigger parts than sixths.',
        isCorrect: false,
        misconception: 'applied-the-unit-fraction-rule-to-unlike-numerators',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The strips are the same length, so the two shaded amounts can be compared directly.',
        'Step 2: Each sixth is one third the size of a half, because 6 is 3 times 2.',
        'Step 3: There are 3 shaded sixths and only 1 shaded half, and 3 parts that are each one third the size cover exactly the same length.',
        'Step 4: They are the same size, but 3/6 is made of more parts and each of those parts is smaller.',
      ],
      conceptSummary:
        'NC.4.NF.1 is about explaining WHY two fractions are equivalent: the number of parts and the size of the parts move in opposite directions by the same factor, so the amount they cover stays put.',
      commonMisconception:
        'Both 3 > 1 and 6 > 2 point the same way, so the pull to call 3/6 bigger is strong. Neither number decides anything on its own — more parts, each smaller, can land on exactly the same amount.',
    },
  },
  {
    // Options are EQUATIONS, so the shared kit's numericValue() returns null
    // for all four and the automatic same-quantity guard does not cover this
    // item. The four values are 0.75, 0.25, 0.333 and 0.917, checked by hand.
    id: 'g4-nf1-04',
    standardCode: 'NC.4.NF.1',
    domainId: 'NF',
    prompt: 'Which equation is true?',
    options: labelOptions([
      // 4 × 3 = 12 in the denominator with the numerator copied across.
      { text: '3/4 = 3/12', isCorrect: false, misconception: 'scaled-the-denominator-only' },
      // The original denominator, 4, written as the new numerator.
      {
        text: '3/4 = 4/12',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
      // 12 - 4 = 8 added to both parts rather than multiplying both by 3:
      // 3 + 8 = 11 over 4 + 8 = 12.
      {
        text: '3/4 = 11/12',
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
      { text: '3/4 = 9/12', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Every equation offers twelfths, so ask what each fourth becomes: 12 / 4 = 3, so each fourth splits into 3 twelfths.',
        'Step 2: Splitting each part into 3 turns the 3 shaded fourths into 3 × 3 = 9 shaded twelfths.',
        'Step 3: Check it on a length model: 3/4 is three quarters of a strip, and 9/12 marks the same point on an identical strip, while 3/12, 4/12 and 11/12 mark a quarter, a third, and nearly the whole strip.',
        'Step 4: The true equation is 3/4 = 9/12.',
      ],
      conceptSummary:
        'A fraction is renamed by multiplying the top and the bottom by the same factor. The factor comes from the denominators — here 12 / 4 = 3 — and must then be applied to the numerator as well.',
      commonMisconception:
        'A quick size check catches every wrong option: 3/4 sits three quarters along the strip, while 3/12 and 4/12 are below half and 11/12 is almost the whole thing.',
    },
  },

  // ==========================================
  // Standard: NC.4.NF.2 — Compare Fractions with Unlike Numerators & Denominators
  // ==========================================
  {
    id: 'g4-nf2-01',
    standardCode: 'NC.4.NF.2',
    domainId: 'NF',
    prompt: 'Each fraction below describes part of the same size whole. Which comparison is true?',
    options: labelOptions([
      { text: '3/8 < 1/2', isCorrect: true },
      // 3 > 1, so the fraction with the bigger numerator was called the bigger
      // fraction, without noticing that eighths are smaller parts than halves.
      { text: '3/8 > 1/2', isCorrect: false, misconception: 'compared-numerators-only' },
      // 8 > 3, so the fraction written with the bigger denominator was called
      // the bigger fraction. In fact eighths are the SMALLER parts, so 1/8 is
      // less than 1/3.
      {
        text: '1/8 > 1/3',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      // Sixths really are smaller parts than thirds, and that rule was applied
      // without counting that there are 5 of them: 5/6 is more than 2/3.
      {
        text: '5/6 < 2/3',
        isCorrect: false,
        misconception: 'applied-the-unit-fraction-rule-to-unlike-numerators',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Compare 3/8 with 1/2 using the benchmark 1/2 itself. Half of 8 is 4, so 4/8 = 1/2.',
        'Step 2: 3/8 is less than 4/8, so 3/8 < 1/2. That comparison is true.',
        'Step 3: Check the others. 1/8 and 1/3 are single parts, and a whole cut into 8 gives smaller parts than a whole cut into 3, so 1/8 < 1/3 and that option is false.',
        'Step 4: 5/6 against 2/3: rewriting 2/3 as 4/6 shows 5/6 > 4/6, so "5/6 < 2/3" is false too. The true comparison is 3/8 < 1/2.',
      ],
      conceptSummary:
        'A fraction has two numbers and neither settles a comparison alone. The numerator counts the parts and the denominator sizes them, so a comparison has to account for both — by a benchmark, a common denominator, or a common numerator.',
      commonMisconception:
        'Reading 1/8 > 1/3 off the digits 8 and 3 is the classic fraction error: the bigger the denominator, the more pieces the whole was cut into, and so the SMALLER each piece is.',
    },
  },
  {
    id: 'g4-nf2-02',
    standardCode: 'NC.4.NF.2',
    domainId: 'NF',
    prompt:
      "Mr. Diaz's class walked 7/12 mile and Ms. Rowe's class walked 5/6 mile on the same trail. Which class walked farther, and why?",
    options: labelOptions([
      // 7 > 5, so the class with the bigger numerator was called the farther
      // walker; twelfths are smaller parts than sixths, which this never
      // accounts for.
      {
        text: "Mr. Diaz's class, because 7 is greater than 5.",
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // 12 > 6, so the fraction written with the bigger denominator was called
      // the bigger distance.
      {
        text: "Mr. Diaz's class, because 12 is greater than 6.",
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      {
        text: "Ms. Rowe's class, because 5/6 is the same as 10/12, and 10/12 is more than 7/12.",
        isCorrect: true,
      },
      // Both fractions clear the 1/2 benchmark - 7/12 > 6/12 and 5/6 > 3/6 -
      // and the comparison was abandoned at that point instead of being
      // carried through to a common denominator.
      {
        text: 'They walked the same distance, because both fractions are more than 1/2.',
        isCorrect: false,
        misconception: 'benchmark-comparison-left-unfinished',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The two classes walked the same trail, so the fractions refer to the same whole mile and can be compared.',
        'Step 2: 12 is a multiple of 6, so rename the sixths as twelfths: 5/6 = 10/12.',
        'Step 3: Now the parts are the same size, so the numerators decide it: 10 twelfths against 7 twelfths.',
        "Step 4: Ms. Rowe's class, because 5/6 is the same as 10/12, and 10/12 is more than 7/12.",
      ],
      conceptSummary:
        'Two fractions can only be compared by their numerators once their denominators match. Renaming one fraction so both count the same-size parts is usually less work than renaming both.',
      commonMisconception:
        'Benchmarks are a real strategy but they only finish the job when the two fractions land on OPPOSITE sides. Both of these are above 1/2, so the benchmark rules nothing out and the comparison still has to be made.',
    },
  },
  {
    id: 'g4-nf2-03',
    standardCode: 'NC.4.NF.2',
    domainId: 'NF',
    prompt: 'All four fractions below describe parts of identical wholes. Which one is the greatest?',
    promptDetails: '5/6, 7/10, 5/12, 2/3',
    options: labelOptions([
      // 12 is the biggest denominator on the page, so this was read as the
      // biggest fraction; 5/12 is in fact the smallest of the four.
      {
        text: '5/12',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      { text: '5/6', isCorrect: true },
      // 7 is the biggest numerator on the page, so this was read as the biggest
      // fraction without weighing that tenths are smaller parts than sixths.
      { text: '7/10', isCorrect: false, misconception: 'compared-numerators-only' },
      // 3 is the smallest denominator, so this was read as the biggest fraction
      // on the unit-fraction rule - true for 1/3 against 1/6, but these have
      // different numerators, and 5 sixths outweigh 2 thirds.
      {
        text: '2/3',
        isCorrect: false,
        misconception: 'applied-the-unit-fraction-rule-to-unlike-numerators',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Sort them against the benchmark 1/2 first. 5/12 is less than 6/12, so 5/12 is below half and cannot be the greatest.',
        'Step 2: The other three are all above half, so use a common denominator of 60: 5/6 = 50/60, 7/10 = 42/60, 2/3 = 40/60.',
        'Step 3: Comparing sixtieths: 50 > 42 > 40.',
        'Step 4: The greatest fraction is 5/6.',
      ],
      conceptSummary:
        'Benchmarks narrow a field quickly, and a common denominator finishes it. Once every fraction counts the same-size parts, comparing them is just comparing whole numbers.',
      commonMisconception:
        'Two of these options are picked by rules that look at one number only — the biggest numerator (7/10) and the smallest denominator (2/3). Both rules work sometimes, and neither works here.',
    },
  },
  {
    id: 'g4-nf2-04',
    standardCode: 'NC.4.NF.2',
    domainId: 'NF',
    prompt:
      'Rosa ate 1/4 of a small pizza. Her cousin ate 1/6 of a large pizza, and the large pizza is much bigger than the small one. Rosa says "I ate more, because fourths are bigger pieces than sixths." What is wrong with her reasoning?',
    options: labelOptions([
      // 6 > 4, so the fraction with the bigger denominator was called the
      // bigger amount - which is the opposite of what the denominators mean.
      {
        text: 'She should have said her cousin ate more, because 6 is greater than 4.',
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      // Counted 1 piece against 1 piece and called it settled, without weighing
      // how big those two pieces are.
      {
        text: 'She should have said they ate the same, because each of them ate 1 piece.',
        isCorrect: false,
        misconception: 'compared-numerators-only',
      },
      // Accepted the comparison of the two fractions as if the pizzas were the
      // same size. 1/4 IS more than 1/6 of one pizza - but a sixth of a much
      // larger pizza can easily be more food.
      {
        text: 'Nothing is wrong: 1/4 is always more than 1/6, so Rosa ate more pizza.',
        isCorrect: false,
        misconception: 'compared-across-different-wholes',
      },
      {
        text: 'The two pizzas are different sizes, so comparing 1/4 and 1/6 cannot tell you who ate more food.',
        isCorrect: true,
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Rosa is right about the fractions themselves: of one identical pizza, 1/4 is more than 1/6, because fourths are the bigger pieces.',
        'Step 2: But 1/4 and 1/6 are fractions OF something, and here they are fractions of two different pizzas.',
        'Step 3: A sixth of a very large pizza can easily be more food than a fourth of a small one, so the fractions alone do not settle it.',
        'Step 4: The two pizzas are different sizes, so comparing 1/4 and 1/6 cannot tell you who ate more food.',
      ],
      conceptSummary:
        'NC.4.NF.2 says it directly: comparisons are valid only when the two fractions refer to the same whole. A fraction is not an amount until you know what it is a fraction of.',
      commonMisconception:
        'The trap here is that Rosa\'s rule about the pieces is CORRECT. What she skipped is checking that the rule applies — and with two different pizzas on the table, it does not.',
    },
  },

  // ==========================================
  // Standard: NC.4.NF.3 — Decompose, Add & Subtract Fractions with Like Denominators
  // ==========================================
  {
    id: 'g4-nf3-01',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt:
      'A muffin recipe uses 3/8 cup of milk and 2/8 cup of water. How much liquid does the recipe use in all?',
    options: labelOptions([
      // The denominators were added along with the numerators: 3 + 2 = 5 over
      // 8 + 8 = 16.
      {
        text: '5/16 cup',
        isCorrect: false,
        misconception: 'operated-on-the-like-denominators-too',
      },
      { text: '5/8 cup', isCorrect: true },
      // 3 - 2 = 1: the two amounts were separated instead of joined.
      { text: '1/8 cup', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // The denominators were multiplied together, 8 × 8 = 64, as if a common
      // denominator had to be built out of two that already matched.
      {
        text: '5/64 cup',
        isCorrect: false,
        misconception: 'multiplied-the-denominators-instead-of-keeping-them',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "In all" means the two amounts are joined: 3/8 + 2/8.',
        'Step 2: Both are already counted in eighths, so the parts are the same size and nothing has to be renamed.',
        'Step 3: Count the parts: 3 eighths and 2 more eighths make 5 eighths.',
        'Step 4: The recipe uses 5/8 cup of liquid.',
      ],
      conceptSummary:
        'Adding fractions with like denominators is counting: 3 of something plus 2 of the same something is 5 of it. The denominator says WHAT is being counted, so it comes along unchanged.',
      commonMisconception:
        'Adding the denominators too gives 5/16, which is less than the 3/8 you started with. Pouring water into milk cannot leave you with less liquid than the milk alone.',
    },
  },
  {
    id: 'g4-nf3-02',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt:
      'A jug held 4 1/5 liters of juice. Someone poured out 1 3/5 liters. How much juice is left in the jug?',
    options: labelOptions([
      { text: '2 3/5 liters', isCorrect: true },
      // The whole numbers subtracted correctly, 4 - 1 = 3, but the fifths were
      // subtracted smaller-from-larger to avoid regrouping: 3 - 1 = 2.
      { text: '3 2/5 liters', isCorrect: false, misconception: 'forgot-to-regroup' },
      // One whole was regrouped into the fraction part - 4 1/5 becomes 3 6/5,
      // and 6/5 - 3/5 = 3/5 - but the whole-number part was still worked out as
      // 4 - 1 = 3 instead of 3 - 1 = 2.
      {
        text: '3 3/5 liters',
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-whole',
      },
      // 4 + 1 = 5 and 1/5 + 3/5 = 4/5: the juice poured out was added to the
      // jug instead of taken from it.
      { text: '5 4/5 liters', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Juice left is what was there minus what was poured out: 4 1/5 - 1 3/5.',
        'Step 2: 1/5 is not enough to take 3/5 from, so regroup one whole liter into fifths: 4 1/5 = 3 + 5/5 + 1/5 = 3 6/5.',
        'Step 3: Now subtract each part: 6/5 - 3/5 = 3/5, and 3 - 1 = 2.',
        'Step 4: 2 3/5 liters of juice are left.',
      ],
      conceptSummary:
        'Regrouping a mixed number works exactly as it does in the standard algorithm: one whole is traded for its equivalent in fifths, and the whole-number part must drop by one at the same moment the fraction part grows.',
      commonMisconception:
        'Add the answer back to check it: 2 3/5 + 1 3/5 = 4 1/5, exactly what the jug held. The dodge that avoids regrouping gives 3 2/5, and 3 2/5 + 1 3/5 = 5 liters, which is 4/5 of a liter more than the jug ever held.',
    },
  },
  {
    id: 'g4-nf3-03',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt:
      'Carlos jogged 2 2/5 miles on Saturday and 1 1/5 miles on Sunday. How far did he jog over the two days?',
    options: labelOptions([
      // The denominators were added along with the numerators: 2 + 1 = 3 over
      // 5 + 5 = 10, giving 3 3/10.
      {
        text: '3 3/10 miles',
        isCorrect: false,
        misconception: 'operated-on-the-like-denominators-too',
      },
      // The whole numbers were combined, 2 + 1 = 3, and Sunday's 1/5 was never
      // brought into the sum at all.
      { text: '3 2/5 miles', isCorrect: false, misconception: 'dropped-a-fraction-part' },
      // 2 - 1 = 1 and 2/5 - 1/5 = 1/5: the two days were separated instead of
      // combined.
      { text: '1 1/5 miles', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '3 3/5 miles', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Over the two days" joins the two distances: 2 2/5 + 1 1/5.',
        'Step 2: Add the whole miles: 2 + 1 = 3.',
        'Step 3: Add the fifths, which are already the same size parts: 2/5 + 1/5 = 3/5. That is less than a whole, so no regrouping is needed.',
        'Step 4: Carlos jogged 3 3/5 miles.',
      ],
      conceptSummary:
        'A mixed number is a whole number plus a fraction, so adding two of them adds the wholes to the wholes and the parts to the parts. Both pieces of the answer have to be carried to the end.',
      commonMisconception:
        'Answering 3 2/5 adds the miles and quietly loses Sunday\'s fifth. Every number in the problem has to appear in the work somewhere.',
    },
  },
  {
    id: 'g4-nf3-04',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt:
      'A bag holds 11/12 pound of rice. A recipe uses 4/12 pound of it. How much rice is left in the bag?',
    options: labelOptions([
      // 11 + 4 = 15: the rice used was added to the bag instead of taken out of
      // it.
      { text: '15/12 pound', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // The denominators were subtracted along with the numerators:
      // 11 - 4 = 7 over 12 - 4 = 8.
      {
        text: '7/8 pound',
        isCorrect: false,
        misconception: 'operated-on-the-like-denominators-too',
      },
      { text: '7/12 pound', isCorrect: true },
      // The denominators were multiplied together, 12 × 12 = 144, as if a
      // common denominator had to be built out of two that already matched.
      {
        text: '7/144 pound',
        isCorrect: false,
        misconception: 'multiplied-the-denominators-instead-of-keeping-them',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Rice left is what was in the bag minus what the recipe used: 11/12 - 4/12.',
        'Step 2: Both amounts are counted in twelfths, so the parts already match and the denominator stays 12.',
        'Step 3: Take 4 twelfths away from 11 twelfths: 11 - 4 = 7 twelfths.',
        'Step 4: 7/12 pound of rice is left in the bag.',
      ],
      conceptSummary:
        'Subtracting like denominators separates parts of the same size, so only the count changes. The denominator is a label on what is being counted, not a number in the subtraction.',
      commonMisconception:
        'Add the answer back to check it: 7/12 + 4/12 = 11/12, exactly what the bag held. Subtracting the denominators too gives 7/8, and eighths are bigger parts than twelfths — 7/8 is more than 10/12, so almost none of the rice would have been used at all.',
    },
  },

  // NC.4.NF.3's headline description is "Understand and justify decompositions
  // of fractions", and its second keyConcept asks for a fraction broken into a
  // sum of unit fractions AND into a sum of fractions with the same
  // denominator, "in more than one way". The two items below are that half of
  // the standard; the four above are the adding and subtracting half.
  {
    // Options are SUMS, so the shared kit's numericValue() returns null for all
    // four and the automatic same-quantity guard does not cover this item. The
    // four values are 3/4, 1, 1/4 and 9/4, checked by hand. Checked by hand too:
    // that no distractor is itself a valid decomposition of 3/4 into unit
    // fractions — 1/2 + 1/4 would have been one, and is not offered.
    id: 'g4-nf3-05',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt: 'Which expression shows 3/4 decomposed into a sum of unit fractions?',
    options: labelOptions([
      { text: '1/4 + 1/4 + 1/4', isCorrect: true },
      // Four copies, not three: the denominator was taken as the number of
      // parts to write down, so the whole was decomposed instead of the 3/4.
      {
        text: '1/4 + 1/4 + 1/4 + 1/4',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
      // The right count of pieces, but the denominator multiplied by 3 as
      // well: 4 × 3 = 12, so each piece was written a third of its real size.
      {
        text: '1/12 + 1/12 + 1/12',
        isCorrect: false,
        misconception: 'multiplied-the-denominator-too',
      },
      // Three copies of the whole fraction rather than of its unit fraction,
      // which comes to 9/4 — three times too much.
      {
        text: '3/4 + 3/4 + 3/4',
        isCorrect: false,
        misconception: 'repeated-the-whole-fraction-not-the-unit-fraction',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A unit fraction has 1 on top. The unit fraction here is 1/4, because the whole is cut into fourths.',
        'Step 2: 3/4 means 3 of those fourths, so it takes exactly 3 copies of 1/4 — not 4, which would be the whole thing.',
        'Step 3: The pieces do not change size when they are written out separately, so every one of them stays a fourth.',
        'Step 4: 3/4 = 1/4 + 1/4 + 1/4.',
      ],
      conceptSummary:
        'Decomposing a fraction breaks it into pieces that add back to exactly what you started with. The numerator says how many pieces, and the denominator says what size each one is — and only the count is allowed to change.',
      commonMisconception:
        'Writing 4 copies of 1/4 decomposes the WHOLE, not the 3/4. The check is always the same: add the pieces up and see whether you get back the fraction you began with.',
    },
  },
  {
    // Options are EQUATIONS, so the shared kit's numericValue() returns null
    // for all four and the automatic same-quantity guard does not cover this
    // item. The right-hand sides come to 9/5, 8/10, 9/10 and 10/10, checked by
    // hand. Checked by hand too: only one of them equals 9/10, and no other
    // valid decomposition (1/10 + 8/10, 2/10 + 7/10, ...) is offered.
    id: 'g4-nf3-06',
    standardCode: 'NC.4.NF.3',
    domainId: 'NF',
    prompt: 'Which equation correctly decomposes 9/10 into a sum of two fractions?',
    options: labelOptions([
      // The denominator was split as well as the numerator: 9 into 4 + 5 and
      // 10 into 5 + 5, which makes the pieces twice the size they should be
      // and adds to 9/5.
      {
        text: '9/10 = 4/5 + 5/5',
        isCorrect: false,
        misconception: 'decomposed-the-denominator-too',
      },
      // 3 + 5 = 8, so one tenth of the nine was left out of the decomposition
      // altogether.
      {
        text: '9/10 = 3/10 + 5/10',
        isCorrect: false,
        misconception: 'dropped-a-fraction-part',
      },
      { text: '9/10 = 4/10 + 5/10', isCorrect: true },
      // The denominator was the number split up: 10 broken into 5 + 5 and
      // written as the two numerators, which adds to a whole rather than 9/10.
      {
        text: '9/10 = 5/10 + 5/10',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Decomposing 9/10 means splitting the 9 tenths into groups, so every piece is still counted in tenths.',
        'Step 2: The two numerators have to add back to 9, because the 9 pieces are only being sorted, never created or lost.',
        'Step 3: 4 + 5 = 9, and both pieces are tenths, so the sizes are untouched as well as the count.',
        'Step 4: 9/10 = 4/10 + 5/10. It is one of several correct decompositions — 1/10 + 8/10 and 2/10 + 7/10 work the same way.',
      ],
      conceptSummary:
        'A fraction can be decomposed in more than one way, and every correct way obeys the same two rules: the pieces keep the denominator, and their numerators add back to the original numerator.',
      commonMisconception:
        'Splitting the denominator as well turns tenths into fifths, which are twice the size — so 4/5 + 5/5 comes to 9/5, nearly two wholes, from a fraction that was less than one.',
    },
  },

  // ==========================================
  // Standard: NC.4.NF.4 — Multiply a Fraction by a Whole Number
  // ==========================================
  {
    id: 'g4-nf4-01',
    standardCode: 'NC.4.NF.4',
    domainId: 'NF',
    prompt:
      'One serving of trail mix is 2/5 cup. How much trail mix is needed for 4 servings?',
    options: labelOptions([
      // 4 × 2 = 8 on top and 4 × 5 = 20 underneath: the denominator was scaled
      // too, which leaves the amount exactly where it started.
      { text: '8/20 cup', isCorrect: false, misconception: 'multiplied-the-denominator-too' },
      // 4 + 2 = 6: the whole number was added to the numerator instead of
      // multiplying.
      { text: '6/5 cup', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: '8/5 cup', isCorrect: true },
      // The 4 and the 2/5 were written side by side as a mixed number, which
      // adds 2/5 to 4 rather than taking four copies of 2/5.
      {
        text: '4 2/5 cup',
        isCorrect: false,
        misconception: 'wrote-the-product-as-a-mixed-number',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Four servings of 2/5 cup each is 4 × 2/5, which is 2/5 + 2/5 + 2/5 + 2/5.',
        'Step 2: Every addend is counted in fifths, so the parts stay fifths: the pieces do not change size just because there are more of them.',
        'Step 3: Count the fifths: 4 × 2 = 8 of them.',
        'Step 4: The recipe needs 8/5 cup of trail mix, which is one and three fifths cups.',
      ],
      conceptSummary:
        'Multiplying a fraction by a whole number repeats it, so only the COUNT of parts changes. The denominator names the size of one part, and taking more of them cannot make each one smaller.',
      commonMisconception:
        'Multiplying the denominator too gives 8/20, which is the same amount as 2/5 — one serving. Four servings must be more than one, so that answer fails before any arithmetic is checked.',
    },
  },
  {
    id: 'g4-nf4-02',
    standardCode: 'NC.4.NF.4',
    domainId: 'NF',
    prompt: 'Priya works out 3 × 2/7 and writes 6/21. What went wrong, and what is the product?',
    options: labelOptions([
      {
        text: 'She multiplied the denominator by 3 as well; the product is 6/7.',
        isCorrect: true,
      },
      // Accepts 6/21, which is 3 × 2 over 3 × 7 - and 6/21 is the same amount
      // as 2/7, so three copies came out no bigger than one.
      {
        text: 'Nothing went wrong: multiplying by 3 multiplies the top and the bottom, so 6/21 is right.',
        isCorrect: false,
        misconception: 'multiplied-the-denominator-too',
      },
      // 3 + 2 = 5 over 7: the whole number was added to the numerator rather
      // than multiplied through it.
      {
        text: 'She should have added the 3 to the numerator; the product is 5/7.',
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // The 3 and the 2/7 written side by side, which is 3 + 2/7, not 3 copies
      // of 2/7.
      {
        text: 'She should have written the 3 beside the fraction; the product is 3 2/7.',
        isCorrect: false,
        misconception: 'wrote-the-product-as-a-mixed-number',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 3 × 2/7 means 2/7 + 2/7 + 2/7 — three copies of two sevenths.',
        'Step 2: Every copy is measured in sevenths, so the answer is measured in sevenths too. The denominator stays 7.',
        'Step 3: Count the sevenths: 3 × 2 = 6, so the product is 6/7. Priya multiplied the 7 by 3 as well, which is why she got 6/21.',
        'Step 4: She multiplied the denominator by 3 as well; the product is 6/7.',
      ],
      conceptSummary:
        'Scaling both the numerator and the denominator is how you RENAME a fraction, not how you multiply it. 6/21 and 2/7 are the same number, which is the clearest sign the operation never happened.',
      commonMisconception:
        'The rule "do the same thing to the top and the bottom" belongs to equivalent fractions. Applied to multiplication it undoes itself, and the answer comes back unchanged.',
    },
  },
  {
    id: 'g4-nf4-03',
    standardCode: 'NC.4.NF.4',
    domainId: 'NF',
    prompt: 'One lap around a track is 3/8 mile. Jordan runs 7 laps. How far does Jordan run?',
    options: labelOptions([
      // 7 + 3 = 10: the number of laps was added to the numerator instead of
      // multiplying by it.
      { text: '10/8 mile', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: '21/8 miles', isCorrect: true },
      // The length of one lap was reported; the 7 laps were never applied.
      {
        text: '3/8 mile',
        isCorrect: false,
        misconception: 'forgot-to-scale-by-the-whole-number',
      },
      // The 7 and the 3/8 written side by side as a mixed number, which is
      // 7 + 3/8 rather than 7 copies of 3/8.
      {
        text: '7 3/8 miles',
        isCorrect: false,
        misconception: 'wrote-the-product-as-a-mixed-number',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Seven laps of 3/8 mile each is 7 × 3/8.',
        'Step 2: Each lap contributes 3 eighths of a mile, and the eighths all measure the same thing, so they can simply be counted up.',
        'Step 3: 7 × 3 = 21 eighths of a mile.',
        'Step 4: Jordan runs 21/8 miles, which is between 2 and 3 miles.',
      ],
      conceptSummary:
        'A whole number times a fraction is repeated addition of that fraction, so the product is the numerator repeated that many times over the same denominator.',
      commonMisconception:
        'Estimating brackets the answer: 3/8 sits between 1/4 and 1/2, so 7 laps must land between 7 × 1/4 = 1 3/4 miles and 7 × 1/2 = 3 1/2 miles. Only 21/8, which is 2 5/8, falls inside that range — 10/8 is below it, and 3/8 and 7 3/8 are nowhere near it.',
    },
  },
  {
    id: 'g4-nf4-04',
    standardCode: 'NC.4.NF.4',
    domainId: 'NF',
    prompt:
      'A craft project uses 3/4 yard of ribbon. Mrs. Lee is making 6 of these projects. How much ribbon does she need?',
    options: labelOptions([
      // 6 × 3 = 18 on top and 6 × 4 = 24 underneath: the denominator was scaled
      // too, which leaves the amount unchanged at 3/4.
      { text: '18/24 yards', isCorrect: false, misconception: 'multiplied-the-denominator-too' },
      // The 6 and the 3/4 written side by side as a mixed number: that is
      // 6 + 3/4, not 6 copies of 3/4.
      {
        text: '6 3/4 yards',
        isCorrect: false,
        misconception: 'wrote-the-product-as-a-mixed-number',
      },
      // 6 + 3 = 9: the number of projects was added to the numerator rather
      // than multiplied through it.
      { text: '9/4 yards', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: '18/4 yards', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Six projects using 3/4 yard each is 6 × 3/4.',
        'Step 2: Think of it as 6 groups of 3 fourths: the fourths never change size, there are just more of them.',
        'Step 3: 6 × 3 = 18 fourths.',
        'Step 4: Mrs. Lee needs 18/4 yards of ribbon, which is 4 and a half yards.',
      ],
      conceptSummary:
        'The whole number multiplies the count of parts, never the size of them. Writing the product over the original denominator is what records that the parts stayed the same.',
      commonMisconception:
        'Six projects at about 3/4 yard each should come to something near 4 1/2 yards. 18/24 is under a yard and 6 3/4 is nearly seven — a rough estimate rules out both.',
    },
  },

  // ==========================================
  // Standard: NC.4.NF.6 — Decimal Notation for Tenths & Hundredths
  // ==========================================
  {
    id: 'g4-nf6-01',
    standardCode: 'NC.4.NF.6',
    domainId: 'NF',
    prompt:
      'A meter stick is divided into 100 equal parts. A pencil is exactly 18 of those parts long. Which decimal gives the pencil\'s length in meters?',
    options: labelOptions([
      { text: '0.18 m', isCorrect: true },
      // 18/100 written with the 18 shifted one place to the left, as though
      // hundredths began at the tenths place.
      { text: '1.8 m', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // 18/100 written with the 18 shifted one place to the right, as though a
      // denominator of 100 needed three decimal places.
      { text: '0.018 m', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // The 1 and the 8 written in each other's places: 8 tenths and 1
      // hundredth instead of 1 tenth and 8 hundredths.
      { text: '0.81 m', isCorrect: false, misconception: 'swapped-the-decimal-place-values' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each of the 100 equal parts is one hundredth of a meter, so the pencil is 18/100 meter long.',
        'Step 2: The first place after the decimal point is tenths and the second is hundredths, so hundredths need exactly two decimal places.',
        'Step 3: 18 hundredths is 1 tenth and 8 hundredths, which writes as 1 in the tenths place and 8 in the hundredths place.',
        'Step 4: The pencil is 0.18 m long.',
      ],
      conceptSummary:
        'A fraction with a denominator of 100 is written with two decimal places, because the second place after the point IS the hundredths place. The denominator tells you which place the last digit lands in.',
      commonMisconception:
        'Writing 1.8 says the pencil is nearly two meters long. Checking the size of the answer against the situation catches a misplaced decimal point faster than recounting the digits.',
    },
  },
  {
    id: 'g4-nf6-02',
    standardCode: 'NC.4.NF.6',
    domainId: 'NF',
    prompt: 'Which fraction with a denominator of 100 names the same amount as 6/10?',
    options: labelOptions([
      // The denominator was scaled by 10 and the numerator carried across
      // unchanged: 6/100.
      { text: '6/100', isCorrect: false, misconception: 'scaled-the-denominator-only' },
      // The original denominator, 10, written as the new numerator.
      {
        text: '10/100',
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
      { text: '60/100', isCorrect: true },
      // 100 - 10 = 90 added to both parts instead of multiplying both by 10:
      // 6 + 90 = 96 over 10 + 90 = 100.
      {
        text: '96/100',
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A whole cut into 10 parts and then each part cut into 10 again gives 100 parts, so each tenth is 10 hundredths.',
        'Step 2: The 6 shaded tenths each become 10 shaded hundredths: 6 × 10 = 60.',
        'Step 3: Both parts of the fraction were multiplied by 10, which is the factor 10/10 — one whole — so the amount did not change.',
        'Step 4: 6/10 = 60/100, and both are written as the decimal 0.60 or 0.6.',
      ],
      conceptSummary:
        'Tenths and hundredths sit in the same base-ten system: ten hundredths make one tenth. That is exactly why 0.6 and 0.60 are the same number.',
      commonMisconception:
        '6/100 is a tenth of the amount 6/10 names. Rescaling a fraction means multiplying BOTH parts by the same factor, never just the denominator.',
    },
  },
  {
    id: 'g4-nf6-03',
    standardCode: 'NC.4.NF.6',
    domainId: 'NF',
    prompt:
      'Malik ran 4/10 kilometer before school and 7/100 kilometer after school. How far did he run in all?',
    options: labelOptions([
      // 4 + 7 = 11 on top and 10 + 100 = 110 underneath: both rows added
      // straight across with no common denominator found.
      {
        text: '11/110 kilometer',
        isCorrect: false,
        misconception: 'added-numerators-and-denominators',
      },
      // 100 was taken as the common denominator but the 4 tenths were never
      // rescaled to 40 hundredths: 4 + 7 = 11 over 100.
      {
        text: '11/100 kilometer',
        isCorrect: false,
        misconception: 'common-denominator-numerator-not-scaled',
      },
      // The wrong addend was scaled: the 7 hundredths were multiplied by 10 to
      // give 70, and the 4 tenths were left as 4, for 4 + 70 = 74.
      { text: '74/100 kilometer', isCorrect: false, misconception: 'scaled-the-wrong-addend' },
      { text: '47/100 kilometer', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The two distances are joined: 4/10 + 7/100.',
        'Step 2: Tenths and hundredths are different sized parts, so rename the tenths: 4/10 = 40/100, because each tenth is 10 hundredths.',
        'Step 3: Now both are counted in hundredths: 40/100 + 7/100 = 47/100.',
        'Step 4: Malik ran 47/100 kilometer, which is written 0.47 km.',
      ],
      conceptSummary:
        'Tenths and hundredths are the one pair of unlike denominators Grade 4 adds, and they are easy to join because 10 divides 100 exactly: every tenth is simply ten hundredths.',
      commonMisconception:
        'Adding 4 and 7 to get 11 hundredths treats a tenth as though it were a hundredth. One tenth is ten times bigger, and the rescaling has to happen before anything is added.',
    },
  },
  {
    id: 'g4-nf6-04',
    standardCode: 'NC.4.NF.6',
    domainId: 'NF',
    prompt:
      'A 10 by 10 grid represents 1 whole. Exactly 9 of its 100 small squares are shaded. Which decimal names the shaded part of the grid?',
    options: labelOptions([
      // The 9 written straight after the point, so the zero that has to hold
      // the empty tenths place was left out and the 9 landed in tenths.
      { text: '0.9', isCorrect: false, misconception: 'omitted-placeholder-zero' },
      { text: '0.09', isCorrect: true },
      // 9/100 written with the 9 shifted one place further right, as though a
      // denominator of 100 needed three decimal places.
      { text: '0.009', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // The count of shaded squares reported as the amount, rather than what
      // 9 out of 100 squares is worth.
      { text: '9.0', isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The grid has 100 small squares and 9 are shaded, so the shaded part is 9/100 of the whole.',
        'Step 2: Hundredths live in the second place after the decimal point, so the 9 has to land in that second place.',
        'Step 3: There are no tenths at all — 9 hundredths is not even one tenth — so a 0 must hold the tenths place open.',
        'Step 4: The shaded part is 0.09 of the grid.',
      ],
      conceptSummary:
        'A hundredths grid makes the two decimal places visible: one column of 10 squares is a tenth, one square is a hundredth. Nine single squares do not fill a column, which is what the 0 in the tenths place records.',
      commonMisconception:
        'Writing 0.9 shades nine whole columns — ninety squares instead of nine. The placeholder zero is not decoration; it is what keeps the 9 in the hundredths place.',
    },
  },

  // ==========================================
  // Standard: NC.4.NF.7 — Compare Decimals to Hundredths
  // ==========================================
  {
    id: 'g4-nf7-01',
    standardCode: 'NC.4.NF.7',
    domainId: 'NF',
    prompt: 'Each decimal below describes part of the same size whole. Which comparison is true?',
    options: labelOptions([
      // The decimal parts read as whole numbers: 25 is more than 5, so 0.25 was
      // called the larger number.
      { text: '0.5 < 0.25', isCorrect: false, misconception: 'compared-by-digit-count' },
      { text: '0.5 > 0.25', isCorrect: true },
      // The same habit again on a different pair: 19 read as more than 2, when
      // 0.19 is 1 tenth and 9 hundredths against 2 whole tenths.
      { text: '0.19 > 0.2', isCorrect: false, misconception: 'compared-by-digit-count' },
      // The zero holding the tenths place in 0.06 was ignored, so 0.06 was read
      // as 0.6 and the two looked identical.
      { text: '0.06 = 0.6', isCorrect: false, misconception: 'omitted-placeholder-zero' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Write both numbers to the same number of places so the columns line up: 0.5 is 0.50, and 0.25 stays 0.25.',
        'Step 2: Compare the tenths place first, because it is worth the most: 5 tenths against 2 tenths.',
        'Step 3: 5 tenths is more than 2 tenths, so the hundredths place never gets a vote.',
        'Step 4: 0.5 > 0.25.',
      ],
      conceptSummary:
        'Decimals are compared place by place from the left, exactly like whole numbers. A longer decimal is not a larger one — 0.5 is half of a whole and 0.25 is a quarter of it.',
      commonMisconception:
        'Reading the digits after the point as the whole number "twenty-five" against "five" is the single commonest decimal error. Padding 0.5 out to 0.50 makes the comparison honest: 50 hundredths against 25 hundredths.',
    },
  },
  {
    id: 'g4-nf7-02',
    standardCode: 'NC.4.NF.7',
    domainId: 'NF',
    prompt:
      'Three beetles crawled across the same tabletop. They travelled 0.4 meter, 0.35 meter and 0.09 meter. Which list shows the three distances in order from GREATEST to LEAST?',
    options: labelOptions([
      // The decimal parts read as whole numbers: 35, then 9, then 4.
      {
        text: '0.35 m; 0.09 m; 0.4 m',
        isCorrect: false,
        misconception: 'compared-by-digit-count',
      },
      // The zero holding the tenths place in 0.09 was ignored, so it was read
      // as 0.9 and placed first: 0.9, then 0.4, then 0.35.
      {
        text: '0.09 m; 0.4 m; 0.35 m',
        isCorrect: false,
        misconception: 'omitted-placeholder-zero',
      },
      { text: '0.4 m; 0.35 m; 0.09 m', isCorrect: true },
      // The right order, run from least to greatest when greatest to least was
      // asked for.
      {
        text: '0.09 m; 0.35 m; 0.4 m',
        isCorrect: false,
        misconception: 'ordered-from-the-wrong-end',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Write all three to hundredths so the places line up: 0.40, 0.35 and 0.09.',
        'Step 2: Compare the tenths place, which is worth the most: 4 tenths, 3 tenths and 0 tenths.',
        'Step 3: 4 > 3 > 0, so the tenths place settles it without ever reaching the hundredths.',
        'Step 4: From greatest to least: 0.4 m; 0.35 m; 0.09 m.',
      ],
      conceptSummary:
        'Padding decimals with zeros to the same length changes nothing about their value and everything about how easy they are to read: 0.4 becomes 0.40, and 40 hundredths against 35 hundredths is a whole-number comparison.',
      commonMisconception:
        '0.09 looks like the biggest number here if the zero is skipped over. That zero says there are no tenths at all, which makes 0.09 the smallest of the three by a wide margin.',
    },
  },
  {
    id: 'g4-nf7-03',
    standardCode: 'NC.4.NF.7',
    domainId: 'NF',
    prompt:
      'Four rain gauges of the same size recorded the amounts below, in inches. Which amount is the greatest?',
    promptDetails: '0.6, 0.58, 0.29, 0.07',
    options: labelOptions([
      { text: '0.6 inch', isCorrect: true },
      // The decimal parts read as whole numbers: 58 is the largest string of
      // digits on the page, though 0.58 is 58 hundredths and 0.6 is 60.
      { text: '0.58 inch', isCorrect: false, misconception: 'compared-by-digit-count' },
      // Compared from the right-hand end instead of the left: the last digits
      // are 6, 8, 9 and 7, and 9 is the biggest of those.
      { text: '0.29 inch', isCorrect: false, misconception: 'compared-decimals-right-to-left' },
      // The zero holding the tenths place was ignored, so 0.07 was read as 0.7
      // and came out ahead of everything else.
      { text: '0.07 inch', isCorrect: false, misconception: 'omitted-placeholder-zero' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The gauges are the same size, so the four decimals refer to the same whole and can be compared directly.',
        'Step 2: Write each to hundredths: 0.60, 0.58, 0.29 and 0.07.',
        'Step 3: Compare the tenths place first: 6 tenths, 5 tenths, 2 tenths and 0 tenths. Six is the largest, so no other place needs checking.',
        'Step 4: The greatest amount is 0.6 inch.',
      ],
      conceptSummary:
        'The leftmost place where two decimals differ decides the comparison, and nothing to the right of it can overturn that. Hundredths only matter once the tenths tie.',
      commonMisconception:
        'Three different bad rules each pick a different answer here: read the digits as whole numbers and you take 0.58, start from the right and you take 0.29, skip the placeholder zero and you take 0.07. Only place value from the left is reliable.',
    },
  },
  {
    id: 'g4-nf7-04',
    standardCode: 'NC.4.NF.7',
    domainId: 'NF',
    prompt: 'Which comparison is true?',
    options: labelOptions([
      // The extra digit read as extra value: 0.40 has two decimal places and
      // 0.4 has one, so 0.40 was called the larger number.
      { text: '0.40 > 0.4', isCorrect: false, misconception: 'compared-by-digit-count' },
      // Compared from the right-hand end: the last digit of 0.59 is 9 and the
      // last digit of 0.62 is 2, so 0.62 was called the smaller number.
      { text: '0.62 < 0.59', isCorrect: false, misconception: 'compared-decimals-right-to-left' },
      // The zero holding the tenths place in 0.07 was ignored, so 0.07 was
      // read as 0.7 — and 0.7 against 0.7 looks like a match.
      { text: '0.7 = 0.07', isCorrect: false, misconception: 'omitted-placeholder-zero' },
      { text: '0.40 = 0.4', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Read 0.40 by place value: 4 tenths and 0 hundredths.',
        'Step 2: Read 0.4 the same way: 4 tenths, with nothing at all in the hundredths place.',
        'Step 3: Zero hundredths and no hundredths are the same amount, so a zero on the END of a decimal adds nothing to its value. The zero in 0.07 is a different zero: it sits BEFORE the 7 and holds the tenths place open, which is why 0.07 is not 0.7.',
        'Step 4: 0.40 = 0.4.',
      ],
      conceptSummary:
        'A zero AFTER the last non-zero digit changes nothing; a zero BEFORE it, holding a place open, changes everything. 0.40 equals 0.4, while 0.04 is a tenth of either.',
      commonMisconception:
        'Extra digits feel like extra value, which is why 0.40 looks bigger than 0.4. Reading each place aloud — "four tenths, zero hundredths" — makes the two obviously identical.',
    },
  },
  {
    // NC.4.NF.7's sourced text ends with "Recognize that comparisons are valid
    // only when the two decimals refer to the same whole." No other item in
    // this domain tests it for decimals, and it is the one part of the
    // standard a child cannot get right by computing.
    id: 'g4-nf7-05',
    standardCode: 'NC.4.NF.7',
    domainId: 'NF',
    prompt:
      'A juice carton is 0.4 full. A milk jug is 0.05 full. The carton and the jug are not the same size. Which statement is TRUE?',
    options: labelOptions([
      // The zero holding the tenths place in 0.05 was ignored, so 0.05 was read
      // as 0.5, and 5 tenths beats the carton's 4 tenths.
      {
        text: 'The jug is the greater fraction full, because 5 is greater than 4.',
        isCorrect: false,
        misconception: 'omitted-placeholder-zero',
      },
      // The decimal parts read as whole numbers: 0.05 shows two digits after
      // the point and 0.4 shows one, so the longer one was called the larger.
      {
        text: 'The jug is the greater fraction full, because 0.05 has more digits than 0.4.',
        isCorrect: false,
        misconception: 'compared-by-digit-count',
      },
      // Reads the comparison of the two decimals as a comparison of the two
      // amounts. 0.4 IS greater than 0.05 - but 0.05 of a much larger jug can
      // still be more liquid than 0.4 of the carton.
      {
        text: 'The carton holds more liquid than the jug, because 0.4 is greater than 0.05.',
        isCorrect: false,
        misconception: 'compared-across-different-wholes',
      },
      {
        text: 'The carton is the greater fraction full, but which container holds more liquid cannot be told from 0.4 and 0.05 alone.',
        isCorrect: true,
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Compare the two decimals by place value: 0.4 is 40 hundredths and 0.05 is 5 hundredths, so 0.4 is much the greater number.',
        'Step 2: That settles one of the two questions here — which container is the greater fraction full. It is the carton.',
        'Step 3: It does not settle the other. A decimal is a fraction OF something, and these are fractions of two different containers: if the jug holds ten times what the carton holds, 0.05 of the jug is half a carton — more liquid than the carton has in it.',
        'Step 4: The carton is the greater fraction full, but which container holds more liquid cannot be told from 0.4 and 0.05 alone.',
      ],
      conceptSummary:
        'NC.4.NF.7 says it directly: a comparison of two decimals is valid only when they refer to the same whole. Two questions hide in one here — which is fuller, and which holds more — and the decimals answer only the first.',
      commonMisconception:
        'Comparing the numbers 0.4 and 0.05 is the easy half and it is worth doing. The trap is treating the answer to it as the answer to a question about amounts of liquid, which needs the sizes of the containers as well.',
    },
  },
];
