### Task 26: Register Grade 1 and close out the plan

**Files:**

- Create: `src/curriculum/grade1/quizzes.ts`, `src/curriculum/grade1/index.ts`, `src/curriculum/grade1/grade1.test.ts`
- Modify: `src/curriculum/registry.ts`
- Modify: `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md` (§13, the verification list)

**Interfaces:**

- Consumes: everything Tasks 22–25 produced.
- Produces: `GRADE_1: GradeCurriculum` registered under key `1`. After this task `listCurricula()` returns all five grades.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/grade1.test.ts`, mirroring `grade2.test.ts` from Task 21 Step 6: `getCurriculum(1) === GRADE_1`; `ssa.passingPercent` 80 and `ssa.targetsGrade` 1; `weighting.kind === 'even-by-standard-count'`; weights totalling 100 through `domainWeight`; 23 standards all with content and `contentComplete: true`; at least 8 standards with a generator; every quiz item id starting with `g1.`; and no `%` in any domain's `officialWeightRange`.

Add one test the other grades cannot make:

```ts
  it('completes the set: every grade from 1 to 5 is now playable', () => {
    const grades = listCurricula().map((c) => c.grade);
    expect(grades).toEqual([1, 2, 3, 4, 5]);
    for (const c of listCurricula()) {
      expect(c.contentComplete, `grade ${c.grade} is registered but incomplete`).toBe(true);
    }
  });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/grade1.test.ts`
Expected: FAIL — `./index` does not exist.

- [ ] **Step 3: Write the quizzes and the curriculum module**

Create `src/curriculum/grade1/quizzes.ts` exporting `GRADE_1_QUIZZES`: `g1-diagnostic-01` (one item per standard, 23 items, `timeLimitMinutes: 30` — a first-grader's attention, not a fifth-grader's), four module drills `g1-mod-oa-01`, `g1-mod-nbt-01`, `g1-mod-md-01`, `g1-mod-g-01`, and `g1-mock-ssa-01` of roughly 20 items split by standard count.

Create `src/curriculum/grade1/index.ts` in the shape of Task 21's Grade 2 module: `grade: 1`, `label: 'Grade 1 Mathematics'`, `ssa: { passingPercent: 80, targetsGrade: 1 }`, `weighting: { kind: 'even-by-standard-count' }` with the same explanatory comment, `contentComplete: true`, and the four content fields.

Register it: add `1: GRADE_1,` to `CURRICULA`.

- [ ] **Step 4: Run the whole suite**

Run: `npm test -- --run`
Expected: PASS. Every registry-driven test from Task 3 now runs five times.

- [ ] **Step 5: Confirm the privacy constraint one last time**

Run: `grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket\|navigator.send\|analytics\|gtag" src/`
Expected: no output. This plan added thousands of lines of content; the constraint that nothing leaves the browser must survive all of it.

- [ ] **Step 6: Verify every grade in a browser**

Run `npm run dev` and, for each of grades 1 through 5: switch the profile to that grade, confirm the standard count matches the table in Task 4, open one study guide, run one quiz to its results screen, and print the parent report. Confirm grades 1 and 2 never use the word "blueprint" and never show a percentage as an official weight.

- [ ] **Step 7: Update the spec's verification list**

In §13 of `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`, record what this plan verified and what still needs a human: the standards and weights are machine-checked against `docs/sources/`, but **the mathematical correctness of the authored items themselves is not** — no test can tell whether a distractor really is what a child would compute. Name that as owner verification.

- [ ] **Step 8: Lint, typecheck, build, commit**

```bash
npm run lint && npx tsc -b --noEmit && npm run build
git add -A
git commit -m "feat: register grade 1, completing grades 1-5"
```

---

## Self-Review

Checked after writing, against the spec.

**Spec coverage.** §5 curriculum data model — Task 4. §5.1 sourcing, and grades 1–2 having no blueprint — Task 4 and Tasks 21, 26. §5.2 four domains at grades 1–2, five at 3–5 — Task 4's table. §5.3 combined bands — Task 4's weight table, the Task 3 group test, and the study-guide percentage tests. §5.4 quizzes and study guides as curriculum data — Tasks 1–2. §6 question sources — every content task. §6.1 deterministic generators — the template tests. §6.3 engineered distractors — The Content Contract and `assertAuthoredBankSound`. §6.4 integrity test — Tasks 1–3. §7.4 static quizzes retained — Tasks 11, 16, 21, 26. §8.2 curriculum from context — Tasks 1, 2, 21. §10 testing — throughout.

Not covered here, deliberately: §8.3 migration, §8.4 first run, §9 landing page, §11 repo and deploy. Those are the previous plan's work or the owner's, and none of them blocks a grade from shipping.

**Known gap carried forward.** Grade 5 has seven standards with authored items but no generator, and `NC.5.MD.4` has a single authored question. This plan does not fix that — it is Grade 5 content work, not multi-grade work — and the `hasGenerator` floors here are written per grade so they do not silently mask it.

**Ordering.** Tasks 1–3 must precede every other task: Task 5's test kit assumes Task 3's registry-driven tests exist, and Tasks 11, 16, 21, and 26 each register a grade whose quizzes and study guides are only reachable through the fields Tasks 1–2 add. Task 4 must precede every content task. Within a grade, the aggregator task (9, 14, 19, 24) must follow that grade's other domain tasks, and the register task (11, 16, 21, 26) must come last.
