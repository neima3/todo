'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Flag } from 'lucide-react';
import { Priority, PRIORITY_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface TaskFilterProps {
  onFilterChange: (filter: TaskFilterState) => void;
  taskCount?: number;
}

export interface TaskFilterState {
  search: string;
  priority: Priority | null;
}

export function TaskFilter({ onFilterChange, taskCount }: TaskFilterProps) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = search !== '' || priority !== null;

  const updateFilter = (updates: Partial<TaskFilterState>) => {
    const newState = {
      search: updates.search ?? search,
      priority: updates.priority !== undefined ? updates.priority : priority,
    };
    if (updates.search !== undefined) setSearch(updates.search);
    if (updates.priority !== undefined) setPriority(updates.priority);
    onFilterChange(newState);
  };

  const clearAll = () => {
    setSearch('');
    setPriority(null);
    setShowFilters(false);
    onFilterChange({ search: '', priority: null });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder="Filter tasks..."
            className="w-full h-8 pl-9 pr-3 text-sm bg-white/5 border border-white/10 rounded-lg outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-white/[0.07] transition-all"
          />
          {search && (
            <button
              onClick={() => updateFilter({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg border transition-all',
            showFilters || hasActiveFilters
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/20'
          )}
        >
          <Filter className="h-3 w-3" />
          Filter
          {hasActiveFilters && (
            <span className="h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-medium">
              {(search ? 1 : 0) + (priority ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mt-2 pl-1">
              <span className="text-xs text-muted-foreground">Priority:</span>
              {([1, 2, 3, 4] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilter({ priority: priority === p ? null : p })}
                  className={cn(
                    'flex items-center gap-1 h-6 px-2 text-xs rounded-md border transition-all',
                    priority === p
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-white/10 bg-white/5 text-muted-foreground hover:text-white'
                  )}
                >
                  <Flag className="h-2.5 w-2.5" style={{ color: PRIORITY_COLORS[p] }} />
                  P{p}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count when filtering */}
      {hasActiveFilters && taskCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-2 pl-1">
          {taskCount} task{taskCount !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
}
