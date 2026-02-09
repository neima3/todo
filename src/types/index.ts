export type Priority = 1 | 2 | 3 | 4;

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  days?: number[]; // for weekly: 0=Sun, 1=Mon, etc.
}

export function generateId(): string {
  return crypto.randomUUID();
}

export interface Task {
  id: string;
  content: string;
  description?: string;
  projectId: string;
  sectionId?: string;
  parentId?: string;
  order: number;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  labels: string[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean;
  recurrence?: Recurrence;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface Filter {
  id: string;
  name: string;
  query: string;
  color: string;
  order: number;
  isFavorite: boolean;
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'project' | 'label' | 'filter';

export interface ParsedTask {
  content: string;
  dueDate?: string;
  dueTime?: string;
  priority?: Priority;
  projectId?: string;
  labels: string[];
  recurrence?: Recurrence;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: '#dc2626', // red - P1 urgent
  2: '#f97316', // orange - P2 high
  3: '#3b82f6', // blue - P3 medium
  4: '#6b7280', // gray - P4 low
};

export const PROJECT_COLORS = [
  '#dc2626', // red
  '#ea580c', // orange
  '#d97706', // amber
  '#65a30d', // lime
  '#16a34a', // green
  '#0d9488', // teal
  '#0891b2', // cyan
  '#2563eb', // blue
  '#7c3aed', // violet
  '#c026d3', // fuchsia
  '#db2777', // pink
  '#64748b', // slate
];

export const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#6b7280', // gray
  '#78716c', // stone
];
