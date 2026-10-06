import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptDetails } from './PromptDetails';
import { isTextDiagram } from './textDiagram';

describe('PromptDetails', () => {
  it('keeps runs of spaces and scrolls long lines instead of wrapping', () => {
    const diagram = '0      1\n|--|--|--|\n     P';
    render(<PromptDetails>{diagram}</PromptDetails>);
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(diagram);
    expect(box.childNodes).toHaveLength(1);
    expect(box).toHaveClass('font-mono', 'whitespace-pre', 'overflow-x-auto');
    expect(box.className).not.toMatch(/whitespace-pre-(wrap|line)/);
  });

  it('lets prose wrap so long sentences stay on a phone screen', () => {
    const prose = 'Mia has a ribbon that is 12 inches long. She cuts off 5 inches.\nHow long is the ribbon now?';
    render(<PromptDetails>{prose}</PromptDetails>);
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(prose);
    expect(box).toHaveClass('font-mono', 'whitespace-pre-wrap');
    expect(box).not.toHaveClass('whitespace-pre');
  });

  it('tells diagrams from prose', () => {
    expect(isTextDiagram('0      1\n|--|--|')).toBe(true);
    expect(isTextDiagram('  ■ ■ ■\n  ■ ■')).toBe(true);
    expect(isTextDiagram('Row A: ■ ■ ■')).toBe(false);
    expect(isTextDiagram('Expression P: 4 × (12,840 + 675)\nExpression Q: 12,840 + 675')).toBe(false);
  });
});
