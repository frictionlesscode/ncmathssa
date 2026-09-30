import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { StudyPaceModal } from './StudyPaceModal';
import { newProfile, saveState } from '../state/storage';

const Probe = () => {
  const { profile, state } = useProgress();
  return (
    <>
      <p data-testid="size">{String(profile.sessionSize)}</p>
      <p data-testid="count">{state.profiles.length}</p>
      <p data-testid="attempts">{profile.attempts.length}</p>
    </>
  );
};

const seed = (extra: Parameters<typeof newProfile>[0] = {}, second = false) =>
  saveState(localStorage, {
    version: 2,
    activeProfileId: 'a',
    profiles: [
      newProfile({ id: 'a', studentName: 'Alex', grade: 5, targetExamDate: '2099-01-01', ...extra }),
      ...(second ? [newProfile({ id: 'b', studentName: 'Sam', grade: 5 })] : []),
    ],
  });

const renderModal = () =>
  render(<ProgressProvider><StudyPaceModal isOpen onClose={() => {}} /><Probe /></ProgressProvider>);

describe('StudyPaceModal', () => {
  beforeEach(() => localStorage.clear());

  it('saves a clamped session size', async () => {
    seed();
    renderModal();
    const input = screen.getByLabelText(/questions per session/i);
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByTestId('size')).toHaveTextContent('30');
  });

  it('says the test date passed instead of "0 days"', () => {
    seed({ targetExamDate: '2020-01-01' });
    renderModal();
    expect(screen.getByText('Test date passed')).toBeInTheDocument();
    expect(screen.queryByText(/0 days/i)).not.toBeInTheDocument();
  });

  it('says the test is today', () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    seed({ targetExamDate: today });
    renderModal();
    expect(screen.getByText('Test is today')).toBeInTheDocument();
  });

  it('shows no days-remaining text when there is no test date', () => {
    seed({ targetExamDate: '' });
    renderModal();
    expect(screen.queryByText(/days remaining/i)).not.toBeInTheDocument();
  });

  it('clears history only after confirming', async () => {
    seed({ attempts: [{
      id: 'x', quizId: 'q', quizTitle: 't', completedAt: '2026-09-30T00:00:00.000Z', scoreRaw: 1, scoreTotal: 1,
      scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1, answers: {},
    }] });
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /clear history/i }));
    expect(screen.getByTestId('attempts')).toHaveTextContent('1');
    await userEvent.click(screen.getByRole('button', { name: /yes, erase history/i }));
    expect(screen.getByTestId('attempts')).toHaveTextContent('0');
  });

  it('deletes the student after confirming when another exists', async () => {
    seed({}, true);
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /delete student/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    await userEvent.click(screen.getByRole('button', { name: /yes, delete student/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('hides Delete student when only one profile exists', () => {
    seed();
    renderModal();
    expect(screen.queryByRole('button', { name: /delete student/i })).not.toBeInTheDocument();
  });
});

describe('StudyPaceModal accessibility (logic-flows Medium)', () => {
  beforeEach(() => localStorage.clear());

  it('is a labelled dialog that Escape closes, with associated field labels', async () => {
    seed();
    const onClose = vi.fn();
    render(<ProgressProvider><StudyPaceModal isOpen onClose={onClose} /><Probe /></ProgressProvider>);
    expect(screen.getByRole('dialog', { name: /study plan/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/testing date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/daily questions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
