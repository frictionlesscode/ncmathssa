import type React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { AdaptiveSessionCard } from './AdaptiveSessionCard';
import type { QuestionRef } from '../engine/questionModel';

const renderCard = (onStart = vi.fn()) => {
  render(
    <ProgressProvider>
      <AdaptiveSessionCard onStart={onStart} />
    </ProgressProvider>
  );
  return onStart;
};

describe('AdaptiveSessionCard', () => {
  beforeEach(() => localStorage.clear());

  it('offers a practice session', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /start.*practice/i })).toBeInTheDocument();
  });

  it('hands back the requested number of question refs', async () => {
    const onStart = renderCard();
    await userEvent.click(screen.getByRole('button', { name: /start.*practice/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0]).toHaveLength(10);
  });

  it('says nothing is due when the review queue is empty', () => {
    renderCard();
    expect(screen.getByText(/no reviews due/i)).toBeInTheDocument();
  });

  it('lets the student choose a session length', async () => {
    const onStart = renderCard();
    await userEvent.selectOptions(screen.getByLabelText(/questions/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /start.*practice/i }));
    expect(onStart.mock.calls[0][0]).toHaveLength(20);
  });

  it('produces refs that all resolve through the curriculum source', async () => {
    let resolveFn: ((ref: QuestionRef) => unknown) | undefined;
    const Capture: React.FC = () => {
      const { curriculum } = useProgress();
      resolveFn = (ref: QuestionRef) => curriculum.source.resolve(ref);
      return null;
    };

    let captured: QuestionRef[] = [];
    render(
      <ProgressProvider>
        <Capture />
        <AdaptiveSessionCard onStart={(refs) => { captured = refs; }} />
      </ProgressProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /start.*practice/i }));

    expect(captured.length).toBeGreaterThan(0);
    for (const ref of captured) {
      expect(() => resolveFn!(ref)).not.toThrow();
    }
  });
});
