import type { QuizDefinition } from '../../types';
import type { GradeCurriculum } from '../types';

/** Grade 3's quiz set.
 *
 *  Every id below is an AUTHORED item id from the Grade 3 banks. A quiz may
 *  not cite a template id: `integrity.test.ts` builds its valid-id set from
 *  `source.authoredFor(code)` alone, and generated items are drawn by seed at
 *  run time rather than pinned into a fixed form.
 *
 *  Ids use a HYPHEN after the grade prefix (`g3-oa1-01`), matching every
 *  shipped Grade 3 item; only template ids use dots.
 *
 *  Nothing here imports `standardsOf` from ../registry: the registry imports
 *  ./index, which imports this file, so importing the registry here closes a
 *  cycle that leaves `CURRICULA[3]` undefined whenever grade3/index is the
 *  first module of the graph to load. Standard counts are taken off
 *  `c.domains` instead. */

// Named so the subtitle functions below can cite `.length` without
// depending on `this` inside an object literal.
const DIAGNOSTIC_QUESTION_IDS = [
  'g3-oa1-01', 'g3-oa2-01', 'g3-oa3-01', 'g3-oa6-01', 'g3-oa7-01', 'g3-oa8-01', 'g3-oa9-01',
  'g3-nf1-01', 'g3-nf2-01', 'g3-nf3-01', 'g3-nf4-01',
  'g3-md1-01', 'g3-md2-01', 'g3-md3-01', 'g3-md5-01', 'g3-md7-01', 'g3-md8-01',
  'g3-g1-01',
  'g3-nbt2-01', 'g3-nbt3-01',
];

/** The full simulation, allocated to the NCDPI blueprint bands rather than
 *  evenly: 28 items x each domain's share through `domainWeight()`.
 *
 *    OA   34%  -> 9.52 -> 10 items  (35.7% of the form, inside 32-36%)
 *    NBT  11%  -> 3.08 ->  3 items  (10.7% of the form, inside  9-13%)
 *    NF   30%  -> 8.40 ->  8 items  (28.6% of the form, inside 28-32%)
 *    MD+G 25%  -> 7.00 ->  7 items  (25.0% of the form, the 23-27% band's
 *                        exact midpoint), split by standard count within the
 *                        shared band: MD holds 6 of the group's 7 standards
 *                        (21.43% -> 6.0 items), G holds 1 (3.57% -> 1.0).
 *
 *  MD and Geometry share ONE published 23-27% band, so their shares come from
 *  `domainWeight()`, never from adding the two raw midpoints - 34 + 11 + 30 +
 *  25 + 25 totals 125, not 100.
 *
 *  None of these 28 items appears in the diagnostic: a child who has just sat
 *  the baseline should meet fresh items in the simulation, not be re-scored on
 *  the ones that set the baseline. */
const MOCK_SSA_01_QUESTION_IDS = [
  // Operations & Algebraic Thinking - 10
  'g3-oa1-02', 'g3-oa1-03', 'g3-oa2-02', 'g3-oa2-03', 'g3-oa3-02',
  'g3-oa3-03', 'g3-oa6-02', 'g3-oa7-02', 'g3-oa8-02', 'g3-oa9-02',
  // Base Ten - 3
  'g3-nbt2-02', 'g3-nbt2-03', 'g3-nbt3-02',
  // Fractions - 8
  'g3-nf1-02', 'g3-nf1-03', 'g3-nf2-02', 'g3-nf2-03',
  'g3-nf3-02', 'g3-nf3-03', 'g3-nf4-02', 'g3-nf4-03',
  // Measurement & Data - 6, and Geometry - 1, together the 23-27% band
  'g3-md1-02', 'g3-md2-02', 'g3-md3-02', 'g3-md5-02', 'g3-md7-02', 'g3-md8-02',
  'g3-g1-02',
];

