import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizRunner } from './QuizRunner';
import { getCurriculum } from '../curriculum/registry';
import { sessionFromQuiz, newSession, recordAnswer, type ActiveSession } from '../engine/activeSession';

const c = getCurriculum(5);
const base = (kind: 'checkup' | 'drill' = 'checkup') =>
  sessionFromQuiz(c.quizzes.find((q) => q.isDiagnostic)!, kind, new Date('2026-09-30T12:00:00Z'));
const renderRunner = (session: ActiveSession, handlers: Partial<Record<'onChange' | 'onFinish' | 'onPause' | 'onDiscard', ReturnType<typeof vi.fn>>> = {}) => {
  const h = { onChange: vi.fn(), onFinish: vi.fn(), onPause: vi.fn(), onDiscard: vi.fn(), ...handlers };
  render(<ProgressProvider><QuizRunner session={session} {...h} /></ProgressProvider>);
  return h;
};

describe('QuizRunner with a saved session', () => {
  beforeEach(() => localStorage.clear());

  it('saves the selected answer to the session', async () => {
    const s = base();
    const h = renderRunner(s);
    const q = c.source.resolve(s.refs[0]);
    const el = screen.getAllByText(q.options[0].text).find((e) => e.closest('button'))!;
    await userEvent.click(el);
    const last = h.onChange.mock.calls.at(-1)![0] as ActiveSession;
    expect(last.answers[q.id].selected).toBe(q.options[0].label);
  });

  it('resumes at the saved question with the saved answers', () => {
    const s0 = base();
    const q = c.source.resolve(s0.refs[2]);
    const s = { ...recordAnswer(s0, q, q.options[1].label), currentIndex: 2 };
    renderRunner(s);
    expect(screen.getByText(new RegExp(`^3 of ${s.refs.length}$`))).toBeInTheDocument();
    const selected = screen.getAllByRole('button', { pressed: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent(q.options[1].text);
  });

  it('"Stop for today" saves and pauses without asking to confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const s = base();
    const q = c.source.resolve(s.refs[0]);
    const h = renderRunner(recordAnswer(s, q, q.options[0].label));
    h.onChange.mockClear();
    await userEvent.click(screen.getByTitle(/stop for today/i));
    expect(h.onChange).toHaveBeenCalledTimes(1);
    const saved = h.onChange.mock.calls[0][0] as ActiveSession;
    expect(saved.answers[q.id].selected).toBe(q.options[0].label);
    expect(h.onPause).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('offers a discard when none of the saved questions resolve', async () => {
    const s = newSession({ kind: 'checkup', quizId: 'x', title: 'x', now: new Date(), refs: [{ kind: 'authored', id: 'gone' }] });
    const h = renderRunner(s);
    expect(screen.getByText(/can't continue/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(h.onDiscard).toHaveBeenCalledTimes(1);
  });

  it('hides the standard code outside a drill and shows it in a drill', () => {
    const s = base();
    const code = c.source.resolve(s.refs[0]).standardCode;
    const { unmount } = render(
      <ProgressProvider><QuizRunner session={s} onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={vi.fn()} /></ProgressProvider>,
    );
    expect(screen.queryByText(code)).not.toBeInTheDocument();
    unmount();
    renderRunner(base('drill'));
    expect(screen.getByText(code)).toBeInTheDocument();
  });
});
