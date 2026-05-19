import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type Priority } from '../types';

dayjs.extend(relativeTime);

export const TAG_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#6366F1', '#A855F7', '#EC4899',
];

export function formatDueDate(iso: string | null): string {
  if (!iso) return '';
  return dayjs(iso).format('MMM D, YYYY');
}

export function isDueSoon(iso: string | null): boolean {
  if (!iso) return false;
  const diff = dayjs(iso).diff(dayjs(), 'day');
  return diff >= 0 && diff <= 2;
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return dayjs(iso).isBefore(dayjs(), 'day');
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#EF4444',
  medium: '#F97316',
  low: '#22C55E',
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: '#FEE2E2',
  medium: '#FFEDD5',
  low: '#DCFCE7',
};

export function randomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
