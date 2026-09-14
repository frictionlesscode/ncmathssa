import { describe, it, expect } from 'vitest';
import { GRADE_3_TEMPLATES } from './index';
import { GRADE_3_DOMAINS } from '../standards';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { MISCONCEPTIONS } from '../../misconceptions';

const codes = new Set(GRADE_3_DOMAINS.flatMap((d) => d.standards.map((s) => s.code)));

/** Joins a prompt to its figure for comparison. A line break cannot appear in
 *  a prompt, so no pair of questions can be made to look alike by shifting
 *  where the prompt ends and the figure begins. */
function questionKey(prompt: string, details: string | undefined): string {
  return `${prompt.trim()}\n<<figure>>\n${(details ?? '').trim()}`;
}

describe('GRADE_3_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_3_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 3 standards', () => {
    for (const t of GRADE_3_TEMPLATES) {
      expect(codes.has(t.standardCode), `${t.id} -> ${t.standardCode}`).toBe(true);
    }
  });

  // A template file that nobody added to index.ts is invisible to the app but
  // still reaches misconceptions.test.ts through allContent.ts, so it stays
  // green while serving no child anything. Discover the files and compare.
  it('exports every template file in this directory', () => {
    const modules = import.meta.glob(['./*.ts', '!./*.test.ts', '!./index.ts'], { eager: true });
    const onDisk = Object.values(modules).flatMap((m) =>
      Object.values(m as Record<string, unknown>).filter(
        (v): v is { id: string } =>
          !!v &&
          typeof v === 'object' &&
          typeof (v as { generate?: unknown }).generate === 'function',
      ),
    );
    const exported = new Set(GRADE_3_TEMPLATES.map((t) => t.id));
    const missing = onDisk.map((t) => t.id).filter((id) => !exported.has(id));
    expect(missing, `template files not listed in index.ts: ${missing.join(', ')}`).toEqual([]);
  });

  it('names every template g3.<tail>.<slug>', () => {
    for (const t of GRADE_3_TEMPLATES) {
      expect(t.id, `${t.id} is not a dotted g3 template id`).toMatch(/^g3\.[a-z]+\d\.[a-z0-9-]+$/);
    }
  });

  it('tags every distractor with a declared misconception', () => {
    for (const t of GRADE_3_TEMPLATES) {
      for (let seed = 0; seed < 50; seed++) {
        const g = t.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          expect(MISCONCEPTIONS[o.misconception ?? ''], `${t.id}: ${o.misconception}`).toBeTruthy();
        }
      }
    }
  });

  // Ruling 12-4, verified rather than asserted in a docstring. Two generators
  // that can emit the same question put ONE question under TWO review keys, so
  // a child who answers it once is credited with both standards - silently,
  // with every other test still green. Grade 3 OA is the plan's worst case for
  // this because all five generators draw from the same 100 products, so the
  // separation has to come from the SHAPE of the prompt.
  it('cannot emit the same question from two different templates', () => {
    const seen = new Map<string, string>();
    for (const t of GRADE_3_TEMPLATES) {
      for (let seed = 0; seed < 800; seed++) {
        const g = t.generate(makeRng(seed));
        const key = questionKey(g.prompt, g.promptDetails);
        const owner = seen.get(key);
        if (owner !== undefined && owner !== t.id) {
          throw new Error(`${t.id} and ${owner} both emit: "${g.prompt}"`);
        }
        seen.set(key, t.id);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
  });

  // The disjointness above is a sweep; this is the reason it holds. Each
  // generator's prompts carry a sentinel no other generator's prompt contains,
  // so the sets stay apart at EVERY seed and not only the ones swept.
  it('gives each generator a prompt shape no other one can produce', () => {
    const sentinels: Record<string, RegExp> = {
      'g3.oa1.equal-groups-array': /^The \w+ below are arranged in equal rows\./,
      'g3.oa2.equal-shares': /^\d+ \w+ are shared equally among \d+ /,
      'g3.oa3.one-step-word-problem': /^[\w. ]+ has \d+ \w+\. Each \w+ (?:holds|seats) \d+ /,
      'g3.oa6.missing-factor': /^What number goes in the box to make the equation /,
      'g3.oa7.multiplication-fact': /^What is \d+ × \d+\?$/,
      'g3.nbt2.add-within-1000': /^Add\.$/,
      'g3.nbt2.subtract-within-1000': /^Subtract\.$/,
      'g3.nbt3.multiply-by-multiple-of-ten': /^Each group below shows \d+ tens?\. What is \d+ × \d+\?$/,
      'g3.nf1.unit-fraction-model': /^Which one shows 1\/\d of a whole [a-z ]+\?$/,
      'g3.nf2.fraction-on-a-number-line': /^Which fraction does point P name\?$/,
      'g3.nf3.equivalent-fraction': /^Which fraction names the same amount as \d+\/\d+\?$/,
      'g3.nf4.compare-like-parts': /^Which comparison is true\?$/,
    };
    expect(Object.keys(sentinels).sort()).toEqual(GRADE_3_TEMPLATES.map((t) => t.id).sort());
    for (const t of GRADE_3_TEMPLATES) {
      for (let seed = 0; seed < 400; seed++) {
        const { prompt } = t.generate(makeRng(seed));
        for (const [id, re] of Object.entries(sentinels)) {
          expect(
            re.test(prompt),
            `${t.id} @ seed ${seed}: "${prompt}" ${id === t.id ? 'fails its own' : `matches ${id}'s`} sentinel`,
          ).toBe(id === t.id);
        }
      }
    }
  });

  it.each(GRADE_3_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
