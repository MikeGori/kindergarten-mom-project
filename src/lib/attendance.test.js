import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateAttendance } from './attendance';

describe('Attendance Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockLogs = [
    { timestamp: '2026-03-16T10:00:00Z', userId: '1', childName: 'Leo', day: 'Mon' },
    { timestamp: '2026-03-16T11:00:00Z', userId: '2', childName: 'Mia', day: 'Mon' },
    { timestamp: '2026-03-15T10:00:00Z', userId: '3', childName: 'Sam', day: 'Sun' },
  ];

  it('calculates daily count correctly', () => {
    // Note: This test depends on 'today' being 2026-03-16
    const { dailyCount } = calculateAttendance(mockLogs);
    expect(dailyCount).toBe(2);
  });

  it('returns zero for empty logs', () => {
    const { dailyCount } = calculateAttendance([]);
    expect(dailyCount).toBe(0);
  });

  it('generates weekly trend correctly', () => {
    const { weeklyTrend } = calculateAttendance(mockLogs);
    const monTrend = weeklyTrend.find(t => t.name === 'Mon');
    expect(monTrend.logins).toBe(2);
  });
});
