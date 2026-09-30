import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState, loadState } from './state/storage';
import { getCurriculum } from './curriculum/registry';
import { correctOption } from './engine/questionModel';
import type { Profile } from './state/types';

const c = getCurriculum(5);
const accept = () => localStorage.setItem(DISCLAIMER_STORAGE_KEY,
  JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }));
const seed = (profiles: Profile[]) => saveState(localStorage, { version: 2, profiles, activeProfileId: profiles[0].id });
const activeSession = () => loadState(localStorage).profiles.find((p) => p.id === loadState(localStorage).activeProfileId)!.activeSession;
const answerCurrent = async () => {
  const s = activeSession()!;
  const q = c.source.resolve(s.refs[s.currentIndex]);
  const label = correctOption(q).label;
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^Answer ${label}:`) }));
  await userEvent.click(screen.getByRole('button', { name: /check my answer/i }));
  return q;
};

describe('App flow', () => {
  beforeEach(() => localStorage.clear());

  it('takes a fresh visitor from the disclaimer to setup to the parent home', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /agree and continue/i }));
    await userEvent.type(screen.getByLabelText(/student.s name/i), 'Alex');
    await userEvent.click(screen.getByRole('button', { name: /start practicing/i }));
    expect(screen.getByText(/alex · grade \d math/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start the check-up/i })).toBeInTheDocument();
  });

  it('asks who is practicing when there are two students', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex' }), newProfile({ id: 's', studentName: 'Sam', grade: 3 })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.getByText(/sam · grade 3 math/i)).toBeInTheDocument();
  });

  it('does not show another student\'s saved session', async () => {
    accept();
    const saved = { kind: 'practice' as const, quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored' as const, id: c.quizzes[0].questionIds[0] }], answers: {}, flagged: {},
      currentIndex: 0, startedAt: '2026-09-30T00:00:00Z', secondsElapsed: 0 };
    seed([newProfile({ id: 'a', studentName: 'Alex', activeSession: saved }), newProfile({ id: 's', studentName: 'Sam' })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.queryByRole('button', { name: /continue —/i })).not.toBeInTheDocument();
  });

  it('runs a practice session to the summary, and resumes a saved one after reload', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex', checkupSkipped: true, sessionSize: 5 })]);
    const first = render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start today's practice \(round 1\)/i }));
    await answerCurrent();
    await userEvent.click(screen.getByRole('button', { name: /^next$/i }));

    // "Reload": unmount and render from storage.
    first.unmount();
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /continue — 1 of \d+ done/i }));
    const total = activeSession()!.refs.length;
    expect(screen.getByText(new RegExp(`^2 of ${total}$`))).toBeInTheDocument();

    for (let i = 1; i < total; i++) {
      await answerCurrent();
      await userEvent.click(screen.getByRole('button', { name: i === total - 1 ? /finish/i : /^next$/i }));
    }
    expect(screen.getByText(/you did it!/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /hand back to your grown-up/i }));
    expect(screen.getByText(/readiness:/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(screen.getByText(/alex · grade 5 math/i)).toBeInTheDocument();
    expect(loadState(localStorage).profiles[0].attempts).toHaveLength(1);
    expect(activeSession()).toBeUndefined();
  });

  it('opens the detailed view and comes back', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex' })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /detailed view/i }));
    const back = screen.getByRole('button', { name: /back to home/i });
    expect(within(document.body).getByRole('navigation')).toBeInTheDocument();
    await userEvent.click(back);
    expect(screen.getByText(/alex · grade 5 math/i)).toBeInTheDocument();
  });
});
