import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import { isMockQuiz } from './attempts';

describe('isMockQuiz', () => {
  const curriculum = getCurriculum(5);
  it('is true for the full practice test', () => {
    const mock = curriculum.quizzes.find((q) => q.isMockAssessment)!;
    expect(isMockQuiz(curriculum, mock.id)).toBe(true);
  });
  it('is false for a diagnostic or an unknown id', () => {
    const diagnostic = curriculum.quizzes.find((q) => !q.isMockAssessment)!;
    expect(isMockQuiz(curriculum, diagnostic.id)).toBe(false);
    expect(isMockQuiz(curriculum, 'no-such-quiz')).toBe(false);
  });
});