export const GRADE_3_QUIZZES: QuizDefinition[] = [
  {
    id: 'g3-diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    // Both counts come from the active curriculum, not a grade-3 literal
    // (Ruling F11): this quiz happens to test one item per standard, so the
    // question count and the standard count are the same figure but are
    // still each derived independently.
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 40,
    questionIds: DIAGNOSTIC_QUESTION_IDS,
  },
  {
    id: 'g3-mod-oa-01',
    title: 'Module 1: Multiplication & Division Drill',
    subtitle:
      'The highest-weighted domain (32–36%): equal groups and arrays, sharing equally, one- and two-step word problems, unknown factors, fluency to 10 × 10, and patterns in the multiplication table.',
    domainId: 'OA',
    timeLimitMinutes: 35,
    questionIds: [
      'g3-oa1-01', 'g3-oa1-02', 'g3-oa1-03',
      'g3-oa2-01', 'g3-oa2-02', 'g3-oa2-03',
      'g3-oa3-01', 'g3-oa3-02', 'g3-oa3-03',
      'g3-oa6-01', 'g3-oa6-02', 'g3-oa6-03',
      'g3-oa7-01', 'g3-oa7-02', 'g3-oa7-03',
      'g3-oa8-01', 'g3-oa8-02', 'g3-oa8-03',
      'g3-oa9-01', 'g3-oa9-02', 'g3-oa9-03',
    ],
  },
  {
    id: 'g3-mod-nbt-01',
    title: 'Module 2: Base Ten to 1,000 Drill',
    subtitle:
      'Adding and subtracting whole numbers within 1,000 — estimating for reasonableness, using the inverse relationship, and expanded form — and multiplying a one-digit number by a multiple of 10.',
    domainId: 'NBT',
    timeLimitMinutes: 20,
    questionIds: [
      'g3-nbt2-01', 'g3-nbt2-02', 'g3-nbt2-03', 'g3-nbt2-04',
      'g3-nbt3-01', 'g3-nbt3-02', 'g3-nbt3-03',
    ],
  },
  {
    id: 'g3-mod-nf-01',
    title: 'Module 3: Introduction to Fractions Drill',
    subtitle:
      'The second-highest-weighted domain (28–32%): unit fractions, fractions on area and length models, equivalent fractions, and comparing fractions with the same numerator or the same denominator.',
    domainId: 'NF',
    timeLimitMinutes: 30,
    questionIds: [
      'g3-nf1-01', 'g3-nf1-02', 'g3-nf1-03',
      'g3-nf2-01', 'g3-nf2-02', 'g3-nf2-03',
      'g3-nf3-01', 'g3-nf3-02', 'g3-nf3-03', 'g3-nf3-04',
      'g3-nf4-01', 'g3-nf4-02', 'g3-nf4-03', 'g3-nf4-04',
    ],
  },
  {
    id: 'g3-mod-md-01',
    title: 'Module 4: Measurement, Area & Perimeter Drill',
    subtitle:
      'Time to the nearest minute and intervals within the hour, customary length, weight and capacity, scaled picture and bar graphs, area by tiling and by multiplying, and perimeter.',
    domainId: 'MD',
    timeLimitMinutes: 35,
    questionIds: [
      'g3-md1-01', 'g3-md1-02', 'g3-md1-03',
      'g3-md2-01', 'g3-md2-02', 'g3-md2-03', 'g3-md2-04', 'g3-md2-05',
      'g3-md3-01', 'g3-md3-02', 'g3-md3-03', 'g3-md3-04',
      'g3-md5-01', 'g3-md5-02', 'g3-md5-03',
      'g3-md7-01', 'g3-md7-02', 'g3-md7-03',
      'g3-md8-01', 'g3-md8-02', 'g3-md8-03',
    ],
  },
  {
    id: 'g3-mod-g-01',
    title: 'Module 5: Shapes & Quadrilaterals Drill',
    subtitle:
      'Composing triangles and quadrilaterals, decomposing quadrilaterals, and telling examples from non-examples of rhombuses, rectangles, squares, parallelograms and trapezoids.',
    domainId: 'G',
    timeLimitMinutes: 15,
    questionIds: ['g3-g1-01', 'g3-g1-02', 'g3-g1-03', 'g3-g1-04', 'g3-g1-05'],
  },
  {
    id: 'g3-mock-ssa-01',
    title: 'Full NC SSA Simulation Assessment (Form A)',
    subtitle: (c: GradeCurriculum) =>
      `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item test simulating the above-grade CASE assessment, allocated to the NCDPI blueprint bands. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
    isMockAssessment: true,
    timeLimitMinutes: 55,
    questionIds: MOCK_SSA_01_QUESTION_IDS,
  },
];
