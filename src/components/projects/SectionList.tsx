'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Section, Task } from '@/types';
import { useTodoStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskItem } from '@/components/tasks/TaskItem';
import { AddTaskInline } from '@/components/tasks/AddTaskInline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SectionListProps {
  projectId: string;
  sections: Section[];
  tasks: Task[];
}

export function SectionList({ projectId, sections, tasks }: SectionListProps) {
  const { addSection, updateSection, deleteSection } = useTodoStore();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  // Get tasks without a section
  const unsectionedTasks = tasks.filter(t => !t.sectionId && !t.parentId);

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    addSection({ projectId, name: newSectionName.trim() });
    setNewSectionName('');
    setIsAddingSection(false);
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleStartEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name);
  };

  const handleSaveEditSection = () => {
    if (editingSectionId && editingSectionName.trim()) {
      updateSection(editingSectionId, { name: editingSectionName.trim() });
    }
    setEditingSectionId(null);
    setEditingSectionName('');
  };

  return (
    <div className="space-y-6">
      {/* Unsectioned tasks */}
      {unsectionedTasks.length > 0 && (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {unsectionedTasks.filter(t => !t.isCompleted).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add task for unsectioned */}
      <AddTaskInline projectId={projectId} />

      {/* Sections */}
      {sections.map((section, index) => {
        const sectionTasks = tasks.filter(t => t.sectionId === section.id && !t.parentId);
        const isExpanded = expandedSections.has(section.id);
        const isEditing = editingSectionId === section.id;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={() => handleToggleSection(section.id)}
                className="p-0.5 rounded hover:bg-white/10 text-muted-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditSection();
                      if (e.key === 'Escape') {
                        setEditingSectionId(null);
                        setEditingSectionName('');
                      }
                    }}
                    onBlur={handleSaveEditSection}
                  />
                </div>
              ) : (
                <>
                  <span className="font-semibold text-sm flex-1">{section.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {sectionTasks.filter(t => !t.isCompleted).length}
                  </span>
                </>
              )}

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6 text-muted-foreground hover:text-white"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleStartEditSection(section)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteSection(section.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Section tasks */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 border-l-2 border-white/10 space-y-1">
                    <AnimatePresence mode="popLayout">
                      {sectionTasks.filter(t => !t.isCompleted).map(task => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                    <AddTaskInline projectId={projectId} sectionId={section.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Add section button */}
      {isAddingSection ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Section name..."
            className="flex-1 h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection();
              if (e.key === 'Escape') {
                setIsAddingSection(false);
                setNewSectionName('');
              }
            }}
          />
          <Button size="sm" className="h-8" onClick={handleAddSection} disabled={!newSectionName.trim()}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              setIsAddingSection(false);
              setNewSectionName('');
            }}
          >
            Cancel
          </Button>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAddingSection(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
      )}

      {/* Completed tasks */}
      {tasks.filter(t => t.isCompleted && !t.parentId).length > 0 && (
        <div className="mt-8 pt-4 border-t border-white/5">
          <p className="text-xs font-medium text-muted-foreground mb-3 px-3">
            Completed ({tasks.filter(t => t.isCompleted && !t.parentId).length})
          </p>
          <AnimatePresence mode="popLayout">
            {tasks.filter(t => t.isCompleted && !t.parentId).slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
