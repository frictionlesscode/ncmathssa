import React, { useRef, useState } from 'react';
import { Calculator as CalcIcon, Pen } from 'lucide-react';
import type { QuizAttempt } from '../types';
import { useProgress } from '../context/ProgressContext';
import {
  answeredCount, recordAnswer, resolveSession, sessionToAttempt, type ActiveSession,
} from '../engine/activeSession';
import { correctOption } from '../engine/questionModel';
import { Scratchpad } from './Scratchpad';
import { Calculator } from './Calculator';
import { PromptDetails } from './PromptDetails';

interface KidPracticeProps {
  session: ActiveSession;
  studentName: string;
  onChange: (s: ActiveSession) => void;
  onFinish: (attempt: QuizAttempt) => void;
  onDiscard: () => void;
}

/** Instant-feedback practice for the child (spec 6.2): one question at a
 *  time, no navigator, no retry. Controlled by `session`. */
export const KidPractice: React.FC<KidPracticeProps> = ({ session, studentName, onChange, onFinish, onDiscard }) => {
  const { curriculum } = useProgress();
  const questions = resolveSession(session, curriculum);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(sessionToAttempt(session, questions, curriculum.ssa.passingPercent, new Date(), { answeredOnly: true }));
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-lg font-bold text-slate-900">This session can&rsquo;t continue</h1>
          <p className="text-sm text-slate-600">Its questions are no longer available. Discard it to get back on track.</p>
          <button onClick={onDiscard} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Discard this session
          </button>
        </div>
      </div>
    );
  }

  const index = Math.min(session.currentIndex, questions.length - 1);
  const q = questions[index];
  const answer = session.answers[q.id];
  const isLast = index === questions.length - 1;
  const right = correctOption(q);

  const check = () => {
    if (!selected) return;
    onChange(recordAnswer(session, q, selected));
    setSelected(null);
  };
  const next = () => {
    if (isLast) finish();
    else onChange({ ...session, currentIndex: index + 1 });
  };
  const stop = () => {
    if (answeredCount(session) === 0) onDiscard();
    else finish();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <span className="font-semibold text-slate-800">{studentName}&rsquo;s practice</span>
        <div className="flex items-center gap-1" aria-hidden="true">
          {questions.map((x) => {
            const a = session.answers[x.id];
            return (
              <span key={x.id} className="text-sm">
                {a ? (a.isCorrect ? '⭐' : '●') : '○'}
              </span>
            );
          })}
        </div>
        <span className="text-sm text-slate-600">{index + 1} of {questions.length}</span>
        <div className="flex gap-2">
          <button onClick={() => setScratchOpen(true)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm">
            <Pen className="w-4 h-4" /> Scratchpad
          </button>
          {q.calculatorAllowed && (
            <button onClick={() => setCalcOpen(true)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm">
              <CalcIcon className="w-4 h-4" /> Calculator
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-xl font-semibold text-slate-900 whitespace-pre-line">{q.prompt}</p>
          {q.promptDetails && (
            <PromptDetails className="mt-2 p-3 rounded-xl text-base">{q.promptDetails}</PromptDetails>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => {
            const chosen = answer ? answer.selected === o.label : selected === o.label;
            const reveal = answer && o.isCorrect;
            return (
              <button
                key={o.label}
                aria-label={`Answer ${o.label}: ${o.text}`}
                disabled={Boolean(answer)}
                onClick={() => setSelected(o.label)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-lg ${
                  reveal ? 'border-emerald-500 bg-emerald-50'
                    : chosen ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                } disabled:cursor-default`}
              >
                <span className="font-bold mr-2">{o.label}</span>{o.text}
              </button>
            );
          })}
        </div>

        {!answer ? (
          <button
            onClick={check}
            disabled={!selected}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white disabled:opacity-50 hover:bg-blue-700"
          >
            Check my answer
          </button>
        ) : (
          <div className="space-y-4">
            {answer.isCorrect ? (
              <p className="text-2xl font-bold text-emerald-700">Nice!</p>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                <p className="text-lg font-semibold text-amber-900">Not quite. The answer is {right.label}.</p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                  {q.explanation.stepByStep.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                {q.explanation.commonMisconception && (
                  <p className="text-sm text-slate-700"><strong>Watch out:</strong> {q.explanation.commonMisconception}</p>
                )}
              </div>
            )}
            <button onClick={next} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        )}

        <div className="pt-4 text-center">
          {!confirmStop ? (
            <button onClick={() => setConfirmStop(true)} className="text-sm text-slate-500 underline">
              Stop for today
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Stop and save your progress?</p>
              <div className="flex justify-center gap-3">
                <button onClick={stop} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white">Yes, stop</button>
                <button onClick={() => setConfirmStop(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">Keep going</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Scratchpad isOpen={scratchOpen} onClose={() => setScratchOpen(false)} />
      <Calculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
};

export default KidPractice;
