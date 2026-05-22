export const parseLocalDateTime = (value) => {
  if (!value) return null;

  // Strip Z or timezone offset if present, treat the remaining date-time as local wall-clock time.
  const normalized = value.replace(/Z$/i, '').replace(/([+-]\d{2}:\d{2})$/, '');
  const [datePart, timePart] = normalized.split('T');
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart
    .split(':')
    .map((part) => Number(part.replace(/\.\d+$/, '')));

  if ([year, month, day, hour, minute, second].some((n) => Number.isNaN(n))) return null;

  return new Date(year, month - 1, day, hour, minute, second);
};

export const formatLocalDateTime = (value) => {
  const date = parseLocalDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatLocalDate = (value) => {
  const date = parseLocalDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getLocalDueDaysLeft = (value) => {
  const date = parseLocalDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const diff = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  return `${diff} day${diff === 1 ? '' : 's'} left`;
};
