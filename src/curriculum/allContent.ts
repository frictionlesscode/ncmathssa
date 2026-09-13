import type { Question } from '../engine/questionModel';
import type { QuestionTemplate } from '../engine/template';

/**
 * Every authored item and every generator on disk, whether or not its grade is
 * registered.
 *
 * The misconception vocabulary has to be checked against ALL content, not just
 * the grades the registry currently offers. A grade's questions are written
 * across several tasks and its grade only registers once they are all done, so
 * a registry-driven check calls every tag in that window an orphan. The author
 * is then pushed to reuse an ill-fitting tag instead of naming the error the
 * child actually made - which defeats the point of tagging distractors at all.
 * That happened once already, on the first Grade 4 content task.
 *
 * Registration stays a statement about what the app offers a child. This is a
 * statement about what content exists. They are different questions.
 *
 * Discovery is by glob so that adding a domain file is enough; nobody has to
 * remember to also list it here.
 */

// The negative pattern is load-bearing, not tidiness. An eager glob IMPORTS
// what it matches, and importing a *.test.ts file executes its describe/it
// calls - which silently grafted every domain's tests onto whichever suite
// happened to import this module. Filtering the paths afterwards is too late.
const authoredModules = import.meta.glob(
  ['./grade*/authored*.ts', '!./grade*/*.test.ts'],
  { eager: true },
);
const templateModules = import.meta.glob(
  ['./grade*/templates/index.ts', '!./grade*/templates/*.test.ts'],
  { eager: true },
);

function isQuestionArray(v: unknown): v is Question[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (q) => !!q && typeof q === 'object' && 'options' in q && 'standardCode' in q,
    )
  );
}

function isTemplateArray(v: unknown): v is QuestionTemplate[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (t) =>
        !!t &&
        typeof t === 'object' &&
        typeof (t as { generate?: unknown }).generate === 'function',
    )
  );
}

/** Authored items from every grade directory. A grade that splits its bank by
 *  domain and also re-exports an aggregate will yield some items twice; callers
 *  here only build sets, so that is harmless. */
export function everyAuthoredQuestion(): Question[] {
  const out: Question[] = [];
  for (const [path, mod] of Object.entries(authoredModules)) {
    if (path.includes('.test.')) continue;
    for (const value of Object.values(mod as Record<string, unknown>)) {
      if (isQuestionArray(value)) out.push(...value);
    }
  }
  return out;
}

/** Templates from every grade directory. */
export function everyTemplate(): QuestionTemplate[] {
  const out: QuestionTemplate[] = [];
  for (const [path, mod] of Object.entries(templateModules)) {
    if (path.includes('.test.')) continue;
    for (const value of Object.values(mod as Record<string, unknown>)) {
      if (isTemplateArray(value)) out.push(...value);
    }
  }
  return out;
}
