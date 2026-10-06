import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NF_AUTHORED } from './authored.nf';
import { GRADE_4_TEMPLATES } from './templates';

describe('grade 4 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_4_DOMAINS.find((d) => d.id === 'NF')!;
    // NF carries the largest band at Grade 4, so the bank is written four
    // items deep per standard rather than the kit's floor of three.
    assertAuthoredBankSound(GRADE_4_NF_AUTHORED, nf, { itemsPerStandard: 4 });
  });

  // Six of the six NF standards have a generator, so this is where the two are
  // most likely to meet. An item a generator can also produce reaches the
  // scheduler under two review keys - {authored, id} and {generated,
  // templateId} - and a child is served it twice.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_4_NF_AUTHORED, GRADE_4_TEMPLATES);
  });

  // The trap this domain sets is a SECOND RIGHT ANSWER: an unsimplified
  // equivalent of the key - 4/8 beside 1/2, 6/4 beside 1 1/2, 0.50 beside 0.5.
  // The shared kit catches that, but only for options its numericValue() can
  // parse; an option it cannot parse is compared by text alone and is silently
  // unguarded. So require every item to be all-numeric or all-prose. A mixed
  // item is the one shape where the kit's guard would quietly cover three
  // options and miss the fourth.
  //
  // numericValue is imported, never re-declared: a local copy of those
  // patterns could drift from the kit's and leave this assertion measuring a
  // parser nothing else uses.
  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_4_NF_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });
});
