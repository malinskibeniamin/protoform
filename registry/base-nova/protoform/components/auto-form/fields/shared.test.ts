import { formatCalendarDate, normalizeDateValue, normalizeTimeValue, parseCalendarDate } from './shared';

declare const { describe, expect, test }: typeof import('bun:test');

describe('auto-form native date helpers', () => {
  test('formats valid Date objects into local calendar dates', () => {
    expect(formatCalendarDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatCalendarDate(new Date(2024, 1, 29))).toBe('2024-02-29');
    expect(formatCalendarDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('normalizes date and time strings, timezone-qualified timestamps, and Date values', () => {
    expect(normalizeDateValue('2026-03-14')).toBe('2026-03-14');
    expect(normalizeDateValue('2026-03-14T09:45:00')).toBe('2026-03-14');
    expect(normalizeTimeValue('2026-03-14T09:45:30')).toBe('09:45');
    expect(normalizeTimeValue('2026-03-14')).toBe('');

    const local = new Date(2026, 6, 4, 8, 7);
    expect(normalizeDateValue(local)).toBe('2026-07-04');
    expect(normalizeTimeValue(local)).toBe('08:07');

    const zoned = '2026-07-04T08:07:00Z';
    const expected = new Date(zoned);
    expect(normalizeDateValue(zoned)).toBe(formatCalendarDate(expected));
    expect(normalizeTimeValue(zoned)).toBe(
      `${String(expected.getHours()).padStart(2, '0')}:${String(expected.getMinutes()).padStart(2, '0')}`
    );

    expect(normalizeDateValue(new Date('invalid'))).toBe('');
    expect(normalizeTimeValue(new Date('invalid'))).toBe('');
    expect(normalizeDateValue('not-a-dateZ')).toBe('');
    expect(normalizeTimeValue('not-a-dateZ')).toBe('');
    expect(normalizeDateValue(undefined)).toBe('');
    expect(normalizeTimeValue(null)).toBe('');
  });

  test('parses valid calendar dates and rejects invalid or overflowing calendar dates', () => {
    const leap = parseCalendarDate('2024-02-29');
    expect(leap).toBeInstanceOf(Date);
    expect(leap?.getFullYear()).toBe(2024);
    expect(leap?.getMonth()).toBe(1);
    expect(leap?.getDate()).toBe(29);

    expect(parseCalendarDate('')).toBeUndefined();
    expect(parseCalendarDate('2025-02-29')).toBeUndefined();
    expect(parseCalendarDate('2024-02-30')).toBeUndefined();
    expect(parseCalendarDate('2024-13-01')).toBeUndefined();
    expect(parseCalendarDate('2024-00-10')).toBeUndefined();
    expect(parseCalendarDate('2024-01-00')).toBeUndefined();
    expect(parseCalendarDate('24-01-01')).toBeUndefined();
    expect(parseCalendarDate('2024-01-01T00:00:00Z')).toBeUndefined();
  });
});
