# Task 20 fix round 1 — findings (reviewer's text verbatim, controller rulings after each)

The task review returned **Needs fixes**: five Important findings (one of them also the
spec ❌), zero Critical. Every Important below is required. The controller has also ruled
REQUIRED the eleven Minors listed after them — each is false, misleading or hard-to-read
text a child or parent reads, a keyConcept the guide omits, or a guard with a hole — plus
one out-of-diff fix (X1) to a template that states the same false rule as I2.

Every edit to child-facing text (`coreConcept`, `stepByStepMethod`) must stay in short
sentences a seven-year-old can follow read aloud. Re-solve any worked example you touch.

## Important

### I1 — NBT.8's child-facing rule is false for subtracting 10 across a hundred
> `studyGuides.ts:447,457`: NBT.8's child-facing rule is false for subtracting 10 across a
> hundred. The guide says adding or subtracting 10 "changes only the tens digit — unless
> that digit is already 9", and Step 3 repeats this. But 305 − 10 = 295 changes the
> hundreds too, and 395 − 10 = 385 does not roll over at all. The NBT.8 template draws
> `n ∈ [200,800]` with both directions (`nbt8-ten-or-hundred.ts:60-62`), so "10 less than
> 305" is a real item a child will see. Fix: give the subtraction case (a tens digit of 0
> borrows from the hundreds). Add the matching trap too.

### I2 — NBT.2's "Only the tens digit changes" is false across a hundred
> `studyGuides.ts:234,240`: NBT.2 says "Only the tens digit changes" when skip-counting by
> 10s, and child-facing Step 3 says to "check only the place that should change actually
> changed". This is false whenever the count crosses a hundred. The NBT.2 template starts
> 10s counts at `10×[10..68]+[1..9]` (`nbt2-skip-count.ts:68`), so a start of 475 gives
> 485, 495, 505. That happens in roughly 30% of the 10s draws. A child following Step 3 at
> that point is steered to 405. Fix: state the rollover, as the NBT.8 guide already does
> at `:451`.

### I3 — MD.10 contradicts the single-unit-scale keyConcept; the represent half is thin
> `studyGuides.ts:772,775,792`: the MD.10 guide contradicts the single-unit-scale
> keyConcept, and the represent half is thin. The child-facing `coreConcept` says a graph's
> scale "is not always exactly 1", and a rule says "Each picture or space might stand for
> more than 1". `standards.ts:287` says "with a single-unit scale", and the grade's own
> template says "No scale of 2 or 5 (that is Grade 3's NC.3.MD.3)"
> (`templates/md10-bar-graph-how-many-more.ts:19`). This is Grade 3 content in a Grade 2
> guide. The MD.10 "represent" half (drawing the graph) gets one rule line (`:774`) and
> nothing else. The worked example (`:792`) reuses the tally chart from
> `authored.md.ts:1193` but drops that item's actual task ("Which bar graph shows the same
> data?"). It only asks "How many votes did Dog get?" Fix: say the Grade 2 scale counts by
> ones. Make the worked example the organize/represent step from `authored.md.ts:1193`.

Also correct the report's claim that the guide covers "reading a tally chart into a bar
graph" if it is still untrue after the fix.

### I4 — MD.3 child-facing Step 2 gets the unit sizes backwards
> `studyGuides.ts:566`: MD.3 child-facing Step 2 gets the unit sizes backwards. It says
> "feet or meters for medium things, yards for bigger things", which tells a seven-year-old
> a meter is smaller than a yard. The guide's own rule at `:561` says "a meter is a little
> longer than a yard". Fix: "feet for medium things, yards or meters for bigger things".

