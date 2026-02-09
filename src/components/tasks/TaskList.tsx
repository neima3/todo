'use client';

import { AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskItem } from './TaskItem';
import { AddTaskInline } from './AddTaskInline';

interface TaskListProps {
  tasks: Task[];
  projectId?: string;
  showProject?: boolean;
  emptyMessage?: string;
  showAddTask?: boolean;
}

export function TaskList({
  tasks,
  projectId = 'inbox',
  showProject = false,
  emptyMessage = 'No tasks yet',
  showAddTask = true,
}: TaskListProps) {
  // Filter out subtasks - they render within their parent TaskItem
  const rootTasks = tasks.filter((t) => !t.parentId);
  const activeTasks = rootTasks.filter((t) => !t.isCompleted);
  const completedTasks = rootTasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-1">
      {/* Active Tasks */}
      <AnimatePresence mode="popLayout">
        {activeTasks.map((task) => (
          <TaskItem key={task.id} task={task} showProject={showProject} />
        ))}
      </AnimatePresence>

      {/* Add Task Inline */}
      {showAddTask && <AddTaskInline projectId={projectId} />}

      {/* Empty State */}
      {activeTasks.length === 0 && !showAddTask && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8 pt-4 border-t border-white/5">
          <p className="text-xs font-medium text-muted-foreground mb-3 px-3">
            Completed ({completedTasks.length})
          </p>
          <AnimatePresence mode="popLayout">
            {completedTasks.slice(0, 5).map((task) => (
              <TaskItem key={task.id} task={task} showProject={showProject} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
