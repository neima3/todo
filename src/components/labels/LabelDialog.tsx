'use client';

import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useTodoStore } from '@/store';
import { LABEL_COLORS, Label } from '@/types';
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

interface LabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: Label;
}

export function LabelDialog({ open, onOpenChange, label }: LabelDialogProps) {
  const { addLabel, updateLabel } = useTodoStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const isEditing = !!label;

  useEffect(() => {
    if (open) {
      if (label) {
        setName(label.name);
        setColor(label.color);
      } else {
        setName('');
        setColor(LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)]);
      }
    }
  }, [open, label]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && label) {
      updateLabel(label.id, { name, color });
    } else {
      addLabel({ name, color });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Label' : 'Add Label'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Label name */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color + '20' }}
              >
                <Tag className="h-5 w-5" style={{ color }} />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Label name"
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
                {LABEL_COLORS.map((c) => (
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
              {isEditing ? 'Save' : 'Add label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
