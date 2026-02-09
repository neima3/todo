'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Flag, Tag, Hash, Sparkles } from 'lucide-react';
import { useTodoStore } from '@/store';
import { parseTaskInput } from '@/lib/nlp-parser';
import { Priority, PRIORITY_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

interface QuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAdd({ open, onOpenChange }: QuickAddProps) {
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState('inbox');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask, projects } = useTodoStore();

  // Parse preview
  const parsed = content ? parseTaskInput(content) : null;

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsed = parseTaskInput(content);
    const project = parsed.projectId
      ? projects.find((p) => p.name.toLowerCase() === parsed.projectId?.toLowerCase())
      : null;

    addTask({
      content: parsed.content,
      projectId: project?.id || selectedProjectId,
      priority: parsed.priority || priority,
      dueDate: parsed.dueDate || dueDate,
      dueTime: parsed.dueTime,
      labels: parsed.labels,
      isCompleted: false,
      recurrence: parsed.recurrence,
    });

    // Reset
    setContent('');
    setPriority(4);
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Add a new task with natural language support</DialogDescription>
        </VisuallyHidden.Root>
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-white/5">
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-lg bg-transparent border-0 outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />

            {/* NLP Preview */}
            <AnimatePresence>
              {parsed && (parsed.dueDate || parsed.priority !== 4 || parsed.labels.length > 0 || parsed.recurrence) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Detected:</span>
                    {parsed.dueDate && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-green-400">
                        📅 {parsed.dueDate}
                      </span>
                    )}
                    {parsed.dueTime && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-blue-400">
                        ⏰ {parsed.dueTime}
                      </span>
                    )}
                    {parsed.priority && parsed.priority !== 4 && (
                      <span
                        className="px-2 py-0.5 rounded bg-white/5"
                        style={{ color: PRIORITY_COLORS[parsed.priority] }}
                      >
                        🚩 P{parsed.priority}
                      </span>
                    )}
                    {parsed.recurrence && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-cyan-400">
                        🔄 {parsed.recurrence.frequency}
                      </span>
                    )}
                    {parsed.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2 py-0.5 rounded bg-white/5 text-purple-400"
                      >
                        🏷 {label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between p-3 bg-card/50">
            <div className="flex items-center gap-2">
              {/* Project selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Hash
                      className="h-3.5 w-3.5"
                      style={{
                        color: projects.find((p) => p.id === selectedProjectId)?.color,
                      }}
                    />
                    {projects.find((p) => p.id === selectedProjectId)?.name || 'Inbox'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <div className="space-y-1">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setSelectedProjectId(project.id)}
                        className={cn(
                          'w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-white/5',
                          selectedProjectId === project.id && 'bg-white/5'
                        )}
                      >
                        <Hash
                          className="h-3.5 w-3.5"
                          style={{ color: project.color }}
                        />
                        {project.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Due date with calendar */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 gap-1.5 text-xs',
                      dueDate ? 'text-green-400' : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[280px] p-0">
                  <CalendarPicker
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => {
                      setDueDate(date ? date.toISOString().split('T')[0] : undefined);
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Priority */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground"
                  >
                    <Flag
                      className="h-3.5 w-3.5"
                      style={{ color: PRIORITY_COLORS[priority] }}
                    />
                    P{priority}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <div className="space-y-1">
                    {([1, 2, 3, 4] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          'w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-white/5',
                          priority === p && 'bg-white/5'
                        )}
                      >
                        <Flag
                          className="h-3.5 w-3.5"
                          style={{ color: PRIORITY_COLORS[p] }}
                        />
                        Priority {p}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Q</kbd> to quick add
              </span>
              <Button type="submit" size="sm" disabled={!content.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add task
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
