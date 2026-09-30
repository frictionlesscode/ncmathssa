import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KidDone, encouragementFor, ENCOURAGEMENT } from './KidDone';
import type { QuizAttempt } from '../types';

const attempt = { scoreRaw: 12, scoreTotal: 15 } as QuizAttempt;

describe('KidDone', () => {
  it('shows the score and hands back to the grown-up', async () => {
    const onHandBack = vi.fn();
    render(<KidDone attempt={attempt} onHandBack={onHandBack} />);
    expect(screen.getByText(/12 out of 15/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /hand back to your grown-up/i }));
    expect(onHandBack).toHaveBeenCalledTimes(1);
  });

  it('picks encouragement by score band', () => {
    expect(ENCOURAGEMENT.high).toContain(encouragementFor(9, 10));
    expect(ENCOURAGEMENT.mid).toContain(encouragementFor(6, 10));
    expect(ENCOURAGEMENT.low).toContain(encouragementFor(1, 10));
    expect(ENCOURAGEMENT.low).toContain(encouragementFor(0, 0));
  });
});
