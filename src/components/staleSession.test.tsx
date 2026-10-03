import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { KidPractice } from './KidPractice';
import { QuizRunner } from './QuizRunner';
import { getCurriculum } from '../curriculum/registry';
import { newSession, stampContentVersions, type ActiveSession } from '../engine/activeSession';

// Spec 3.3: a saved session whose question was rewritten since it started
// shows the existing "can't continue" discard screen, in both runners. The
// recorded version is set to 99 so this needs no rewritten content: the
// shipped Grade 5 items are version 1.

const c = getCurriculum(5);
const ids = c.quizzes.find((q) => q.isDiagnostic)!.questionIds.slice(0, 2);
const refs = ids.map((id) => ({ kind: 'authored' as const, id }));
const started = (kind: ActiveSession['kind']) =>
  newSession({ kind, quizId: 'x', title: 'x', refs, now: new Date('2026-09-30T12:00:00Z') });

describe('a session whose question was rewritten cannot continue', () => {
  beforeEach(() => localStorage.clear());

  it('KidPractice shows the discard screen', async () => {
    const onDiscard = vi.fn();
    render(
      <ProgressProvider>
        <KidPractice
          session={{ ...started('practice'), versions: { [ids[0]]: 99, [ids[1]]: 1 } }}
          studentName="Alex" onChange={vi.fn()} onFinish={vi.fn()} onDiscard={onDiscard}
        />
      </ProgressProvider>,
    );
    expect(screen.getByText(/can.t continue/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /discard this session/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('QuizRunner shows the discard screen', async () => {
    const onDiscard = vi.fn();
    render(
      <ProgressProvider>
        <QuizRunner
          session={{ ...started('checkup'), versions: { [ids[0]]: 99 } }}
          onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={onDiscard}
        />
      </ProgressProvider>,
    );
    expect(screen.getByText(/can't continue/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('a session with matching versions still runs', () => {
    render(
      <ProgressProvider>
        <QuizRunner session={stampContentVersions(started('checkup'), c)} onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={vi.fn()} />
      </ProgressProvider>,
    );
    expect(screen.queryByText(/can't continue/i)).not.toBeInTheDocument();
  });
});
