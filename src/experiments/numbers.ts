/** Pure numeric guard shared by calculators. Blank inputs must not silently become zero. */
export function numeric(value: string, min = 0, max = 100000000, integer = false): number {
  const n = Number(value);
  if (!value.trim() || !Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new RangeError("Invalid input");
  return n;
}
export function estimate<T>(calculate: () => T): T | null {
  try { return calculate(); } catch (error) { if (error instanceof RangeError) return null; throw error; }
}
