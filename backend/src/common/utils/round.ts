/** round(3.456, 1) -> 3.5 */
export const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;
