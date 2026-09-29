import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 2 Operations & Algebraic Thinking bank.
 *
 * A seven-year-old is the reader. Short sentences, one clause each, numbers
 * inside the standard's stated range, and no prompt that takes longer to read
 * than to solve. Every incorrect option is the value a real Grade 2 student
 * reaches by a specific, named error, tagged in `../misconceptions.ts`.
 *
 * Scope, from the sourced NC text in `./standards.ts` (rulings 17-1..17-4 of
 * `.superpowers/sdd/2026-09-13-grades-1-4-content/task-17-21-rulings.md`
 * OVERRIDE the task brief wherever the two disagree):
 *
 *   NC.2.OA.1 — add/subtract word problems within 100, unknowns in every
 *               position. Five named types: one-step Start Unknown, one-step
 *               Compare-Bigger Unknown, one-step Compare-Smaller Unknown,
 *               two-step Change Unknown, two-step Result Unknown. RULING 17-1
 *               raises the floor to 5 and requires one item of each type,
 *               every one showing an equation with a symbol for the unknown.
 *   NC.2.OA.2 — fluency with addition/subtraction within 20 using MENTAL
 *               strategies. RULING 17-4: calculatorAllowed is false on every
 *               item here, because a fluency standard answered with a
 *               calculator assesses nothing.
 *   NC.2.OA.3 — odd/even for a group of objects within 20: pairing objects
 *               and counting by 2s; determining whether objects split into
 *               two equal groups; writing an equation expressing an even
 *               number as a sum of two equal addends. RULING 17-2: the
 *               equal-addends bullet is a distinct skill the brief never
 *               asked for, and it is covered below.
 *   NC.2.OA.4 — rectangular arrays UP TO 5 ROWS AND 5 COLUMNS (stated twice
 *               in the source), total found by ADDING (not multiplying —
 *               that is Grade 3), and an equation expressing the total as a
 *               sum of equal addends. RULING 17-3: the brief's named error,
 *               "counting a shared row or column twice", is unconstructible
 *               in a rectangular array (no row or column is shared by two
 *               others), so no item here uses it. In its place: adding the
 *               row and column counts instead of adding equal groups, and
 *               skip-counting one row short or one too many.
 *
 * DEVIATION FROM THE BRIEF, worth a reviewer's attention: NC.2.OA.1's two
 * two-step items (g2-oa1-04, g2-oa1-05) use only addition and subtraction of
 * DIFFERENT given quantities, so the two steps commute — 9 − x + 4 and
 * 9 + 4 − x solve to the same x. Unlike Grade 3's multiplication-based
 * two-step problems, there is no "did the steps in the wrong order" error to
 * construct here that produces a genuinely different wrong value, so neither
 * item uses that tag; both use a stopped-early error and a counting slip
 * instead.
 *
 * Grade 2's errors are about the counting PROCESS breaking down, not an
 * algorithm going wrong, which is why several tags here are new to this
 * file's vocabulary — see the Grade 2 OA comment block in
 * `../misconceptions.ts`.
 */
