import type { Question } from '../types';


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
 * Evaluates whether studentAnswer matches the question's correctAnswer or acceptableAnswers.
 */
export function checkAnswer(question: Question, rawStudentAnswer: string): boolean {
  if (!rawStudentAnswer) return false;
  const student = rawStudentAnswer.trim();
  const canonical = question.correctAnswer.trim();

  if (question.questionType === 'multiple-choice') {
    // Exact letter match or choice string match
    if (student.toUpperCase() === canonical.toUpperCase()) return true;
    
    // Check if student typed full option text that matches canonical choice
    if (question.options) {
      const canonicalIndex = canonical.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1
      if (canonicalIndex >= 0 && canonicalIndex < question.options.length) {
        if (student.toLowerCase() === question.options[canonicalIndex].toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  // Open-response evaluation:
  // 1. Exact string match (ignoring case & whitespace)
  if (student.toLowerCase() === canonical.toLowerCase()) return true;

  // 2. Check acceptableAnswers list if provided
  if (question.acceptableAnswers && question.acceptableAnswers.length > 0) {
    for (const alt of question.acceptableAnswers) {
      if (student.toLowerCase() === alt.trim().toLowerCase()) {
        return true;
      }
    }
  }

  // 3. Numeric / Fraction mathematical equivalence
  const studentVal = normalizeValue(student);
  const canonicalVal = normalizeValue(canonical);

  if (studentVal !== null && canonicalVal !== null) {
    // Allow precision delta of 0.0001
    if (Math.abs(studentVal - canonicalVal) < 0.0001) {
      return true;
    }
  }

  // 4. Check acceptable answers numerically
  if (studentVal !== null && question.acceptableAnswers) {
    for (const alt of question.acceptableAnswers) {
      const altVal = normalizeValue(alt);
      if (altVal !== null && Math.abs(studentVal - altVal) < 0.0001) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Formats time in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
