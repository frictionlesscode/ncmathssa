# Task 19 fix round 1 — required findings (reviewer's text verbatim, controller rulings after each)

The task review APPROVED Task 19 with zero Critical/Important. The controller has ruled the
eight Minor findings below REQUIRED for this round: each is either child/parent-facing
content that is false or mis-attributable, a standard keyConcept left uncovered, or a test
that asserts nothing. Findings 2, 3, 11 and 12 of the review are deferred, not in scope —
do not touch them (in particular, leave the rank-pinning tests' `toEqual([0, 1])` as is).

## F1 (review #1) — MD.7's five-minute marks :05–:25 appear nowhere

> `md7-clock-to-five-minutes.ts:23-24` states something false. It says ":05 to :30 — is
> read in the authored items". The authored MD.7 times are only 8:15, 3:45, 8:00 and 2:30
> (`authored.md.ts:830-967`). So :05, :10, :20 and :25 appear nowhere in MD.7 content, for
> a standard titled "to five minutes". `templates/index.ts:~163-165` repeats the claim more
> loosely. Restricting the template to :35–:55 is defensible, since it keeps the next-hour
> error live at every seed. Fix: correct the docstring, and add one authored item at, say,
> :20 or :25.

Ruling: required. Keep the template's :35–:55 range. Add at least one authored MD.7 item
whose time is at :05, :10, :20 or :25 (a non-quarter five-minute mark), with distractors
from named errors, and make both docstrings true.

## F2 (review #4) — `g2-md8-04` "25¢" is reachable by several errors

> `g2-md8-04` "25¢" can be reached by several errors (`authored.md.ts:1078`). It is tagged
> nickel/dime mix-up (25 + 5 + 5 = 35, and 60 − 35 = 25). Counting only one dime
> (25 + 10 = 35) gives the same 25, and 25¢ is also the value of the quarter the prompt
> names. The tag can mis-report the error. Pick a coin set where the nickel/dime value is
> unique to that error.

Ruling: required — the Global Constraints say a mis-filed tag "tells a parent their child
made a mistake they did not make, which is worse than no tag at all." Choose values so each
distractor is reachable only by its tagged error, and check the item's other distractors
the same way after the change.

## F3 (review #5) — two estimation items blame wording their prompts don't use

> `g2-md3-01` and `g2-md3-04` (`authored.md.ts:329/353`, `423/446`), and the tag
> `measured-length-with-a-unit-of-time` (`misconceptions.ts:~1786-1788`), explain the
> "minutes" distractor as `"how long" heard as time`. But the prompts say "the length of a
> new crayon" and "the length of a car". Either change the prompts to "About how long is…"
> or drop the "how long" rationale.

Ruling: required. Either fix is acceptable; the comment, the explanation text and the
tag's description must all agree with the prompt the child actually reads.

## F4 (review #6) — centimeters are never the keyed unit in MD.3; its test guards nothing

> Centimeters are never the keyed unit in MD.3. keyConcept 2 is "Estimating in centimeters
> and meters". Centimeters appear only as a rejected option (`g2-md3-03`). The five-unit
> test at `authored.md.test.ts:174-181` passes on distractor text and on MD.1's tool item
> (`g2-md1-02`), so it doesn't guard what its comment claims. Add a centimeter estimate,
> such as an eraser at about 5 cm.

Ruling: required — both halves. Add an MD.3 item keyed in centimeters, and make the test
check the unit of the CORRECT option of MD.3 items (or otherwise assert exactly what its
comment claims), so it fails if a keyed unit disappears.

## F5 (review #7) — `md1-read-a-ruler.ts`'s start-mark exclusion is applied to d = s only

> One exclusion rationale in `md1-read-a-ruler.ts` isn't applied consistently. The file
> excludes d = s so a child who answers the start mark can't hit the key (lines 31-33,
> 79-85). But d+1 = s (3 spans) and d−1 = s (4 spans) still let that child land on a
> distractor tagged with a marks-counting error they didn't make. Either apply the same
> logic to d±1 or drop the stated rationale.

Ruling: required; apply it consistently (exclude d±1 = s as well) unless doing so empties
or badly skews the space — if so, say why in the fix report and drop the rationale instead.
Update the sweep counts and any pins the change moves (re-run the generator for the new
literals; never hand-write them).

## F6 (review #8) — three "would collide" tests assert arithmetic identities

> Three "would collide" tests assert arithmetic identities, not the generator.
> `md1-read-a-ruler.test.ts:168-172` checks `1 + d === d + 1`. `md7…test.ts:165-173` builds
> `swapped` and `key` from the same numbers. `md8…test.ts:160-166` checks
> `25 + 5k + 10k + 1 === 25 + 10k + 5k + 1`. Only their `RULER_SPANS` / `CLOCK_READINGS` /
> `COIN_SETS` membership lines test anything. They're harmless, and the md5/md10
> counterfactuals are the real kind.

Ruling: required. Remove the tautological assertions, or replace them with real
counterfactuals in the md5/md10 style (show the excluded parameter WOULD produce a
duplicate option if the generator drew it). Keep the membership assertions.

## F7 (review #9) — test title does not match what it checks

> `authored.test.ts:73`: the test title doesn't match what it checks. It says "shares no
> prompt" but the test keys on prompt + figure (line 76). Rename it.

Ruling: required.

## F8 (review #10) — `g2-md2-03` nearly duplicates `g2.md2.two-units`

> `g2-md2-03` (`authored.md.ts:282`) nearly duplicates `g2.md2.two-units`. Same name
> (Maya), same cm/inch pair, same hint sentence. The exact-prompt guard won't catch it.
> Vary the name and the unit pair.

Ruling: required.
