'use client';

import { motion } from 'framer-motion';
import { Calendar, Plus, Sun, AlertCircle } from 'lucide-react';
import { useTodoStore } from '@/store';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';

export default function TodayPage() {
  const { getTodayTasks, getOverdueTasks, setQuickAddOpen } = useTodoStore();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
            <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Today</h1>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>
      </motion.div>

      {/* Overdue Section */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3 px-3">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400">
              Overdue ({overdueTasks.length})
            </h2>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-2">
            <TaskList
              tasks={overdueTasks}
              showProject
              showAddTask={false}
              emptyMessage=""
            />
          </div>
        </motion.div>
      )}

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {todayTasks.length === 0 && overdueTasks.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-yellow-500/20 mb-4"
            >
              <Sun className="h-8 w-8 text-yellow-400" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Enjoy your day!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              No tasks due today. Add a task with &quot;today&quot; in the description to see it here.
            </p>
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add a task for today
            </Button>
          </div>
        ) : (
          <>
            {todayTasks.length > 0 && (
              <div className="mb-3 px-3">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Due today ({todayTasks.length})
                </h2>
              </div>
            )}
            <TaskList
              tasks={todayTasks}
              showProject
              emptyMessage=""
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
