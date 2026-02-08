import { ParsedTask, Priority } from '@/types';

// Natural Language Processing for task input
// Supports: dates, priorities, projects (#), labels (@)

const DATE_PATTERNS: Record<string, () => Date> = {
  today: () => new Date(),
  tomorrow: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  tod: () => new Date(),
  tom: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  monday: () => getNextDayOfWeek(1),
  tuesday: () => getNextDayOfWeek(2),
  wednesday: () => getNextDayOfWeek(3),
  thursday: () => getNextDayOfWeek(4),
  friday: () => getNextDayOfWeek(5),
  saturday: () => getNextDayOfWeek(6),
  sunday: () => getNextDayOfWeek(0),
  mon: () => getNextDayOfWeek(1),
  tue: () => getNextDayOfWeek(2),
  wed: () => getNextDayOfWeek(3),
  thu: () => getNextDayOfWeek(4),
  fri: () => getNextDayOfWeek(5),
  sat: () => getNextDayOfWeek(6),
  sun: () => getNextDayOfWeek(0),
  'next week': () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  },
  'next month': () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  },
};

function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntil);
  return result;
}

function parseRelativeDate(input: string): Date | null {
  // Match "in X days/weeks/months"
  const inMatch = input.match(/in\s+(\d+)\s+(day|week|month)s?/i);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    const d = new Date();
    if (unit === 'day') d.setDate(d.getDate() + amount);
    else if (unit === 'week') d.setDate(d.getDate() + amount * 7);
    else if (unit === 'month') d.setMonth(d.getMonth() + amount);
    return d;
  }
  return null;
}

function parseExactDate(input: string): Date | null {
  // Match "Jan 15", "January 15", "1/15", "15/1", etc.
  const monthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  // "Jan 15" or "January 15"
  const monthDayMatch = input.match(/(\w+)\s+(\d{1,2})/i);
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1].toLowerCase().slice(0, 3);
    const monthIndex = monthNames.indexOf(monthStr);
    if (monthIndex !== -1) {
      const day = parseInt(monthDayMatch[2]);
      const d = new Date();
      d.setMonth(monthIndex);
      d.setDate(day);
      if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
      return d;
    }
  }

  // "1/15" or "15/1"
  const slashMatch = input.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1]) - 1;
    const day = parseInt(slashMatch[2]);
    const d = new Date();
    d.setMonth(month);
    d.setDate(day);
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    return d;
  }

  return null;
}

function parseTime(input: string): string | null {
  // Match "at 5pm", "at 17:00", "5:30pm", etc.
  const timeMatch = input.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3]?.toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return null;
}

function parsePriority(input: string): Priority | undefined {
  const priorityMatch = input.match(/p([1-4])/i);
  if (priorityMatch) {
    return parseInt(priorityMatch[1]) as Priority;
  }

  // Also check for !! or !!! patterns
  const exclamationMatch = input.match(/!{1,3}/);
  if (exclamationMatch) {
    const count = exclamationMatch[0].length;
    if (count >= 3) return 1;
    if (count === 2) return 2;
    if (count === 1) return 3;
  }

  return undefined;
}

export function parseTaskInput(input: string): ParsedTask {
  let content = input.trim();
  const labels: string[] = [];
  let dueDate: string | undefined;
  let dueTime: string | undefined;
  let priority: Priority | undefined;
  let projectId: string | undefined;

  // Extract labels (@label)
  const labelMatches = content.match(/@(\w+)/g);
  if (labelMatches) {
    labelMatches.forEach((match) => {
      labels.push(match.slice(1));
    });
    content = content.replace(/@\w+/g, '').trim();
  }

  // Extract project (#project)
  const projectMatch = content.match(/#(\w+)/);
  if (projectMatch) {
    projectId = projectMatch[1];
    content = content.replace(/#\w+/g, '').trim();
  }

  // Extract priority (p1-p4 or !)
  priority = parsePriority(content);
  if (priority) {
    content = content.replace(/p[1-4]/gi, '').replace(/!{1,3}/g, '').trim();
  }

  // Extract time first (to avoid confusion with dates)
  const timeStr = parseTime(content);
  if (timeStr) {
    dueTime = timeStr;
    content = content.replace(/(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '').trim();
  }

  // Extract date patterns
  const lowerContent = content.toLowerCase();
  for (const [pattern, getDate] of Object.entries(DATE_PATTERNS)) {
    if (lowerContent.includes(pattern)) {
      const date = getDate();
      dueDate = date.toISOString().split('T')[0];
      content = content.replace(new RegExp(pattern, 'gi'), '').trim();
      break;
    }
  }

  // Try relative date if no named date found
  if (!dueDate) {
    const relativeDate = parseRelativeDate(lowerContent);
    if (relativeDate) {
      dueDate = relativeDate.toISOString().split('T')[0];
      content = content.replace(/in\s+\d+\s+(?:day|week|month)s?/gi, '').trim();
    }
  }

  // Try exact date if still no date
  if (!dueDate) {
    const exactDate = parseExactDate(lowerContent);
    if (exactDate) {
      dueDate = exactDate.toISOString().split('T')[0];
      content = content.replace(/\w+\s+\d{1,2}|\d{1,2}\/\d{1,2}/gi, '').trim();
    }
  }

  // Clean up extra whitespace
  content = content.replace(/\s+/g, ' ').trim();

  return {
    content,
    dueDate,
    dueTime,
    priority: priority || 4,
    projectId,
    labels,
  };
}
