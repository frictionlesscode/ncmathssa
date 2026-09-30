import React from 'react';
import {
  ArrowRight,
  Award,
  Clock,
  Layers,
  Play,
  Target
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { standardsOf, weightCompactLabel } from '../curriculum/registry';
import type { QuizDefinition } from '../types';
import { AdaptiveSessionCard } from './AdaptiveSessionCard';
import type { QuestionRef } from '../engine/questionModel';
import { parseQuestionRef } from '../engine/questionModel';
import { isPassing as meetsBar, displayPercent } from '../engine/mastery';

interface QuizzesListViewProps {
  onStartQuiz: (quizId: string) => void;
  onStartStandardDrill: (standardCode: string) => void;
  onStartAdaptiveSession: (refs: QuestionRef[]) => void;
}

export const QuizzesListView: React.FC<QuizzesListViewProps> = ({
  onStartQuiz,
  onStartStandardDrill,
  onStartAdaptiveSession
}) => {
  const { profile, curriculum } = useProgress();
  const passingPercent = curriculum.ssa.passingPercent;
  const standards = standardsOf(curriculum);

  // Helper to find highest score on a quiz
  const getBestScore = (quizId: string) => {
    const attempts = profile.attempts.filter(a => a.quizId === quizId);
    if (attempts.length === 0) return null;
    // Shown floored from raw counts so a miss never displays as the goal (F5).
    return displayPercent(Math.max(...attempts.map(a =>
      a.scoreTotal > 0 ? (a.scoreRaw * 100) / a.scoreTotal : a.scorePercent)));
  };

  // Pass is decided from raw counts, never from the rounded percent (F5).
  const hasPassed = (quizId: string) =>
    profile.attempts.some(a => a.quizId === quizId && meetsBar(a.scoreRaw, a.scoreTotal, passingPercent));

  const diagnosticQuiz = curriculum.quizzes.find(q => q.isDiagnostic);
  const mockQuizzes = curriculum.quizzes.filter(q => q.isMockAssessment);
  const moduleDrills = curriculum.quizzes.filter(q => q.domainId && !q.isMockAssessment);

  // Finding F3: the mock header used to hardcode grade 5's own "60-65
  // Minutes... Calculator Inactive & Active" wording for every grade. Both
  // clauses are derived from the active curriculum's actual mock quizzes,
  // never assumed - grades 2-4 have exactly one mock apiece and no
  // calculator split, so both facts must come from the real content.
  const mockMinutes = mockQuizzes
    .map(q => q.timeLimitMinutes)
    .filter((m): m is number => typeof m === 'number');
  const mockMinutesLabel = mockMinutes.length === 0
    ? ''
    : Math.min(...mockMinutes) === Math.max(...mockMinutes)
    ? `${mockMinutes[0]}`
    : `${Math.min(...mockMinutes)}-${Math.max(...mockMinutes)}`;
  const mockCalculatorFlags = mockQuizzes
    .flatMap(q => q.questionIds)
    .map(id => {
      try {
        return curriculum.source.resolve(parseQuestionRef(id)).calculatorAllowed;
      } catch {
        return undefined;
      }
    })
    .filter((v): v is boolean => typeof v === 'boolean');
  const mockHasCalculatorSplit = mockCalculatorFlags.includes(true) && mockCalculatorFlags.includes(false);

  // A quiz's subtitle is either a plain string or a function of the active
  // curriculum, for the handful of quizzes whose copy cites a standard
  // count or the passing cutoff (Ruling F11 - no such figure may be a
  // grade-5 literal).
  const subtitleOf = (quiz: QuizDefinition) =>
    typeof quiz.subtitle === 'function' ? quiz.subtitle(curriculum) : quiz.subtitle;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
            TESTING CENTER
          </span>
          <span className="text-xs font-semibold text-slate-500">Secure Assessment Simulations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          NCSCOS Grade {curriculum.grade} Assessment Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Take full timed mock exams, comprehensive module assessments, or drill individual standards. Practice tests are scored against the {passingPercent}% SSA bar; module quizzes and drills are practice.
        </p>
      </div>

      {/* 0. Adaptive daily practice - additive to the static library below,
          not a replacement for it. */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Daily Practice
        </h2>
        <AdaptiveSessionCard onStart={onStartAdaptiveSession} />
      </div>

      {/* 1. Baseline Diagnostic */}
      {diagnosticQuiz && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Initial Placement
          </h2>
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-3xl p-6 border border-blue-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md">
                  DIAGNOSTIC
                </span>
                <span className="text-xs font-bold text-blue-900">{diagnosticQuiz.questionIds.length} Questions (1 per standard)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{diagnosticQuiz.title}</h3>
              <p className="text-xs text-slate-600 max-w-xl">{subtitleOf(diagnosticQuiz)}</p>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              {getBestScore(diagnosticQuiz.id) !== null && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Best Score</span>
                  <span className={`text-xl font-black ${
                    hasPassed(diagnosticQuiz.id) ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {getBestScore(diagnosticQuiz.id)}%
                  </span>
                </div>
              )}
              <button
                onClick={() => onStartQuiz(diagnosticQuiz.id)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Take Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Mock Exams (Form A & Form B) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Full NC SSA Mock Assessment Simulations
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Timed {mockMinutesLabel} Minutes{mockHasCalculatorSplit ? ' • Divided into Calculator Inactive & Active' : ''}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {mockQuizzes.map(quiz => {
            const best = getBestScore(quiz.id);
            const isPassing = hasPassed(quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                      CASE SIMULATION
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{quiz.timeLimitMinutes} mins</span>
                      <span>•</span>
                      <span>{quiz.questionIds.length} items</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{subtitleOf(quiz)}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {best !== null ? (
                      <span className={`text-xs font-bold ${isPassing ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Best: {best}% {isPassing ? '(Passed SSA Bar)' : '(Below Bar)'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not yet attempted</span>
                    )}
                  </div>

                  <button
                    onClick={() => onStartQuiz(quiz.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Start Exam <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Domain Module Drills */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Domain Comprehensive Mastery Drills ({curriculum.domains.length} Modules)
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleDrills.map(quiz => {
            const best = getBestScore(quiz.id);
            const domain = curriculum.domains.find(d => d.id === quiz.domainId);
            const isPassing = hasPassed(quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${domain?.badgeBg}`}
                      title={domain?.weightGroupLabel}
                    >
                      {quiz.domainId} • {weightCompactLabel(curriculum, quiz.domainId ?? '')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {quiz.questionIds.length} Qs
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{subtitleOf(quiz)}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {best !== null ? (
                      <span className={`text-xs font-bold ${isPassing ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Best: {best}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Untested</span>
                    )}
                  </div>

                  <button
                    onClick={() => onStartQuiz(quiz.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Take Drill
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Standard-Specific Rapid Drills */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Targeted Single-Standard Drills ({standards.length} Total)
        </h2>
        <p className="text-xs text-slate-500">
          Drill a specific standard code to eliminate weak spots and guarantee mastery.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {standards.map(std => (
            <div
              key={std.code}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-slate-900 block">{std.code}</span>
                <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">{std.title}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => onStartStandardDrill(std.code)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Drill Standard <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
