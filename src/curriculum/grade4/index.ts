import type { GradeCurriculum } from '../types';
import { GRADE_4_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_4_AUTHORED } from './authored';
import { GRADE_4_TEMPLATES } from './templates';
import { GRADE_4_QUIZZES } from './quizzes';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';

export { GRADE_4_DOMAINS, GRADE_4_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_4: GradeCurriculum = {
  grade: 4,
  label: 'Grade 4 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 4 },
  weighting: {
    kind: 'ncdpi-blueprint',
    // Verbatim from docs/sources/nc-eog-blueprint.json's `source` field.
    source: 'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026',
  },
  contentComplete: true,
  domains: GRADE_4_DOMAINS,
  quizzes: GRADE_4_QUIZZES,
  studyGuides: GRADE_4_STUDY_GUIDES,
  source: makeQuestionSource(GRADE_4_AUTHORED, GRADE_4_TEMPLATES),
};
