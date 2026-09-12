import type { Question } from '../engine/questionModel';
import { correctOption } from '../engine/questionModel';


/**
 * Normalizes a math answer string for flexible comparison.
 * Supports fractions (e.g. 3/4), mixed numbers (e.g. 1 1/2),
 * decimals (e.g. 0.75, .75), currency ($12.50), and units.
 */
export function normalizeValue(raw: string): number | null {
  if (!raw) return null;
  let str = raw.trim().toLowerCase();

  // Strip currency symbols and common units
  str = str.replace(/[$¢€£]/g, '');
  str = str.replace(/(cubic\s*(in|inches|cm|ft|units)|sq\s*(in|inches|cm|ft|units)|inches|inch|in|feet|foot|ft|yards|yd|miles|mi|centimeters|cm|meters|m|kilometers|km|grams|g|kilograms|kg|pounds|lbs|lb|ounces|oz|cups|pints|quarts|gallons|units)/g, '');
  str = str.trim();

  // Check for mixed number format: e.g. "2 1/4" or "2-1/4"
  const mixedMatch = str.match(/^(\d+)\s+([0-9]+)\/([1-9][0-9]*)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    return whole + num / den;
  }

  // Check for simple fraction: e.g. "3/4" or "7/8"
  const fracMatch = str.match(/^([0-9]+)\/([1-9][0-9]*)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    return num / den;
  }

  // Check for numeric decimal/integer
  const num = parseFloat(str);
  if (!isNaN(num)) {
    return num;
  }

  return null;
}

/**
 * Evaluates a submitted answer. Every item is multiple choice, so a submission
 * is an option label ('A'..'D'); the full option text is accepted too, which
 * keeps the free-text retry boxes in the review screens usable.
 */
export function checkAnswer(question: Question, rawStudentAnswer: string): boolean {
  if (!rawStudentAnswer) return false;
  const student = rawStudentAnswer.trim().toLowerCase();
  if (!student) return false;

  const correct = correctOption(question);
  if (student === correct.label.toLowerCase()) return true;
  if (student === correct.text.trim().toLowerCase()) return true;

  // Accept a mathematically equivalent typed value (e.g. "2.25" for "2 1/4 pounds").
  const studentVal = normalizeValue(student);
  const correctVal = normalizeValue(correct.text);
  if (studentVal === null || correctVal === null) return false;
  if (Math.abs(studentVal - correctVal) >= 0.0001) return false;

  // ...but only when no other option carries that same value, so a typed number
  // can never be credited for an answer that is ambiguous between options.
  return question.options.every((o) => {
    if (o.label === correct.label) return true;
    const v = normalizeValue(o.text);
    return v === null || Math.abs(v - correctVal) >= 0.0001;
  });
}

/**
 * Formats time in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
