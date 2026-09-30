import React from 'react';
import { isTextDiagram } from './textDiagram';

interface PromptDetailsProps {
  children: string;
  /** Padding, radius and text size, which differ per screen. */
  className?: string;
}

/** Diagrams need exact whitespace, and their long lines scroll inside the
 *  box, because wrapping would misalign them. Prose wraps normally. The box
 *  holds a single text node so its layout can be measured. */
export const PromptDetails: React.FC<PromptDetailsProps> = ({ children, className = '' }) => {
  const layout = isTextDiagram(children) ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap';
  return (
    <div
      data-testid="prompt-details"
      className={`font-mono font-semibold text-slate-800 bg-slate-50 border border-slate-200 ${layout} ${className}`}
    >
      {children}
    </div>
  );
};

export default PromptDetails;
