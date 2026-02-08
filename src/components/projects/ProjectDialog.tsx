'use client';

import { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { useTodoStore } from '@/store';
import { PROJECT_COLORS, Project } from '@/types';
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

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const { addProject, updateProject } = useTodoStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const isEditing = !!project;

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setColor(project.color);
      } else {
        setName('');
        setColor(PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
      }
    }
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && project) {
      updateProject(project.id, { name, color });
    } else {
      addProject({
        name,
        color,
        isArchived: false,
        isFavorite: false,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Project name */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color + '20' }}
              >
                <Hash className="h-5 w-5" style={{ color }} />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="flex-1"
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-transform hover:scale-110',
                      color === c && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? 'Save' : 'Add project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
