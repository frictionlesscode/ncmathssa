import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import type { QuizAttempt } from '../types';

function Probe() {
  const { profile, curriculum, readiness, addProfile, switchProfile, state } = useProgress();
  return (
    <div>
      <span data-testid="name">{profile.studentName}</span>
      <span data-testid="grade">{curriculum.grade}</span>
      <span data-testid="pass">{curriculum.ssa.passingPercent}</span>
      <span data-testid="readiness">{readiness}</span>
      <span data-testid="count">{state.profiles.length}</span>
      <button onClick={() => addProfile('Second', 5)}>add</button>
      <button onClick={() => switchProfile(state.profiles[0].id)}>first</button>
    </div>
  );
}

const renderApp = () => render(<ProgressProvider><Probe /></ProgressProvider>);

function makeAttempt(id: string, wasCorrect: boolean): QuizAttempt {
  return {
    id,
    quizId: 'test-quiz',
    quizTitle: 'Test Quiz',
    standardCode: 'NC.5.NF.1',
    completedAt: new Date().toISOString(),
    scoreRaw: wasCorrect ? 1 : 0,
    scoreTotal: 1,
    scorePercent: wasCorrect ? 100 : 0,
    isPassingSSA: wasCorrect,
    timeElapsedSeconds: 0,
    answers: {
      'nf1-01': {
        questionId: 'nf1-01',
        studentAnswer: 'A',
        isCorrect: wasCorrect,
        standardCode: 'NC.5.NF.1'
      }
    }
  };
}

function ReviewQueueProbe() {
  const { profile, recordAttempt } = useProgress();
  const entry = profile.reviewQueue['a:nf1-01'];
  return (
    <div>
      <span data-testid="box">{entry ? String(entry.box) : 'none'}</span>
      <button
        onClick={() =>
          recordAttempt(makeAttempt('a1', false), [
            { ref: { kind: 'authored', id: 'nf1-01' }, wasCorrect: false }
          ])
        }
      >
        wrong
      </button>
      <button
        onClick={() =>
          recordAttempt(makeAttempt('a2', true), [
            { ref: { kind: 'authored', id: 'nf1-01' }, wasCorrect: true }
          ])
        }
      >
        right
      </button>
    </div>
  );
}

describe('ProgressProvider', () => {
  beforeEach(() => localStorage.clear());

  it('supplies the active profile curriculum, not a hardcoded grade 5 import', () => {
    renderApp();
    expect(screen.getByTestId('grade')).toHaveTextContent('5');
    expect(screen.getByTestId('pass')).toHaveTextContent('80');
  });

  it('starts at zero readiness with no attempts', () => {
    renderApp();
    expect(screen.getByTestId('readiness')).toHaveTextContent('0');
  });

  it('adds and switches profiles', () => {
    renderApp();
    act(() => screen.getByText('add').click());
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('name')).toHaveTextContent('Second');
    act(() => screen.getByText('first').click());
    expect(screen.getByTestId('name')).not.toHaveTextContent('Second');
  });

  it('persists across a remount', () => {
    const { unmount } = renderApp();
    act(() => screen.getByText('add').click());
    unmount();
    renderApp();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('recordAttempt folds a wrong result into the reviewQueue at box 1, then promotes it on a correct retry', () => {
    render(<ProgressProvider><ReviewQueueProbe /></ProgressProvider>);
    expect(screen.getByTestId('box')).toHaveTextContent('none');

    act(() => screen.getByText('wrong').click());
    expect(screen.getByTestId('box')).toHaveTextContent('1');

    act(() => screen.getByText('right').click());
    expect(screen.getByTestId('box')).toHaveTextContent('2');
  });
});
