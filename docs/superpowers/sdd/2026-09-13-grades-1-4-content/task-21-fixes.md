# Task 21 — fix round 1 findings

Sources: the controller's browser check (Step 8) on `f81e24b`, with a Grade 2 profile and a Grade 5
profile at a 2560 px-wide viewport, plus the opus task review's Minors (M1–M8), which touch the same lines.
Every item below is REQUIRED in this round.

**Standing rule for every item: Grade 5 output must not change** unless the item says otherwise, and each
changed component keeps a Grade 5 assertion plus a Grade 2 assertion on real rendered text.

---

## F1 — Grades 3–5 combined-band labels break the layout (regression from this diff; merges review M1 + M3)

`weightValue` → `weightLabel` now renders the full combined-band wording into two tight spots:

- `CurriculumView.tsx` ~121, the filter pills: "MD (19–23% (Measurement & Data and Geometry combined))" and
  "G (19–23% (…combined))". At Grade 5 the pill row now breaks into two rows, and the page's h1 and paragraph
  get squeezed into a narrow column beside it. At Grade 2, where the pills are short, the header lays out normally.
- `Dashboard.tsx` ~280, the domain card badge: "MD • 19–23% (Measurement & Data and Geometry combined) Weight".
  At Grade 5 it wraps to two lines and pushes the MD and G cards' titles below their neighbours.

Required:
- The pills and badges get a compact form that still marks the band as shared. The global constraint
  forbids presenting 19–23% as MD's own weight, so the old bare "MD • 19–23%" is not acceptable either.
  The form must fit on one line, with no nested parentheses and no "Weight" trailing after a parenthetical.
  Examples: "MD+G 19–23%", or "MD • 19–23% with G". You choose, but produce it from ONE shared helper next to
  `weightLabel`/`weightValue` in `registry.ts`, not by string surgery in each component.
- The full "(Measurement & Data and Geometry combined)" wording stays where there is room: the CurriculumView
  domain header and the printed-report table. It may also go in a `title` attribute on the compact label.
- `QuizzesListView`'s module-drill badges use the same compact form, so all three places read alike.
- Tests: pin the Grade 5 MD string exactly in `CurriculumView.test.tsx` (pill) and `Dashboard.test.tsx`
  (badge), as review M1 asked. Pin the Grade 2 values exactly: the QuizzesListView badge
  (e.g. `/^OA • \d+%$/`, not `/OA •/`) and the Dashboard badge ("OA • 17% Weight" or its new form), as M3 asked.

## F2 — the study guide tells every grade its traps are "4th/5th grade"

`StudyGuideModal.tsx:111` hardcodes "Common 4th/5th Grade Traps to Avoid", and it shows on NC.2.OA.1's
guide. Derive the heading from `curriculum.grade`, or drop the grade from it. Add a test that a Grade 2
guide's heading has no "4th/5th".

## F3 — the Testing Center's mock header is Grade 5's

`QuizzesListView.tsx:124` hardcodes "Timed 60-65 Minutes • Divided into Calculator Inactive & Active".
At Grade 2 the only mock is 40 minutes, and no Grade 2 item allows a calculator. At Grades 3 and 4 the
mocks are 55 and 60 minutes.
- Derive the minutes from the current curriculum's `isMockAssessment` quizzes: a single value, or
  "min-max" when they differ.
- Show the calculator clause only when the mock items really split into calculator-allowed and
  calculator-inactive. Check the data; don't assume.
- Grade 5 must still read exactly "Timed 60-65 Minutes • Divided into Calculator Inactive & Active".
  Test Grade 5 and Grade 2.

## F4 — the printed report's mock advice is Grade 5's

`PrintReportModal.tsx`, recommendation 3 says "complete at least two full mock exams within a 60-minute
window before the Wake County test day". Grade 2 has one 40-minute mock, and Grades 3 and 4 each have one
(check them). Derive the count and minutes from the curriculum's mocks, and keep Grade 5's sentence
unchanged. Test Grade 5 and Grade 2.

