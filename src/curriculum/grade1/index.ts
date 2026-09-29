import type { GradeCurriculum } from '../types';
import { GRADE_1_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_1_AUTHORED } from './authored';
import { GRADE_1_TEMPLATES } from './templates';
import { GRADE_1_STUDY_GUIDES } from './studyGuides';
import { GRADE_1_QUIZZES } from './quizzes';

export { GRADE_1_DOMAINS, GRADE_1_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_1: GradeCurriculum = {
  grade: 1,
  label: 'Grade 1 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 1 },
  // NCDPI publishes no EOG blueprint below grade 3; there is no state
  // assessment to weight against, so domains share weight by standard count.
  weighting: { kind: 'even-by-standard-count' },
  contentComplete: true,
  domains: GRADE_1_DOMAINS,
  studyGuides: GRADE_1_STUDY_GUIDES,
  quizzes: GRADE_1_QUIZZES,
  source: makeQuestionSource(GRADE_1_AUTHORED, GRADE_1_TEMPLATES),
};
