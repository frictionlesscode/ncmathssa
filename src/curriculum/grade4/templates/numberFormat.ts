/**
 * Comma-grouped whole numbers, for a grade whose entire Base Ten domain is
 * about reading five-digit numerals. `40000` and `40,000` are the same value
 * but not the same reading exercise, and NC.4.NBT.2 asks a student to read
 * numerals to 100,000 — so every generated number here is printed the way a
 * student would see it on the page.
 *
 * Deliberately not `toLocaleString`: its grouping depends on an ICU locale
 * that a CI container may not carry, and a generator whose option text varies
 * by environment is a generator whose pinned-seed test is a coin flip.
 *
 * Injective on the non-negative integers (grouping never merges two values),
 * so every distinctness argument written over VALUES in this directory carries
 * over unchanged to the TEXT those values are printed as.
 */
export function fmt(n: number): string {
  return `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
