import { expect } from 'vitest';
import fc from 'fast-check';
import { makeRng } from './rng';
import type { QuestionTemplate } from './template';

/**
 * A template correct at seeds 1-10 can still emit a broken question at
 * seed 4912, so every template is checked across hundreds of seeds.
 * These are the invariants that make generated practice trustworthy.
 */
export function assertTemplateSound(t: QuestionTemplate, opts: { runs?: number } = {}): void {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), (seed) => {
      const g = t.generate(makeRng(seed));
      const where = `${t.id} @ seed ${seed}`;

      expect(g.prompt.trim().length, `${where}: empty prompt`).toBeGreaterThan(0);
      expect(g.options.length, `${where}: expected 4 options`).toBe(4);

      const correct = g.options.filter((o) => o.isCorrect);
      expect(correct.length, `${where}: exactly one correct option`).toBe(1);
      expect(correct[0].text, `${where}: answerText must match the correct option`)
        .toBe(g.answerText);

      const texts = g.options.map((o) => o.text.trim());
      expect(new Set(texts).size, `${where}: duplicate option text ${texts.join(' | ')}`).toBe(4);

      for (const o of g.options) {
        expect(o.text.trim().length, `${where}: blank option`).toBeGreaterThan(0);
        if (!o.isCorrect) {
          expect(o.misconception, `${where}: option ${o.label} has no misconception tag`)
            .toBeTruthy();
        }
      }

      expect(g.explanation.stepByStep.length, `${where}: no worked solution`).toBeGreaterThan(0);
      const lastStep = g.explanation.stepByStep[g.explanation.stepByStep.length - 1];
      expect(
        lastStep.includes(g.answerText),
        `${where}: final solution step "${lastStep}" does not state the answer "${g.answerText}"`,
      ).toBe(true);

      expect(
        /NaN|Infinity|undefined|null/.test(JSON.stringify(g)),
        `${where}: numeric or template corruption in output`,
      ).toBe(false);
    }),
    { numRuns: opts.runs ?? 300 },
  );
}
