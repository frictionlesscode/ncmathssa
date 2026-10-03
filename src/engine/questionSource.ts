import type { StandardCode } from '../curriculum/types';
import { contentVersionOf, type Question, type QuestionRef } from './questionModel';
import type { QuestionTemplate } from './template';
import { realize } from './template';
import { makeRng } from './rng';

export interface QuestionSource {
  itemsFor(standardCode: StandardCode, opts: { count: number; seedBase: number }): QuestionRef[];
  resolve(ref: QuestionRef): Question;
  /** The current content version behind a ref, without realizing it: an
   *  authored item's own version, or the template's for a generated one.
   *  undefined when the ref no longer names anything. */
  versionOf(ref: QuestionRef): number | undefined;
  allStandardsWithContent(): StandardCode[];
  /** Every authored item for a standard, deterministically and in full -
   *  unlike itemsFor, which samples a mix of authored and generated items.
   *  For UI callers (e.g. a "drill every authored question on this
   *  standard" quiz) that want the whole authored bank, not a sample. */
  authoredFor(standardCode: StandardCode): QuestionRef[];
  /** True if this standard has at least one seeded generator template, in
   *  which case its practice pool is effectively unlimited; false means
   *  it is authored-only and will repeat sooner. Lets UI callers (e.g.
   *  CurriculumView) surface that distinction from the live content
   *  instead of a list of standard codes hardcoded in a component. */
  hasGenerator(standardCode: StandardCode): boolean;
  /** Every template this source can draw from. Exposed so the misconception
   *  registry test can sample the tags generators emit; not for quiz code,
   *  which should go through itemsFor(). */
  templates(): QuestionTemplate[];
}

export function makeQuestionSource(
  authored: Question[],
  templates: QuestionTemplate[],
): QuestionSource {
  const authoredById = new Map(authored.map((q) => [q.id, q]));
  const templateById = new Map(templates.map((t) => [t.id, t]));

  const authoredByStandard = new Map<StandardCode, Question[]>();
  for (const q of authored) {
    const list = authoredByStandard.get(q.standardCode) ?? [];
    list.push(q);
    authoredByStandard.set(q.standardCode, list);
  }

  const templatesByStandard = new Map<StandardCode, QuestionTemplate[]>();
  for (const t of templates) {
    const list = templatesByStandard.get(t.standardCode) ?? [];
    list.push(t);
    templatesByStandard.set(t.standardCode, list);
  }

  return {
    itemsFor(standardCode, { count, seedBase }) {
      const rng = makeRng(seedBase);
      const pool = authoredByStandard.get(standardCode) ?? [];
      const temps = templatesByStandard.get(standardCode) ?? [];
      if (pool.length === 0 && temps.length === 0) return [];

      const refs: QuestionRef[] = [];
      const shuffledAuthored = rng.shuffle(pool);
      let authoredTaken = 0;

      for (let i = 0; i < count; i++) {
        // Prefer an unused authored item; fall back to a template, which
        // can supply unlimited fresh instances.
        const useAuthored =
          authoredTaken < shuffledAuthored.length && (temps.length === 0 || rng.next() < 0.4);

        if (useAuthored) {
          refs.push({ kind: 'authored', id: shuffledAuthored[authoredTaken++].id });
        } else if (temps.length > 0) {
          const t = rng.pick(temps);
          refs.push({ kind: 'generated', templateId: t.id, seed: rng.int(0, 2 ** 31 - 1) });
        } else {
          break; // authored pool exhausted and no templates exist
        }
      }
      return refs;
    },

    resolve(ref) {
      if (ref.kind === 'authored') {
        const q = authoredById.get(ref.id);
        if (!q) throw new Error(`Unknown authored question id: ${ref.id}`);
        return q;
      }
      const t = templateById.get(ref.templateId);
      if (!t) throw new Error(`Unknown template id: ${ref.templateId}`);
      return realize(t, ref.seed, makeRng(ref.seed));
    },

    versionOf(ref) {
      if (ref.kind === 'authored') {
        const q = authoredById.get(ref.id);
        return q ? contentVersionOf(q) : undefined;
      }
      const t = templateById.get(ref.templateId);
      return t ? contentVersionOf(t) : undefined;
    },

    allStandardsWithContent() {
      return [...new Set([...authoredByStandard.keys(), ...templatesByStandard.keys()])];
    },

    authoredFor(standardCode) {
      return (authoredByStandard.get(standardCode) ?? []).map((q) => ({
        kind: 'authored' as const,
        id: q.id,
      }));
    },

    hasGenerator(standardCode) {
      return (templatesByStandard.get(standardCode) ?? []).length > 0;
    },

    templates() {
      // A copy: the array below is what itemsFor() and hasGenerator() read,
      // and a caller that sorted or pushed into it would corrupt them.
      return [...templates];
    },
  };
}
