// Generates the next stable id for a hand-added item, continuing the same "q3",
// "f3"-style sequence the generation pipeline uses — so ids stay stable and
// collision-free whether an item came from the LLM or was added by hand.
export function nextItemId(prefix: string, existingIds: string[]): string {
  const max = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${max + 1}`;
}

/** A `nextId()` generator that keeps advancing across multiple calls in one batch
 * (e.g. regenerating several questions at once), so none collide with each other. */
export function makeContinuingIdGenerator(prefix: string, existingIds: string[]) {
  const seen = [...existingIds];
  return () => {
    const id = nextItemId(prefix, seen);
    seen.push(id);
    return id;
  };
}
