import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { KidPractice } from './KidPractice';
import { getCurriculum } from '../curriculum/registry';
import { newSession, recordAnswer, stampContentVersions, type ActiveSession } from '../engine/activeSession';
import { correctOption } from '../engine/questionModel';
import { newProfile, saveState } from '../state/storage';

const c = getCurriculum(5);
const diagnostic = c.quizzes.find((q) => q.isDiagnostic)!;
const refs = diagnostic.questionIds.slice(0, 2).map((id) => ({ kind: 'authored' as const, id }));
const q1 = c.source.resolve(refs[0]);
const q2 = c.source.resolve(refs[1]);
// Stamped like a real session start, so rewritten (version 2) items still run.
const fresh = () => stampContentVersions(newSession({ kind: 'practice', quizId: 'path-practice-1', title: 'Round 1 practice', refs, now: new Date() }), c);

function Harness({ initial, onFinish, onDiscard }: { initial: ActiveSession; onFinish: (a: unknown) => void; onDiscard: () => void }) {
  const [s, setS] = useState(initial);
  return <KidPractice session={s} studentName="Alex" onChange={setS} onFinish={onFinish} onDiscard={onDiscard} />;
}
const setup = (initial = fresh()) => {
  const onFinish = vi.fn();
  const onDiscard = vi.fn();
  render(<ProgressProvider><Harness initial={initial} onFinish={onFinish} onDiscard={onDiscard} /></ProgressProvider>);
  return { onFinish, onDiscard };
};
const option = (label: string) => screen.getByRole('button', { name: new RegExp(`^Answer ${label}:`) });
const choose = async (label: string) => {
  await userEvent.click(option(label));
  await userEvent.click(screen.getByRole('button', { name: /check my answer/i }));
};

describe('KidPractice', () => {
  beforeEach(() => localStorage.clear());

  it('praises a right answer', async () => {
    setup();
    await choose(correctOption(q1).label);
    expect(screen.getByText(/nice!/i)).toBeInTheDocument();
  });

  it('explains a wrong answer and does not allow a retry', async () => {
    setup();
    const wrong = q1.options.find((o) => !o.isCorrect)!;
    await choose(wrong.label);
    expect(screen.getByText(new RegExp(`the answer is ${correctOption(q1).label}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(q1.explanation.stepByStep[0])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /check my answer/i })).not.toBeInTheDocument();
    for (const o of q1.options) expect(option(o.label)).toBeDisabled();
  });

  it('resumes into the feedback for an answered question (tab closed before Next)', () => {
    setup(recordAnswer(fresh(), q1, correctOption(q1).label));
    expect(screen.getByText(/nice!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    // no retry: the question is not offered again
    expect(screen.queryByRole('button', { name: /check my answer/i })).not.toBeInTheDocument();
    for (const o of q1.options) expect(option(o.label)).toBeDisabled();
  });

  it('finishes once, even on a double click', async () => {
    const { onFinish } = setup();
    await choose(correctOption(q1).label);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await choose(correctOption(q2).label);
    const finish = screen.getByRole('button', { name: /finish/i });
    await userEvent.dblClick(finish);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].scoreTotal).toBe(2);
  });

  it('stopping with nothing answered discards', async () => {
    const { onDiscard, onFinish } = setup();
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    expect(screen.getByText(/stop now\? your answers so far are saved and counted/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /yes, stop/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('stopping after one answer grades just that answer', async () => {
    const { onFinish } = setup();
    await choose(correctOption(q1).label);
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, stop/i }));
    expect(onFinish.mock.calls[0][0].scoreTotal).toBe(1);
  });

  it('offers a discard when the saved questions no longer exist', async () => {
    const { onDiscard } = setup(newSession({ kind: 'practice', quizId: 'x', title: 'x', now: new Date(), refs: [{ kind: 'authored', id: 'gone' }] }));
    await userEvent.click(screen.getByRole('button', { name: /discard this session/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/can.t continue/i)).toBeInTheDocument();
  });

  it('shows the calculator only where the question allows it', () => {
    setup();
    expect(Boolean(screen.queryByRole('button', { name: /calculator/i }))).toBe(q1.calculatorAllowed);
  });

  it('shows the calculator button for a question that allows it, and not otherwise', () => {
    const all = c.quizzes.flatMap((qz) => qz.questionIds).map((id) => ({ kind: 'authored' as const, id }));
    const withCalc = all.find((r) => c.source.resolve(r).calculatorAllowed);
    const without = all.find((r) => !c.source.resolve(r).calculatorAllowed);
    expect(withCalc).toBeDefined();
    expect(without).toBeDefined();
    const mk = (r: typeof all[number]) => stampContentVersions(newSession({ kind: 'practice', quizId: 'p', title: 'p', refs: [r], now: new Date() }), c);
    const first = render(<ProgressProvider><Harness initial={mk(withCalc!)} onFinish={vi.fn()} onDiscard={vi.fn()} /></ProgressProvider>);
    expect(screen.getByRole('button', { name: /calculator/i })).toBeInTheDocument();
    first.unmount();
    render(<ProgressProvider><Harness initial={mk(without!)} onFinish={vi.fn()} onDiscard={vi.fn()} /></ProgressProvider>);
    expect(screen.queryByRole('button', { name: /calculator/i })).not.toBeInTheDocument();
  });

  it('never shows standard codes or domain ids', async () => {
    const { container } = render(<ProgressProvider><Harness initial={fresh()} onFinish={vi.fn()} onDiscard={vi.fn()} /></ProgressProvider>);
    await choose(q1.options.find((o) => !o.isCorrect)!.label);
    const text = container.textContent ?? '';
    expect(text).not.toContain(q1.standardCode);
    expect(text).not.toMatch(/\d\.[A-Z]{2,3}\.\d/);
  });
});

describe('KidPractice text diagrams (content-g3 CRITICAL display)', () => {
  beforeEach(() => localStorage.clear());

  it('g3 nf2: promptDetails render monospace with exact spacing', () => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'p3',
      profiles: [newProfile({ id: 'p3', studentName: 'Sam', grade: 3 })],
    });
    const ref = { kind: 'generated' as const, templateId: 'g3.nf2.fraction-on-a-number-line', seed: 7 };
    const q = getCurriculum(3).source.resolve(ref);
    expect(q.promptDetails).toBeTruthy();
    setup(stampContentVersions(newSession({ kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [ref], now: new Date() }), c));
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(q.promptDetails);
    expect(box).toHaveClass('font-mono', 'whitespace-pre', 'overflow-x-auto');
  });
});

describe('KidPractice accessibility (logic-flows Medium)', () => {
  beforeEach(() => localStorage.clear());

  it('moves focus to the feedback heading, which sits in a status region', async () => {
    setup();
    await choose(correctOption(q1).label);
    const heading = screen.getByRole('heading', { name: /nice!/i });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('status')).toContainElement(heading);
  });

  it('options expose selection with aria-pressed', async () => {
    setup();
    const label = q1.options[0].label;
    expect(option(label)).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(option(label));
    expect(option(label)).toHaveAttribute('aria-pressed', 'true');
  });

  it('spec 2.6: the stop confirm says answers are saved and counted', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    expect(screen.getByText('Stop now? Your answers so far are saved and counted.')).toBeInTheDocument();
  });
});
