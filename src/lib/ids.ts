/* Trove — id extraction. Accepts a pasted URL or a bare id; keeps the trailing
   numeric id (e.g. themoviedb.org/movie/414906 -> 414906). Ported from the
   prototype's onPaste regex. Pure. */
export function extractTrailingId(input: string): string | null {
  const m = (input || "").match(/(\d+)(?!.*\d)/);
  return m ? m[1] : null;
}
