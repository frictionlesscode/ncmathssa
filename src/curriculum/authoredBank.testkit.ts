import { expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';

/**
 * The invariants every authored bank must hold, asserted in one place so a
 * new domain's test file is three lines instead of forty. Mirrors what
 * assertTemplateSound() does for generators.
 */
export function assertAuthoredBankSound(
  items: Question[],
  domain: DomainInfo,
  opts: { itemsPerStandard?: number } = {},
): void {
  const floor = opts.itemsPerStandard ?? 3;
  const codes = new Set(domain.standards.map((s) => s.code));

  const ids = items.map((q) => q.id);
  expect(new Set(ids).size, `duplicate item ids in ${domain.id}`).toBe(ids.length);

  for (const q of items) {
    expect(codes.has(q.standardCode), `${q.id} is not a ${domain.id} standard`).toBe(true);
    expect(q.domainId, `${q.id} domainId`).toBe(domain.id);
    expect(q.options.length, `${q.id} must have 4 options`).toBe(4);
    expect(q.options.filter((o) => o.isCorrect).length, `${q.id} correct count`).toBe(1);
    for (const o of q.options) {
      expect(o.text.trim().length, `${q.id} option ${o.label} is blank`).toBeGreaterThan(0);
      if (!o.isCorrect) {
        expect(o.misconception, `${q.id} option ${o.label} has no misconception tag`).toBeTruthy();
      }
    }
    const texts = q.options.map((o) => o.text.trim());
    expect(new Set(texts).size, `${q.id} has duplicate option text`).toBe(4);
    expect(q.explanation.stepByStep.length, `${q.id} has no worked solution`).toBeGreaterThan(0);
    expect(q.explanation.conceptSummary.trim().length, `${q.id} concept summary`).toBeGreaterThan(0);
  }

  for (const s of domain.standards) {
    const mine = items.filter((q) => q.standardCode === s.code);
    expect(mine.length, `${s.code} has ${mine.length} items, needs ${floor}`)
      .toBeGreaterThanOrEqual(floor);
  }

  // A bank of nothing but mastery items never stretches a student, and a bank
  // of nothing but stretch items teaches nobody. Both tiers must be present.
  const difficulties = new Set(items.map((q) => q.difficulty));
  expect(difficulties.has('mastery'), `${domain.id} has no mastery-level items`).toBe(true);
  expect(
    difficulties.has('advanced') || difficulties.has('stretch'),
    `${domain.id} has no items above mastery level`,
  ).toBe(true);
}
