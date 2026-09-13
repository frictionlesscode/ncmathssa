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
