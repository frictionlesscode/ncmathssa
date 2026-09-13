import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { MISCONCEPTIONS } from '../misconceptions';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_OA_AUTHORED } from './authored.oa';

describe('grade 4 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_4_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_4_OA_AUTHORED, oa);
  });

  // misconceptions.test.ts walks only REGISTERED grades, and grade 4 does not
  // register until its content is complete several tasks from now. Until then
  // nothing else would catch an undeclared tag in this bank, so check here.
  it('uses only declared misconception tags', () => {
    for (const q of GRADE_4_OA_AUTHORED) {
      for (const o of q.options) {
        if (o.isCorrect) continue;
        expect(MISCONCEPTIONS[o.misconception ?? ''], `${q.id}: ${o.misconception}`).toBeTruthy();
      }
    }
  });
});
