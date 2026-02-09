'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Trash2, ArrowRight, Flag, X } from 'lucide-react';
import { useTodoStore } from '@/store';
import { Priority, PRIORITY_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const { bulkComplete, bulkDelete, bulkMove, bulkPriority, projects } = useTodoStore();
  const count = selectedIds.length;

  const handleComplete = () => {
    bulkComplete(selectedIds);
    toast.success(`${count} task${count > 1 ? 's' : ''} completed`);
    onClear();
  };

  const handleDelete = () => {
    bulkDelete(selectedIds);
    toast.success(`${count} task${count > 1 ? 's' : ''} deleted`);
    onClear();
  };

  const handleMove = (projectId: string) => {
    bulkMove(selectedIds, projectId);
    const project = projects.find(p => p.id === projectId);
    toast.success(`Moved ${count} task${count > 1 ? 's' : ''} to ${project?.name}`);
    onClear();
  };

  const handlePriority = (priority: Priority) => {
    bulkPriority(selectedIds, priority);
    toast.success(`Set priority P${priority} on ${count} task${count > 1 ? 's' : ''}`);
    onClear();
  };

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl"
    >
      <span className="text-sm font-medium text-primary mr-2">
        {count} selected
      </span>

      <Button size="sm" variant="ghost" onClick={handleComplete} className="gap-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10">
        <CheckCircle2 className="h-4 w-4" />
        Complete
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1.5">
            <ArrowRight className="h-4 w-4" />
            Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {projects.map(p => (
            <DropdownMenuItem key={p.id} onClick={() => handleMove(p.id)}>
              <span className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: p.color }} />
              {p.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1.5">
            <Flag className="h-4 w-4" />
            Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {([1, 2, 3, 4] as Priority[]).map(p => (
            <DropdownMenuItem key={p} onClick={() => handlePriority(p)}>
              <Flag className="h-4 w-4 mr-2" style={{ color: PRIORITY_COLORS[p] }} />
              Priority {p}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="ghost" onClick={handleDelete} className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <Button size="sm" variant="ghost" onClick={onClear} className="gap-1.5 text-muted-foreground">
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
