/** Tiny classname joiner (ported from the prototype's `cx`). */
export const cx = (...a: Array<string | false | null | undefined>): string =>
  a.filter(Boolean).join(" ");
