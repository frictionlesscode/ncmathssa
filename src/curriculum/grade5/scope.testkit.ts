import type { Question } from '../../engine/questionModel';
import { correctOption } from '../../engine/questionModel';
import { GRADE_5_AUTHORED } from './authored';

/** The authored Grade 5 item with this id; throws if there is none. */
export function byId(id: string): Question {
  const q = GRADE_5_AUTHORED.find((x) => x.id === id);
  if (!q) throw new Error(`no Grade 5 item ${id}`);
  return q;
}

/** Text of the item's marked-correct option. */
export function keyText(id: string): string {
  return correctOption(byId(id)).text;
}

/** Text of the single option carrying `tag`; throws unless exactly one does. */
export function optionFor(id: string, tag: string): string {
  const matches = byId(id).options.filter((o) => o.misconception === tag);
  if (matches.length !== 1) {
    throw new Error(`${id}: expected one option tagged ${tag}, found ${matches.length}`);
  }
  return matches[0].text;
}

/** Number of + − × ÷ operations written in `expr`. A hyphen counts as a minus
 *  only when spaces surround it, which is how every Grade 5 expression is
 *  written ("12 - 4"). */
export function operationCount(expr: string): number {
  return (expr.match(/[+×÷−]|\s-\s/g) ?? []).length;
}

/** Every denominator written as a slash fraction in `text` ("3/4" gives 4). */
export function denominatorsIn(text: string): number[] {
  return [...text.matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
}

/** NC.5.NF.1 (NC-R6): unlike denominators are added only within one of these
 *  related families. */
export const NF1_FAMILIES: readonly (readonly number[])[] = [
  [2, 4, 8],
  [3, 6, 12],
  [5, 10, 100],
];

/** True when every denominator belongs to the same NC.5.NF.1 family. */
export function inOneFamily(dens: number[]): boolean {
  return NF1_FAMILIES.some((family) => dens.every((d) => family.includes(d)));
}
