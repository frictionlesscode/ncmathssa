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

/** Percentage weight of a domain within its grade, 0-100.
 *
 *  A domain in a weightGroup shares one published band with its siblings, so
 *  the group midpoint is divided among them by standard count. Returning the
 *  group midpoint for each member would total well over 100. */
export function domainWeight(c: GradeCurriculum, domainId: DomainId): number {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return 0;
  if (c.weighting.kind === 'ncdpi-blueprint') {
    if (!domain.weightGroup) return domain.officialWeightMidpoint;
    const siblings = c.domains.filter((d) => d.weightGroup === domain.weightGroup);
    const groupStandards = siblings.reduce((n, d) => n + d.standards.length, 0);
    if (groupStandards === 0) return 0;
    return domain.officialWeightMidpoint * (domain.standards.length / groupStandards);
  }
  const total = standardsOf(c).length;
  if (total === 0) return 0;
  return (domain.standards.length / total) * 100;
}

/** The weight band as it should be shown to a reader. A grouped domain is
 *  labelled with its group, because NCDPI publishes no weight for it alone
 *  and the app presents these as official blueprint figures. */
export function weightLabel(c: GradeCurriculum, domainId: DomainId): string {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return '';
  if (domain.weightGroup && domain.weightGroupLabel) {
    return `${domain.officialWeightRange} (${domain.weightGroupLabel})`;
  }
  return domain.officialWeightRange;
}
