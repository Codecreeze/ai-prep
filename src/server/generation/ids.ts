// Sequential, human-readable ids (r1, q1, f1...) matching the brief's own example
// shapes — simpler to read in a review/test failure than a UUID, and "stable within
// a kit" (the brief's only actual requirement) doesn't call for global uniqueness.
export function makeIdGenerator(prefix: string) {
  let counter = 0;
  return () => `${prefix}${++counter}`;
}
