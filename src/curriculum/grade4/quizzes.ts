import type { QuizDefinition } from '../../types';
import type { GradeCurriculum } from '../types';

/** Grade 4's quiz set.
 *
 *  Every id below is an AUTHORED item id from the Grade 4 banks. A quiz may
 *  not cite a template id: `integrity.test.ts` builds its valid-id set from
 *  `source.authoredFor(code)` alone, and generated items are drawn by seed at
 *  run time rather than pinned into a fixed form. */

// Named so the subtitle functions below can cite `.length` without
// depending on `this` inside an object literal.
//
// The standard count below is counted from the curriculum's own domains
// rather than through `standardsOf()` from ../registry on purpose: the
// registry imports ./index, which imports this file, so importing the
// registry here closes a cycle that leaves `CURRICULA[4]` undefined
// whenever grade4/index is the first module of the graph to load.
const DIAGNOSTIC_QUESTION_IDS = [
  'g4-oa1-01', 'g4-oa3-01', 'g4-oa4-01', 'g4-oa5-01',
  'g4-nbt1-01', 'g4-nbt2-01', 'g4-nbt4-01', 'g4-nbt5-01', 'g4-nbt6-01', 'g4-nbt7-01',
  'g4-nf1-01', 'g4-nf2-01', 'g4-nf3-01', 'g4-nf4-01', 'g4-nf6-01', 'g4-nf7-01',
  'g4-md1-01', 'g4-md2-01', 'g4-md3-01', 'g4-md4-01', 'g4-md6-01', 'g4-md8-01',
  'g4-g1-01', 'g4-g2-01', 'g4-g3-01',
];

/** The full simulation, allocated to the NCDPI blueprint bands rather than
 *  evenly: 30 items x each domain's share through `domainWeight()`.
 *
 *    OA   16%  -> 4.8  -> 5 items
 *    NBT  27%  -> 8.1  -> 8 items
 *    NF   32%  -> 9.6  -> 10 items
 *    MD+G 25%  -> 7.5  -> 7 items, split by standard count within the shared
 *                        band: MD holds 6 of the group's 9 standards
 *                        (16.67% -> 5.0 items), G holds 3 (8.33% -> 2.5).
 *
 *  MD and Geometry share ONE published 23-27% band, so their shares come from
 *  `domainWeight()`, never from adding the two raw midpoints - that would
 *  total 125, not 100.
 *
 *  None of these 30 items appears in the diagnostic: a child who has just sat
 *  the baseline should meet fresh items in the simulation, not be re-scored on
 *  the ones that set the baseline. */
const MOCK_SSA_01_QUESTION_IDS = [
  // Operations & Algebraic Thinking - 5
  'g4-oa1-02', 'g4-oa3-02', 'g4-oa3-03', 'g4-oa4-02', 'g4-oa5-02',
  // Base Ten - 8
  'g4-nbt1-02', 'g4-nbt2-02', 'g4-nbt4-02', 'g4-nbt4-03',
  'g4-nbt5-02', 'g4-nbt6-02', 'g4-nbt7-02', 'g4-nbt7-03',
  // Fractions & Decimals - 10
  'g4-nf1-02', 'g4-nf2-02', 'g4-nf3-02', 'g4-nf3-03', 'g4-nf4-02',
  'g4-nf4-03', 'g4-nf6-02', 'g4-nf6-03', 'g4-nf7-02', 'g4-nf7-03',
  // Measurement & Data - 5, and Geometry - 2, together the 23-27% band
  'g4-md1-02', 'g4-md2-02', 'g4-md3-02', 'g4-md4-02', 'g4-md6-02',
  'g4-g2-02', 'g4-g3-02',
];

