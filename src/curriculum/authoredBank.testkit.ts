import { expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';
import { MISCONCEPTIONS } from './misconceptions';
import type { QuestionTemplate } from '../engine/template';
import { makeRng } from '../engine/rng';

/**
 * Parses an option into the quantity it names ("1 3/4", "0.75", "$1,200",
 * "6,000 meters"). Returns null for prose options, which are compared by text.
 * Distinct text is not enough for a numeric item: "4/8" and "1/2" are
 * different strings but the same quantity, so an item offering both has two
 * right answers and a child who picks the second is marked wrong unfairly.
 *
 * Exported so a domain test can ask WHICH of its options this parser can see.
 * An option it returns null for is compared by text alone and is not
 * value-guarded, so an item mixing parseable and unparseable options is
 * silently half-checked. A domain test that re-declared these patterns locally
 * could drift from this copy without anything going red — which is precisely
 * the failure the guard exists to prevent — so there is one definition and
 * everything imports it.
 */
export function numericValue(raw: string): number | null {
  const s = raw.trim().replace(/^\$/, '').replace(/,/g, '');
  let m = /^(\d+)\s+(\d+)\/(\d+)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  m = /^(\d+(?:\.\d+)?)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]);
  return null;
}

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

    // Distinct text is not distinct answers. This guard lived only in
    // grade5/authored.test.ts and did not survive into the shared kit, which
    // meant the fraction and decimal banks were about to be written without
    // the one check most likely to catch a genuinely wrong item.
    const values = q.options
      .map((o) => numericValue(o.text))
      .filter((v): v is number => v !== null);
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        expect(
          Math.abs(values[i] - values[j]),
          `${q.id}: two options both equal ${values[i]}`,
        ).toBeGreaterThan(1e-9);
      }
    }

    expect(q.prompt.trim().length, `${q.id} has an empty prompt`).toBeGreaterThan(0);

    // A tag nothing declares reaches a parent as a blank explanation.
    for (const o of q.options) {
      if (o.misconception) {
        expect(
          MISCONCEPTIONS[o.misconception],
          `${q.id} option ${o.label} uses undeclared tag "${o.misconception}"`,
        ).toBeTruthy();
      }
    }

    // assertTemplateSound enforces this for generators; authored items were
    // held to a lower bar for no reason. A worked solution that never states
    // the answer leaves a child who got it wrong with nothing to check against.
    const correct = q.options.find((o) => o.isCorrect)!;
    const lastStep = q.explanation.stepByStep[q.explanation.stepByStep.length - 1] ?? '';
    expect(
      lastStep.includes(correct.text.trim()),
      `${q.id}: final step "${lastStep}" never states the answer "${correct.text}"`,
    ).toBe(true);

    expect(
      q.isStretch === (q.difficulty === 'stretch'),
      `${q.id}: isStretch=${q.isStretch} disagrees with difficulty="${q.difficulty}"`,
    ).toBe(true);

    expect(q.explanation.stepByStep.length, `${q.id} has no worked solution`).toBeGreaterThan(0);
    expect(q.explanation.conceptSummary.trim().length, `${q.id} concept summary`).toBeGreaterThan(0);
  }

  for (const s of domain.standards) {
    const mine = items.filter((q) => q.standardCode === s.code);
    expect(mine.length, `${s.code} has ${mine.length} items, needs ${floor}`)
      .toBeGreaterThanOrEqual(floor);
  }

  // Ruling F2, promoted out of grade5/authored.test.ts where it only ever
  // guarded one bank: a child who notices the key is usually C stops doing
  // mathematics and starts reading the layout.
  const labels = items.map((q) => q.options.find((o) => o.isCorrect)!.label);
  const distinct = new Set(labels);
  if (items.length >= 8) {
    expect(
      distinct.size,
      `${domain.id}: correct answers only ever at ${[...distinct].join(', ')}`,
    ).toBeGreaterThanOrEqual(3);
  }
  for (const l of distinct) {
    expect(
      labels.filter((x) => x === l).length,
      `${domain.id}: more than half the answers sit at ${l}`,
    ).toBeLessThanOrEqual(Math.ceil(items.length / 2));
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

/**
 * A question a generator can also produce reaches the scheduler under two
 * review keys - {authored, id} and {generated, templateId} - so a child is
 * served it twice and the second serving teaches nothing. Generalised out of
 * the Grade 4 OA bank, where a review found two authored items their own
 * generators reproduced verbatim.
 *
 * Call this from any domain test whose standards have both authored items and
 * templates.
 */
export function assertNoGeneratorDuplicatesAuthored(
  items: Question[],
  templates: QuestionTemplate[],
  opts: { seeds?: number } = {},
): void {
  const seeds = opts.seeds ?? 2000;
  const authored = new Set(items.map((q) => q.prompt.trim()));
  for (const t of templates) {
    for (let seed = 0; seed < seeds; seed++) {
      const prompt = t.generate(makeRng(seed)).prompt.trim();
      expect(
        authored.has(prompt),
        `${t.id} at seed ${seed} reproduces an authored item: "${prompt}"`,
      ).toBe(false);
    }
  }
}
