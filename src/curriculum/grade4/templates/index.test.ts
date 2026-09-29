import { describe, it, expect } from 'vitest';
import { GRADE_4_TEMPLATES } from './index';
import { GRADE_4_DOMAINS } from '../standards';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { MISCONCEPTIONS } from '../../misconceptions';

const codes = new Set(GRADE_4_DOMAINS.flatMap((d) => d.standards.map((s) => s.code)));

describe('GRADE_4_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_4_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 4 standards', () => {
    for (const t of GRADE_4_TEMPLATES) {
      expect(codes.has(t.standardCode), `${t.id} -> ${t.standardCode}`).toBe(true);
    }
  });

  it('tags every distractor with a declared misconception', () => {
    for (const t of GRADE_4_TEMPLATES) {
      for (let seed = 0; seed < 50; seed++) {
        const g = t.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          expect(MISCONCEPTIONS[o.misconception ?? ''], `${t.id}: ${o.misconception}`).toBeTruthy();
        }
      }
    }
  });

  it.each(GRADE_4_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
