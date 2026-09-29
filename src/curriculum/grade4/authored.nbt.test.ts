import { describe, it } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
} from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NBT_AUTHORED } from './authored.nbt';
import { GRADE_4_TEMPLATES } from './templates';

describe('grade 4 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_4_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_4_NBT_AUTHORED, nbt);
  });

  // Every NBT standard has BOTH an authored item and a generator, so this is
  // the domain where the two are most likely to meet. An item a generator can
  // also produce reaches the scheduler under two review keys — {authored, id}
  // and {generated, templateId} — and a child is served it twice.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_4_NBT_AUTHORED, GRADE_4_TEMPLATES);
  });
});
