import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TOPIC_STATUS_LABELS, type TopicStatus, NEXT_STATUS } from './types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // empty is allowed for note type
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getNextStatus(current: TopicStatus): TopicStatus {
  return NEXT_STATUS[current];
}

export function getStatusLabel(status: TopicStatus): string {
  return TOPIC_STATUS_LABELS[status];
}

export function getStatusColor(status: TopicStatus): string {
  switch (status) {
    case 'not_started':
      return 'text-gray-400 bg-gray-100';
    case 'in_progress':
      return 'text-amber-700 bg-amber-100';
    case 'completed':
      return 'text-green-700 bg-green-100';
  }
}

export function getStatusHex(status: TopicStatus): string {
  switch (status) {
    case 'not_started':
      return '#9ca3af';
    case 'in_progress':
      return '#f59e0b';
    case 'completed':
      return '#22c55e';
  }
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
