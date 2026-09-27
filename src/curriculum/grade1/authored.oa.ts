import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 1 Operations & Algebraic Thinking bank.
 *
 * A six-year-old is the reader, often aloud with a parent. Every prompt passes
 * `assertGradeOneReadable` (under 90 characters, at most one setup sentence
 * and one question, no word over 10 letters), and every number in a prompt is
 * 20 or less. Every incorrect option is the value a first-grader reaches by
 * one named error, tagged in `../misconceptions.ts`.
 *
 * Scope is read from the sourced text in `./standards.ts`, NOT from the Task
 * 22 brief. Rulings 22-1..22-8 of
 * `.superpowers/sdd/2026-09-13-grades-1-4-content/task-22-26-rulings.md`
 * OVERRIDE the brief wherever the two disagree:
 *
 *   NC.1.OA.1  word problems within 20. RULING 22-2: one item of each named
 *              type — Take from, Change Unknown (g1-oa1-01); Take Apart,
 *              Addend Unknown (g1-oa1-02); Compare, Difference Unknown
 *              (g1-oa1-03).
 *   NC.1.OA.2  three addends, sum at most 20 (ruling 22-3), told as actions or
 *              as groups — never as the generator's colours.
 *   NC.1.OA.3  the commutative and associative properties AS STRATEGIES.
 *              RULING 22-5: g1-oa3-03 regroups three addends, and no item
 *              asks a child to name a property.
 *   NC.1.OA.4  an unknown addend within 20 (ruling 22-8), solved as the
 *              standard says: by CHANGING IT TO A TAKE-AWAY (g1-oa4-01,
 *              8 + ☐ = 13 as 13 − 8) or by adding on (g1-oa4-02 and
 *              g1-oa4-03, each making a ten).
 *   NC.1.OA.9  FLUENCY WITHIN 10. RULING 22-1: this is NC.1.OA.9, not OA.6,
 *              whatever Common Core numbers it. The generators drill bare
 *              facts; these items take the pairs that make 10, a fact family,
 *              and 0 as an answer.
 *   NC.1.OA.6  add and subtract within 20 USING STRATEGIES. RULING 22-4: every
 *              worked solution names its strategy in its first step — counting
 *              on, making ten, a doubles fact, getting to 10 — and both
 *              "making ten" and "counting on" appear. Every wrong option
 *              is a slip made inside the strategy the item names.
 *   NC.1.OA.7  the meaning of the equal sign. RULING 22-6: a true/false
 *              standard asked as "Which equation is true?", four candidate
 *              equations, each false one false for a named reason. g1-oa7-04
 *              is the brief's own 4 + 3 = ☐ + 2 trap, with its numbers
 *              changed.
 *   NC.1.OA.8  the unknown in any position. The generators take a missing part
 *              and a missing start; these items take a result with the box on
 *              the LEFT, and 0 as the unknown.
 *
 * Grade 1 errors are about counting and about the equal sign. The commonest
 * counting slip — saying the number you start FROM as the first count, so
 * "8, 9, 10" for 8 + 3 — is `counted-the-start-number-as-a-hop`, and its
 * value is worked out in the comment above every option that uses it.
 *
 * NO ANSWER-SHAPE TELL (review finding M4). A counting slip always lands
 * next to the key, so an item offering one puts the key in a ±1 pair. The
 * bank spreads its slips across counting the start number, stopping one
 * short and counting one too many, so the key is the lower of its pair as
 * often as the upper; and where an honest error sits beside the slip, or
 * no slip is offered, there is no lone ±1 pair to pick from at all.
 * `./authored.oa.test.ts` holds both counts.
 */
