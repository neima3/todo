'use client';

import { useState, useEffect } from 'react';
import { Calendar, Flag, Tag, Hash, X } from 'lucide-react';
import { Task, Priority, PRIORITY_COLORS } from '@/types';
import { useTodoStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

interface TaskEditDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
  const { updateTask, projects, labels: storeLabels } = useTodoStore();
  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [selectedProjectId, setSelectedProjectId] = useState(task.projectId);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels);

  useEffect(() => {
    if (open) {
      setContent(task.content);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setSelectedProjectId(task.projectId);
      setSelectedLabels(task.labels);
    }
  }, [open, task]);

  const handleSave = () => {
    updateTask(task.id, {
      content,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      projectId: selectedProjectId,
      labels: selectedLabels,
    });
    onOpenChange(false);
  };

  const toggleLabel = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task content */}
          <div>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Task name"
              className="text-base font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Due date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-9',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <CalendarPicker
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => {
                      setDueDate(date ? date.toISOString().split('T')[0] : '');
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Time
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Priority
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all',
                    priority === p
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:bg-white/5'
                  )}
                >
                  <Flag
                    className="h-3.5 w-3.5"
                    style={{ color: PRIORITY_COLORS[p] }}
                  />
                  P{p}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Project
            </label>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all',
                    selectedProjectId === project.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:bg-white/5'
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
          </div>

          {/* Labels */}
          {storeLabels.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {storeLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.name)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all',
                      selectedLabels.includes(label.name)
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:bg-white/5'
                    )}
                  >
                    <Tag
                      className="h-3.5 w-3.5"
                      style={{ color: label.color }}
                    />
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
