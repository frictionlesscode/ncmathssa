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
