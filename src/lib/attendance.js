/**
 * Calculates attendance statistics from login records.
 * @param {Array} logs - Array of login objects { timestamp, userId, childName }
 * @returns {Object} { dailyCount, weeklyTrend }
 */
export const calculateAttendance = (logs) => {
  if (!logs || logs.length === 0) return { dailyCount: 0, weeklyTrend: [] };

  const today = new Date().toISOString().split('T')[0];
  const dailyCount = logs.filter(log => log.timestamp.split('T')[0] === today).length;

  // Mocking trend logic for now
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeklyTrend = days.map(day => ({
    name: day,
    logins: logs.filter(log => log.day === day).length
  }));

  return { dailyCount, weeklyTrend };
};
