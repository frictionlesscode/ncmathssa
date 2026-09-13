# Standards provenance

`nc-standards-1-5.json` holds the NC Standard Course of Study mathematics
standards for grades 1-5: 108 standards, each with its code, cluster heading,
full text, and sub-bullets.

## Sources

Two independent NCDPI publications were used, so that no standard rests on a
single document (or on recall):

1. **2025 Quick Reference Guides**, one PDF per grade, from the NCDPI
   publications catalog (`is184`-`is188`). Used to establish the authoritative
   *list* of standard codes per grade.
2. **K-12 Mathematics Standard Course of Study**, the NCDPI-published Google
   Doc linked from the Mathematics "Standard Course of Study & Supporting
   Resources" page. Used for the standard *text*, because its plain-text export
   is free of the PDF font-encoding artifacts described below.

## Verification

The code list extracted from source 2 was diffed against the code list
extracted from source 1, per grade. All five grades match exactly:

| Grade | Standards | OA | NBT | NF | MD | G |
|-------|-----------|----|-----|----|----|---|
| 1     | 23        | 8  | 7   | -  | 5  | 3 |
| 2     | 23        | 4  | 8   | -  | 9  | 2 |
| 3     | 20        | 7  | 2   | 4  | 6  | 1 |
| 4     | 25        | 4  | 6   | 6  | 6  | 3 |
| 5     | 17        | 2  | 5   | 4  | 4  | 2 |

Grade 5 was additionally diffed against `src/curriculum/grade5/standards.ts`,
which the app already shipped. It matched on all 17 codes, which is what
justifies trusting the extraction for the other four grades.

## Defects found in the sources

Four transcription errors exist in the published Google Doc (source 2). Each was
confirmed against the Quick Reference Guide (source 1) and corrected during
extraction. None of them are errors in the standards themselves.

- `NC.5MD.1` - missing the dot after the grade.
- `NC.4.NBT. 7` - stray space inside the code.
- `NC.2.MD.4Measure to determine...` - missing the space after the code.
- Grade 5's fractions domain is headed "Number and Operations in Base Ten";
  it should read "Number and Operations - Fractions". Because of this, domain
  membership is derived from each standard's own code rather than from the
  heading above it.

The Quick Reference Guide PDFs have their own problem: the grade 1 PDF's font
encoding splits the first glyph of many text runs, so `pypdf` renders
`NC.1.OA.1 Represent` as `N C.1.O A.1   R epresent`. This is why source 1 is
used only for the code lists and not for the standard text.

## Caveat carried forward

NCDPI publishes EOG assessment blueprints starting at grade 3. Grades 1 and 2
have no official domain weighting, so a grade 1 or 2 curriculum module cannot
set `weighting.kind` to `'ncdpi-blueprint'`.

---

# Blueprint provenance

`nc-eog-blueprint.json` holds the NCDPI EOG mathematics domain weight bands for
grades 3, 4 and 5.

## Source

**EOG Mathematics Grades 3-8 Test Specifications**, NCDPI Office of
Accountability and Testing, April 2026, Table 1. Corroborated against the
February 11, 2020 edition of the same document, whose Table 1 is identical.

## What this corrected

The app's grade 5 module claimed two weights that appear in no NCDPI
publication: Measurement & Data at `12-15%` and Geometry at `7-10%`. NCDPI
weights those two domains as a **single combined band** - 19-23% at grade 5,
23-27% at grades 3 and 4. The fabricated pair had midpoints of 13 and 8, which
sum to 21, exactly the combined midpoint, so the app's "weights sum to 100"
test passed and the invention went unnoticed.

This mattered because `officialWeightRange` is displayed in five places,
including the printed parent report, under the label "NC Blueprint Weight",
and `grade5/index.ts` cites the NCDPI blueprint as its source. Two of the five
figures were not from that blueprint.

`DomainInfo` now carries an optional `weightGroup`, `domainWeight()` divides a
shared band among its members by standard count rather than handing each member
the whole band, and `weightLabel()` renders a grouped band as
"19-23% (Measurement & Data and Geometry combined)" so the reader is told the
figure is shared.

## Caveat carried forward

Verifying that grade 5's standard *codes* matched the official list was not
sufficient to establish that the grade 5 module was accurate. The codes were
right and the weights were invented. Any future grade must have its codes,
its weights, and its `ssa` policy figures each checked against a named
document.
