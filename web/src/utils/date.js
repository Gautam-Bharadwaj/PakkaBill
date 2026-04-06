import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns';

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
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
};
export const formatMonthDay = (date) => formatDate(date, 'MMM d');
