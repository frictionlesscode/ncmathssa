/**
 * RULING 14-1, in one place.
 *
 * NC.3.MD.2 is CUSTOMARY measurement — "cups, pints, quarts, gallons, ounces,
 * and pounds", and lengths "to the quarter-inch and half-inch, and feet and
 * yards". Grams, kilograms and liters are Common Core 3.MD.A.2's vocabulary.
 * NC's metric work is Grade 4's NC.4.MD.1 and already ships as
 * ../grade4/templates/md2-metric-convert.ts.
 *
 * A metric unit anywhere in Grade 3 Measurement & Data is another curriculum's
 * content printed under a real NC code, inside a 23–27% band, and it would pass
 * every other test in this suite. This pattern is the one thing standing
 * between the two, so it lives here rather than being re-declared in each of
 * the five test files that use it: five copies drift, and a copy that quietly
 * stops matching anything is precisely the failure it exists to prevent.
 * ./authored.md.test.ts tests it in BOTH directions - against strings it must
 * catch as well as strings it must not.
 *
 * The word boundaries are load-bearing in one direction too: `\bmeter\b` does
 * not match "perimeter" or "diameter", because each has a word character
 * before the m. Measurement & Data cannot be written without those two words.
 */
export const METRIC_UNIT =
  /\b(gram|grams|kilogram|kilograms|kg|liter|liters|litre|litres|milliliter|milliliters|millilitre|millilitres|mL|centimeter|centimeters|centimetre|centimetres|cm|millimeter|millimeters|millimetre|millimetres|mm|kilometer|kilometers|kilometre|kilometres|km|meter|meters|metre|metres)\b/i;

/** Every measurement unit Grade 3 Measurement & Data is allowed to print,
 *  taken from NC.3.MD.2's first two keyConcepts. */
export const CUSTOMARY_UNIT =
  /\b(inch|inches|foot|feet|yard|yards|cup|cups|pint|pints|quart|quarts|gallon|gallons|ounce|ounces|pound|pounds)\b/i;
