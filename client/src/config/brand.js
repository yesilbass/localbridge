/**
 * Brand / company-wide config that is referenced in user-facing copy.
 * Centralized so changes (e.g. a founder leaves, the platform exits pre-launch)
 * are a one-line edit, not a copy-hunt.
 */

export const FOUNDERS = ['Ahmet', 'Muaz'];

/** Format founder names for prose: "Ahmet and Muaz" / "Ahmet, Muaz, and Sarah". */
export function foundersText(list = FOUNDERS) {
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
}

/** Minimum age to use the platform. Surfaced in Terms and Trust pages. */
export const MIN_AGE = 18;

/** Flip to false once Bridge has publicly launched. */
export const PRE_LAUNCH = true;
