import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5 } from './index';
import { correctOption } from '../../engine/questionModel';
import { GRADE_5_QUIZZES } from './quizzes';

const codes = new Set(GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code)));

/**
 * Parses an option that is purely a numeric answer ("$30.95", "2 1/4 pounds",
 * "6,000 meters"). Returns null for prose options, which are compared by text.
 * Distinct text is not enough for a numeric item: "4/8" and "1/2" are different
 * strings but the same quantity, so an item offering both has two right answers.
 */
function numericValue(raw: string): number | null {
  const s = raw.trim().replace(/^\$/, '').replace(/,/g, '');
  let m = /^(\d+)\s+(\d+)\/(\d+)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  m = /^(\d+(?:\.\d+)?)(?:\s+[A-Za-z][A-Za-z ]*)?$/.exec(s);
  if (m) return Number(m[1]);
  return null;
}

describe('GRADE_5_AUTHORED', () => {
  it('retains all 49 items', () => {
    expect(GRADE_5_AUTHORED).toHaveLength(49);
  });

  it('has unique ids', () => {
    const ids = GRADE_5_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(GRADE_5_AUTHORED.map((q) => [q.id, q] as const))(
    '%s is a well-formed multiple-choice item',
    (_id, q) => {
      expect(codes.has(q.standardCode)).toBe(true);
      expect(q.options.length).toBe(4);
      expect(() => correctOption(q)).not.toThrow();

      const texts = q.options.map((o) => o.text.trim());
      expect(new Set(texts).size).toBe(4);           // no duplicate options

      // No two options may name the same quantity: an unsimplified equivalent
      // of the key ("4/8" beside "1/2") is not a wrong answer, it is a second
      // right one, and a child who picks it would be marked wrong unfairly.
      const values = q.options.map((o) => numericValue(o.text)).filter((v): v is number => v !== null);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(
            Math.abs(values[i] - values[j]),
            `${q.id}: two options both equal ${values[i]}`,
          ).toBeGreaterThan(1e-9);
        }
      }

      for (const o of q.options) {
        expect(o.text.trim().length).toBeGreaterThan(0);
        if (!o.isCorrect) expect(o.misconception, `${q.id} option ${o.label}`).toBeTruthy();
      }

      expect(q.explanation.stepByStep.length).toBeGreaterThan(0);
      expect(q.explanation.conceptSummary.length).toBeGreaterThan(0);
    },
  );

  it('covers every grade 5 standard', () => {
    const covered = new Set(GRADE_5_AUTHORED.map((q) => q.standardCode));
    for (const code of codes) expect(covered.has(code), `no item for ${code}`).toBe(true);
  });

  it('assigns each question to the domain that owns its standard', () => {
    const ownerOf = new Map(
      GRADE_5.domains.flatMap((d) => d.standards.map((s) => [s.code, d.id] as const)),
    );
    for (const q of GRADE_5_AUTHORED) expect(q.domainId).toBe(ownerOf.get(q.standardCode));
  });

  // Ruling F2: the correct answer must not always sit in the same slot.
  it('does not put the correct answer in the same position every time', () => {
    const labels = GRADE_5_AUTHORED.map((q) => correctOption(q).label);
    const distinct = new Set(labels);
    expect(distinct.size, `correct answers only ever at ${[...distinct].join(', ')}`)
      .toBeGreaterThanOrEqual(3);
    // No single label may hold more than half the answers.
    for (const l of distinct) {
      expect(labels.filter((x) => x === l).length).toBeLessThanOrEqual(Math.ceil(49 / 2));
    }
  });

  // Ruling F9: the baseline diagnostic must assess all 17 standards.
  it('the baseline diagnostic covers every standard exactly once', () => {
    const diagnostic = GRADE_5_QUIZZES.find((q) => q.id === 'diagnostic-01')!;
    const byId = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q]));
    const covered = diagnostic.questionIds.map((id) => byId.get(id)!.standardCode);
    expect(new Set(covered).size).toBe(codes.size);
    expect(covered).toHaveLength(codes.size);
  });
});
