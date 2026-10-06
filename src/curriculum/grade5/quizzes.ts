import type { QuizDefinition } from '../../types';
import type { GradeCurriculum, StandardInfo } from '../types';

/** This grade's standards, flattened.
 *
 *  Counted off `c.domains` rather than imported as `standardsOf` from
 *  ../registry on purpose: the registry imports ./grade5, which imports this
 *  file, so importing the registry here closes a cycle. It was green only by
 *  import order, and `registry.ts` now imports ./grade3 and ./grade4 first -
 *  so if grade5/index ever became the graph's entry point, `CURRICULA` would
 *  evaluate with `5: undefined`, a partially working registry that fails
 *  worse than a clean throw. `grade4/quizzes.ts` counts the same way. */
function standardsOf(c: GradeCurriculum): StandardInfo[] {
  return c.domains.flatMap((d) => d.standards);
}

// Named so the subtitle functions below can cite `.length` without
// depending on `this` inside an object literal.
//
// Form composition follows the NCDPI blueprint bands in standards.ts
// (OA 9-13%, NBT 25-29%, NF 39-43%, MD and G together 19-23%). Each question
// carries its own calculatorAllowed flag and the app applies it per question,
// so the forms are not split into calculator sections.
//
// Only 12 fraction items exist, so a form that is about 40% fractions cannot be
// disjoint from another. The two practice tests therefore share 8 fraction
// items and nothing else. The check-up keeps one item for every standard and
// adds five fraction items; it is held to within 5 points of each band.
// quizzes.blueprint.test.ts computes every share.

// 22 items: OA 2, NBT 5, NF 9, MD+G 6.
const DIAGNOSTIC_QUESTION_IDS = [
  'oa2-01', 'oa3-01',
  'nbt1-01', 'nbt3-01', 'nbt5-01', 'nbt6-01', 'nbt7-01',
  'nf1-01', 'nf1-02', 'nf1-03', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf7-01', 'nf7-02',
  'md1-01', 'md2-01', 'md4-01', 'md5-01',
  'g1-01', 'g3-01'
];

// 29 items: OA 3, NBT 8, NF 12, MD+G 6.
const MOCK_SSA_01_QUESTION_IDS = [
  'oa2-01', 'oa2-02', 'oa3-01',
  'nbt1-01', 'nbt1-02', 'nbt3-01', 'nbt3-02', 'nbt5-01', 'nbt6-01', 'nbt7-01', 'nbt7-03',
  'nf1-01', 'nf1-02', 'nf1-03', 'nf1-04', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf4-03', 'nf7-01', 'nf7-02', 'nf7-03',
  'md1-01', 'md2-01', 'md4-01', 'md5-01',
  'g1-01', 'g3-01'
];

// 19 items: OA 2, NBT 5, NF 8, MD+G 4. The 8 fraction items are the only ones
// shared with Form A.
const MOCK_SSA_02_QUESTION_IDS = [
  'oa2-03', 'oa3-02',
  'nbt1-03', 'nbt3-03', 'nbt5-02', 'nbt6-02', 'nbt7-04',
  'nf1-03', 'nf1-04', 'nf3-01', 'nf3-02', 'nf4-02', 'nf4-03', 'nf7-02', 'nf7-03',
  'md1-03', 'md2-02', 'md5-03',
  'g3-03'
];

export const GRADE_5_QUIZZES: QuizDefinition[] = [
  {
    id: 'diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    // Both counts below come from the active curriculum, not a grade-5
    // literal (Ruling F11): this quiz has more items than standards
    // (some standards get two), so the two counts differ and are each
    // derived independently.
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${standardsOf(c).length} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 50,
    questionIds: DIAGNOSTIC_QUESTION_IDS
  },
  {
    id: 'mod-oa-01',
    title: 'Module 1: Operations & Algebraic Thinking Drill',
    subtitle: 'Parentheses, order of operations, numerical expressions, and coordinate patterns (NC.5.OA.2 & NC.5.OA.3).',
    domainId: 'OA',
    timeLimitMinutes: 25,
    questionIds: ['oa2-01', 'oa2-02', 'oa2-03', 'oa2-04', 'oa3-01', 'oa3-02', 'oa3-03']
  },
  {
    id: 'mod-nbt-01',
    title: 'Module 2: Base Ten & Decimal Operations Drill',
    subtitle: 'Place value powers of 10, decimal comparison, multi-digit multiplication/division, and decimal arithmetic.',
    domainId: 'NBT',
    timeLimitMinutes: 40,
    questionIds: [
      'nbt1-01', 'nbt1-02', 'nbt1-03',
      'nbt3-01', 'nbt3-02', 'nbt3-03',
      'nbt5-01', 'nbt5-02',
      'nbt6-01', 'nbt6-02', 'nbt6-03',
      'nbt7-01', 'nbt7-02', 'nbt7-03', 'nbt7-04'
    ]
  },
  {
    id: 'mod-nf-01',
    title: 'Module 3: Fractions Operations & Applications Drill',
    subtitle: 'The highest-weighted domain (~41%): unlike denominators, fractions as division, fraction multiplication, and division.',
    domainId: 'NF',
    timeLimitMinutes: 45,
    questionIds: [
      'nf1-01', 'nf1-02', 'nf1-03', 'nf1-04',
      'nf3-01', 'nf3-02',
      'nf4-01', 'nf4-02', 'nf4-03',
      'nf7-01', 'nf7-02', 'nf7-03'
    ]
  },
  {
    id: 'mod-md-01',
    title: 'Module 4: Measurement & Data Drill',
    subtitle: 'One-step unit conversions from a chart, line graphs of data over time, cubic volume, and composed prisms.',
    domainId: 'MD',
    timeLimitMinutes: 30,
    questionIds: [
      'md1-01', 'md1-02', 'md1-03',
      'md2-01', 'md2-02',
      'md4-01',
      'md5-01', 'md5-02', 'md5-03'
    ]
  },
  {
    id: 'mod-g-01',
    title: 'Module 5: Coordinate Geometry & 2D Shapes Drill',
    subtitle: 'Quadrant 1 coordinate plotting, distance, and the quadrilateral geometric hierarchy.',
    domainId: 'G',
    timeLimitMinutes: 25,
    questionIds: ['g1-01', 'g1-02', 'g1-03', 'g3-01', 'g3-02', 'g3-03']
  },
  {
    id: 'mock-ssa-01',
    title: 'Full NC SSA Simulation Assessment (Form A)',
    subtitle: (c: GradeCurriculum) =>
      `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item test simulating the above-grade CASE assessment. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
    isMockAssessment: true,
    timeLimitMinutes: 60,
    questionIds: MOCK_SSA_01_QUESTION_IDS
  },
  {
    id: 'mock-ssa-02',
    title: 'Full NC SSA Challenge Assessment (Form B)',
    subtitle: 'Harder multi-step word problems and expression items at Grade 5 level.',
    isMockAssessment: true,
    timeLimitMinutes: 65,
    questionIds: MOCK_SSA_02_QUESTION_IDS
  }
];
