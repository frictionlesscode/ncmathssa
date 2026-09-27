# Task 7 fix round 2 — final

The re-review APPROVED the fix round. The new mathematics is clean: no wrong key, no
second correct answer, no distractor comment that fails to produce its option, both
decomposition items offer exactly one valid decomposition. Nothing below is a wrong
answer. This round is small and it closes the task.

Three of these are the SAME defect class as fixes you just made, which is why they are
worth another pass rather than parking.

**G1. The new NF.6 generator prints thousandths on all 71 draws, and the F3 paragraph
you just narrowed does not mention it.** You corrected that header one round ago for
exactly this reason; the new generator then reintroduced the gap. Update both the header
paragraph and the generator's own docstring to name it. The generator is fine — a
`0.0tu` distractor is the shifted-place error NF.6 exists to catch. The claim is what is
wrong, again.

**G2. `g4-nf3-04`'s new reasonableness line adds 7/8 + 4/12.** Those are unlike
denominators, which the file header says the bank never asks and which are NC.5.NF.1,
a grade above. It is prose rather than a question, but a child reads it. Rewrite it
within like denominators. (This is the line you rewrote last round after finding the
old one false — the replacement is true, it is just out of grade.)

**G3. The "exhaustive" sweeps re-derive option texts inline instead of calling
`generate()`.** A sweep that recomputes what the generator should produce and checks its
own arithmetic is not testing the generator — it is testing a copy of it, and the two
can drift exactly the way `numericValue`'s inline copy could before F9. Call `generate()`
in the sweeps. The re-review drove 50,000 seeds and found no disagreement today, so this
is about keeping the guard real, not about a live bug. Related: the 300-seed tests reach
only 69 of the NF.6 generator's 71 draws — raise the seed count or drive the parameter
space directly so every draw is covered.

**G4. `g4-nf7-05` is a near word-for-word twin of `g4-nf2-04`.** Reword it. Two items a
child reads as the same question are worth one item.

**G5. Two comment/prose slips.** `g4-nf7-05` option B's comment says "8 is one digit"
where it means 0.6 — the option still matches its tag, only the comment is garbled.
`g4-nf3-02`'s new check calls a 4/5-litre excess "a litre more", which is the looseness
F10 was aimed at.

## Park, do not fix

`g4-nf3-05`, `g4-nf3-06` and `g4-nf1-04` are expression-shaped, so `numericValue` returns
null for their options and the automated value guard does not cover them. That is
inherent to offering equations as options and the re-review hand-checked all three
clean. Add a one-line comment on each saying the value check is by hand and why, so the
next person does not assume the guard has them.

## Constraints

- `standards.ts` is the authority. If anything above disagrees with it, it wins and you
  say so.
- Do not re-author anything not named here. The bank is approved.
- Run `npx vitest run`, `npm run lint`, `npx tsc -b --noEmit`. Baseline is 538 passing.
