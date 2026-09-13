import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_OA_AUTHORED } from './authored.oa';
import { GRADE_4_TEMPLATES } from './templates';
import { makeRng } from '../../engine/rng';

describe('grade 4 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_4_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_4_OA_AUTHORED, oa);
  });

  // The declared-tag guard that used to live here now lives in the shared kit.
  //
  // This one does not, and belongs to the bank rather than to any single item:
  // a question a generator can also produce reaches the scheduler under two
  // review keys — {authored, id} and {generated, templateId} — so a child gets
  // it twice and the second serving teaches nothing. Both generators are held
  // clear of the authored items by an invariant they already enforce (two-digit
  // quantities; numbers with three or more factor pairs); this checks that the
  // invariant is really keeping the two apart.
  it('shares no question with the generators', () => {
    const authored = new Set(GRADE_4_OA_AUTHORED.map((q) => q.prompt.trim()));
    for (const t of GRADE_4_TEMPLATES) {
      for (let seed = 0; seed < 2000; seed++) {
        const prompt = t.generate(makeRng(seed)).prompt.trim();
        expect(
          authored.has(prompt),
          `${t.id} at seed ${seed} reproduces an authored item: "${prompt}"`,
        ).toBe(false);
      }
    }
  });
});
