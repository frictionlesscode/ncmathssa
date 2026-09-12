import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Flag,
  Flame,
  RotateCcw,
  Sparkles,
  XCircle
} from 'lucide-react';
import type { Question, QuizAttempt } from '../types';
import { correctOption, parseQuestionRef } from '../engine/questionModel';
import { useProgress } from '../context/ProgressContext';
import { formatTime } from '../utils/answerChecker';

interface QuizResultsProps {
  attempt: QuizAttempt;
  onRetake: () => void;
  onStartStandardDrill: (standardCode: string) => void;
  onOpenStudyGuide: (standardCode: string) => void;
  onDone: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  attempt,
  onRetake,
  onStartStandardDrill,
  onOpenStudyGuide,
  onDone
}) => {
  const { curriculum } = useProgress();
  const passingPercent = curriculum.ssa.passingPercent;
  const [filter, setFilter] = useState<'all' | 'missed' | 'correct' | 'flagged'>('all');
  const [retryResults, setRetryResults] = useState<Record<string, boolean | null>>({});

  // Confetti effect if passed the SSA bar
  useEffect(() => {
    if (attempt.isPassingSSA) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if canvas-confetti fails
      }
    }
  }, [attempt.isPassingSSA]);

  // Collect question objects. Most answer ids are authored ids, but a
  // custom "practice due reviews" drill can carry generated refs too
  // (encoded as `templateId#seed`), so every id is parsed back into its
  // QuestionRef rather than assumed authored.
  const questionIds = Object.keys(attempt.answers);
  const questions: Question[] = questionIds
    .map(id => {
      try {
        return curriculum.source.resolve(parseQuestionRef(id));
      } catch {
        return undefined;
      }
    })
    .filter((q): q is Question => q !== undefined);

  const missedQuestions = questions.filter(q => !attempt.answers[q.id]?.isCorrect);
  const flaggedQuestions = questions.filter(q => attempt.answers[q.id]?.flaggedForReview);

  // Filtered list
  const displayedQuestions = questions.filter(q => {
    const ans = attempt.answers[q.id];
    if (filter === 'missed') return !ans?.isCorrect;
    if (filter === 'correct') return ans?.isCorrect;
    if (filter === 'flagged') return ans?.flaggedForReview;
    return true;
  });

  const handleRetryChoice = (q: Question, label: string) => {
    setRetryResults(prev => ({ ...prev, [q.id]: correctOption(q).label === label }));
  };

  // Group missed questions by standard to identify weak standards
  const missedByStandard: Record<string, number> = {};
  missedQuestions.forEach(q => {
    missedByStandard[q.standardCode] = (missedByStandard[q.standardCode] || 0) + 1;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Score Header Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden ${
        attempt.isPassingSSA
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300'
          : 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${
                attempt.isPassingSSA
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-amber-500 text-white border-amber-600'
              }`}>
                {attempt.isPassingSSA ? `★ SSA Acceleration-Ready (Passed ≥ ${passingPercent}%)` : `Needs Practice (Below ${passingPercent}% Cutoff)`}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {formatTime(attempt.timeElapsedSeconds)} Elapsed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {attempt.quizTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              {attempt.isPassingSSA
                ? `Excellent mastery! Scoring at or above ${passingPercent}% satisfies the Wake County Single Subject Acceleration performance benchmark on this module.`
                : `Wake County SSA requires a ${passingPercent}% or higher score to accelerate. Review the missed questions below to identify and master weak concepts.`}
            </p>
          </div>

          {/* Score Circle & Raw Data */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md text-center min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Overall Score
            </span>
            <div className={`text-4xl font-black tracking-tight ${
              attempt.isPassingSSA ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {attempt.scorePercent}%
            </div>
            <div className="text-xs font-bold text-slate-700 mt-1">
              {attempt.scoreRaw} of {attempt.scoreTotal} Correct
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Qualifying Bar: {passingPercent}%
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-200/60">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retake Test
          </button>
          <button
            onClick={onDone}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors ml-auto"
          >
            Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weak Standards Callout Box (if missed questions exist) */}
      {Object.keys(missedByStandard).length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Targeted Focus: Standards Needing Review</span>
          </div>
          <p className="text-xs text-rose-900 mb-4 leading-relaxed">
            You missed questions on the following standards. Click to review the official NC study guide or launch a targeted drill:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(missedByStandard).map(([stdCode, count]) => (
              <div
                key={stdCode}
                className="bg-white border border-rose-200 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs shadow-2xs"
              >
                <span className="font-mono font-bold text-slate-900">{stdCode}</span>
                <span className="text-rose-600 font-extrabold text-[11px]">({count} missed)</span>
                <button
                  onClick={() => onOpenStudyGuide(stdCode)}
                  className="text-blue-600 hover:underline font-semibold ml-1 text-[11px]"
                >
                  Study Guide
                </button>
                <button
                  onClick={() => onStartStandardDrill(stdCode)}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                >
                  Drill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs for Questions Review */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Question-by-Question Detailed Review
          </h2>
          <p className="text-xs text-slate-500">
            Step-by-step worked solutions and NC misconceptions
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({questions.length})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'missed' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Missed ({missedQuestions.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'correct' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Correct ({questions.length - missedQuestions.length})
          </button>
          {flaggedQuestions.length > 0 && (
            <button
              onClick={() => setFilter('flagged')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'flagged' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flagged ({flaggedQuestions.length})
            </button>
          )}
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        {displayedQuestions.map((q) => {

          const ans = attempt.answers[q.id];
          const isCorrect = ans?.isCorrect;
          const studentAns = ans?.studentAnswer || '(No answer provided)';

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-all ${
                isCorrect ? 'border-slate-200' : 'border-rose-200 ring-1 ring-rose-200'
              }`}
            >
              {/* Question Card Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white text-slate-800 rounded border border-slate-200">
                    {q.standardCode}
                  </span>
                  {q.isStretch && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                      <Flame className="w-3 h-3 text-amber-600" /> Above-Grade Stretch
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {ans?.flaggedForReview && (
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">
                      <Flag className="w-3 h-3 fill-amber-600" /> Flagged
                    </span>
                  )}
                  <button
                    onClick={() => onOpenStudyGuide(q.standardCode)}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Guide
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-900 leading-relaxed">
                    {q.prompt}
                  </p>
                  {q.promptDetails && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                      {q.promptDetails}
                    </div>
                  )}
                </div>

                {/* Answer choices, with the key and the student's pick marked */}
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map(opt => {
                    const isStudentChoice = opt.label === studentAns.toUpperCase();

                    let cardStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (opt.isCorrect) {
                      cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                    } else if (isStudentChoice && !isCorrect) {
                      cardStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
                    }

                    return (
                      <div key={opt.label} className={`p-2.5 rounded-xl border ${cardStyle}`}>
                        <span className="font-mono font-black mr-1.5">{opt.label})</span>
                        {opt.text}
                        {isStudentChoice && !isCorrect && opt.misconception && (
                          <span className="block mt-1 font-mono text-[10px] font-semibold text-rose-700">
                            error: {opt.misconception.replace(/-/g, ' ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answers Comparison Box */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className={`p-3 rounded-2xl border ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-0.5">
                      Your Submitted Answer
                    </span>
                    <span className="text-sm font-bold font-mono">{studentAns}</span>
                  </div>

                  <div className="p-3 rounded-2xl border bg-emerald-50/70 border-emerald-200 text-emerald-950">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-0.5">
                      Correct Target Answer
                    </span>
                    <span className="text-sm font-bold font-mono">
                      {correctOption(q).label}) {correctOption(q).text}
                    </span>
                  </div>
                </div>

                {/* Worked Explanation */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Worked Step-by-Step Solution
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {q.explanation.stepByStep.map((step, sIdx) => (
                      <div key={sIdx} className="pl-3 border-l-2 border-blue-400 leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>

                  {q.explanation.commonMisconception && (
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-950">
                      <strong>⚠️ Watch Out:</strong> {q.explanation.commonMisconception}
                    </div>
                  )}
                </div>

                {/* Interactive "Try Again" / Instant Retry for Missed Question */}
                {!isCorrect && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Try Question Again:</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {q.options.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => handleRetryChoice(q, opt.label)}
                          className="w-9 h-9 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-800 font-mono font-black text-xs rounded-xl border border-slate-300 transition-colors"
                          title={opt.text}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {retryResults[q.id] !== undefined && retryResults[q.id] !== null && (
                      <span className={`text-xs font-bold ml-2 ${
                        retryResults[q.id] ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {retryResults[q.id] ? '✓ Correct! Nice work!' : '✗ Still not quite, check the steps above.'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
