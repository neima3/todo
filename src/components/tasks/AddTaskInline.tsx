'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Flag, Tag, Hash, X } from 'lucide-react';
import { useTodoStore } from '@/store';
import { parseTaskInput } from '@/lib/nlp-parser';
import { Priority, PRIORITY_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AddTaskInlineProps {
  projectId?: string;
  sectionId?: string;
}

export function AddTaskInline({ projectId = 'inbox', sectionId }: AddTaskInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask, projects, labels: storeLabels } = useTodoStore();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsed = parseTaskInput(content);

    addTask({
      content: parsed.content,
      description: undefined,
      projectId: parsed.projectId
        ? projects.find((p) => p.name.toLowerCase() === parsed.projectId?.toLowerCase())?.id || projectId
        : projectId,
      sectionId,
      parentId: undefined,
      priority: parsed.priority || priority,
      dueDate: parsed.dueDate || dueDate,
      dueTime: parsed.dueTime,
      labels: parsed.labels,
      isCompleted: false,
    });

    // Reset
    setContent('');
    setPriority(4);
    setDueDate(undefined);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setContent('');
    setPriority(4);
    setDueDate(undefined);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <Plus className="h-4 w-4 text-primary" />
        <span>Add task</span>
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="mx-2 p-3 rounded-lg border border-white/10 bg-card/50"
    >
      <Input
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Task name (e.g., 'Buy groceries tomorrow p1 @shopping')"
        className="border-0 bg-transparent px-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Due date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 gap-1.5 text-xs',
                  dueDate ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {dueDate || 'Due date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setDueDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setDueDate(tomorrow.toISOString().split('T')[0]);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setDueDate(nextWeek.toISOString().split('T')[0]);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5"
                >
                  Next week
                </button>
                {dueDate && (
                  <>
                    <div className="border-t border-white/5 my-1" />
                    <button
                      type="button"
                      onClick={() => setDueDate(undefined)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 text-red-400"
                    >
                      Remove date
                    </button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Priority */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground"
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-7"
            disabled={!content.trim()}
          >
            Add task
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
