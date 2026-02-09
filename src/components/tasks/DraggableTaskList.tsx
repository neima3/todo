'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { useTodoStore } from '@/store';
import { TaskItem } from './TaskItem';
import { AddTaskInline } from './AddTaskInline';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableTaskProps {
  task: Task;
  showProject?: boolean;
}

function SortableTask({ task, showProject }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <TaskItem task={task} showProject={showProject} />
    </div>
  );
}

interface DraggableTaskListProps {
  tasks: Task[];
  projectId: string;
  sectionId?: string;
  showProject?: boolean;
  showAddTask?: boolean;
  emptyMessage?: string;
}

export function DraggableTaskList({
  tasks,
  projectId,
  sectionId,
  showProject = false,
  showAddTask = true,
  emptyMessage = 'No tasks yet',
}: DraggableTaskListProps) {
  const { reorderTasks } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filter out subtasks for the main list
  const topLevelTasks = tasks.filter((t) => !t.parentId);
  const activeTasks = topLevelTasks.filter((t) => !t.isCompleted);
  const completedTasks = topLevelTasks.filter((t) => t.isCompleted);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
      const newIndex = activeTasks.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(activeTasks, oldIndex, newIndex);
        reorderTasks(projectId, reorderedTasks.map((t) => t.id));
      }
    }
  };

  const activeTask = activeId ? activeTasks.find((t) => t.id === activeId) : null;

  if (activeTasks.length === 0 && completedTasks.length === 0 && !showAddTask) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1 pl-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {activeTasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              showProject={showProject}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
              <TaskItem task={activeTask} showProject={showProject} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showAddTask && (
        <AddTaskInline projectId={projectId} sectionId={sectionId} />
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-sm text-muted-foreground mb-2">
            Completed ({completedTasks.length})
          </p>
          {completedTasks.slice(0, 5).map((task) => (
            <TaskItem key={task.id} task={task} showProject={showProject} />
          ))}
          {completedTasks.length > 5 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              + {completedTasks.length - 5} more completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