### I5 — four `whyItMattersForSSA` lines state false facts about the curriculum
> `:294` (NBT.3) calls "comparing numbers and adding within 1,000" "the next two
> standards". The next two are NBT.4 (compare) and NBT.5, which is within 100. `:367`
> (NBT.5) calls adding and subtracting within 1,000 "the very next standard". The next
> standard is NBT.6 (three addends). Within 1,000 is NBT.7. `:439` (NBT.7) says Grade 3
> "uses exactly the same trades one place further". `grade3/standards.ts:283` says
> NC.3.NBT.2 is "up to and including 1,000", so there is no further place. This looks
> written from recall. `:331` (NBT.4) credits a "left-to-right habit" with making addition
> and subtraction within 1,000 come out right. This contradicts the NBT.7 guide's "Ones,
> then tens, then hundreds" (`:413`).

Ruling: required. Every claim about what comes next — in Grade 2 or Grade 3 — must be
checked against `grade2/standards.ts` / `grade3/standards.ts`, not recalled. Check the
other nineteen `whyItMattersForSSA` lines for the same class of claim while you are there.

## Out-of-diff fix, ruled into this round

### X1 — `nbt2-skip-count.ts:108` states I2's false rule to the child
> `templates/nbt2-skip-count.ts:108` tells the child "Only the tens change" for skip-counts
> by 10 that the same template makes cross a hundred. The guide copied this.

Ruling: required in this round although the file is Task 18's — it is the same false
child-facing rule as I2, emitted by the generator in roughly 30% of its 10s draws, and it
is cheapest fixed now alongside I2. Make the explanation true at every seed (e.g. branch
on whether the run crosses a hundred). Re-capture any literal pins the change moves by
running the generator — never hand-write them. Also check
`templates/nbt8-ten-or-hundred.ts`'s explanation text for the I1 claim ("only the tens
digit changes" when subtracting 10 across a hundred) and fix it the same way if present.

## Minors ruled required

- **M1** — `studyGuides.test.ts`: no test guards the 20-1 figure. Grade 3 asserts each
  guide quotes its own domain's figure (`grade3/studyGuides.test.ts:131-147`). Here a
  guide could drop "N of 23" or cite the wrong domain's count and stay green. A cheap
  assertion would be
  `` expect(why).toContain(`${domain.standards.length} of the ${STANDARDS.length}`) ``.
- **M2** — `studyGuides.test.ts:67`: `/%/` misses a spelled-out weight such as "about 35
  percent". A regex like `/%|per\s?cent/i` closes the hole for free.
- **M3** — `studyGuides.ts:433-435`: the NBT.7 worked steps state "0 − 5" and "3 − 1"
  without showing where the 0 and 3 come from (1 ten → 0, 4 hundreds → 3). Those
  reductions are exactly what the guide's own trap at `:428` warns about.
- **M4** — `studyGuides.ts:376-381`: NBT.6 leaves out the keyConcept "adding in a
  convenient order". Its own example has 27 + 13 = 40, which would show it.
- **M5** — `studyGuides.ts:852`: the G.3 rule says "Two identical pizzas" cut "corner to
  corner". The source item says square pizzas (`authored.g.ts:338`). A round pizza has no
  corners, and halving a circle through its centre always gives identical halves, so the
  missing word matters.
- **M6** — `studyGuides.ts:307`: "can be worth the same even when they look different on
  the page" is false for two three-digit numerals written normally.
- **M7** — `studyGuides.ts:323`: the NBT.4 problem asks "Which sentence … is true?" but
  gives no sentences to choose from.
- **M8** — header comment: `:34` says "MD arrays" (arrays belong to OA.4); `:7` says the
  child-facing fields use second person ("you"), but many are third person (`:117`,
  `:193`, `:847`). Make the comment true (either fix the fields or the claim).
- **M9** — `studyGuides.ts:60`: the OA.1 trap uses "answering 8 because the story already
  said 8", while 8 is the correct answer to the OA.1 worked example (`:72`). This will
  confuse a parent reading the guide.
- **M10** — hard-to-read child-facing text: `:93` "adjust by the difference" is abstract
  for a seven-year-old; `:811` (G.1) is two sentences of about 35 words each; `:232`'s
  label "Counting past 99 inside a hundred" is unclear.
- **M11** — `studyGuides.ts:812-817`: G.1's keyConcept "Drawing a shape to match
  specified attributes" is not covered.
