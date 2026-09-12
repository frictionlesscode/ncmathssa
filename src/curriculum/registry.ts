import type { Grade, GradeCurriculum, DomainId, StandardInfo } from './types';
import { GRADE_5 } from './grade5';

const CURRICULA: Partial<Record<Grade, GradeCurriculum>> = {
  5: GRADE_5,
};

export function getCurriculum(grade: Grade): GradeCurriculum {
  const c = CURRICULA[grade];
  if (!c) throw new Error(`No curriculum module for grade ${grade}`);
  return c;
}

export function listCurricula(): GradeCurriculum[] {
  return Object.values(CURRICULA).sort((a, b) => a.grade - b.grade);
}

export function standardsOf(c: GradeCurriculum): StandardInfo[] {
  return c.domains.flatMap((d) => d.standards);
}

/** Percentage weight of a domain within its grade, 0-100. */
export function domainWeight(c: GradeCurriculum, domainId: DomainId): number {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return 0;
  if (c.weighting.kind === 'ncdpi-blueprint') return domain.officialWeightMidpoint;
  const total = standardsOf(c).length;
  if (total === 0) return 0;
  return (domain.standards.length / total) * 100;
}
