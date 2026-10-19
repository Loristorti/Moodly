import { todayParis } from './date.js';

describe('todayParis', () => {
  it('returns the Paris day at midnight UTC', () => {
    expect(todayParis(new Date('2026-10-19T10:00:00Z')).toISOString()).toBe(
      '2026-10-19T00:00:00.000Z',
    );
  });

  it('is still the same day at 23:30 in Paris (summer time, UTC+2)', () => {
    // 21:30 UTC = 23:30 in Paris
    expect(todayParis(new Date('2026-10-19T21:30:00Z')).toISOString()).toBe(
      '2026-10-19T00:00:00.000Z',
    );
  });

  it('is already the next day at 00:30 in Paris while still the day before in UTC', () => {
    // 22:30 UTC on the 19th = 00:30 on the 20th in Paris
    expect(todayParis(new Date('2026-10-19T22:30:00Z')).toISOString()).toBe(
      '2026-10-20T00:00:00.000Z',
    );
  });

  it('handles winter time (UTC+1) and the new year', () => {
    // 23:30 UTC on Dec 31 = 00:30 on Jan 1 in Paris
    expect(todayParis(new Date('2026-12-31T23:30:00Z')).toISOString()).toBe(
      '2027-01-01T00:00:00.000Z',
    );
  });
});
