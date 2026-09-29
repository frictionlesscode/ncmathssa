import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisclaimerGate, DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './DisclaimerGate';

const renderGate = () =>
  render(
    <DisclaimerGate>
      <p>app content</p>
    </DisclaimerGate>,
  );

describe('DisclaimerGate', () => {
  beforeEach(() => localStorage.clear());

  it('shows the disclaimer instead of the app until it is accepted', () => {
    renderGate();
    expect(screen.getByRole('heading', { name: /before you begin/i })).toBeInTheDocument();
    expect(screen.queryByText('app content')).not.toBeInTheDocument();
  });

  it('says the real test is not public and nothing here is guaranteed', () => {
    // Bold lead-ins repeat the paragraph wording, so match the page text as a
    // whole rather than a single element.
    const { container } = renderGate();
    const text = container.textContent ?? '';
    expect(text).toMatch(/publicly available information/i);
    expect(text).toMatch(/actual test is secure and is not public/i);
    expect(text).toMatch(/no guarantee/i);
    expect(text).toMatch(/at your own risk/i);
    expect(text).toMatch(/hold the author harmless/i);
  });

  it('keeps the continue button disabled until the agreement box is ticked', async () => {
    renderGate();
    const button = screen.getByRole('button', { name: /agree and continue/i });
    expect(button).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox'));
    expect(button).toBeEnabled();
  });

  it('shows the app and remembers the acceptance once agreed', async () => {
    renderGate();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /agree and continue/i }));
    expect(screen.getByText('app content')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(DISCLAIMER_STORAGE_KEY) ?? 'null');
    expect(stored.version).toBe(DISCLAIMER_VERSION);
    expect(typeof stored.acceptedAt).toBe('string');
  });

  it('skips the disclaimer for a visitor who already accepted this version', () => {
    localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-29T00:00:00.000Z' }),
    );
    renderGate();
    expect(screen.getByText('app content')).toBeInTheDocument();
  });

  it('asks again when the stored acceptance is for an older version', () => {
    localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION - 1, acceptedAt: '2026-01-01T00:00:00.000Z' }),
    );
    renderGate();
    expect(screen.queryByText('app content')).not.toBeInTheDocument();
  });
});
