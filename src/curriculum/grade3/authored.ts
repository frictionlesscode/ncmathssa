import type { Question } from '../../engine/questionModel';
import { GRADE_3_OA_AUTHORED } from './authored.oa';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';
import { GRADE_3_NF_AUTHORED } from './authored.nf';
import { GRADE_3_MD_AUTHORED } from './authored.md';
import { GRADE_3_G_AUTHORED } from './authored.g';

/** The whole Grade 3 authored bank. Split by domain on disk because one file
 *  per domain stays readable; joined here because the question source wants a
 *  single array.
 *
 *  Nothing is authored in this file. Each domain bank is checked item by item
 *  by its own sibling test; what ./authored.test.ts checks is what can only go
 *  wrong HERE - a bank left out of the list, or concatenated twice. */
export const GRADE_3_AUTHORED: Question[] = [
  ...GRADE_3_OA_AUTHORED,
  ...GRADE_3_NBT_AUTHORED,
  ...GRADE_3_NF_AUTHORED,
  ...GRADE_3_MD_AUTHORED,
  ...GRADE_3_G_AUTHORED,
];
