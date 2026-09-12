import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Flame,
  RotateCcw
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { dueEntries } from '../engine/scheduler';
import { correctOption } from '../engine/questionModel';
import type { Question } from '../engine/questionModel';
import type { QuestionRef } from '../engine/questionModel';
import type { QuizAttempt } from '../types';

interface WeakSpotsViewProps {
  onStartCustomQuiz: (questionIds: string[]) => void;
  onOpenStudyGuide: (standardCode: string) => void;
}

/** A due review entry's key is deliberately seedless (Ruling F3 elsewhere),
 *  so a generated item needs a seed manufactured here to resolve to an
 *  actual question. Deterministic per template id so re-renders are stable. */
function seedFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const WeakSpotsView: React.FC<WeakSpotsViewProps> = ({
  onStartCustomQuiz,
  onOpenStudyGuide
}) => {
  const { profile, curriculum, recordAttempt } = useProgress();
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [retryResults, setRetryResults] = useState<Record<string, boolean | null>>({});
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());

  const due = dueEntries(profile.reviewQueue, new Date());

  const items: { id: string; ref: QuestionRef; question: Question }[] = due
    .map((entry) => {
      const ref: QuestionRef =
        entry.key.kind === 'authored'
          ? { kind: 'authored', id: entry.key.id }
          : { kind: 'generated', templateId: entry.key.templateId, seed: seedFor(entry.key.templateId) };
      const id = entry.key.kind === 'authored' ? `a:${entry.key.id}` : `g:${entry.key.templateId}`;
      try {
        return { id, ref, question: curriculum.source.resolve(ref) };
      } catch {
        return null;
      }
    })
    .filter((x): x is { id: string; ref: QuestionRef; question: Question } => x !== null)
    .filter((x) => !clearedIds.has(x.id));

  // Filter by standard
  const filteredItems = selectedStandard === 'all'
    ? items
    : items.filter(({ question }) => question.standardCode === selectedStandard);

  // Distinct standards with due questions
  const distinctStandards = Array.from(new Set(items.map(({ question }) => question.standardCode)));

  const handleInlineCheck = (item: { id: string; ref: QuestionRef; question: Question }, label: string) => {
    const isCorrect = correctOption(item.question).label === label;
    setRetryResults(prev => ({ ...prev, [item.id]: isCorrect }));

    const attempt: QuizAttempt = {
      id: `weakspot-retry-${Date.now()}`,
      quizId: 'weakspots-retry',
      quizTitle: 'Weak Spots Retry',
      standardCode: item.question.standardCode,
      completedAt: new Date().toISOString(),
      scoreRaw: isCorrect ? 1 : 0,
      scoreTotal: 1,
      scorePercent: isCorrect ? 100 : 0,
      isPassingSSA: isCorrect,
      timeElapsedSeconds: 0,
      answers: {
        [item.question.id]: {
          questionId: item.question.id,
          studentAnswer: label,
          isCorrect,
          standardCode: item.question.standardCode
        }
      }
    };
    recordAttempt(attempt, [{ ref: item.ref, wasCorrect: isCorrect }]);

    if (isCorrect) {
      // Automatically clear after a short celebration delay
      setTimeout(() => {
        setClearedIds(prev => new Set(prev).add(item.id));
      }, 1200);
    }
  };

  const authoredIds = items
    .filter(({ ref }) => ref.kind === 'authored')
    .map(({ ref }) => (ref as { kind: 'authored'; id: string }).id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              TARGETED REMEDIATION
            </span>
            <span className="text-xs font-semibold text-slate-500">Due Reviews & Mastery Clearance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weak Spots & Due Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Every question answered incorrectly across any test is scheduled here for spaced review. Practice them individually or launch a custom test to clear your due reviews before the exam.
          </p>
        </div>

        {authoredIds.length > 0 && (
          <button
            onClick={() => onStartCustomQuiz(authoredIds)}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-rose-600/20 transition-all self-start"
          >
            <RotateCcw className="w-4 h-4" /> Practice All {items.length} Due Qs
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty State: All Clear! */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Zero Due Reviews!</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You currently have no questions due for review. Any missed questions from upcoming practice quizzes or mock exams will automatically show up here for targeted practice.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          {distinctStandards.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs">
              <span className="font-bold text-slate-500 text-xs mr-1">Filter Standard:</span>
              <button
                onClick={() => setSelectedStandard('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  selectedStandard === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Standards ({items.length})
              </button>
              {distinctStandards.map(code => (
                <button
                  key={code}
                  onClick={() => setSelectedStandard(code)}
                  className={`px-3 py-1.5 rounded-xl font-bold font-mono transition-colors ${
                    selectedStandard === code
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {code} ({items.filter(({ question }) => question.standardCode === code).length})
                </button>
              ))}
            </div>
          )}

          {/* Due Questions Grid */}
          <div className="grid gap-5">
            {filteredItems.map(item => {
              const q = item.question;
              const result = retryResults[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                        {q.standardCode}
                      </span>
                      {q.isStretch && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                          <Flame className="w-3 h-3 text-amber-600" /> Above-Grade Stretch
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenStudyGuide(q.standardCode)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Study Guide
                      </button>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.prompt}
                    </p>
                    {q.promptDetails && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-semibold text-slate-800 whitespace-pre-wrap">
                        {q.promptDetails}
                      </div>
                    )}
                  </div>

                  {/* Answer choices */}
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map(opt => (
                      <div key={opt.label} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                        <span className="font-mono font-black mr-1.5">{opt.label})</span>
                        {opt.text}
                      </div>
                    ))}
                  </div>

                  {/* Retry & Clearance Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-bold text-slate-700 mr-1">Answer to clear:</span>
                      {q.options.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => handleInlineCheck(item, opt.label)}
                          className="w-9 h-9 bg-white hover:bg-slate-800 hover:text-white text-slate-800 font-mono font-black text-xs rounded-xl border border-slate-300 transition-colors flex-shrink-0"
                          title={opt.text}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {result !== undefined && result !== null && (
                      <div className={`text-xs font-bold flex items-center gap-1 ${
                        result ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {result ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Correct! Clearing from weak spots...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4" /> Not quite right. Target answer is: <strong className="font-mono underline ml-1">{correctOption(q).label}) {correctOption(q).text}</strong>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
