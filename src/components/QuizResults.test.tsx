import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import confetti from 'canvas-confetti';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizResults } from './QuizResults';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const passingPercent = getCurriculum(5).ssa.passingPercent;

const attemptFor = (quizId: string, raw: number, total: number): QuizAttempt => ({
  id: 'a', quizId, quizTitle: 'Some quiz', completedAt: '2026-09-30T12:00:00.000Z',
  scoreRaw: raw, scoreTotal: total, scorePercent: (raw / total) * 100, isPassingSSA: raw * 100 >= passingPercent * total,
  timeElapsedSeconds: 60, answers: {},
});
const renderResults = (a: QuizAttempt) => render(
  <ProgressProvider>
    <QuizResults attempt={a} onRetake={vi.fn()} onStartStandardDrill={vi.fn()} onOpenStudyGuide={vi.fn()} onDone={vi.fn()} />
  </ProgressProvider>,
);

describe('QuizResults after a question was rewritten', () => {
  beforeEach(() => localStorage.clear());
  const answered = (contentVersion?: number): QuizAttempt => ({
    ...attemptFor('drill-g', 1, 1),
    answers: {
      'g3-02': {
        questionId: 'g3-02', studentAnswer: 'A', isCorrect: contentVersion === undefined, standardCode: 'NC.5.G.3',
        ...(contentVersion === undefined ? {} : { contentVersion }),
      },
    },
  });
  const marked = (c: HTMLElement) => ({
    correct: c.querySelectorAll('.border-emerald-300').length,
    wrong: c.querySelectorAll('.border-rose-300').length,
  });

  it('a legacy answer to g3-02 shows the note and marks no current option', () => {
    const { container } = renderResults(answered());
    expect(screen.getByText(/this question was updated after it was answered/i)).toBeInTheDocument();
    expect(container.textContent).toMatch(/You chose A and it was marked correct at the time/);
    expect(marked(container)).toEqual({ correct: 0, wrong: 0 });
  });

  it('a current-version answer renders as before', () => {
    const { container } = renderResults(answered(2));
    expect(screen.queryByText(/updated after it was answered/i)).toBeNull();
    expect(marked(container)).toEqual({ correct: 1, wrong: 1 });
  });
});

describe('QuizResults SSA claims (F10)', () => {
  beforeEach(() => { localStorage.clear(); vi.mocked(confetti).mockClear(); });

  it('F10: a 4/5 drill says "Nice work" with the score, no SSA pass, no confetti', () => {
    const { container } = renderResults(attemptFor('drill-nf1', 4, 5));
    expect(screen.getByText(/nice work/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/SSA Acceleration-Ready/);
    expect(container.textContent).not.toMatch(/Wake County/);
    expect(container.textContent).not.toMatch(/Qualifying Bar/);
    expect(container.textContent).toMatch(/4 of 5 Correct/);
    expect(confetti).not.toHaveBeenCalled();
  });

  it('F10: a passed full practice test still celebrates', () => {
    const { container } = renderResults(attemptFor('mock-ssa-01', 18, 20));
    expect(container.textContent).toMatch(/SSA Acceleration-Ready/);
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it('F10: a failed practice test says Needs Practice', () => {
    const { container } = renderResults(attemptFor('mock-ssa-01', 10, 20));
    expect(container.textContent).toMatch(/Needs Practice/);
    expect(confetti).not.toHaveBeenCalled();
  });
});
