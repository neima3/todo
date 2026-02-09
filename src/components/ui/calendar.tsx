'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(selected || today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    onSelect(newDate);
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayIsToday = isToday(date);
      const dayIsSelected = isSelected(date);
      const dayIsPast = isPast(date);

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDateClick(day)}
          className={cn(
            'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
            'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50',
            dayIsToday && !dayIsSelected && 'text-primary ring-1 ring-primary/50',
            dayIsSelected && 'bg-primary text-primary-foreground',
            dayIsPast && !dayIsSelected && 'text-muted-foreground/50',
            !dayIsToday && !dayIsSelected && !dayIsPast && 'text-foreground'
          )}
        >
          {day}
        </motion.button>
      );
    }

    return days;
  };

  // Quick date options
  const quickDates = [
    { label: 'Today', date: today, color: 'text-green-400' },
    {
      label: 'Tomorrow',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      color: 'text-orange-400'
    },
    {
      label: 'Next week',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      color: 'text-purple-400'
    },
  ];

  return (
    <div className={cn('p-3 space-y-3', className)}>
      {/* Quick date options */}
      <div className="flex flex-col gap-1">
        {quickDates.map(({ label, date, color }) => (
          <button
            key={label}
            onClick={() => onSelect(date)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              'hover:bg-white/5',
              isSelected(date) && 'bg-white/10'
            )}
          >
            <CalendarIcon className={cn('h-4 w-4', color)} />
            <span>{label}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </button>
        ))}
        {selected && (
          <button
            onClick={() => onSelect(undefined)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-white/5"
          >
            No date
          </button>
        )}
      </div>

      <div className="border-t border-white/10 pt-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={prevMonth}
            className="text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {MONTHS[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={nextMonth}
            className="text-muted-foreground hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="w-9 h-6 flex items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
      </div>
    </div>
  );
}