export const GRADE_2_OA_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.2.OA.1 — Add & Subtract Word Problems within 100
  // ==========================================
  {
    id: 'g2-oa1-01',
    standardCode: 'NC.2.OA.1',
    domainId: 'OA',
    // One-step, Add to-Start Unknown.
    // Fix 1 (whole-branch review, Important): shortened from 5 sentences to
    // 3 by folding the result and the equation into the question. Numbers,
    // answer, standard and every distractor's derivation are unchanged.
    prompt: 'A fence had some birds. 8 more landed, and now there are 15. What number goes in ☐ + 8 = 15?',
    options: labelOptions([
      { text: '7', isCorrect: true },
      // 15 + 8 = 23: added the two known numbers instead of subtracting.
      { text: '23', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Restated the 8 that was already given instead of solving for ☐.
      { text: '8', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Counted back from 15 by ones but took one extra count: 6 instead of 7.
      { text: '6', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The ☐ stands for how many birds were on the fence at the start.',
        'Step 2: 8 more birds landed, and then there were 15 birds in all.',
        'Step 3: To find the start, undo the "8 more": 15 − 8 = 7.',
        'Step 4: The number that goes in the ☐ is 7.',
      ],
      conceptSummary:
        'When the start of a story is missing, the equation still shows the whole story — the start plus the change equals the end. Working backward from the end by the amount of the change finds the missing start.',
      commonMisconception:
        'Adding 15 and 8 gives 23, which makes the fence more crowded than the story ever says it was.',
    },
  },
  {
    id: 'g2-oa1-02',
    standardCode: 'NC.2.OA.1',
    domainId: 'OA',
    // One-step, Compare-Bigger Unknown.
    // Fix 1 (whole-branch review, Important): shortened from 4 sentences to
    // 3 by folding the equation into the question.
    prompt: 'Maya has 6 stickers. Liam has 5 more than Maya. What number goes in ☐ in 6 + 5 = ☐?',
    options: labelOptions([
      // Restated Maya's 6 instead of solving for Liam's total.
      { text: '6', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '11', isCorrect: true },
      // 6 - 5 = 1: subtracted instead of adding the "5 more".
      { text: '1', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // Counted on from 6 by ones but took one extra count: 12 instead of 11.
      { text: '12', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Liam has more stickers than Maya, so his total is Maya\'s amount plus the extra.',
        'Step 2: Maya has 6 stickers, and Liam has 5 more than that.',
        'Step 3: 6 + 5 = 11.',
        'Step 4: The number that goes in the ☐ is 11.',
      ],
      conceptSummary:
        '"More than" in a comparing problem tells which amount is bigger. Adding the smaller amount and the extra finds the bigger amount.',
      commonMisconception:
        'Subtracting 5 from 6 answers a different question — how many fewer Maya has — not how many Liam has.',
    },
  },
  {
    id: 'g2-oa1-03',
    standardCode: 'NC.2.OA.1',
    domainId: 'OA',
    // One-step, Compare-Smaller Unknown.
    // Fix 1 (whole-branch review, Important): shortened from 4 sentences to
    // 3 by folding the equation into the question.
    prompt: 'Jon has 14 marbles. Priya has 6 fewer than Jon. What number goes in ☐ in 14 − 6 = ☐?',
    options: labelOptions([
      // 14 + 6 = 20: added instead of taking away the "6 fewer".
      { text: '20', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Restated Jon's 14 instead of solving for Priya's total.
      { text: '14', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '8', isCorrect: true },
      // Counted back from 14 by ones but stopped one count short: 9 instead of 8.
      { text: '9', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Priya has fewer marbles than Jon, so her total is Jon\'s amount with some taken away.',
        'Step 2: Jon has 14 marbles, and Priya has 6 fewer than that.',
        'Step 3: 14 − 6 = 8.',
        'Step 4: The number that goes in the ☐ is 8.',
      ],
      conceptSummary:
        '"Fewer than" tells which amount is smaller. Subtracting the difference from the bigger amount finds the smaller amount.',
      commonMisconception:
        'Adding 6 to 14 answers how many marbles Jon would have with more, not how many Priya actually has.',
    },
  },
  {
    id: 'g2-oa1-04',
    standardCode: 'NC.2.OA.1',
    domainId: 'OA',
    // Two-step, single digit, Add to/Take from - Change Unknown.
    // Fix 1 (whole-branch review, Important): shortened from 175 characters
    // and 6 sentences to 2 sentences, folding the narrative into one
    // sentence and the equation into the question — the two-step
    // mathematics NC.2.OA.1 requires is unchanged.
    prompt: 'Ana had 9 crayons, lost some, then got 4 more, ending with 8. In 9 − ☐ + 4 = 8, how many did Ana lose?',
    options: labelOptions([
      // 9 − 8 = 1: compared only the start and the end, skipping over the
      // 4 crayons her friend gave in between.
      { text: '1', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Restated the 4 crayons her friend gave instead of solving for the loss.
      { text: '4', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Worked backward correctly in method but miscounted one of the two
      // counting-back steps, landing one too high.
      { text: '6', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: '5', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Ana started with 9 crayons and lost some — that loss is the ☐.',
        'Step 2: After losing some, her friend gave her 4 more, and she ended with 8.',
        'Step 3: Work backward: 8 − 4 = 4 tells how many Ana had right after she lost the crayons.',
        'Step 4: 9 − 4 = 5, so the number that goes in the ☐ is 5.',
      ],
      conceptSummary:
        'A two-step problem is solved one step at a time, in the order the story happens. Undoing the last event first — here, taking away the 4 crayons her friend gave — uncovers the middle amount before the first event can be undone too.',
      commonMisconception:
        'Subtracting 9 − 8 = 1 only compares the start and the end; it skips over the 4 crayons Ana was given in between.',
    },
  },
  {
    id: 'g2-oa1-05',
    standardCode: 'NC.2.OA.1',
    domainId: 'OA',
    // Two-step, single digit, Add to/Take from - Result Unknown.
    // Fix 1 (whole-branch review, Important): shortened from 161 characters
    // and 5 sentences to 2 sentences, the same way as g2-oa1-04 above.
    prompt: 'Leo has 7 toy cars, buys 5 more, then gives 3 to his brother. In 7 + 5 − 3 = ☐, how many cars does Leo have now?',
    options: labelOptions([
      { text: '9', isCorrect: true },
      // Stopped after the first step and never subtracted the 3 given away.
      { text: '12', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Worked the two steps correctly in method but miscounted one of them,
      // landing one short of the correct total.
      { text: '8', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
      // Added all three numbers instead of subtracting the amount given away.
      { text: '15', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: First step — Leo buys 5 more cars: 7 + 5 = 12.',
        'Step 2: Hold on to that 12. It is the result of the first step, not the answer.',
        'Step 3: Second step — he gives 3 cars away: 12 − 3 = 9.',
        'Step 4: Leo has 9 toy cars now.',
      ],
      conceptSummary:
        'A two-step problem needs the result of the first event kept in mind while the second event is carried out, in the order the story actually happens.',
      commonMisconception:
        'Adding all three numbers together treats "gives 3 away" the same as "gets 3 more," which is the opposite of what happened.',
    },
  },

  // ==========================================
  // Standard: NC.2.OA.2 — Fluency with Addition & Subtraction within 20
  // ==========================================
  {
    id: 'g2-oa2-01',
    standardCode: 'NC.2.OA.2',
    domainId: 'OA',
    prompt: 'What is 8 + 5?',
    options: labelOptions([
      // Counted on by ones from 8 but stopped one count short.
      { text: '12', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
      { text: '13', isCorrect: true },
      // Counted on by ones from 8 but took one extra count.
      { text: '14', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      // 8 - 5 = 3: subtracted instead of adding.
      { text: '3', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A quick mental way is to make a ten first: 8 needs 2 more to make 10.',
        'Step 2: Take those 2 from the 5, leaving 3: 8 + 2 = 10, and 5 − 2 = 3.',
        'Step 3: Add the 3 that is left onto the 10: 10 + 3 = 13.',
        'Step 4: So 8 + 5 = 13.',
      ],
      conceptSummary:
        'Making a ten first turns a hard fact into an easy one: 10 plus a small number. That is faster and more reliable than counting on by ones one at a time.',
      commonMisconception:
        'Counting on by ones from 8 is slow, and it is easy to lose the count and stop one number early or go one number too far.',
    },
  },
  {
    id: 'g2-oa2-02',
    standardCode: 'NC.2.OA.2',
    domainId: 'OA',
    prompt: 'What is 14 − 6?',
    options: labelOptions([
      // 14 + 6 = 20: added instead of subtracting.
      { text: '20', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '8', isCorrect: true },
      // Counted back by ones but stopped one count short, landing one too high.
      { text: '9', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
      // Counted back by ones but took one extra count, landing one too low.
      { text: '7', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A quick mental way is to count back to the nearest ten first: 14 back to 10 is 4 counts.',
        'Step 2: That uses up 4 of the 6 being subtracted, leaving 2 more to count back.',
        'Step 3: 10 back 2 more is 8.',
        'Step 4: So 14 − 6 = 8.',
      ],
      conceptSummary:
        'Breaking the number being subtracted into a piece that reaches ten first, then a leftover piece, keeps a mental subtraction from needing ones counted one at a time.',
      commonMisconception:
        'Counting back by ones six separate times is easy to lose track of, landing one count short or one count too many.',
    },
  },
  {
    id: 'g2-oa2-03',
    standardCode: 'NC.2.OA.2',
    domainId: 'OA',
    prompt: 'What is 9 + 7?',
    options: labelOptions([
      // Counted on by ones from 9 but stopped one count short.
      { text: '15', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
      // Counted on by ones from 9 but took one extra count.
      { text: '17', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: '16', isCorrect: true },
      // 9 - 7 = 2: subtracted instead of adding.
      { text: '2', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A near-double is a fast mental strategy: 7 + 7 = 14 is a double already known.',
        'Step 2: 9 is 2 more than 7, so 9 + 7 is 2 more than 7 + 7.',
        'Step 3: 14 + 2 = 16.',
        'Step 4: So 9 + 7 = 16.',
      ],
      conceptSummary:
        'A fact close to a known double can be solved from the double instead of from scratch: find how far one addend is from its double partner, then adjust.',
      commonMisconception:
        'Counting on by ones from 9 seven separate times gives many chances to lose the count by one in either direction.',
    },
  },

  // ==========================================
  // Standard: NC.2.OA.3 — Odd & Even Numbers
  // ==========================================
  {
    id: 'g2-oa3-01',
    standardCode: 'NC.2.OA.3',
    domainId: 'OA',
    // Pairing objects, then counting by 2s.
    prompt:
      'Sam has 16 crayons. He pairs them up: 2 crayons in every pair, with none left over. Is 16 odd or even?',
    options: labelOptions([
      { text: 'Even, because every crayon has a partner and none is left over.', isCorrect: true },
      // Claims a leftover where the story says there is none.
      {
        text: 'Odd, because one crayon is left over with no partner.',
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      },
      // Fixates on the count of pairs (8, which is even) rather than on
      // whether anything is left over, and gets the reasoning backward.
      {
        text: 'Odd, because Sam made 8 pairs, and pairs come in twos.',
        isCorrect: false,
        misconception: 'judged-the-total-by-the-count-of-pairs',
      },
      // Restates the number of crayons instead of answering odd or even.
      { text: '16 crayons', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Pairing objects up is a way to check odd or even: put them into groups of 2.',
        'Step 2: Sam paired all 16 crayons and had none left without a partner.',
        'Step 3: A group with no object left over pairs up evenly.',
        'Step 4: Even, because every crayon has a partner and none is left over.',
      ],
      conceptSummary:
        'A group is even exactly when it can be split into pairs with nothing left over. One crayon standing alone, with no partner, is what makes a group odd instead.',
      commonMisconception:
        'Claiming a leftover crayon when the story already says none is left over ignores what the pairing actually showed.',
    },
  },
  {
    id: 'g2-oa3-02',
    standardCode: 'NC.2.OA.3',
    domainId: 'OA',
    // Pairing objects, then counting by 2s — the odd case.
    // Fix 1 (whole-branch review, Important): shortened from 4 sentences to 3.
    prompt: 'Priya pairs up 13 blocks, 2 in each pair. She makes 6 pairs, with 1 block left over. Is 13 odd or even?',
    options: labelOptions([
      // Fixates on the number of complete pairs (6, which is even) instead of
      // the leftover block, and calls the total even because the pair count is.
      {
        text: 'Even, because Priya made 6 whole pairs.',
        isCorrect: false,
        misconception: 'judged-the-total-by-the-count-of-pairs',
      },
      { text: 'Odd, because one block is left over with no partner.', isCorrect: true },
      // Claims every block found a partner, contradicting the story.
      {
        text: 'Even, because every block has a partner.',
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      },
      // Restates the number of pairs instead of answering odd or even.
      { text: '6 pairs', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Pairing objects up checks odd or even: put them into groups of 2.',
        'Step 2: Priya paired 12 of her 13 blocks into 6 pairs, and 1 block had no partner.',
        'Step 3: A group with one object left over does not pair up evenly.',
        'Step 4: Odd, because one block is left over with no partner.',
      ],
      conceptSummary:
        'Whether a group is odd or even depends on the object left over, not on how many pairs were made. Six pairs is an even number of pairs, but the group itself is still odd because one block never got a partner.',
      commonMisconception:
        'Looking at the 6 pairs and calling the group even confuses a fact about the count of pairs with a fact about the group being paired.',
    },
  },
  {
    id: 'g2-oa3-03',
    standardCode: 'NC.2.OA.3',
    domainId: 'OA',
    // Determining whether objects can be placed into two equal groups —
    // distinct from pairing (groups of 2) per the standard's second bullet.
    prompt:
      'Dana has 18 buttons. Can she split them into two equal groups with none left over?',
    options: labelOptions([
      // Split into two groups that are not equal in size.
      {
        text: 'Yes — 10 buttons in one group and 8 in the other.',
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      },
      // Restates the total instead of describing the two equal groups.
      { text: '18 buttons', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: 'Yes — 9 buttons in each of the two groups.', isCorrect: true },
      // Claims it cannot be done at all, contradicting that 18 is even.
      {
        text: 'No — one button is always left over.',
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: An even number of objects can always be split into two equal groups.',
        'Step 2: Share the 18 buttons out evenly between the two groups, one at a time.',
        'Step 3: 9 buttons go to each group, and 9 + 9 = 18, so nothing is left over.',
        'Step 4: Yes — 9 buttons in each of the two groups.',
      ],
      conceptSummary:
        'Splitting into two EQUAL groups is another way to check for even, alongside pairing objects into twos — both tests agree, because an even number is exactly one that has no leftover either way.',
      commonMisconception:
        'Two groups of different sizes, like 10 and 8, both use all 18 buttons but are not the EQUAL groups the question asks for.',
    },
  },
  {
    id: 'g2-oa3-04',
    standardCode: 'NC.2.OA.3',
    domainId: 'OA',
    // Writing an equation expressing an even number as a sum of two equal
    // addends — the standard's third bullet, per ruling 17-2.
    prompt: 'Which equation shows 14 as the sum of two equal addends?',
    options: labelOptions([
      // Addends that sum correctly but are not equal to each other.
      { text: '6 + 8 = 14', isCorrect: false, misconception: 'judged-the-total-by-the-count-of-pairs' },
      // Halved 14 incorrectly, off by one in each addend.
      { text: '6 + 6 = 12', isCorrect: false, misconception: 'miscounted-while-pairing-the-objects' },
      // Equal addends, but the sum is wrong.
      { text: '7 + 7 = 15', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: '7 + 7 = 14', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: An even number can be written as two EQUAL addends that add up to it.',
        'Step 2: Half of 14 is 7, since 7 + 7 = 14.',
        'Step 3: Check: both addends are 7, and they are the same number.',
        'Step 4: So the equation is 7 + 7 = 14.',
      ],
      conceptSummary:
        'Writing an even number as a sum of two equal addends is the pairing idea turned into an equation: each addend is the size of one of the two equal groups.',
      commonMisconception:
        '6 + 8 = 14 is a true equation, but the two addends are not equal to each other, so it does not show 14 the way this question asks.',
    },
  },

  // ==========================================
  // Standard: NC.2.OA.4 — Rectangular Arrays as Repeated Addition
  // ==========================================
  {
    id: 'g2-oa4-01',
    standardCode: 'NC.2.OA.4',
    domainId: 'OA',
    prompt:
      'The tiles below are arranged in equal rows. Find the total by adding, not by counting one by one.',
    promptDetails: '■ ■ ■ ■\n■ ■ ■ ■\n■ ■ ■ ■',
    options: labelOptions([
      { text: '12 tiles', isCorrect: true },
      // 3 + 4 = 7: added the row count and the column count instead of
      // adding one row's worth for every row.
      { text: '7 tiles', isCorrect: false, misconception: 'added-rows-and-columns-instead-of-repeated-addition' },
      // 4 + 4 = 8: skip-counted the rows but left one row out.
      { text: '8 tiles', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // Counted a single row and reported that instead of the total.
      { text: '4 tiles', isCorrect: false, misconception: 'counted-only-one-group' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count the rows. There are 3 equal rows.',
        'Step 2: Count one row. There are 4 tiles in each row.',
        'Step 3: Add one row for every row instead of counting one by one: 4 + 4 + 4.',
        'Step 4: 4 + 4 + 4 = 12, so there are 12 tiles in all.',
      ],
      conceptSummary:
        'A rectangular array can be found by adding, without counting every single tile: add the size of one row once for every row there is.',
      commonMisconception:
        'Adding the number of rows to the number in a row, 3 + 4, mixes up two different counts and is not the same as adding a row for every row.',
    },
  },
  {
    id: 'g2-oa4-02',
    standardCode: 'NC.2.OA.4',
    domainId: 'OA',
    prompt:
      'The buttons below are arranged in equal rows. Find the total by adding, not by counting one by one.',
    promptDetails: '● ● ● ● ●\n● ● ● ● ●',
    options: labelOptions([
      // 2 + 5 = 7: added the row count and the column count.
      { text: '7 buttons', isCorrect: false, misconception: 'added-rows-and-columns-instead-of-repeated-addition' },
      { text: '10 buttons', isCorrect: true },
      // Counted a single row and reported that instead of the total.
      { text: '5 buttons', isCorrect: false, misconception: 'counted-only-one-group' },
      // Restated the row count instead of finding the total.
      { text: '2 buttons', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count the rows. There are 2 equal rows.',
        'Step 2: Count one row. There are 5 buttons in each row.',
        'Step 3: Add one row for every row: 5 + 5.',
        'Step 4: 5 + 5 = 10, so there are 10 buttons in all.',
      ],
      conceptSummary:
        'Adding equal rows together gives the same total as counting one by one, but it is faster and it is what "repeated addition" means.',
      commonMisconception:
        'Reporting 5, the size of one row, answers how many are in ONE row rather than in all of the rows together.',
    },
  },
  {
    id: 'g2-oa4-03',
    standardCode: 'NC.2.OA.4',
    domainId: 'OA',
    // Writing an equation expressing the total as a sum of equal addends.
    prompt:
      'An array has 4 equal rows with 3 stars in each row. Which equation shows the total as a sum of equal addends?',
    options: labelOptions([
      // Only three 3s instead of four: skip-counted one row short.
      { text: '3 + 3 + 3 = 9', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // Added the row count and the column count instead of repeating a row.
      { text: '4 + 3 = 7', isCorrect: false, misconception: 'added-rows-and-columns-instead-of-repeated-addition' },
      { text: '3 + 3 + 3 + 3 = 12', isCorrect: true },
      // Repeated the correct addend but one row too many: five 3s instead of four.
      { text: '3 + 3 + 3 + 3 + 3 = 15', isCorrect: false, misconception: 'skip-counted-one-group-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: There are 4 equal rows, and each row has 3 stars.',
        'Step 2: Repeated addition adds the size of ONE row, once for every row.',
        'Step 3: That is 3 added four times: 3 + 3 + 3 + 3.',
        'Step 4: 3 + 3 + 3 + 3 = 12, so the equation is 3 + 3 + 3 + 3 = 12.',
      ],
      conceptSummary:
        'Writing an array as a sum of equal addends means repeating the size of one row, and repeating it exactly as many times as there are rows.',
      commonMisconception:
        '3 + 3 + 3 = 9 leaves the fourth row out of the total, which is one row fewer than the array actually has.',
    },
  },
  {
    id: 'g2-oa4-04',
    standardCode: 'NC.2.OA.4',
    domainId: 'OA',
    prompt:
      'The tiles below are arranged in equal rows. Find the total by adding, not by counting one by one.',
    promptDetails: '▲ ▲\n▲ ▲\n▲ ▲\n▲ ▲\n▲ ▲',
    options: labelOptions([
      // 2 + 2 + 2 + 2 = 8: skip-counted the rows but left one row out.
      { text: '8 tiles', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // Counted a single row and reported that instead of the total.
      { text: '2 tiles', isCorrect: false, misconception: 'counted-only-one-group' },
      // 5 + 2 = 7: added the row count and the column count.
      { text: '7 tiles', isCorrect: false, misconception: 'added-rows-and-columns-instead-of-repeated-addition' },
      { text: '10 tiles', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count the rows. There are 5 equal rows.',
        'Step 2: Count one row. There are 2 tiles in each row.',
        'Step 3: Add one row for every row: 2 + 2 + 2 + 2 + 2.',
        'Step 4: 2 + 2 + 2 + 2 + 2 = 10, so there are 10 tiles in all.',
      ],
      conceptSummary:
        'Five rows means the row size is added five times — one addend for every row, and no fewer.',
      commonMisconception:
        'Stopping after four 2s gives 8, which leaves the fifth row out of the total entirely.',
    },
  },
];
