/** "1 ten" but "9 tens". Every count in a worked solution runs through this,
 *  because a solution that reads "1 tens" is read by an eight-year-old. */
export function count(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}