export const GRADE_4_QUIZZES: QuizDefinition[] = [
  {
    id: 'g4-diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    // Both counts come from the active curriculum, not a grade-4 literal
    // (Ruling F11): this quiz happens to test one item per standard, so the
    // question count and the standard count are the same figure but are
    // still each derived independently.
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 45,
    questionIds: DIAGNOSTIC_QUESTION_IDS,
  },
  {
    id: 'g4-mod-oa-01',
    title: 'Module 1: Operations & Algebraic Thinking Drill',
    subtitle:
      'Multiplicative comparison, two-step word problems, factor pairs and primes, and number or shape patterns.',
    domainId: 'OA',
    timeLimitMinutes: 30,
    questionIds: [
      'g4-oa1-01', 'g4-oa1-02', 'g4-oa1-03', 'g4-oa1-04',
      'g4-oa3-01', 'g4-oa3-02', 'g4-oa3-03', 'g4-oa3-04', 'g4-oa3-05',
      'g4-oa4-01', 'g4-oa4-02', 'g4-oa4-03', 'g4-oa4-04',
      'g4-oa5-01', 'g4-oa5-02', 'g4-oa5-03', 'g4-oa5-04', 'g4-oa5-05',
    ],
  },
  {
    id: 'g4-mod-nbt-01',
    title: 'Module 2: Base Ten & Whole Number Operations Drill',
    subtitle:
      'Place value to 100,000, reading and writing numerals, comparing with > = <, and multi-digit addition, subtraction, multiplication and division.',
    domainId: 'NBT',
    timeLimitMinutes: 35,
    questionIds: [
      'g4-nbt1-01', 'g4-nbt1-02', 'g4-nbt1-03',
      'g4-nbt2-01', 'g4-nbt2-02', 'g4-nbt2-03',
      'g4-nbt4-01', 'g4-nbt4-02', 'g4-nbt4-03',
      'g4-nbt5-01', 'g4-nbt5-02', 'g4-nbt5-03',
      'g4-nbt6-01', 'g4-nbt6-02', 'g4-nbt6-03',
      'g4-nbt7-01', 'g4-nbt7-02', 'g4-nbt7-03',
    ],
  },
  {
    id: 'g4-mod-nf-01',
    title: 'Module 3: Fractions & Decimals Drill',
    subtitle:
      'The highest-weighted domain (30-34%): equivalence, comparison, adding and subtracting, multiplying by a whole number, and decimal notation for tenths and hundredths.',
    domainId: 'NF',
    timeLimitMinutes: 45,
    questionIds: [
      'g4-nf1-01', 'g4-nf1-02', 'g4-nf1-03', 'g4-nf1-04',
      'g4-nf2-01', 'g4-nf2-02', 'g4-nf2-03', 'g4-nf2-04',
      'g4-nf3-01', 'g4-nf3-02', 'g4-nf3-03', 'g4-nf3-04', 'g4-nf3-05', 'g4-nf3-06',
      'g4-nf4-01', 'g4-nf4-02', 'g4-nf4-03', 'g4-nf4-04',
      'g4-nf6-01', 'g4-nf6-02', 'g4-nf6-03', 'g4-nf6-04',
      'g4-nf7-01', 'g4-nf7-02', 'g4-nf7-03', 'g4-nf7-04', 'g4-nf7-05',
    ],
  },
  {
    id: 'g4-mod-md-01',
    title: 'Module 4: Measurement, Data & Angles Drill',
    subtitle:
      'Metric measurement word problems, unit conversion, elapsed time, area and perimeter, representing data, and angle measure.',
    domainId: 'MD',
    timeLimitMinutes: 35,
    questionIds: [
      'g4-md1-01', 'g4-md1-02', 'g4-md1-03',
      'g4-md2-01', 'g4-md2-02', 'g4-md2-03',
      'g4-md3-01', 'g4-md3-02', 'g4-md3-03', 'g4-md3-04',
      'g4-md4-01', 'g4-md4-02', 'g4-md4-03', 'g4-md4-04',
      'g4-md6-01', 'g4-md6-02', 'g4-md6-03',
      'g4-md8-01', 'g4-md8-02', 'g4-md8-03', 'g4-md8-04',
    ],
  },
  {
    id: 'g4-mod-g-01',
    title: 'Module 5: Lines, Angles & Symmetry Drill',
    subtitle:
      'Points, lines, segments, rays and angles, parallel and perpendicular lines, classifying quadrilaterals and triangles, and lines of symmetry.',
    domainId: 'G',
    timeLimitMinutes: 25,
    questionIds: [
      'g4-g1-01', 'g4-g1-02', 'g4-g1-03', 'g4-g1-04',
      'g4-g2-01', 'g4-g2-02', 'g4-g2-03', 'g4-g2-04', 'g4-g2-05',
      'g4-g3-01', 'g4-g3-02', 'g4-g3-03',
    ],
  },
  {
    id: 'g4-mock-ssa-01',
    title: 'Full NC SSA Simulation Assessment (Form A)',
    subtitle: (c: GradeCurriculum) =>
      `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item test simulating the above-grade CASE assessment, allocated to the NCDPI blueprint bands. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
    isMockAssessment: true,
    timeLimitMinutes: 60,
    questionIds: MOCK_SSA_01_QUESTION_IDS,
  },
];
