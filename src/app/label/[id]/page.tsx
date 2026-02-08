'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tag, Plus, MoreHorizontal, Pencil, Trash2, Tags } from 'lucide-react';
import { useTodoStore } from '@/store';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LabelDialog } from '@/components/labels/LabelDialog';

export default function LabelPage() {
  const params = useParams();
  const labelId = params.id as string;
  const { labels, tasks, setQuickAddOpen, deleteLabel } = useTodoStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const label = labels.find((l) => l.id === labelId);

  if (!label) {
    notFound();
  }

  const labelTasks = tasks.filter((t) => t.labels.includes(label.name));

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this label? It will be removed from all tasks.')) {
      deleteLabel(labelId);
      window.location.href = '/';
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: label.color + '20' }}
            >
              <Tag className="h-5 w-5" style={{ color: label.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">@{label.name}</h1>
              <p className="text-sm text-muted-foreground">
                {labelTasks.filter((t) => !t.isCompleted).length} tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit label
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {labelTasks.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${label.color}20 0%, ${label.color}10 100%)`,
              }}
            >
              <Tags className="h-8 w-8" style={{ color: label.color }} />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No tasks with this label</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add @{label.name} to a task to see it here.
            </p>
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>
        ) : (
          <TaskList tasks={labelTasks} showProject showAddTask={false} />
        )}
      </motion.div>

      {/* Edit Dialog */}
      <LabelDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        label={label}
      />
    </div>
  );
}
