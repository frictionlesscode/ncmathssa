import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator as CalcIcon,
  Check,
  Flag,
  Pen,
  X
} from 'lucide-react';
import type { Question, QuizAttempt, QuizAttemptAnswer, QuizDefinition } from '../types';
import { QUESTIONS_BANK } from '../data/questions';
import { checkAnswer, formatTime } from '../utils/answerChecker';
import { Scratchpad } from './Scratchpad';
import { Calculator } from './Calculator';

interface QuizRunnerProps {
  quiz: QuizDefinition;
  onFinish: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onFinish, onExit }) => {
  // Load questions for this quiz
  const questions: Question[] = quiz.questionIds
    .map(id => QUESTIONS_BANK.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Scratchpad & Calculator modal toggles
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const currentQ = questions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Questions Found</h2>
        <p className="text-sm text-slate-500 mt-2">This quiz does not have matching questions.</p>
        <button
          onClick={onExit}
          className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSelectAnswer = (ans: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: ans }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmit = () => {
    // Grade all answers
    const evaluatedAnswers: Record<string, QuizAttemptAnswer> = {};
    let rawScore = 0;

    questions.forEach(q => {
      const studentAns = answers[q.id] || '';
      const isCorrect = checkAnswer(q, studentAns);
      if (isCorrect) rawScore++;

      evaluatedAnswers[q.id] = {
        questionId: q.id,
        studentAnswer: studentAns,
        isCorrect,
        flaggedForReview: flagged[q.id]
      };
    });

    const scorePercent = Math.round((rawScore / questions.length) * 1000) / 10;
    const isPassingSSA = scorePercent >= 80;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      domainId: quiz.domainId,
      standardCode: quiz.standardCode,
      completedAt: new Date().toISOString(),
      scoreRaw: rawScore,
      scoreTotal: questions.length,
      scorePercent,
      isPassingSSA,
      timeElapsedSeconds: secondsElapsed,
      answers: evaluatedAnswers
    };

    onFinish(attempt);
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim().length > 0).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Test Runner Top Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Leave test? Your progress on this quiz will not be saved.')) {
                onExit();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Exit test"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              SECURE TEST MODE • NO MID-QUIZ FEEDBACK
            </span>
            <h1 className="text-sm sm:text-base font-black truncate max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Center: Question Counter & Calculator Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Question:</span>
            <span className="font-mono font-bold text-white">
              {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Calculator Status Badge */}
          {currentQ.calculatorAllowed ? (
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl border border-emerald-500/40 text-xs font-bold transition-colors animate-pulse"
              title="Calculator Active: Open on-screen calculator"
            >
              <CalcIcon className="w-3.5 h-3.5" />
              <span>Calculator Active</span>
            </button>
          ) : (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 text-xs font-semibold"
              title="Calculator Inactive: Calculations must be done manually on paper or scratchpad"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Calculator Inactive</span>
            </div>
          )}
        </div>

        {/* Right Tools: Scratchpad, Timer, Finish */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            title="Open scratchpad whiteboard"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          {/* Timer */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="font-mono text-xs sm:text-sm font-extrabold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title={isPaused ? "Resume Timer" : "Pause Timer"}
          >
            {isPaused ? '⏸ ' : ''}{formatTime(secondsElapsed)}
          </button>


          <button
            onClick={() => {
              if (unansweredCount > 0) {
                setShowConfirmSubmit(true);
              } else {
                handleSubmit();
              }
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
          >
            Submit
          </button>
        </div>
      </header>

      {/* Main Test Body */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 relative">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                {currentQ.standardCode}
              </span>
              {currentQ.isStretch && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  Above-Grade Stretch Item
                </span>
              )}
            </div>

            {/* Flag Question Toggle */}
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                flagged[currentQ.id]
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQ.prompt}
            </h2>

            {currentQ.promptDetails && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-base font-semibold text-slate-800 whitespace-pre-wrap">
                {currentQ.promptDetails}
              </div>
            )}
          </div>

          {/* Answer Inputs: Multiple Choice vs Open Response */}
          {currentQ.questionType === 'multiple-choice' && currentQ.options ? (
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const choiceLetter = option.charAt(0).toUpperCase();
                const isSelected = answers[currentQ.id] === choiceLetter;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(choiceLetter)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Open Response / Free Text */
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Open-Response Answer:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={e => handleSelectAnswer(e.target.value)}
                  placeholder="Enter integer, decimal, or fraction (e.g. 3/4 or 2 1/3)..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                💡 Enter numeric values directly. Fractions may be written as <code className="bg-slate-200 px-1 rounded">3/4</code> or mixed numbers as <code className="bg-slate-200 px-1 rounded">2 1/4</code>.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation & Question Grid Bar */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky bottom-0 z-30">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {/* Navigator Drawer Trigger */}
        <button
          onClick={() => setShowNavigator(!showNavigator)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
        >
          <span>Question Grid ({answeredCount}/{questions.length})</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (unansweredCount > 0) {
                setShowConfirmSubmit(true);
              } else {
                handleSubmit();
              }
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Submit Test
          </button>
        )}
      </footer>

      {/* Question Navigator Drawer / Modal */}
      {showNavigator && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-xl animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900">Question Navigator</h3>
              <button
                onClick={() => setShowNavigator(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id]?.trim().length > 0;
                const isFlagged = flagged[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavigator(false);
                    }}
                    className={`relative h-10 rounded-xl text-xs font-extrabold transition-all border ${
                      isCurrent
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : isAnswered
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Answered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Flagged
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Unanswered
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal if Submitting with Unanswered Questions */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-slate-900">Unanswered Questions</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              You have <strong>{unansweredCount} unanswered question(s)</strong> out of {questions.length}. On the official WCPSS assessment, unanswered questions are scored as incorrect. Are you sure you want to finish now?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Return to Test
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratchpad whiteboard tool */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Calculator tool (active on designated questions) */}
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
