'use client';

import { motion } from 'framer-motion';
import { CalendarDays, Plus, CalendarCheck } from 'lucide-react';
import { useTodoStore } from '@/store';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { formatDateFull } from '@/lib/utils';

export default function UpcomingPage() {
  const { getUpcomingTasks, setQuickAddOpen } = useTodoStore();
  const upcomingTasks = getUpcomingTasks();

  // Group tasks by date
  const tasksByDate = upcomingTasks.reduce((acc, task) => {
    const date = task.dueDate!;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof upcomingTasks>);

  const sortedDates = Object.keys(tasksByDate).sort();

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Upcoming</h1>
              <p className="text-sm text-muted-foreground">
                {upcomingTasks.length} tasks scheduled
              </p>
            </div>
          </div>
          <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4"
            >
              <CalendarCheck className="h-8 w-8 text-purple-400" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No upcoming tasks</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add due dates to your tasks to see them here. Try &quot;tomorrow&quot; or &quot;next week&quot;.
            </p>
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule a task
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date, index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-3 px-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {formatDateFull(date)}
                  </h2>
                  <span className="text-xs text-muted-foreground/60">
                    ({tasksByDate[date].length})
                  </span>
                </div>
                <TaskList
                  tasks={tasksByDate[date]}
                  showProject
                  showAddTask={false}
                  emptyMessage=""
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
