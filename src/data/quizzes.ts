import type { QuizDefinition } from '../types';

import { QUESTIONS_BANK } from './questions';

export const STATIC_QUIZZES: QuizDefinition[] = [
  {
    id: 'diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    subtitle: '16-question diagnostic covering all 16 Grade 5 NCSCOS standards to determine your initial baseline.',
    isDiagnostic: true,
    timeLimitMinutes: 45,
    questionIds: [
      'oa2-01', 'oa3-01',
      'nbt1-01', 'nbt3-01', 'nbt5-01', 'nbt6-01', 'nbt7-01',
      'nf1-01', 'nf3-01', 'nf4-01', 'nf7-01',
      'md1-01', 'md2-01', 'md4-01', 'md5-01',
      'g1-01'
    ]
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
    subtitle: 'Comprehensive 24-item test simulating the above-grade CASE assessment. Benchmarked against the 80% passing bar.',
    isMockAssessment: true,
    timeLimitMinutes: 60,
    questionIds: [
      // Calculator Inactive section
      'oa2-01', 'oa2-02', 'oa3-01',
      'nbt1-01', 'nbt1-02', 'nbt3-01', 'nbt3-02', 'nbt5-01', 'nbt6-01', 'nbt7-01', 'nbt7-02',
      'nf1-01', 'nf1-02', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf7-01', 'nf7-02',
      // Calculator Active section
      'nbt5-02', 'nbt7-03', 'md1-01', 'md1-02', 'md2-01', 'md4-01', 'md5-01', 'md5-02', 'g1-01', 'g1-02', 'g3-01'
    ]
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

export function getQuizById(quizId: string): QuizDefinition | undefined {
  return STATIC_QUIZZES.find(q => q.id === quizId);
}

/**
 * Creates a dynamic custom drill for a single standard.
 */
export function createStandardDrill(standardCode: string): QuizDefinition {
  const matchingQuestions = QUESTIONS_BANK.filter(q => q.standardCode === standardCode);
  return {
    id: `drill-${standardCode}`,
    title: `Targeted Practice: ${standardCode}`,
    subtitle: `Focused mastery drill on standard ${standardCode}`,
    standardCode,
    domainId: matchingQuestions[0]?.domainId,
    isCustomDrill: true,
    questionIds: matchingQuestions.map(q => q.id)
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
