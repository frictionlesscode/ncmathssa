import type { QuizDefinition } from '../../types';
import type { GradeCurriculum, StandardInfo } from '../types';
import type { QuestionRef } from '../../engine/questionModel';
import { questionRefId } from '../../engine/questionModel';

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
const DIAGNOSTIC_QUESTION_IDS = [
  'oa2-01', 'oa3-01',
  'nbt1-01', 'nbt3-01', 'nbt5-01', 'nbt6-01', 'nbt7-01',
  'nf1-01', 'nf3-01', 'nf4-01', 'nf7-01',
  'md1-01', 'md2-01', 'md4-01', 'md5-01',
  'g1-01', 'g3-01'
];

const MOCK_SSA_01_QUESTION_IDS = [
  // Calculator Inactive section
  'oa2-01', 'oa2-02', 'oa3-01',
  'nbt1-01', 'nbt1-02', 'nbt3-01', 'nbt3-02', 'nbt5-01', 'nbt6-01', 'nbt7-01', 'nbt7-02',
  'nf1-01', 'nf1-02', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf7-01', 'nf7-02',
  // Calculator Active section
  'nbt5-02', 'nbt7-03', 'md1-01', 'md1-02', 'md2-01', 'md4-01', 'md5-01', 'md5-02', 'g1-01', 'g1-02', 'g3-01'
];

export const GRADE_5_QUIZZES: QuizDefinition[] = [
  {
    id: 'diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    // Both counts below come from the active curriculum, not a grade-5
    // literal (Ruling F11): this quiz happens to test one item per
    // standard, so the question count and the standard count are the
    // same figure but are still each derived independently.
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${standardsOf(c).length} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 45,
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
    subtitle: 'Multiplicative unit conversions, fractional line plots, cubic volume, and composite 3D figures.',
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
    subtitle: 'Advanced simulation including multi-step word problems and above-grade stretch items.',
    isMockAssessment: true,
    timeLimitMinutes: 65,
    questionIds: [
      'oa2-03', 'oa2-04', 'oa3-02', 'oa3-03',
      'nbt1-03', 'nbt3-03', 'nbt6-02', 'nbt6-03', 'nbt7-04',
      'nf1-03', 'nf1-04', 'nf4-03', 'nf7-03',
      'md1-03', 'md2-02', 'md5-03',
      'g1-03', 'g3-02', 'g3-03'
    ]
  }
];

/**
 * Creates a dynamic custom drill for a single standard, drawing every
 * authored question for that standard from the active curriculum's
 * question source rather than a specific grade's authored bank.
 */
export function createStandardDrill(standardCode: string, curriculum: GradeCurriculum): QuizDefinition {
  const refs = curriculum.source.authoredFor(standardCode);
  const standardInfo = standardsOf(curriculum).find(s => s.code === standardCode);
  return {
    id: `drill-${standardCode}`,
    title: `Targeted Practice: ${standardCode}`,
    subtitle: `Focused mastery drill on standard ${standardCode}`,
    standardCode,
    domainId: standardInfo?.domainId,
    isCustomDrill: true,
    questionIds: refs.map(r => (r as { kind: 'authored'; id: string }).id)
  };
}

/**
 * Creates a dynamic quiz containing all current missed questions.
 */
export function createMissedQuestionsDrill(missedIds: string[]): QuizDefinition {
  return {
    id: `drill-weakspots-${Date.now()}`,
    title: 'Weak Spots & Missed Questions Drill',
    subtitle: `Re-testing ${missedIds.length} question(s) previously answered incorrectly.`,
    isCustomDrill: true,
    questionIds: missedIds
  };
}

/**
 * Wraps the refs `selectSession` (Task 11) produces as a `QuizDefinition`
 * so the existing `QuizRunner`/`QuizAttempt` machinery can run an adaptive
 * practice session without any special-casing: every ref, authored or
 * generated, round-trips through `questionRefId`/`parseQuestionRef`.
 */
export function createAdaptiveSessionDrill(refs: QuestionRef[]): QuizDefinition {
  return {
    id: `adaptive-session-${Date.now()}`,
    title: 'Adaptive Practice Session',
    subtitle: `A ${refs.length}-question set built from your due reviews and current weak spots.`,
    isCustomDrill: true,
    questionIds: refs.map(questionRefId)
  };
}
