import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { SessionSummary } from './SessionSummary';
import { newProfile, saveState } from '../state/storage';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';

const c = getCurriculum(5);
const code = (d: string) => c.domains.find((x) => x.id === d)!.standards[0].code;
function attemptOf(rows: [string, boolean][]): QuizAttempt {
  const answers: Record<string, QuizAttemptAnswer> = {};
  rows.forEach(([d, ok], i) => { answers[`q${i}`] = { questionId: `q${i}`, studentAnswer: 'A', isCorrect: ok, standardCode: code(d) }; });
  return { id: 'a1', quizId: 'path-practice-1', quizTitle: 'Round 1 practice', completedAt: '2026-09-30T12:00:00Z',
    scoreRaw: rows.filter(([, ok]) => ok).length, scoreTotal: rows.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 0, answers };
}

describe('SessionSummary', () => {
  beforeEach(() => localStorage.clear());

  it('names strong and tricky topics in plain words and shows readiness change', async () => {
    const attempt = attemptOf([['NF', true], ['NF', true], ['NBT', false], ['NBT', false]]);
    const p = newProfile({ id: 'p1', studentName: 'Alex', attempts: [attempt], checkupSkipped: true });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: 'p1' });
    const onHome = vi.fn();
    const { container } = render(<ProgressProvider><SessionSummary attempt={attempt} readinessBefore={0} roundBefore={1} onHome={onHome} /></ProgressProvider>);
    expect(screen.getByText(/strong today/i)).toBeInTheDocument();
    expect(screen.getByText('Fractions')).toBeInTheDocument();
    expect(screen.getByText(/decimals & place value/i)).toBeInTheDocument();
    expect(screen.getByText(/missed 2/i)).toBeInTheDocument();
    expect(screen.getByText(/these will come back next time/i)).toBeInTheDocument();
    expect(screen.getByText(/readiness: 0% → 10%/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NC\.\d/);
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(onHome).toHaveBeenCalledTimes(1);
  });
});
