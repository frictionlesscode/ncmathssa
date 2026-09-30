# logic-scoring audit

## Coverage
Read in full: mastery.ts, path.ts, pace.ts, sessionSummary.ts, activeSession.ts, scheduler.ts, sessionComposer.ts, pathSession.ts,
ProgressContext.tsx, ParentHome, SessionSummary, KidDone, QuizResults (score header), Dashboard, App.tsx finish(), KidPractice finish/stop, spec sections 4-5.
Probed with temporary vitest files (deleted): blueprint weights grades 1-5 (sum 100; G4 = 99.99999999999999), standards without content (none),
empty domains (none), standard-code overlap across grades (none, so other-grade answers are ignored in mastery/path/summary), checkup composition
(exactly 1 question per standard, G1-G5), sampleSizeFor per domain (G3 G=5, G5 OA=7, G5 G=6, others 8), readiness with 1 correct per standard,
perfect checkup, uniform 79.6% accuracy, 63/79 domain rounding, short-on-time pace with 0 and 1 attempts (all 5 grades), checkAnswer(q,'') = false.
Not checked: whether a profile's grade can change after creation (no UI found; cross-grade behavior by code reading only); PrintReportModal; StudyPaceModal.

Verified OK: readiness equals a hand-computed blueprint-weighted mean of per-standard percents (untested standards = 0, does not inflate);
passing boundary uses >= consistently (exactly 80 passes); daysUntil is local-day and DST-safe; readinessBefore in App.finish is captured before completeSession;
unanswered test-style questions graded wrong with correct denominators; answeredOnly practice denominators are answered-only; generated (t#seed) answers
count identically to authored (by standardCode); discarded/paused sessions record nothing.

## Findings
| # | Sev | Location | What's wrong | Evidence | Fix |
|---|---|---|---|---|---|
| F1 | Critical | path.ts:154 (`r1 = shortOnTime \|\| ...`), pace.ts progress calc | In short-on-time mode every topic counts as having finished Round 1 with zero work, so path progress starts at 50% and pace says "Ahead" | Test date 5 days out, no attempts: roundsFinished=4/8 (G1,G2), 5/10 (G3-5). After ONE answered question today, computePace status = "ahead" in all 5 grades (progress 50% vs elapsed 0%). Right: on track/behind (real progress ~0). Round 1 also shows a check mark on ParentHome | Do not count skipped rounds as finished for pace, or hide pace status in short mode |
| F2 | High | mastery.ts overallReadiness; Dashboard badge | Readiness is not sample-size gated: each standard counts fully from one answer | G5 perfect 17-question check-up (1 Q per standard): readiness=100, Dashboard badge "Acceleration-Ready (>=80%)" while "0 of 17 Standards Mastered" and two domains are only "approaching" | Shrink standards with total<4 (weight min(total,4)/4) or show "based on N answers" |
| F3 | High | ProgressContext.tsx (weightedScore=Math.round, isAccelerationReady unrounded); Dashboard.tsx:244; ParentHome tracker | Rounded vs unrounded readiness disagree on one screen | Uniform 79.6% accuracy gives readiness 79.6: ParentHome "80% ready - goal: 80%"; Dashboard headline "Acceleration Ready! Complete a Full Mock Exam" (rounded) but badge "Approaching Mastery" (unrounded) and "Need 0% more for SSA threshold". Any value 79.5-79.9 | Compare and display one number |
| F4 | High | Dashboard.tsx ~line 311 `isReady = dm.masteryPercent >= passingPercent` | Domain card shows green "Ready" with no minimum answers | Domain with 3/3 correct: card "100% Ready" while status is "approaching" (needs 4 answers), ParentHome says "Getting there", and same card says "0 of N Mastered" | Use dm.status === 'acceleration-ready' |
| F5 | Medium | mastery.ts domainStatsFor | Percent rounded before status derived; path/standards use unrounded | 63/79 = 79.75%: domain masteryPercent=80 -> acceleration-ready/"Strong", but its standard is "approaching" (probe confirmed) and path passes() says not passing. 59.5 -> 60 "approaching" instead of needs-focus | Derive status from the unrounded ratio |
| F6 | Medium | path.ts passedMock, ParentHome "Ready to try for SSA" | Banner is permanent and independent of current readiness | Any passing mock ever sets practiceTestPassedAt; later failed mocks or 40% readiness leave it. Grades 1-4 have one mock form so a retake serves identical questions (memorized), and those answers are counted in mastery again | Use most recent mock only; note repeated form |
| F7 | Medium | path.ts round exits vs mastery status | Round exits use last 8 answers, topic labels use lifetime accuracy | 40 wrong then 8 right: Round 2 finished, path advances to Round 3, but topic still shows "Needs work" (16.7%) and readiness stays low. Old misses never age out | Recency window for status/readiness, or explain |
| F8 | Medium | path.ts round3 map, sessionComposer due reviews | A finished topic can regress from due-review answers | Round 3 sessions include due reviews (previously missed items) of finished topics; they are appended to that topic's round3 window. Two wrong reviews turn 7/8 into 6/8 = 75%, topic falls out of done, path leaves 'test' | Exclude review answers from exit windows or document |
| F9 | Medium | sessionSummary.ts isStrong | "Strong today" at n=1 | 1/1 in a domain (often one due-review item) is listed "Strong today" and hidden from Tricky; same for 2/2 | Require >=3 answers |
| F10 | Medium | QuizResults.tsx header/confetti | Any drill shows "SSA Acceleration-Ready (Passed >=80%)", confetti, "Wake County SSA benchmark" text | 4/5 on a 5-question drill: isPassingSSA = scorePercent >= 80 | Claim SSA pass only for full mock forms |
| F11 | Low | ParentHome path useMemo without now; useReadinessSummary daysUntilExam memo | Stale day count / short-on-time flag after midnight with app open | Deps exclude date | Add day key to deps |
| F12 | Low | pace.ts `first` | Earliest attempt includes other-grade attempts and pre-date-change history | Old attempts + new far test date inflate elapsed% -> "A bit behind" | Filter to current grade/date |
| F13 | Low | ParentHome timeLeft | floor(days/7): 20 days -> "2 weeks left" | 2.86 weeks | Round or show days |
| F14 | Low | Dashboard "Quizzes Taken" | Counts all attempts incl. path sessions and other grades | attempts.length | Relabel/filter |
| F15 | Low | activeSession.ts sessionToAttempt, withAttempt | Early-submitted test-style session records unanswered as wrong in mastery and pushes them to review box 1 | 20-question mock, 5 answered: 15 misses recorded; matches real-test scoring, but summary says "missed N" | Tag as skipped |

## Recommendations
- Invariant tests: readiness never displayed as ready while no standard is acceleration-ready; every ready/strong flag derived from one shared function with no Math.round before a threshold compare.
- Pace tests: short-on-time with 0 or 1 attempts must not be "ahead".
- Cross-screen fixture test asserting ParentHome and Dashboard wording agree for the same profile.
