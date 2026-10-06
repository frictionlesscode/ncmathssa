/**
 * A tiny solver for Grade 1 arithmetic, for TESTS: whole numbers joined by
 * + and −, an equal sign, and at most one ☐.
 *
 * It exists so a Grade 1 test can solve a question cold instead of trusting
 * the key it was handed. `authored.oa.test.ts` uses it to recompute the keyed
 * answer of every authored item it can read, and the NC.1.OA.8 missing-part
 * template test uses it to show each generated equation has exactly one
 * solution. One copy, shared, so the two checks cannot drift apart.
 *
 * Strict on purpose: anything it does not recognise throws, so a typo in an
 * option ("5 + = 9", a hyphen for a minus) fails loudly instead of quietly
 * evaluating to something.
 */

/** The value of an expression such as "10 − 3 + 4". */
export function evaluate(expr: string): number {
  const tokens = expr.trim().split(/\s+/);
  if (tokens.length % 2 === 0) throw new Error(`not an expression: "${expr}"`);
  if (!/^\d+$/.test(tokens[0])) throw new Error(`not a number in "${expr}"`);
  let total = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    if (!/^\d+$/.test(tokens[i + 1])) throw new Error(`not a number in "${expr}"`);
    const n = Number(tokens[i + 1]);
    if (tokens[i] === '+') total += n;
    else if (tokens[i] === '−') total -= n;
    else throw new Error(`unknown operator "${tokens[i]}" in "${expr}"`);
  }
  return total;
}

/** True if an equation's two sides name the same amount. */
export function holds(equation: string): boolean {
  const sides = equation.split('=');
  if (sides.length !== 2) throw new Error(`not an equation: "${equation}"`);
  return evaluate(sides[0]) === evaluate(sides[1]);
}

/** Every whole number 0-40 that makes an equation with one ☐ true. */
export function solutions(equation: string): number[] {
  if ((equation.match(/☐/g) ?? []).length !== 1) throw new Error(`not one ☐: "${equation}"`);
  const out: number[] = [];
  for (let n = 0; n <= 40; n++) if (holds(equation.replace('☐', `${n}`))) out.push(n);
  return out;
}
