'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerConfetti } from '@/lib/confetti';
import {
  Calendar,
  Flag,
  Tag,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Hash,
  ChevronRight,
  ChevronDown,
  Plus,
  CornerDownRight,
  Repeat,
} from 'lucide-react';
import { Task, Priority, PRIORITY_COLORS } from '@/types';
import { useTodoStore } from '@/store';
import { cn } from '@/lib/utils';
import { getDueDateColor, getDueDateLabel } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
  isSubtask?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

export function TaskItem({ task, showProject = false, isSubtask = false, isSelected = false, onToggleSelect, selectionMode = false }: TaskItemProps) {
  const {
    completeTask,
    uncompleteTask,
    deleteTask,
    updateTask,
    projects,
    labels: storeLabels,
    addSubtask,
    toggleTaskExpanded,
    getSubtasks,
    tasks,
    undo,
  } = useTodoStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskContent, setSubtaskContent] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === task.projectId);
  const subtasks = tasks.filter(t => t.parentId === task.id);
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = subtasks.filter(t => t.isCompleted).length;

  const handleComplete = () => {
    if (task.isCompleted) {
      uncompleteTask(task.id);
      return;
    }
    setIsCompleting(true);
    setTimeout(() => {
      completeTask(task.id);
      triggerConfetti();
      const msg = task.recurrence
        ? `"${task.content}" completed — next occurrence created`
        : `"${task.content}" completed`;
      toast.success(msg, {
        action: {
          label: 'Undo',
          onClick: () => undo(),
        },
      });
      setIsCompleting(false);
    }, 400);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success(`"${task.content}" deleted`, {
      action: {
        label: 'Undo',
        onClick: () => undo(),
      },
    });
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
  };

  const handleMoveToProject = (projectId: string) => {
    updateTask(task.id, { projectId });
  };

  const handleAddSubtask = () => {
    if (!subtaskContent.trim()) return;
    addSubtask(task.id, subtaskContent.trim());
    setSubtaskContent('');
    setIsAddingSubtask(false);
  };

  const handleToggleExpanded = () => {
    if (hasSubtasks || isAddingSubtask) {
      toggleTaskExpanded(task.id);
    }
  };

  const dueDateLabel = getDueDateLabel(task.dueDate);
  const dueDateColor = getDueDateColor(task.dueDate);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={isCompleting
          ? { opacity: [1, 1, 0.5], scale: [1, 1.02, 0.98], y: 0 }
          : { opacity: 1, y: 0, scale: 1 }
        }
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
        transition={isCompleting
          ? { duration: 0.4, ease: 'easeOut' }
          : { duration: 0.2 }
        }
        className={cn(
          'group task-item flex flex-col rounded-lg border transition-colors',
          isSelected ? 'border-primary/40 bg-primary/5' : 'border-transparent'
        )}
      >
        <div
          className={cn(
            'flex items-start gap-3 px-3 py-3',
            isSubtask && 'pl-8'
          )}
          onClick={(e) => {
            if (selectionMode && onToggleSelect && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLButtonElement)) {
              onToggleSelect();
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Selection checkbox in bulk mode */}
          {selectionMode && onToggleSelect && !isSubtask && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
              className={cn(
                'mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-all shrink-0',
                isSelected
                  ? 'bg-primary border-primary text-white'
                  : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              {isSelected && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}

          {/* Expand/Collapse for subtasks */}
          {!isSubtask && (
            <button
              onClick={handleToggleExpanded}
              className={cn(
                'mt-0.5 p-0.5 rounded transition-colors',
                hasSubtasks ? 'hover:bg-white/10 text-muted-foreground' : 'invisible'
              )}
            >
              {task.isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Subtask indicator */}
          {isSubtask && (
            <CornerDownRight className="h-3 w-3 text-muted-foreground/50 mt-1 -ml-2" />
          )}

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

              {/* Recurrence indicator */}
              {task.recurrence && (
                <span className="flex items-center gap-1 text-xs text-cyan-400">
                  <Repeat className="h-3 w-3" />
                  {task.recurrence.frequency}
                </span>
              )}

              {/* Subtask count */}
              {hasSubtasks && !isSubtask && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CornerDownRight className="h-3 w-3" />
                  {completedSubtasks}/{subtasks.length}
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
                {!isSubtask && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsAddingSubtask(true)}
                    className="text-muted-foreground hover:text-white"
                    title="Add subtask"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
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

                    {!isSubtask && (
                      <DropdownMenuItem onClick={() => setIsAddingSubtask(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add subtask
                      </DropdownMenuItem>
                    )}

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
                      onClick={handleDelete}
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
        </div>

        {/* Subtasks */}
        <AnimatePresence>
          {(task.isExpanded || isAddingSubtask) && !isSubtask && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pl-6 border-l-2 border-white/5 ml-5 mb-2">
                {/* Existing subtasks */}
                {subtasks.map((subtask) => (
                  <TaskItem
                    key={subtask.id}
                    task={subtask}
                    showProject={showProject}
                    isSubtask
                  />
                ))}

                {/* Add subtask input */}
                {isAddingSubtask && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 pl-8"
                  >
                    <CornerDownRight className="h-3 w-3 text-muted-foreground/50 -ml-2" />
                    <Input
                      ref={subtaskInputRef}
                      value={subtaskContent}
                      onChange={(e) => setSubtaskContent(e.target.value)}
                      placeholder="Add subtask..."
                      className="flex-1 h-8 text-sm bg-transparent border-white/10"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSubtask();
                        if (e.key === 'Escape') {
                          setIsAddingSubtask(false);
                          setSubtaskContent('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={handleAddSubtask}
                      disabled={!subtaskContent.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        setIsAddingSubtask(false);
                        setSubtaskContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </div>
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
