import { describe, it } from 'vitest';
import { assertAuthoredBankSound, assertGradeTwoReadable, GRADE_2_VOCAB_ALLOWLIST } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_G_AUTHORED } from './authored.g';

describe('grade 2 Geometry authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const g = GRADE_2_DOMAINS.find((d) => d.id === 'G')!;
    assertAuthoredBankSound(GRADE_2_G_AUTHORED, g, { itemsPerStandard: 4 });
  });

  // Fix 1 (whole-branch review, Important): see authored.oa.test.ts.
  it('keeps every prompt readable for a seven-year-old', () => {
    assertGradeTwoReadable(GRADE_2_G_AUTHORED, { allowlist: GRADE_2_VOCAB_ALLOWLIST });
  });
});
