import type { Question } from '../../engine/questionModel';
import { GRADE_1_OA_AUTHORED } from './authored.oa';
import { GRADE_1_NBT_AUTHORED } from './authored.nbt';
import { GRADE_1_MD_AUTHORED } from './authored.md';
import { GRADE_1_G_AUTHORED } from './authored.g';

/** The whole Grade 1 authored bank. Split by domain on disk because one file
 *  per domain stays readable; joined here because the question source wants a
 *  single array.
 *
 *  Nothing is authored in this file. Each domain bank is checked item by item
 *  by its own sibling test; what `./authored.g.test.ts`'s aggregate suite
 *  checks is what can only go wrong HERE - a bank left out of the list, a
 *  bank concatenated twice, or a standard with no authored item at all. */
export const GRADE_1_AUTHORED: Question[] = [
  ...GRADE_1_OA_AUTHORED,
  ...GRADE_1_NBT_AUTHORED,
  ...GRADE_1_MD_AUTHORED,
  ...GRADE_1_G_AUTHORED,
];
