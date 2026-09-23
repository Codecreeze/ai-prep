export type PageToken = number | "ellipsis";

// Always shows page 1, the last page, and a small window around the current page,
// collapsing any gap into a single "..." — the standard pattern (matches the
// reference: "1 2 [3] ... 100"), not a raw list of every page number.
export function paginationRange(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);
  const tokens: PageToken[] = [1];

  if (windowStart > 2) tokens.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p++) tokens.push(p);
  if (windowEnd < total - 1) tokens.push("ellipsis");

  tokens.push(total);
  return tokens;
}
