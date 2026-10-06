# SDD workspace snapshot — grades 1–4 content plan

A copy of the subagent-driven-development workspace for
`docs/superpowers/plans/2026-09-13-grades-1-4-content.md`. The live workspace is
`.superpowers/sdd/2026-09-13-grades-1-4-content/`, which is gitignored as scratch; this
copy exists so the execution record survives the loss of the machine it was built on.

The live copy is authoritative. Refresh this one by re-copying the workspace's `*.md`
files at the end of each batch and at the Task 26 close-out. The `review-*.diff` files
are left out on purpose: each is `git diff BASE..HEAD` for the range in its name.

What is here:

- `progress.md` — the ledger. Every task's dispatch, review, fix rounds, and completion,
  in order. Read its tail to see where execution stopped.
- `task-N-brief.md` — the brief each implementer was dispatched with.
- `task-A-B-preflight.md` — the pre-flight audit of a batch of tasks against the sourced
  standards, before any of them ran.
- `task-A-B-rulings.md` — the binding decision on every pre-flight finding. These
  **override the task briefs** wherever they conflict, and every dispatch in the batch
  carries its rulings file.
- `task-N-report.md`, `task-7-*.md` — implementer reports and the Task 7 review/fix record.
