import { getCurriculum } from '../curriculum/registry';
import type { StandardCode } from '../curriculum/types';
import { sampleSizeFor } from './path';

/** Shared fixtures for tests that drive buildPath against the grade 5 curriculum. */
export const c5 = getCurriculum(5);
export const withContent = new Set(c5.source.allStandardsWithContent());
export const domainIds = c5.domains
  .filter((d) => d.standards.some((s) => withContent.has(s.code)))
  .map((d) => d.id);
export const codeOf = (domainId: string): StandardCode =>
  c5.domains.find((d) => d.id === domainId)!.standards.find((s) => withContent.has(s.code))!.code;
export const needFor = (domainId: string) =>
  sampleSizeFor(c5, c5.domains.find((d) => d.id === domainId)!.standards.map((s) => s.code).filter((c) => withContent.has(c)));
