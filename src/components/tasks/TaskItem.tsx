'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Flag,
  Tag,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Copy,
  Hash,
} from 'lucide-react';
import { Task, Priority, PRIORITY_COLORS } from '@/types';
import { useTodoStore } from '@/store';
import { cn } from '@/lib/utils';
import { getDueDateColor, getDueDateLabel } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskEditDialog } from './TaskEditDialog';

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export function TaskItem({ task, showProject = false }: TaskItemProps) {
  const { completeTask, uncompleteTask, deleteTask, updateTask, projects, labels: storeLabels } = useTodoStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const project = projects.find((p) => p.id === task.projectId);

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      if (task.isCompleted) {
        uncompleteTask(task.id);
      } else {
        completeTask(task.id);
      }
      setIsCompleting(false);
    }, 300);
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
  };

  const handleMoveToProject = (projectId: string) => {
    updateTask(task.id, { projectId });
  };

  const dueDateLabel = getDueDateLabel(task.dueDate);
  const dueDateColor = getDueDateColor(task.dueDate);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          'group task-item flex items-start gap-3 px-3 py-3 rounded-lg border border-transparent',
          isCompleting && 'animate-complete'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={handleComplete}
            priority={task.priority}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm leading-relaxed transition-all duration-200',
              task.isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.content}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Due date */}
            {task.dueDate && (
              <span className={cn('flex items-center gap-1 text-xs', dueDateColor)}>
                <Calendar className="h-3 w-3" />
                {dueDateLabel}
                {task.dueTime && ` ${task.dueTime}`}
              </span>
            )}

            {/* Project badge */}
            {showProject && project && project.id !== 'inbox' && (
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground"
                style={{ color: project.color }}
              >
                <Hash className="h-3 w-3" />
                {project.name}
              </span>
            )}

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-1">
                {task.labels.map((labelName) => {
                  const label = storeLabels.find((l) => l.name === labelName);
                  return (
                    <span
                      key={labelName}
                      className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-white/5"
                      style={{ color: label?.color || '#9898a6' }}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {labelName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditDialogOpen(true)}
                className="text-muted-foreground hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-white"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit task
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Flag className="h-4 w-4 mr-2" />
                      Priority
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {([1, 2, 3, 4] as Priority[]).map((p) => (
                        <DropdownMenuItem
                          key={p}
                          onClick={() => handlePriorityChange(p)}
                        >
                          <Flag
                            className="h-4 w-4 mr-2"
                            style={{ color: PRIORITY_COLORS[p] }}
                          />
                          Priority {p}
                          {task.priority === p && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to...
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {projects.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => handleMoveToProject(p.id)}
                        >
                          <Hash
                            className="h-4 w-4 mr-2"
                            style={{ color: p.color }}
                          />
                          {p.name}
                          {task.projectId === p.id && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <TaskEditDialog
        task={task}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