export const GRADE_1_OA_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.1.OA.1 — Addition & Subtraction Word Problems within 20
  // ==========================================
  {
    id: 'g1-oa1-01',
    standardCode: 'NC.1.OA.1',
    domainId: 'OA',
    // Take from, Change Unknown: 12 − ☐ = 5. One setup (before and now), one
    // question (what happened in between).
    prompt: 'Mia had 12 grapes and now has 5. How many did she eat?',
    options: labelOptions([
      // 12 + 5 = 17: added the two numbers in the story.
      { text: '17', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '7', isCorrect: true },
      // 5: the grapes she has now, given back as the grapes eaten.
      { text: '5', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Counting up from 5 and stopping one number before 12: 6, 7, 8, 9, 10,
      // 11 is 6 counts.
      { text: '6', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Mia started with 12 grapes and has 5 now. The grapes she ate are the difference.',
        'Step 2: Write it as 12 − ☐ = 5.',
        'Step 3: Count on from 5 up to 12: 6, 7, 8, 9, 10, 11, 12. That is 7 counts.',
        'Step 4: Mia ate 7 grapes.',
      ],
      conceptSummary:
        'When a story tells how many there were at the start and how many there are now, the missing number is how many were taken. Counting on from the number now up to the start finds it.',
      commonMisconception: 'Adding 12 and 5 gives 17, which is more grapes than Mia ever had.',
    },
  },
  {
    id: 'g1-oa1-02',
    standardCode: 'NC.1.OA.1',
    domainId: 'OA',
    // Take Apart, Addend Unknown: 8 + ☐ = 14.
    prompt: 'Kim has 14 fish, some red and some blue. If 8 are red, how many are blue?',
    options: labelOptions([
      // 14 + 8 = 22: added the two numbers in the story.
      { text: '22', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 8: the red fish, given back as the blue ones.
      { text: '8', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Counting up from 8 to 14 and saying the 8: 8, 9, ..., 14 is 7 counts.
      { text: '7', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      { text: '6', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The 14 fish are made of two parts: 8 red fish and the blue fish.',
        'Step 2: Write it as 8 + ☐ = 14.',
        'Step 3: Count on from 8 up to 14: 9, 10, 11, 12, 13, 14. That is 6 counts.',
        'Step 4: 6 of the fish are blue.',
      ],
      conceptSummary:
        'When a total is made of two parts and one part is known, the missing part is the total take away the part you know.',
      commonMisconception:
        'Adding 14 and 8 gives 22, but the blue fish are only part of the 14, so there must be fewer than 14 of them.',
    },
  },
  {
    id: 'g1-oa1-03',
    standardCode: 'NC.1.OA.1',
    domainId: 'OA',
    // Compare, Difference Unknown: 9 + ☐ = 14.
    prompt: 'Ana read 14 books and Ben read 9. How many more books did Ana read than Ben?',
    options: labelOptions([
      { text: '5', isCorrect: true },
      // 14 + 9 = 23: "more" read as "put together".
      { text: '23', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 14: how many books Ana read, not how many MORE.
      { text: '14', isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
      // 9: how many books Ben read — the other amount given back.
      { text: '9', isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Ana read 14 books. Ben read 9 books.',
        'Step 2: Write it as 9 + ☐ = 14. The ☐ is how many more Ana read.',
        'Step 3: Count on from 9 up to 14: 10, 11, 12, 13, 14. That is 5 counts, so 14 − 9 = 5.',
        'Step 4: Ana read 5 more books than Ben.',
      ],
      conceptSummary:
        '"How many more" asks for the difference between two amounts — not either amount, and not both together. Matching the two amounts up shows the extra.',
      commonMisconception:
        '"More" can make adding feel right, but 14 + 9 = 23 is how many books they read together, not how many more Ana read.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.2 — Add Three Whole Numbers
  // ==========================================
  {
    id: 'g1-oa2-01',
    standardCode: 'NC.1.OA.2',
    domainId: 'OA',
    prompt: 'Rosa picked 5 apples, then 3, then 5 more. How many did she pick in all?',
    options: labelOptions([
      // 5 + 3 = 8: the last 5 never added.
      { text: '8', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      // 5 + 5 = 10, then 10 + 3 + 5 = 18: one 5 used in the ten and again.
      { text: '18', isCorrect: false, misconception: 'added-one-number-twice' },
      { text: '13', isCorrect: true },
      // 5 + 5 = 10, then counting on 3 with one count too many: 11, 12, 13, 14.
      { text: '14', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Write it as 5 + 3 + 5 = ☐.',
        'Step 2: The two 5s make 10, so add those first: 5 + 5 = 10.',
        'Step 3: 10 + 3 = 13.',
        'Step 4: Rosa picked 13 apples in all.',
      ],
      conceptSummary:
        'Three numbers can be added in any order. Looking for two that make 10 first turns the problem into 10 plus a number.',
      commonMisconception: 'Stopping after 5 + 3 = 8 leaves out the last 5 apples Rosa picked.',
    },
  },
  {
    id: 'g1-oa2-02',
    standardCode: 'NC.1.OA.2',
    domainId: 'OA',
    prompt: 'There are 6 cats, 8 dogs, and 2 birds. How many pets are there in all?',
    options: labelOptions([
      // 6 + 8 = 14: the birds never added.
      { text: '14', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      { text: '16', isCorrect: true },
      // 8 + 2 = 10, then 10 + 6 + 2 = 18: the 2 used in the ten and again.
      { text: '18', isCorrect: false, misconception: 'added-one-number-twice' },
      // 8 + 2 = 10, then counting on 6 and saying the 10: 10, 11, ..., 15.
      { text: '15', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Write it as 6 + 8 + 2 = ☐.',
        'Step 2: 8 + 2 = 10, so add those two first.',
        'Step 3: 10 + 6 = 16.',
        'Step 4: There are 16 pets in all.',
      ],
      conceptSummary:
        'Three numbers can be grouped in any way and the total stays the same. Putting two that make 10 together first makes the adding easier.',
      commonMisconception: 'Adding only the cats and dogs, 6 + 8 = 14, leaves out the 2 birds.',
    },
  },
  {
    id: 'g1-oa2-03',
    standardCode: 'NC.1.OA.2',
    domainId: 'OA',
    // The pair that makes 10 (4 and 6) is NOT next to each other in the story.
    prompt: 'Sam scored 4 points, then 9, then 6. How many points did he score in all?',
    options: labelOptions([
      // 4 + 9 = 13: the last 6 never added.
      { text: '13', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      // 4 + 6 = 10, then 10 + 9 + 6 = 25: the 6 used in the ten and again.
      { text: '25', isCorrect: false, misconception: 'added-one-number-twice' },
      // 4 + 6 = 10, then counting on 9 with one count too many: 11, ..., 20.
      { text: '20', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: '19', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Write it as 4 + 9 + 6 = ☐.',
        'Step 2: 4 + 6 = 10. They are not next to each other, but numbers can be added in any order, so add those two first.',
        'Step 3: 10 + 9 = 19.',
        'Step 4: Sam scored 19 points in all.',
      ],
      conceptSummary:
        'Numbers can be added in any order and grouped in any way. Looking past the order in the story for two that make 10 is the quickest path.',
      commonMisconception: 'Adding only the first two scores, 4 + 9 = 13, leaves out the last 6 points.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.3 — Commutative & Associative Properties
  // ==========================================
  {
    id: 'g1-oa3-01',
    standardCode: 'NC.1.OA.3',
    domainId: 'OA',
    // Turning the numbers around, used as a strategy: nothing new to work out.
    prompt: '9 + 4 = 13. What is 4 + 9?',
    options: labelOptions([
      { text: '13', isCorrect: true },
      // Counting on 9 from 4 and saying the 4: 4, 5, ..., 12 is 9 counts.
      { text: '12', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // 9 − 4 = 5.
      { text: '5', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // 9: started at the 9 and never counted the 4 on.
      { text: '9', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 4 + 9 has the same two numbers as 9 + 4, just turned around.',
        'Step 2: Adding in the other order gives the same total, so there is nothing new to work out.',
        'Step 3: 4 + 9 = 13.',
      ],
      conceptSummary:
        'Two numbers can be added in either order and the total is the same. Knowing 9 + 4 means knowing 4 + 9, and starting from the bigger number is usually quicker.',
      commonMisconception:
        'Starting at 4 and counting on 9 is a long count, and saying the 4 as the first count lands on 12 instead of 13.',
    },
  },
  {
    id: 'g1-oa3-02',
    standardCode: 'NC.1.OA.3',
    domainId: 'OA',
    prompt: 'What number makes 2 + 9 = 9 + ☐ true?',
    options: labelOptions([
      // 2 + 9 = 11, written straight into the box.
      { text: '11', isCorrect: false, misconception: 'read-the-equal-sign-as-the-answer-comes-next' },
      // 2 + 9 + 9 = 20.
      { text: '20', isCorrect: false, misconception: 'added-every-number-in-the-equation' },
      { text: '2', isCorrect: true },
      // 2 + 9 = 11, then counting up from 9 and stopping one number before
      // 11: just "10", 1 count.
      { text: '1', isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The equal sign means both sides are the same amount.',
        'Step 2: The left side is 2 + 9. The right side has the same 9, turned to the front.',
        'Step 3: Adding in any order gives the same total, so 2 + 9 = 9 + 2.',
        'Step 4: The number in the ☐ is 2.',
      ],
      conceptSummary:
        'Turning two numbers around does not change their total, so 2 + 9 and 9 + 2 are the same amount. Seeing that is quicker than working out both sides.',
      commonMisconception:
        'Writing 11 in the box treats the equal sign as "the answer goes next". But then the right side would be 9 + 11 = 20, not 11.',
    },
  },
  {
    id: 'g1-oa3-03',
    standardCode: 'NC.1.OA.3',
    domainId: 'OA',
    // Ruling 22-5's three-addend regrouping item: (7 + 3) + 6.
    prompt: 'Which is the same as 7 + 6 + 3?',
    options: labelOptions([
      // 13: the 3 left out altogether.
      { text: '7 + 6', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      { text: '10 + 6', isCorrect: true },
      // 19: the 3 made the ten with the 7, then was added again.
      { text: '10 + 6 + 3', isCorrect: false, misconception: 'added-one-number-twice' },
      // 15: 7 + 3 counted "7, 8, 9", saying the 7, made 9 instead of 10.
      { text: '9 + 6', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Look for two numbers that make 10: 7 + 3 = 10.',
        'Step 2: Numbers can be added in any order and grouped in any way, so add the 7 and the 3 first.',
        'Step 3: That leaves 10 and the 6.',
        'Step 4: So 7 + 6 + 3 is the same as 10 + 6.',
      ],
      conceptSummary:
        'Three numbers can be grouped in any way without changing the total. Grouping two that make 10 turns a hard sum into 10 plus a number: 10 + 6 = 16.',
      commonMisconception:
        'Once the 3 has gone into the ten it is used up. Writing 10 + 6 + 3 counts the 3 twice.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.4 — Unknown-Addend Problems
  // ==========================================
  {
    id: 'g1-oa4-01',
    standardCode: 'NC.1.OA.4',
    domainId: 'OA',
    // An unknown-addend problem rewritten as a take-away: the sourced
    // keyConcept "Rewriting an unknown-addend problem as a subtraction
    // problem". The "Think:" sentence keeps it off the missing-part
    // generator's prompt shape.
    prompt: 'What number makes 8 + ☐ = 13 true? Think: 13 − 8.',
    options: labelOptions([
      // 13 + 8 = 21: the take-away added instead.
      { text: '21', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 8: the part already given, written into the box.
      { text: '8', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Counting back 8 from 13 with one count too many: 12, 11, 10, 9, 8, 7,
      // 6, 5, 4.
      { text: '4', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: '5', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 8 + ☐ = 13 asks what goes with 8 to make 13.',
        'Step 2: Change it to a take-away: the ☐ is 13 − 8.',
        'Step 3: Take 8 away in two jumps: 13 − 3 = 10, and 10 − 5 = 5.',
        'Step 4: The number in the ☐ is 5.',
      ],
      conceptSummary:
        'An adding problem with a missing part can be turned into a take-away: the missing part is the total take away the part you know.',
      commonMisconception: 'Adding 13 and 8 gives 21, but the ☐ is part of 13, so it has to be less than 13.',
    },
  },
  {
    id: 'g1-oa4-02',
    standardCode: 'NC.1.OA.4',
    domainId: 'OA',
    prompt: 'Leo has 9 cars. How many more cars does he need to have 16?',
    options: labelOptions([
      { text: '7', isCorrect: true },
      // 9 + 16 = 25.
      { text: '25', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Counting up from 9 to 16 and saying the 9: 9, 10, ..., 16 is 8 counts.
      { text: '8', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // 9: the cars Leo already has, given back as the cars he needs.
      { text: '9', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Write it as 9 + ☐ = 16.',
        'Step 2: Make a ten: 9 + 1 = 10, and 10 + 6 = 16.',
        'Step 3: The jumps are 1 and 6, and 1 + 6 = 7.',
        'Step 4: Leo needs 7 more cars.',
      ],
      conceptSummary:
        '"How many more to have" is an adding problem with a missing part. Adding on from what you have to what you want finds it, and so does 16 − 9.',
      commonMisconception: 'Adding 9 and 16 gives 25, far more cars than the 16 Leo wants.',
    },
  },
  {
    id: 'g1-oa4-03',
    standardCode: 'NC.1.OA.4',
    domainId: 'OA',
    prompt: 'Make a ten to solve 7 + ☐ = 16. What number goes in the ☐?',
    options: labelOptions([
      // 3: the jump from 7 up to 10, and then stopped.
      { text: '3', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 7 + 16 = 23.
      { text: '23', isCorrect: false, misconception: 'added-every-number-in-the-equation' },
      { text: '9', isCorrect: true },
      // 6: the jump from 10 up to 16, with the jump up to 10 left out.
      { text: '6', isCorrect: false, misconception: 'left-out-the-jump-to-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Jump from 7 up to 10. That is a jump of 3.',
        'Step 2: Jump from 10 up to 16. That is a jump of 6.',
        'Step 3: The two jumps together are 3 + 6 = 9.',
        'Step 4: The number in the ☐ is 9.',
      ],
      conceptSummary:
        'A missing part can be found by adding on in two jumps, first up to 10 and then to the total. The answer is both jumps together.',
      commonMisconception:
        'Stopping after the first jump gives 3, and giving only the second jump gives 6. The answer is both jumps: 3 + 6 = 9.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.9 — Fluency with Addition & Subtraction within 10
  // ==========================================
  {
    id: 'g1-oa9-01',
    standardCode: 'NC.1.OA.9',
    domainId: 'OA',
    // A pair that makes 10.
    prompt: 'How many more does 6 need to make 10?',
    options: labelOptions([
      // 6 + 10 = 16.
      { text: '16', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '4', isCorrect: true },
      // Counting up from 6 to 10 and saying the 6: 6, 7, 8, 9, 10 is 5 counts.
      { text: '5', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // 6: the number it starts from, given back as the number needed.
      { text: '6', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Think 6 + ☐ = 10.',
        'Step 2: Count on from 6: 7, 8, 9, 10. That is 4 counts.',
        'Step 3: 6 and 4 make 10.',
      ],
      conceptSummary:
        'The pairs that make 10 — 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5 — are worth knowing by heart. Every make-a-ten strategy uses them.',
      commonMisconception: 'Saying 6 as the first count gives 5. The first number to say is 7.',
    },
  },
  {
    id: 'g1-oa9-02',
    standardCode: 'NC.1.OA.9',
    domainId: 'OA',
    // A fact family: the take-away from the adding fact.
    prompt: '5 + 3 = 8. What is 8 − 3?',
    options: labelOptions([
      // 8 + 3 = 11.
      { text: '11', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Counting back 3 from 8 with one count too many: 7, 6, 5, 4.
      { text: '4', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      // 3: the number taken away, given back as the answer.
      { text: '3', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '5', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 5 + 3 = 8 and 8 − 3 use the same three numbers.',
        'Step 2: Take the 3 back off the 8, and the 5 is what is left.',
        'Step 3: 8 − 3 = 5.',
      ],
      conceptSummary:
        'An adding fact and a take-away fact that use the same three numbers belong together. Knowing one gives the other with no counting.',
      commonMisconception: 'Counting back 3 from 8 is 7, 6, 5. One count too many lands on 4.',
    },
  },
  {
    id: 'g1-oa9-03',
    standardCode: 'NC.1.OA.9',
    domainId: 'OA',
    // 0 as an answer — the subtraction generator never takes a number from
    // itself.
    prompt: 'What is 7 − 7?',
    options: labelOptions([
      { text: '0', isCorrect: true },
      // 7 + 7 = 14.
      { text: '14', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Counting back 7 from 7 and saying the 7: 7, 6, 5, 4, 3, 2, 1.
      { text: '1', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // 7: one of the two numbers given back as the answer.
      { text: '7', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Start with 7 and take all 7 away.',
        'Step 2: Nothing is left.',
        'Step 3: 7 − 7 = 0.',
      ],
      conceptSummary: 'Any number take away itself leaves 0, so 7 − 7, 4 − 4 and 10 − 10 all make 0.',
      commonMisconception:
        'Counting back 7 from 7 and saying 7 as the first count stops at 1. Taking every one away leaves none.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.6 — Add & Subtract within 20 Using Strategies
  // ==========================================
  {
    id: 'g1-oa6-01',
    standardCode: 'NC.1.OA.6',
    domainId: 'OA',
    // Strategy: counting on.
    prompt: 'What is 15 + 3? Count on from 15.',
    options: labelOptions([
      // Counting on 3 from 15 with one count too many: 16, 17, 18, 19.
      { text: '19', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      // 15 − 3 = 12.
      { text: '12', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '18', isCorrect: true },
      // 5 + 3 = 8: the ones added and the ten of 15 dropped.
      { text: '8', isCorrect: false, misconception: 'left-the-ten-out-of-a-teen-number' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Use counting on. Start at 15 and count on 3.',
        'Step 2: The first number to say is 16: 16, 17, 18.',
        'Step 3: 15 + 3 = 18.',
      ],
      conceptSummary:
        'Counting on from the bigger number is quick when the other number is small. The number you start on is not counted: the first count is one more.',
      commonMisconception: 'It is easy to say one number too many — 16, 17, 18, 19 — and land on 19. Count on exactly 3.',
    },
  },
  {
    id: 'g1-oa6-02',
    standardCode: 'NC.1.OA.6',
    domainId: 'OA',
    // Strategy: making ten, asked about the strategy itself.
    prompt: 'Zoe adds 8 + 5 by making a ten. Which is the same as 8 + 5?',
    options: labelOptions([
      { text: '10 + 3', isCorrect: true },
      // 15: 8 + 2 made the ten, then all 5 were added anyway.
      { text: '10 + 5', isCorrect: false, misconception: 'used-the-whole-number-after-breaking-it-apart' },
      // 12: the 2 that went into the ten added again, instead of the 3 left.
      { text: '10 + 2', isCorrect: false, misconception: 'used-the-wrong-part-after-making-ten' },
      // 14: 8 treated as needing 1 to make 10, so 4 of the 5 look left over.
      { text: '10 + 4', isCorrect: false, misconception: 'used-the-wrong-partner-to-make-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Use making ten. 8 needs 2 more to make 10.',
        'Step 2: Break the 5 into 2 and 3.',
        'Step 3: 8 + 2 = 10, and the 3 is left over.',
        'Step 4: So 8 + 5 is the same as 10 + 3.',
      ],
      conceptSummary:
        'Making ten moves part of one number over to fill the other up to 10. The total does not change, and 10 plus a number is easy: 10 + 3 = 13.',
      commonMisconception: 'Once 2 of the 5 have gone into the ten, only 3 are left. Writing 10 + 5 adds those 2 twice.',
    },
  },
  {
    id: 'g1-oa6-03',
    standardCode: 'NC.1.OA.6',
    domainId: 'OA',
    // Strategy: a doubles fact ("creating equivalent but simpler or known
    // sums").
    prompt: 'You know 6 + 6 = 12. What is 6 + 7?',
    options: labelOptions([
      // 12: the doubles fact, and then stopped.
      { text: '12', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 6 + 6 = 12 used 6 of the 7, then all 7 added on: 12 + 7 = 19.
      { text: '19', isCorrect: false, misconception: 'used-the-whole-number-after-breaking-it-apart' },
      // 7 − 6 = 1.
      { text: '1', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '13', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Use a doubles fact you know: 6 + 6 = 12.',
        'Step 2: 7 is 6 and 1 more, so 6 + 7 is 1 more than 6 + 6.',
        'Step 3: 12 + 1 = 13.',
        'Step 4: 6 + 7 = 13.',
      ],
      conceptSummary:
        'A doubles fact you already know turns a nearby fact into an easy one: 6 + 7 is the double 6 + 6 and 1 more.',
      commonMisconception: 'Stopping at the doubles fact gives 12. The 7 is one more than 6, so the answer is one more too.',
    },
  },
  {
    id: 'g1-oa6-04',
    standardCode: 'NC.1.OA.6',
    domainId: 'OA',
    // Strategy: getting to 10 first ("decomposing a number leading to a
    // ten"), asked about the strategy itself. Every wrong option is a slip
    // made INSIDE that strategy.
    prompt: 'Max gets to 10 first to find 14 − 9. Which is the same as 14 − 9?',
    options: labelOptions([
      // 15: 14 − 4 = 10, then the other 5 added instead of taken away.
      { text: '10 + 5', isCorrect: false, misconception: 'added-the-rest-after-getting-to-ten' },
      { text: '10 − 5', isCorrect: true },
      // 1: got to 10, then took all 9 away again.
      { text: '10 − 9', isCorrect: false, misconception: 'used-the-whole-number-after-breaking-it-apart' },
      // 6: took away the 4 that already got 14 down to 10, not the 5 left.
      { text: '10 − 4', isCorrect: false, misconception: 'used-the-wrong-part-after-making-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Get to 10 first. Break the 9 into 4 and 5.',
        'Step 2: 14 − 4 = 10.',
        'Step 3: The 5 still has to come away.',
        'Step 4: So 14 − 9 is the same as 10 − 5.',
      ],
      conceptSummary:
        'Getting to 10 first splits a hard take-away into two easy ones: 14 − 4 = 10, then 10 − 5 = 5.',
      commonMisconception:
        'Once 4 of the 9 have been used to get to 10, only 5 are left, and they are taken AWAY: 10 − 5, not 10 + 5.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.7 — The Meaning of the Equal Sign
  // ==========================================
  {
    id: 'g1-oa7-01',
    standardCode: 'NC.1.OA.7',
    domainId: 'OA',
    prompt: 'Which equation is true?',
    options: labelOptions([
      // False (10 is not 9): counting on 4 from 5 with one count too many.
      // Written answer-first, like the key, so the shape gives nothing away.
      { text: '10 = 5 + 4', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      // False (9 is not 10): 5 + 4 = 9 is checked and the + 1 ignored.
      { text: '5 + 4 = 9 + 1', isCorrect: false, misconception: 'read-the-equal-sign-as-the-answer-comes-next' },
      { text: '9 = 5 + 4', isCorrect: true },
      // False (1 is not 9): the minus read as a plus, 5 + 4 = 9.
      { text: '5 − 4 = 9', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: An equation is true when both sides are the same amount.',
        'Step 2: 5 + 4 is 9, so 10 = 5 + 4 is false, and so is 5 + 4 = 9 + 1, because 9 + 1 is 10. And 5 − 4 is 1, not 9.',
        'Step 3: In 9 = 5 + 4 both sides are 9. The answer can come first.',
        'Step 4: The true equation is 9 = 5 + 4.',
      ],
      conceptSummary:
        'The equal sign means "is the same amount as", not "the answer goes next". The answer can come first, and there can be adding on both sides.',
      commonMisconception:
        '5 + 4 = 9 + 1 starts out right, but the equal sign is about the WHOLE other side: 9 + 1 is 10, not 9.',
    },
  },
  {
    id: 'g1-oa7-02',
    standardCode: 'NC.1.OA.7',
    domainId: 'OA',
    prompt: 'Which equation is true?',
    options: labelOptions([
      { text: '6 + 2 = 5 + 3', isCorrect: true },
      // False (8 is not 11): 6 + 2 = 8 is checked and the + 3 ignored.
      { text: '6 + 2 = 8 + 3', isCorrect: false, misconception: 'read-the-equal-sign-as-the-answer-comes-next' },
      // False (8 is not 7): counting on 2 and saying the 6: 6, 7.
      { text: '6 + 2 = 7', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // False (8 is not 4): the minus read as a plus, 6 + 2 = 8.
      { text: '8 = 6 − 2', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Work out each side on its own.',
        'Step 2: 6 + 2 is 8, and 5 + 3 is 8. Both sides are 8.',
        'Step 3: The others are false: 8 + 3 is 11, 6 + 2 is not 7, and 6 − 2 is 4.',
        'Step 4: The true equation is 6 + 2 = 5 + 3.',
      ],
      conceptSummary:
        'An equation can have adding on both sides. It is true when the two sides work out to the same amount.',
      commonMisconception: '6 + 2 = 8 + 3 looks right if you stop at the 8. But the right side is 8 + 3, which is 11.',
    },
  },
  {
    id: 'g1-oa7-03',
    standardCode: 'NC.1.OA.7',
    domainId: 'OA',
    prompt: 'Which equation is true?',
    options: labelOptions([
      // False (7 is not 10): 10 − 3 = 7 is checked and the + 3 ignored.
      { text: '10 − 3 = 7 + 3', isCorrect: false, misconception: 'read-the-equal-sign-as-the-answer-comes-next' },
      // False (7 is not 8): counting back 3 and saying the 10: 10, 9, 8 —
      // which matches 3 + 5 = 8.
      { text: '10 − 3 = 3 + 5', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // False (13 is not 7): the plus read as a minus, 10 − 3 = 7.
      { text: '10 + 3 = 7', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '10 − 3 = 4 + 3', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Work out each side on its own.',
        'Step 2: 10 − 3 is 7, and 4 + 3 is 7. Both sides are 7.',
        'Step 3: The others are false: 7 + 3 is 10, 3 + 5 is 8, and 10 + 3 is 13.',
        'Step 4: The true equation is 10 − 3 = 4 + 3.',
      ],
      conceptSummary:
        'A take-away on one side and an adding on the other can still be equal. The equal sign only asks whether both sides are the same amount.',
      commonMisconception:
        'Counting back 3 from 10 and saying 10 as the first count lands on 8, which makes 10 − 3 = 3 + 5 look true. The first number to say is 9.',
    },
  },
  {
    id: 'g1-oa7-04',
    standardCode: 'NC.1.OA.7',
    domainId: 'OA',
    // The brief's 4 + 3 = ☐ + 2 trap, with different numbers.
    prompt: 'What number makes 6 + 5 = ☐ + 3 true?',
    options: labelOptions([
      // 6 + 5 = 11, written straight into the box.
      { text: '11', isCorrect: false, misconception: 'read-the-equal-sign-as-the-answer-comes-next' },
      { text: '8', isCorrect: true },
      // 6 + 5 + 3 = 14.
      { text: '14', isCorrect: false, misconception: 'added-every-number-in-the-equation' },
      // 11 found, then counting back 3 with one count too many: 10, 9, 8, 7.
      { text: '7', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The left side is 6 + 5 = 11, so the right side must be 11 too.',
        'Step 2: ☐ + 3 = 11. What goes with 3 to make 11?',
        'Step 3: 11 − 3 = 8, and 8 + 3 = 11.',
        'Step 4: The number in the ☐ is 8.',
      ],
      conceptSummary:
        'The equal sign means both sides are the same amount. The ☐ is whatever makes the right side equal the left side, not the answer to the left side.',
      commonMisconception:
        'Writing 11 treats the equal sign as "the answer goes next". Then the right side would be 11 + 3 = 14, not 11.',
    },
  },

  // ==========================================
  // Standard: NC.1.OA.8 — Find the Unknown Number in an Equation
  // ==========================================
  {
    id: 'g1-oa8-01',
    standardCode: 'NC.1.OA.8',
    domainId: 'OA',
    // The result, with the box on the LEFT of the equal sign.
    prompt: 'What number makes ☐ = 9 − 3 true?',
    options: labelOptions([
      // 9 + 3 = 12: the minus read as a plus.
      { text: '12', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Counting back 3 from 9 and saying the 9: 9, 8, 7.
      { text: '7', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      { text: '6', isCorrect: true },
      // 3: a number from the equation written into the box.
      { text: '3', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The equal sign means both sides are the same amount, so the ☐ is the same as 9 − 3.',
        'Step 2: It does not matter that the ☐ comes first.',
        'Step 3: 9 − 3 = 6.',
        'Step 4: The number in the ☐ is 6.',
      ],
      conceptSummary: 'An equation can be written either way round. ☐ = 9 − 3 says the same thing as 9 − 3 = ☐.',
      commonMisconception: 'Counting back 3 from 9 and saying 9 as the first count lands on 7. The first number to say is 8.',
    },
  },
  {
    id: 'g1-oa8-02',
    standardCode: 'NC.1.OA.8',
    domainId: 'OA',
    prompt: 'What number makes ☐ = 7 + 6 true?',
    options: labelOptions([
      // 7 − 6 = 1.
      { text: '1', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // Counting on 6 from 7 and saying the 7: 7, 8, ..., 12.
      { text: '12', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
      // 7: a number from the equation written into the box.
      { text: '7', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '13', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The ☐ is the same amount as 7 + 6.',
        'Step 2: 7 + 3 = 10, and 3 more makes 13.',
        'Step 3: So 7 + 6 = 13.',
        'Step 4: The number in the ☐ is 13.',
      ],
      conceptSummary:
        'The equal sign works in both directions. When the ☐ is on the left, it still stands for the amount on the other side.',
      commonMisconception: 'Counting on 6 from 7 and saying 7 as the first count lands on 12. The first number to say is 8.',
    },
  },
  {
    id: 'g1-oa8-03',
    standardCode: 'NC.1.OA.8',
    domainId: 'OA',
    // 0 as the unknown — the missing-part generator never draws it.
    prompt: 'What number makes 9 = 9 + ☐ true?',
    options: labelOptions([
      { text: '0', isCorrect: true },
      // 9 + 9 = 18.
      { text: '18', isCorrect: false, misconception: 'added-every-number-in-the-equation' },
      // 9: a number from the equation written into the box.
      { text: '9', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      // Counting on from 9 up to 9 and saying the 9 as a count: 1.
      { text: '1', isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The left side is 9. The right side is 9 and something more.',
        'Step 2: For both sides to be the same, the something more must be nothing.',
        'Step 3: 9 = 9 + 0.',
        'Step 4: The number in the ☐ is 0.',
      ],
      conceptSummary: 'Adding 0 leaves a number the same. When both sides already match, the missing number is 0.',
      commonMisconception:
        'Adding every number, 9 + 9 = 18, would make the right side 9 + 18 = 27. The equal sign asks for the two sides to match.',
    },
  },
];
