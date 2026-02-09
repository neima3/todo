'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Inbox,
  Calendar,
  CalendarDays,
  Hash,
  Tag,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTodoStore } from '@/store';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { getDueDateLabel, getDueDateColor } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickAdd: () => void;
}

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  color?: string;
}

type SearchResult =
  | { id: string; type: 'task'; task: Task }
  | { id: string; type: 'command'; command: Command };

export function CommandPalette({ open, onOpenChange, onQuickAdd }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { tasks, projects, labels, completeTask } = useTodoStore();

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Build commands
  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [];

    // Navigation commands
    cmds.push({
      id: 'nav-inbox',
      label: 'Go to Inbox',
      icon: <Inbox className="h-4 w-4" />,
      action: () => {
        router.push('/');
        onOpenChange(false);
      },
    });

    cmds.push({
      id: 'nav-today',
      label: 'Go to Today',
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        router.push('/today');
        onOpenChange(false);
      },
    });

    cmds.push({
      id: 'nav-upcoming',
      label: 'Go to Upcoming',
      icon: <CalendarDays className="h-4 w-4" />,
      action: () => {
        router.push('/upcoming');
        onOpenChange(false);
      },
    });

    cmds.push({
      id: 'nav-help',
      label: 'Help & Shortcuts',
      icon: <HelpCircle className="h-4 w-4" />,
      shortcut: '?',
      action: () => {
        router.push('/help');
        onOpenChange(false);
      },
    });

    // Project navigation
    projects.filter(p => p.id !== 'inbox').forEach(project => {
      cmds.push({
        id: `nav-project-${project.id}`,
        label: `Go to ${project.name}`,
        icon: <Hash className="h-4 w-4" style={{ color: project.color }} />,
        color: project.color,
        action: () => {
          router.push(`/project/${project.id}`);
          onOpenChange(false);
        },
      });
    });

    // Label navigation
    labels.forEach(label => {
      cmds.push({
        id: `nav-label-${label.id}`,
        label: `Go to @${label.name}`,
        icon: <Tag className="h-4 w-4" style={{ color: label.color }} />,
        color: label.color,
        action: () => {
          router.push(`/label/${label.id}`);
          onOpenChange(false);
        },
      });
    });

    // Action commands
    cmds.push({
      id: 'action-add-task',
      label: 'Add new task',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'Q',
      action: () => {
        onOpenChange(false);
        setTimeout(onQuickAdd, 100);
      },
    });

    return cmds;
  }, [projects, labels, router, onOpenChange, onQuickAdd]);

  // Filter commands and tasks based on query
  const filteredResults = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      // Show default commands when no query
      return {
        commands: commands.slice(0, 8),
        tasks: [],
      };
    }

    // Filter commands
    const filteredCommands = commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery)
    );

    // Filter tasks
    const filteredTasks = tasks
      .filter(task => !task.isCompleted && task.content.toLowerCase().includes(lowerQuery))
      .slice(0, 5);

    return {
      commands: filteredCommands.slice(0, 5),
      tasks: filteredTasks,
    };
  }, [query, commands, tasks]);

  const allResults: SearchResult[] = [
    ...filteredResults.tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      task,
    })),
    ...filteredResults.commands.map(cmd => ({
      id: cmd.id,
      type: 'command' as const,
      command: cmd,
    })),
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            const result = allResults[selectedIndex];
            if (result.type === 'task') {
              completeTask(result.task.id);
              onOpenChange(false);
            } else if (result.type === 'command') {
              result.command.action();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, allResults, completeTask, onOpenChange]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search tasks, navigate, or take action</DialogDescription>
        </VisuallyHidden.Root>
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tasks, navigate, or take action..."
            className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/10 text-xs text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {allResults.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Tasks section */}
              {filteredResults.tasks.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Tasks
                  </p>
                  {filteredResults.tasks.map((task, index) => {
                    const isSelected = selectedIndex === index;
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <button
                        key={task.id}
                        data-index={index}
                        onClick={() => {
                          completeTask(task.id);
                          onOpenChange(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{task.content}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.dueDate && (
                              <span className={cn('text-xs', getDueDateColor(task.dueDate))}>
                                {getDueDateLabel(task.dueDate)}
                              </span>
                            )}
                            {project && project.id !== 'inbox' && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Hash className="h-2.5 w-2.5" style={{ color: project.color }} />
                                {project.name}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-muted-foreground">
                            Press Enter to complete
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Commands section */}
              {filteredResults.commands.length > 0 && (
                <div>
                  {filteredResults.tasks.length > 0 && (
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                      Commands
                    </p>
                  )}
                  {filteredResults.commands.map((cmd, idx) => {
                    const index = filteredResults.tasks.length + idx;
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={cmd.id}
                        data-index={index}
                        onClick={cmd.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                      >
                        <span className="text-muted-foreground">{cmd.icon}</span>
                        <span className="flex-1 text-sm">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs text-muted-foreground font-mono">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">↵</kbd>
              to select
            </span>
          </div>
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Q</kbd> for Quick Add
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
