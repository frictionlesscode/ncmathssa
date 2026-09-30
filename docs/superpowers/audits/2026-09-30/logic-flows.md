# logic-flows audit

## Coverage
Read in full: App.tsx, ParentHome, KidPractice, QuizRunner, KidDone, SessionSummary, WhoIsPracticing, FirstRunScreen,
StudyPaceModal, DetailedView, DisclaimerGate, storage.ts, types.ts, ProgressContext, activeSession.ts, questionModel.ts,
answerChecker.ts, questionSource.ts, path.ts, pathSession.ts; Navbar profile-menu code only (not the whole 423 lines).
Not read: Navbar rendering beyond profile menu, Scratchpad/Calculator internals, PrintReportModal.
Probes (temporary jsdom tests, deleted): 16 storage/flow probes on the real App; 348 template x seed resolves for
determinism (all 5 grades); 348 label-vs-correct-text collision checks; 1000 generated path sessions (grades 1-5, sizes
5-30, 40 seeds) checked for duplicate refs / unresolvable refs / non-single-correct; every quiz's questionIds checked for
duplicates and resolvability. Not possible in jsdom: real reload, real second tab, layout, real timers over time.

## Findings
| Sev | Location | Problem | Evidence | Fix |
|---|---|---|---|---|
| High | storage.ts:47-57,118-125 (isPopulatedV2/loadState) + ProgressContext.tsx:76-78 | Any v2 blob that fails the shallow check is treated as absent, so app boots empty and the save effect overwrites it. Dangling activeProfileId, one profile lacking `id`, or corrupt JSON all wipe every student's history on first load. No backup, no warning. | Probe: v2 {Alex (with attempts), B, activeProfileId:'gone'} -> localStorage after load = one profile with empty name. Corrupt JSON -> replaced by fresh state. One id-less profile -> both real profiles lost. | Repair instead of reject (fall back to profiles[0] for active id, drop only bad profiles). Never write over an unparseable v2 blob: copy it to a `_corrupt_<ts>` key first. Do not save until the user changes something. |
| High | storage.ts:38-45 (returns raw v2 unvalidated); no ErrorBoundary anywhere | No field normalisation. A profile with missing `attempts`, `activeSession` missing `refs`, a null inside attempts, or a grade not registered (e.g. 6) throws during render -> permanent white screen on every load (state is re-read each time). | Probe: attempts undefined -> "attempts is not iterable"; attempts [null] -> "Cannot read properties of null (reading 'answers')"; activeSession without refs -> crash on Home; grade 6 -> "No curriculum module for grade 6". (missing reviewQueue tolerated.) | Add normaliseProfile() in loadState (defaults, filter malformed attempts, drop invalid activeSession, clamp grade) plus a root ErrorBoundary with Export / Reset recovery. |
| High | StudyPaceModal.tsx:19-23, DetailedView.tsx:63 | Modal is always mounted in DetailedView and seeds name/date/goal with useState once. Switching (or adding) a student from the Navbar inside Detailed view leaves the OLD student's values in the form; Save then writes them onto the NEW active profile (renames student, overwrites test date/goal). | Probe: Alex + Bea, open Detailed view, switch to Bea via navbar select (value p2), open pace modal: name input shows "Alex". | Render modal only when open (as ParentHome does) or key it by profile.id. |
| High | ProgressContext.tsx:76-78; no `storage` listener anywhere | Two tabs/windows each hold the full state and last write wins; the other tab's attempts, students, edits are silently lost. | Probe: other "tab" writes an attempt into the v2 key; the app then saves any change; the attempt is gone. | Listen to `storage` events and merge/reload, or re-read and merge by profile id / attempt id before write; at minimum a version counter and a "changed in another tab, reload" banner. |
| Medium | ProgressContext.tsx:76 / saveState:127-133 | Quota or blocked write is swallowed with console.error. Family keeps practicing, sees normal UI, nothing persists. | Probe: setItem throws for v2 key -> no alert, no message. | saveState returns ok/err; show a persistent "Progress is not being saved" banner and offer Export JSON. |
| Medium | ProgressContext.tsx:69 (`loadState(localStorage)`) | Reading the `localStorage` global itself throws when site data is blocked. DisclaimerGate guards this; ProgressProvider does not. | Probe: getter throws; after accepting the disclaimer the app crashes ("denied"). | try/catch around the accessor; fall back to in-memory storage plus the not-saving banner. |
| Medium | QuizRunner.tsx:39-46; activeSession.ts (stores option label only) | Saved answers are option LABELS. If authored content is edited after deploy (options reordered, key fixed) a resumed session maps the label to a different option, and attempt history's isCorrect is frozen and never re-derived, so old wrong keys stay in mastery forever. | Code reading. Generated items are safe: 0 of 348 template x seed resolves differ between calls. | Store selected option text with the label and re-grade at load, or add a contentVersion to sessions/attempts. |
| Medium | KidPractice.tsx:107-140 | After "Check my answer" the focused button is removed and focus drops to body; the "Nice!/Not quite" feedback is not in an aria-live region; option buttons expose no selected state (colour only). | Keyboard probe: Tab/Enter completes a session, but activeElement is BODY after Check; no aria-live/role=status; no aria-pressed on options. | role=radiogroup/radio or aria-pressed; move focus to feedback heading or Next; wrap feedback in role=status. |
| Medium | QuizRunner.tsx header, modals, StudyPaceModal | Icon-only buttons (back arrow, timer) are named only by `title`; timer button name is just "3:04". Navigator / confirm-submit / scratchpad / calculator overlays have no role=dialog, focus trap or Escape. Icon buttons about 32px (below 44px). StudyPaceModal labels lack htmlFor (name/date/goal). | Code reading. | aria-labels, dialog semantics, 44px targets, label association. |
| Low | QuizRunner.tsx:57-60,78-84 | Elapsed seconds are saved only on interaction; reload loses up to the seconds since the last click (Stop saves correctly). Tick counting under-counts in a throttled background tab. Pause state is not persisted. No timer runs while paused or after Stop (interval cleared) - verified by reading. | Code. | Store timestamps and derive elapsed. |
| Low | QuizRunner.tsx snapshot | Answers for refs that no longer resolve are dropped on the next save (unrecoverable). | Code. | Keep unknown answers in the snapshot. |
| Low | activeSession.ts sessionToAttempt id `attempt-${ms}` | Not unique across tabs/devices; used as identity. | Code. | Add a random suffix. |
| Low | KidPractice.tsx stop = finish | Stop on practice grades and closes the session; unanswered questions are gone (consistent with spec 223-224). Copy says "save your progress", a parent may expect to resume. | Code + spec. | Copy tweak. |
| Process | .github/workflows/deploy.yml | Deploy runs on push to master independently of ci.yml; a red CI does not block publishing wrong content. | Read workflows. | Make deploy depend on CI (workflow_run or reusable workflow). |

