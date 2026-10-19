const parisDateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Current day in the Europe/Paris time zone, as a Date at midnight UTC
 * (the format Prisma expects for @db.Date columns).
 * This is the only place where "today" is computed.
 */
export function todayParis(now: Date = new Date()): Date {
  const parts = parisDateFormat.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)!.value;

  return new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00.000Z`);
}

/** Same day shifted by `days` (days stored at midnight UTC, so no time zone issue). */
export function addDays(day: Date, days: number): Date {
  const result = new Date(day);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** "2026-10-19" */
export function toIsoDate(day: Date): string {
  return day.toISOString().slice(0, 10);
}

/** Monday to Friday. */
export function isWorkingDay(day: Date): boolean {
  const weekDay = day.getUTCDay();
  return weekDay !== 0 && weekDay !== 6;
}
