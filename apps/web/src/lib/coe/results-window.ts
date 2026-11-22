/**
 * The weekday afternoon window in which COE pages listen for same-day results:
 * 15:55–16:45 SGT, around the 16:00 close and the five QStash runs of
 * `coeInterimResultsWorkflow` (16:05–16:45). Singapore has no daylight saving,
 * so the window is a fixed 07:55–08:45 UTC, on the same calendar date in both
 * zones.
 */
const START_UTC = { hours: 7, minutes: 55 };
const END_UTC = { hours: 8, minutes: 45 };

export interface ResultsWindow {
  /** Window start, as Unix milliseconds. */
  start: number;
  /** Window end, as Unix milliseconds. */
  end: number;
}

/**
 * Today's results window, or `null` on a weekend or once today's window has
 * ended. A window that has not started yet is still returned, so a page opened
 * at 15:50 can wait for it.
 */
export const getResultsWindow = (now: Date): ResultsWindow | null => {
  const day = now.getUTCDay();
  if (day === 0 || day === 6) {
    return null;
  }

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();
  const start = Date.UTC(year, month, date, START_UTC.hours, START_UTC.minutes);
  const end = Date.UTC(year, month, date, END_UTC.hours, END_UTC.minutes);

  return now.getTime() < end ? { start, end } : null;
};