Checked and found OK: double-click Submit (1 attempt, session cleared; KidPractice also has finishedRef); Stop during feedback (answer kept and graded); resume replays same refs and answers; generated refs deterministic; checkAnswer label/text cross collision 0; 1000 path sessions have no duplicate refs, no unresolvable refs, exact sizes; no quiz has duplicate or unresolvable ids; an attempt is recorded against the active profile at write time and sessions live on the profile, so no wrong-student path found within one tab; deleting the active student reassigns to profiles[0]; last student cannot be deleted; no grade-change UI exists (only via edited storage, see crash finding).

## Part 2: End-to-end plan

Tool: Playwright (@playwright/test), Chromium + WebKit (iPad/iPhone Safari matters for kids), optional Firefox. Config: webServer
`npm run preview -- --port 4173` against the production build with baseURL http://localhost:4173/ncmathssa/ (exercises the real base
path). Projects: desktop-chromium, iPhone 13 (webkit), iPad, Pixel 7. Add @axe-core/playwright for a11y scans.
CI: new `e2e` job in ci.yml after build: setup-node, npm ci, `npx playwright install --with-deps chromium webkit`, npm run build,
`npx playwright test`; cache ~/.cache/ms-playwright; upload report/traces on failure; retries 1 in CI only. Gate deploy.yml on CI and
add a post-deploy smoke job (scenarios 1 and 2) against https://frictionlesscode.github.io/ncmathssa/.

Scenarios jsdom cannot cover (effort = write + stabilise):
1. Base path + asset smoke: load /ncmathssa/, no console errors, no 404s. 0.5 h
2. Full kid session with reload after every step (disclaimer, first run, check-up Q1, answer, reload, Continue count correct, finish, summary numbers, reload, home readiness same). 3 h
3. Persistence across browser restart (persistent context). 1 h
4. Two-tab conflict: attempt in A, edit in B, assert nothing lost (fails today; guard for the two-tab finding). 2 h
5. Timer with page.clock: pause holds value, stop/resume keeps seconds, submit shows time. 2 h
6. Phone layout (375x667, 320x568): no horizontal scroll, sticky header/footer reachable, options >=44px, on-screen keyboard does not hide controls; screenshot baselines for ParentHome, KidPractice, QuizRunner, StudyPaceModal. 4 h
7. Keyboard-only practice and check-up with focus assertions plus axe on every screen. 3 h
8. Multi-student: create two, switch, delete active, clear history; the Detailed-view stale-modal case. 2 h
9. Storage seeding via addInitScript: v1 real fixture, corrupt v2, dangling active id, quota, blocked storage; assert no white screen and no silent wipe. 3 h
10. Stale deploy: serve build A, load, swap to build B (new hashes), reload with cached index.html; assert recovery. No service worker exists, so the risk is a cached index.html pointing at deleted hashed assets on Pages. 3 h
11. Print report renders under print media, chrome hidden. 2 h
12. Full practice-test pass via keyboard; verify score, pass flag, home state. 2 h
About 28 h to first green suite plus about 4 h CI wiring.

Content-QA process
- Property test every template (fast-check): exactly one correct option, unique option texts, correct answer recomputed by an independent reference function in the test (not the generator's answerText), each misconception distractor equals what the stated error yields, no unresolved tokens in prompts. 500+ seeds per template in CI, 50k nightly.
- Golden answer-key file: export every authored question and 20 seeded instances per template to a content-key JSON (prompt, options, marked answer, standard), signed off by a teacher; CI fails on any diff from the signed snapshot so any generator/text change forces re-review.
- Standard-coverage matrix test per grade (each NC standard has items; codes belong to that grade; no Common Core-only content).
- Reading-level lint per grade and banned-phrase checks (e.g. brackets/braces in grade 5).
- contentVersion in state and sessions; snapshot test for authored-id stability.
- A "report a wrong question" link carrying the question id to feed the review loop.
