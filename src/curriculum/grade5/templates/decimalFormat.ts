/**
 * Exact decimal text, built by shifting digit strings rather than by
 * dividing. A generator that computes `456 / 100000` and formats the float
 * can emit `0.0045599999999999995`; every value here is an integer mantissa
 * and a power-of-ten exponent, so the printed form is always exact.
 */

/** `mantissa * 10^exponent`, written out in full. Not normalized: the
 *  mantissa's digits are preserved exactly as given, so distinct exponents
 *  over the same mantissa always produce distinct text. */
export function decimalString(mantissa: number, exponent: number): string {
  if (!Number.isInteger(mantissa) || mantissa < 0) {
    throw new Error(`decimalString: mantissa must be a non-negative integer, got ${mantissa}`);
  }
  if (exponent >= 0) return `${mantissa}${'0'.repeat(exponent)}`;

  const places = -exponent;
  let digits = `${mantissa}`;
  if (digits.length <= places) digits = '0'.repeat(places - digits.length + 1) + digits;
  const cut = digits.length - places;
  return `${digits.slice(0, cut)}.${digits.slice(cut)}`;
}

/** Same value, in canonical form: trailing zeros after the decimal point are
 *  dropped, so equal values always share one spelling and unequal values
 *  never do. */
export function trimmedDecimal(mantissa: number, exponent: number): string {
  const text = decimalString(mantissa, exponent);
  if (!text.includes('.')) return text;
  return text.replace(/0+$/, '').replace(/\.$/, '');
}