## F5 — unweighted-grade advice contradicts itself (review M8, out-of-diff lines, now required)

- `PrintReportModal.tsx:116`: the composite line ends "Focused drill on high-weight domains is
  recommended." Item 1 on the same page says there is no official weight to rank by.
- `Dashboard.tsx:235`: "Drill High-Weight Domains".

For `weighting.kind === 'even-by-standard-count'`, both must advise the domains furthest below the bar.
Grade 5 is unchanged. Test Grade 2.

## F6 — the "Focus by Standards Share:" label contradicts its own sentence (review M2)

`PrintReportModal.tsx:451`: the sentence says to prioritise the domains furthest below the bar, not the
share. Give it a label that matches the advice, e.g. "Focus on the Biggest Gaps:". Update the Grade 2
print test.

## F7 — "Blueprint" page chrome at a grade that has no blueprint

Controller ruling: in scope for Task 21, whose title is "stop the UI claiming a blueprint that does not
exist". A Grade 2 parent currently reads:
- `Navbar.tsx:84`, the top banner: "Grade 2 Mathematics Blueprint (targets Grade 2)".
- `CurriculumView.tsx:44`, the eyebrow "Grade 2 Content Blueprint", and `:47`, the h1
  "Curriculum Structure & Standard Blueprints".
- `Dashboard.tsx:65`: "…(NCSCOS) Grade 2 Mathematics blueprint with multi-step reasoning…".

For `weighting.kind === 'even-by-standard-count'`, none of these may say "blueprint". Use "standards"
wording, e.g. "Grade 2 Mathematics Standards", "Curriculum Structure & Standards". Blueprint grades keep
their exact current wording. Add a Grade 2 assertion to each component's test that the rendered page has
no `/blueprint/i` in these spots. Keep the honest disclaimers ("there is no official state blueprint")
that deliberately mention the word; scope the assertions so those still pass.

## F8 — the browser title says Grade 5 for every grade

`index.html:7` reads "NC Math SSA Prep | North Carolina Grade 5 Math Acceleration (WCPSS)", and `:8`'s meta
description says "5th Grade Mathematics (… NCSCOS blueprint)". The app now serves Grades 2–5 (Grade 1
comes in Task 26). Make both grade-neutral in `index.html` itself, with no runtime `document.title` code.
Don't claim a blueprint in the description.

## F9 — `types.ts:26` points readers at the wrong renderer (review M4)

The comment says to "render it through weightLabel()". That is wrong for Grades 1–2, and it is the trap
Task 26 (Grade 1 registration) would walk into. Point it at the renderer that is right at every grade. Also
fix the asymmetry: `weightValue` returns '0%' for an unknown domain on an unweighted grade, where
`weightLabel` returns ''. Make them agree, and add a test.

## F10 — `registry.test.ts:972-979` comment history is wrong (review M5)

The comment says the pin was "grade 2 until this task". Task 16 chose grade 1 deliberately. Correct the
comment.

## F11 — `grade2/quizzes.ts:855-861` rounding comment is muddled (review M6)

State it plainly: nearest-integer rounding of 4.3 / 8.7 / 9.8 / 2.2 gives 4 / 9 / 10 / 2, which totals 25.

## F12 — `grade2.test.ts:705` has an unnecessary `domainId as never` cast (review M7)

`DomainId` is `string`. Remove the cast.

---

Covering tests to run while iterating: `CurriculumView.test.tsx`, `Dashboard.test.tsx`,
`QuizzesListView.test.tsx`, `PrintReportModal.test.tsx`, the StudyGuideModal and Navbar tests (create
focused ones if none exist), `registry.test.ts`, and `grade2.test.ts`. Then run the full gate once before
committing: lint 0, `tsc -b --noEmit` clean, `vitest run` green, `npm run build` ok.
