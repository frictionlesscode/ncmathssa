import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  RotateCcw
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { dueEntries, BOX_INTERVALS_DAYS, type ReviewEntry } from '../engine/scheduler';
import { correctOption, questionRefId } from '../engine/questionModel';
import type { Question, QuestionRef } from '../engine/questionModel';
import type { QuizAttempt } from '../types';
import { topMisconceptionFamilies } from '../engine/mastery';
import { MISCONCEPTIONS, familyLabel } from '../curriculum/misconceptions';
import { PromptDetails } from './PromptDetails';

interface WeakSpotsViewProps {
  onStartCustomQuiz: (questionIds: string[]) => void;
  onOpenStudyGuide: (standardCode: string) => void;
}

interface Item {
  id: string;
  ref: QuestionRef;
  question: Question;
  entry: ReviewEntry;
}

/** A due review entry's key is deliberately seedless (Ruling F3 elsewhere) -
 *  review re-serves a FRESH instance of a template, precisely so a repeat
 *  review doesn't just re-show the same numbers and teach the answer
 *  instead of the method. The seed is derived from `lastSeenAt`, which
 *  changes every time this entry is scheduled, so a generated item's
 *  numbers differ across review cycles without needing an impure clock
 *  read during render. */
function seedFor(templateId: string, lastSeenAt: string): number {
  const s = `${templateId}:${lastSeenAt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function daysUntil(iso: string, now: Date): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export const WeakSpotsView: React.FC<WeakSpotsViewProps> = ({
  onStartCustomQuiz,
  onOpenStudyGuide
}) => {
  const { profile, curriculum, mastery, recordAttempt } = useProgress();
  const misconceptionFamilies = topMisconceptionFamilies(mastery, 3);
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [retryResults, setRetryResults] = useState<Record<string, boolean>>({});
  // Items the student just answered are pinned here so the result banner
  // stays visible even though recordAttempt/recordResult already moved the
  // entry's dueAt into the future (a Leitner review is never "still due"
  // immediately after being answered, right or wrong).
  const [pinned, setPinned] = useState<Record<string, Item>>({});

  const now = new Date();

  const toItem = (entry: ReviewEntry): Item | null => {
    const ref: QuestionRef =
      entry.key.kind === 'authored'
        ? { kind: 'authored', id: entry.key.id }
        : {
            kind: 'generated',
            templateId: entry.key.templateId,
            seed: seedFor(entry.key.templateId, entry.lastSeenAt)
          };
    const id = questionRefId(ref);
    try {
      return { id, ref, question: curriculum.source.resolve(ref), entry };
    } catch {
      return null;
    }
  };

  const allEntries = Object.values(profile.reviewQueue);
  const dueNowRaw = dueEntries(profile.reviewQueue, now);
  const dueIds = new Set(dueNowRaw.map((e) => `${e.key.kind}:${e.key.kind === 'authored' ? e.key.id : e.key.templateId}`));

  const dueNow: Item[] = dueNowRaw
    .map(toItem)
    .filter((x): x is Item => x !== null);

  // Everything pinned (just answered) that isn't already due joins the due
  // list too, so the result banner has somewhere to render.
  const dueList: Item[] = [
    ...dueNow,
    ...Object.values(pinned).filter((p) => !dueNow.some((d) => d.id === p.id))
  ];

  // Scheduled: every other queue entry, not due and not pinned, so nothing
  // shows up in both sections. This is the "what is he struggling with"
  // picture the old missedQuestionIds bank gave a parent - visible even
  // when nothing is actionable today.
  const scheduled: Item[] = allEntries
    .filter((e) => !dueIds.has(`${e.key.kind}:${e.key.kind === 'authored' ? e.key.id : e.key.templateId}`))
    .map(toItem)
    .filter((x): x is Item => x !== null && !pinned[x.id])
    .sort((a, b) => a.entry.dueAt.localeCompare(b.entry.dueAt));

  // Filter by standard (due list only - the actionable list)
  const filteredDue = selectedStandard === 'all'
    ? dueList
    : dueList.filter(({ question }) => question.standardCode === selectedStandard);

  const distinctStandards = Array.from(new Set(dueList.map(({ question }) => question.standardCode)));

  const handleInlineCheck = (item: Item, label: string) => {
    const isCorrect = correctOption(item.question).label === label;
    setRetryResults(prev => ({ ...prev, [item.id]: isCorrect }));
    setPinned(prev => ({ ...prev, [item.id]: item }));

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
      // Let the "back for review in N days" banner show briefly, then
      // let the item fall out of view now that it's genuinely rescheduled.
      setTimeout(() => {
        setPinned(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        setRetryResults(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 2000);
    }
  };

  /** What recordResult will actually do to this item's box, so the banner
   *  can say what really happens under Leitner instead of the old
   *  permanent-clear model's "clearing from weak spots". */
  const nextIntervalMessage = (entry: ReviewEntry, isCorrect: boolean): string => {
    if (!isCorrect) {
      return `Not quite right. Back for review in ${BOX_INTERVALS_DAYS[0]} day${BOX_INTERVALS_DAYS[0] === 1 ? '' : 's'}.`;
    }
    const promotedBox = entry.box + 1;
    if (promotedBox > BOX_INTERVALS_DAYS.length) {
      return 'Correct! Mastered - this item will not be scheduled again.';
    }
    const days = BOX_INTERVALS_DAYS[promotedBox - 1];
    return `Correct! Back for review in ${days} day${days === 1 ? '' : 's'}.`;
  };

  const dueRefIds = dueNow.map(({ ref }) => questionRefId(ref));

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
            Every question answered incorrectly across any test is scheduled here for spaced review under a
            5-box Leitner system. Practice due items individually, or launch a custom test to work through
            everything due today.
          </p>
        </div>

        {dueNow.length > 0 && (
          <button
            onClick={() => onStartCustomQuiz(dueRefIds)}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-rose-600/20 transition-all self-start"
          >
            <RotateCcw className="w-4 h-4" /> Practice All {dueNow.length} Due Qs
          </button>
        )}
      </div>

      {/* Common Misconceptions */}
      {misconceptionFamilies.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" /> Common Misconceptions
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {misconceptionFamilies.map(({ family, count, tags }) => {
              const topTag = tags[0]?.tag;
              const description = topTag ? MISCONCEPTIONS[topTag]?.description : undefined;
              return (
                <div
                  key={family}
                  className="p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-900">{familyLabel(family)}</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-700">{count}×</span>
                  </div>
                  {description && (
                    <p className="text-[11px] text-indigo-800 leading-snug">{description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dueList.length === 0 && scheduled.length === 0 ? (
        /* Empty State: All Clear! */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Zero Missed Questions!</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You currently have nothing scheduled for review. Any missed questions from upcoming practice
            quizzes or mock exams will automatically show up here for targeted, spaced practice.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Due Now */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" /> Due Now ({dueList.length})
            </h2>

            {dueList.length === 0 ? (
              <p className="text-xs text-slate-500">Nothing is due today - see Scheduled below.</p>
            ) : (
              <>
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
                      All Standards ({dueList.length})
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
                        {code} ({dueList.filter(({ question }) => question.standardCode === code).length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Due Questions Grid */}
                <div className="grid gap-5">
                  {filteredDue.map(item => {
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
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                              Box {item.entry.box} of {BOX_INTERVALS_DAYS.length}
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
                            <PromptDetails className="p-3 rounded-xl text-xs">{q.promptDetails}</PromptDetails>
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

                          {result !== undefined && (
                            <div className={`text-xs font-bold flex items-center gap-1 ${
                              result ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {result ? (
                                <>
                                  <CheckCircle className="w-4 h-4" /> {nextIntervalMessage(item.entry, true)}
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4" /> {nextIntervalMessage(item.entry, false)}
                                  {' '}Target answer: <strong className="font-mono underline ml-1">{correctOption(q).label}) {correctOption(q).text}</strong>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Scheduled (not yet due) */}
          {scheduled.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Scheduled ({scheduled.length})
              </h2>
              <p className="text-xs text-slate-500">
                Already reviewed at least once and not due yet - this is what a parent used to see in the
                permanent weak-spots bank, now with an actual next-review date.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheduled.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {item.question.standardCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                        Box {item.entry.box} of {BOX_INTERVALS_DAYS.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{item.question.prompt}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Next review in {daysUntil(item.entry.dueAt, now)}d</span>
                      <button
                        onClick={() => onOpenStudyGuide(item.question.standardCode)}
                        className="font-bold text-blue-600 hover:text-blue-700"
                      >
                        Study Guide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
