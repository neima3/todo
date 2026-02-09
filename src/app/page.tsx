'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Plus, Sparkles } from 'lucide-react';
import { useTodoStore } from '@/store';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilter, TaskFilterState } from '@/components/tasks/TaskFilter';
import { Button } from '@/components/ui/button';

export default function InboxPage() {
  const { tasks, setQuickAddOpen } = useTodoStore();
  const [filter, setFilter] = useState<TaskFilterState>({ search: '', priority: null });

  const inboxTasks = tasks.filter((t) => t.projectId === 'inbox');

  const filteredTasks = useMemo(() => {
    let result = inboxTasks;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(t =>
        t.content.toLowerCase().includes(q) ||
        t.labels.some(l => l.toLowerCase().includes(q)) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    if (filter.priority) {
      result = result.filter(t => t.priority === filter.priority);
    }
    return result;
  }, [inboxTasks, filter]);

  const activeCount = filteredTasks.filter(t => !t.isCompleted).length;
  const hasActiveFilters = filter.search !== '' || filter.priority !== null;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                {inboxTasks.filter((t) => !t.isCompleted).length} tasks
              </p>
            </div>
          </div>
          <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>

        <TaskFilter
          onFilterChange={setFilter}
          taskCount={hasActiveFilters ? activeCount : undefined}
        />
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {inboxTasks.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4"
            >
              <Sparkles className="h-8 w-8 text-blue-400" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">All clear!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your inbox is empty. Add a task to get started, or press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">
                Q
              </kbd>{' '}
              to quick add.
            </p>
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add your first task
            </Button>
          </div>
        ) : (
          <TaskList tasks={filteredTasks} projectId="inbox" />
        )}
      </motion.div>
    </div>
  );
}
