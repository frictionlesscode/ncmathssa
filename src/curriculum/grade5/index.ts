import type { GradeCurriculum } from '../types';
import { GRADE_5_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_TEMPLATES } from './templates';

export { GRADE_5_DOMAINS, GRADE_5_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_5: GradeCurriculum = {
  grade: 5,
  label: 'Grade 5 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 5 },
  weighting: {
    kind: 'ncdpi-blueprint',
    source: 'NCDPI Grade 5 Mathematics EOG Assessment Blueprint',
  },
  contentComplete: true,
  domains: GRADE_5_DOMAINS,
  source: makeQuestionSource(GRADE_5_AUTHORED, GRADE_5_TEMPLATES),
};
