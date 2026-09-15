import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_OA_AUTHORED } from './authored.oa';

describe('grade 2 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_2_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_2_OA_AUTHORED, oa, { itemsPerStandard: 3 });
  });

  it('gives NC.2.OA.1 at least 5 items, one per named problem type', () => {
    const items = GRADE_2_OA_AUTHORED.filter((q) => q.standardCode === 'NC.2.OA.1');
    if (items.length < 5) throw new Error(`NC.2.OA.1 has ${items.length} items, needs 5`);
  });
});
