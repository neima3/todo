import { ParsedTask, Priority, Recurrence } from '@/types';

// Natural Language Processing for task input
// Supports: dates, priorities, projects (#), labels (@)

const DATE_PATTERNS: Record<string, () => Date> = {
  'tomorrow': () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  'today': () => new Date(),
  'tod': () => new Date(),
  'tom': () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  'monday': () => getNextDayOfWeek(1),
  'tuesday': () => getNextDayOfWeek(2),
  'wednesday': () => getNextDayOfWeek(3),
  'thursday': () => getNextDayOfWeek(4),
  'friday': () => getNextDayOfWeek(5),
  'saturday': () => getNextDayOfWeek(6),
  'sunday': () => getNextDayOfWeek(0),
  'mon': () => getNextDayOfWeek(1),
  'tue': () => getNextDayOfWeek(2),
  'wed': () => getNextDayOfWeek(3),
  'thu': () => getNextDayOfWeek(4),
  'fri': () => getNextDayOfWeek(5),
  'sat': () => getNextDayOfWeek(6),
  'sun': () => getNextDayOfWeek(0),
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

function parseRecurrence(input: string): { recurrence: Recurrence; dueDate: string; remaining: string } | null {
  const dayMap: Record<string, number> = {
    sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2,
    wednesday: 3, wed: 3, thursday: 4, thu: 4, friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };

  // "every day" / "daily"
  const dailyMatch = input.match(/\b(?:every\s+day|daily)\b/i);
  if (dailyMatch) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return {
      recurrence: { frequency: 'daily', interval: 1 },
      dueDate: d.toISOString().split('T')[0],
      remaining: input.replace(dailyMatch[0], '').trim(),
    };
  }

  // "every N days/weeks/months"
  const everyNMatch = input.match(/\bevery\s+(\d+)\s+(day|week|month|year)s?\b/i);
  if (everyNMatch) {
    const interval = parseInt(everyNMatch[1]);
    const unit = everyNMatch[2].toLowerCase() as 'day' | 'week' | 'month' | 'year';
    const freq = (unit + 'ly') as 'daily' | 'weekly' | 'monthly' | 'yearly';
    const d = new Date();
    if (unit === 'day') d.setDate(d.getDate() + interval);
    else if (unit === 'week') d.setDate(d.getDate() + 7 * interval);
    else if (unit === 'month') d.setMonth(d.getMonth() + interval);
    else if (unit === 'year') d.setFullYear(d.getFullYear() + interval);
    return {
      recurrence: { frequency: freq, interval },
      dueDate: d.toISOString().split('T')[0],
      remaining: input.replace(everyNMatch[0], '').trim(),
    };
  }

  // "every week" / "weekly"
  const weeklyMatch = input.match(/\b(?:every\s+week|weekly)\b/i);
  if (weeklyMatch) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return {
      recurrence: { frequency: 'weekly', interval: 1 },
      dueDate: d.toISOString().split('T')[0],
      remaining: input.replace(weeklyMatch[0], '').trim(),
    };
  }

  // "every month" / "monthly"
  const monthlyMatch = input.match(/\b(?:every\s+month|monthly)\b/i);
  if (monthlyMatch) {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return {
      recurrence: { frequency: 'monthly', interval: 1 },
      dueDate: d.toISOString().split('T')[0],
      remaining: input.replace(monthlyMatch[0], '').trim(),
    };
  }

  // "every year" / "yearly" / "annually"
  const yearlyMatch = input.match(/\b(?:every\s+year|yearly|annually)\b/i);
  if (yearlyMatch) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return {
      recurrence: { frequency: 'yearly', interval: 1 },
      dueDate: d.toISOString().split('T')[0],
      remaining: input.replace(yearlyMatch[0], '').trim(),
    };
  }

  // "every monday", "every friday", etc.
  const everyDayMatch = input.match(/\bevery\s+(\w+)\b/i);
  if (everyDayMatch) {
    const dayName = everyDayMatch[1].toLowerCase();
    if (dayMap[dayName] !== undefined) {
      const dayOfWeek = dayMap[dayName];
      const d = getNextDayOfWeek(dayOfWeek);
      return {
        recurrence: { frequency: 'weekly', interval: 1, days: [dayOfWeek] },
        dueDate: d.toISOString().split('T')[0],
        remaining: input.replace(everyDayMatch[0], '').trim(),
      };
    }
  }

  return null;
}

export function parseTaskInput(input: string): ParsedTask {
  let content = input.trim();
  const labels: string[] = [];
  let dueDate: string | undefined;
  let dueTime: string | undefined;
  let priority: Priority | undefined;
  let projectId: string | undefined;
  let recurrence: Recurrence | undefined;

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

  // Extract recurrence (before date parsing)
  const recurrenceResult = parseRecurrence(content);
  if (recurrenceResult) {
    recurrence = recurrenceResult.recurrence;
    dueDate = recurrenceResult.dueDate;
    content = recurrenceResult.remaining;
  }

  // Extract time first (to avoid confusion with dates)
  const timeStr = parseTime(content);
  if (timeStr) {
    dueTime = timeStr;
    content = content.replace(/(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '').trim();
  }

  // Extract date patterns (only if no recurrence already set a date)
  const lowerContent = content.toLowerCase();
  for (const [pattern, getDate] of Object.entries(DATE_PATTERNS)) {
    // Use regex with word boundaries to avoid matching inside other words
    // And ensure it's not followed by an apostrophe (to avoid replacing "Today" in "Today's")
    const regex = new RegExp(`\\b${pattern}\\b(?!['\u2019])`, 'i');
    if (regex.test(content)) {
      const date = getDate();
      dueDate = date.toISOString().split('T')[0];
      content = content.replace(regex, '').trim();
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
    recurrence,
  };
}
