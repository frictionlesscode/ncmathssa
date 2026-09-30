/** A text diagram (number line, shaded bar, array) is laid out with runs of
 *  spaces or tick marks; prose is not. */
export function isTextDiagram(text: string): boolean {
  return /\S {2,}|^ {2,}|\|/m.test(text);
}
