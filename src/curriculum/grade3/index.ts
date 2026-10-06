import type { GradeCurriculum } from '../types';
import { GRADE_3_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_3_AUTHORED } from './authored';
import { GRADE_3_TEMPLATES } from './templates';
import { GRADE_3_QUIZZES } from './quizzes';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';

export { GRADE_3_DOMAINS, GRADE_3_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_3: GradeCurriculum = {
  grade: 3,
  label: 'Grade 3 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 3 },
  weighting: {
    kind: 'ncdpi-blueprint',
    // Verbatim from docs/sources/nc-eog-blueprint.json's `source` field.
    // Grade 3 is the lowest grade NCDPI publishes a blueprint for.
    source: 'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026',
  },
  contentComplete: true,
  domains: GRADE_3_DOMAINS,
  quizzes: GRADE_3_QUIZZES,
  studyGuides: GRADE_3_STUDY_GUIDES,
  source: makeQuestionSource(GRADE_3_AUTHORED, GRADE_3_TEMPLATES),
};
