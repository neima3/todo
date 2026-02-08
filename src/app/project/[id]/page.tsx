'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hash, Plus, MoreHorizontal, Pencil, Trash2, FolderOpen } from 'lucide-react';
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
import { ProjectDialog } from '@/components/projects/ProjectDialog';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, tasks, setQuickAddOpen, deleteProject } = useTodoStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  if (!project) {
    notFound();
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      deleteProject(projectId);
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
              style={{ backgroundColor: project.color + '20' }}
            >
              <Hash className="h-5 w-5" style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                {projectTasks.filter((t) => !t.isCompleted).length} tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
            {project.id !== 'inbox' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {projectTasks.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${project.color}20 0%, ${project.color}10 100%)`,
              }}
            >
              <FolderOpen className="h-8 w-8" style={{ color: project.color }} />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your first task to this project.
            </p>
            <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>
        ) : (
          <TaskList tasks={projectTasks} projectId={projectId} />
        )}
      </motion.div>

      {/* Edit Dialog */}
      <ProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
      />
    </div>
  );
}
