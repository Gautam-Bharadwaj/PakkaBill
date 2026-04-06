import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Always use these — never display raw ISO strings in UI.
 */
export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return format(d, pattern);
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatMonthDay = (date) => formatDate(date, 'MMM d');
export const formatDayShort = (date) => formatDate(date, 'EEE');
