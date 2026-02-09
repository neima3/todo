'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskItem } from './TaskItem';
import { AddTaskInline } from './AddTaskInline';
import { BulkActionBar } from './BulkActionBar';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter out subtasks - they render within their parent TaskItem
  const rootTasks = tasks.filter((t) => !t.parentId);
  const activeTasks = rootTasks.filter((t) => !t.isCompleted);
  const completedTasks = rootTasks.filter((t) => t.isCompleted);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Cmd+A to select all, Escape to clear selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && selectedIds.size > 0) {
        e.preventDefault();
        setSelectedIds(new Set(activeTasks.map(t => t.id)));
      }
      if (e.key === 'Escape' && selectedIds.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTasks, selectedIds.size, clearSelection]);

  return (
    <div className="space-y-1">
      {/* Active Tasks */}
      <AnimatePresence mode="popLayout">
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            showProject={showProject}
            isSelected={selectedIds.has(task.id)}
            onToggleSelect={() => toggleSelect(task.id)}
            selectionMode={selectedIds.size > 0}
          />
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
            {completedTasks.slice(0, 10).map((task) => (
              <TaskItem key={task.id} task={task} showProject={showProject} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionBar
            selectedIds={Array.from(selectedIds)}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
