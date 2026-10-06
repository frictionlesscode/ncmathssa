import type { Question } from '../engine/questionModel';
import { correctOption } from '../engine/questionModel';

/**
 * Evaluates a submitted answer. Every item is multiple choice, so a
 * submission is an option label ('A'..'D'); the full option text is
 * accepted too, matching how callers already build the string in a few
 * places (e.g. review-item click handlers).
 */
export function checkAnswer(question: Question, rawStudentAnswer: string): boolean {
  if (!rawStudentAnswer) return false;
  const student = rawStudentAnswer.trim().toLowerCase();
  if (!student) return false;

  const correct = correctOption(question);
  if (student === correct.label.toLowerCase()) return true;
  if (student === correct.text.trim().toLowerCase()) return true;

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
