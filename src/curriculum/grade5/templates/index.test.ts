import { describe, it, expect } from 'vitest';
import { GRADE_5_TEMPLATES } from './index';
import { GRADE_5 } from '../index';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { MISCONCEPTIONS } from '../../misconceptions';

const codes = new Set(GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code)));

describe('GRADE_5_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_5_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 5 standards', () => {
    for (const t of GRADE_5_TEMPLATES) {
      expect(codes.has(t.standardCode), `${t.id} -> ${t.standardCode}`).toBe(true);
    }
  });

  it('covers each fluency standard exactly once', () => {
    const covered = GRADE_5_TEMPLATES.map((t) => t.standardCode).sort();
    expect(covered).toEqual([
      'NC.5.MD.1',
      'NC.5.MD.5',
      'NC.5.NBT.1',
      'NC.5.NBT.3',
      'NC.5.NBT.5',
      'NC.5.NBT.6',
      'NC.5.NBT.7',
      'NC.5.NF.1',
      'NC.5.NF.4',
      'NC.5.NF.7',
    ]);
  });

  it('tags every distractor with a declared misconception', () => {
    for (const t of GRADE_5_TEMPLATES) {
      for (let seed = 0; seed < 50; seed++) {
        const g = t.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          expect(MISCONCEPTIONS[o.misconception ?? ''], `${t.id}: ${o.misconception}`).toBeTruthy();
        }
      }
    }
  });

  it.each(GRADE_5_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
