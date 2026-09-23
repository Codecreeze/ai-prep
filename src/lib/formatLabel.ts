// Turns a raw lowercase/hyphenated value (a category slug, a status key) into a
// human-displayable label — "system-design" -> "System Design". Used anywhere a
// backend enum value would otherwise render straight to the screen in lowercase.
export const capitalizeWords = (value: string): string =>
  value
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
