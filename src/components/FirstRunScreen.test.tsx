import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstRunScreen } from './FirstRunScreen';

describe('FirstRunScreen', () => {
  it('explains what SSA is and that the tool is NC-specific', () => {
    render(<FirstRunScreen onComplete={vi.fn()} />);
    expect(screen.getByText(/single subject acceleration/i)).toBeInTheDocument();
    expect(screen.getByText(/north carolina/i)).toBeInTheDocument();
  });

  it('states plainly that no data leaves the browser', () => {
    // The users are children; this claim is load-bearing and must be
    // visible before anyone types a name.
    render(<FirstRunScreen onComplete={vi.fn()} />);
    expect(screen.getByText(/stays (in|on) (your|this) (browser|device)/i)).toBeInTheDocument();
  });

  it('will not continue without a name', async () => {
    const onComplete = vi.fn();
    render(<FirstRunScreen onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('passes the name and chosen grade back', async () => {
    const onComplete = vi.fn();
    render(<FirstRunScreen onComplete={onComplete} />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Alex');
    await userEvent.selectOptions(screen.getByLabelText(/grade/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onComplete).toHaveBeenCalledWith({ studentName: 'Alex', grade: 5 });
  });

  it('offers only grades that have a curriculum', () => {
    render(<FirstRunScreen onComplete={vi.fn()} />);
    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    // Grades 4 and 5 are registered; 1-3 are a later batch and must not be
    // offered, because choosing one would land on an empty curriculum.
    expect(options).toEqual(['4', '5']);
  });
});
