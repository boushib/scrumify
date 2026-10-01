/**
 * Rank for an item dropped between two neighbours (fractional ranking), so a
 * move only rewrites one issue instead of renumbering the whole column.
 */
export const rankBetween = (before?: number, after?: number) => {
  if (before === undefined && after === undefined) return 1000
  if (before === undefined) return after! - 1000
  if (after === undefined) return before + 1000
  return (before + after) / 2
}
