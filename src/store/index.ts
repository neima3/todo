import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, Label, Section, ViewType, Priority, generateId } from '@/types';

// Re-export generateId
export { generateId } from '@/types';

// Undo action types
type UndoAction =
  | { type: 'COMPLETE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; task: Task }
  | { type: 'DELETE_PROJECT'; project: Project; tasks: Task[]; sections: Section[] };

interface TodoStore {
  // Data
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  sections: Section[];

  // Undo stack
  undoStack: UndoAction[];

  // UI State
  currentView: ViewType;
  currentProjectId: string | null;
  currentLabelId: string | null;
  selectedTaskId: string | null;
  sidebarOpen: boolean;
  quickAddOpen: boolean;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  reorderTasks: (projectId: string, taskIds: string[]) => void;
  addSubtask: (parentId: string, content: string) => void;
  toggleTaskExpanded: (id: string) => void;
  getSubtasks: (parentId: string) => Task[];

  // Undo Actions
  undo: () => UndoAction | null;
  clearUndoStack: () => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Section Actions
  addSection: (section: Omit<Section, 'id' | 'createdAt' | 'order'>) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;

  // Label Actions
  addLabel: (label: Omit<Label, 'id' | 'createdAt' | 'order'>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;

  // UI Actions
  setCurrentView: (view: ViewType) => void;
  setCurrentProjectId: (id: string | null) => void;
  setCurrentLabelId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;

  // Selectors
  getTasksByProject: (projectId: string) => Task[];
  getTasksByLabel: (labelName: string) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getInboxTasks: () => Task[];
  getOverdueTasks: () => Task[];

  // Import/Export
  exportData: () => string;
  importData: (json: string) => boolean;
}

// Generate ID helper
function genId(): string {
  return crypto.randomUUID();
}

// Default inbox project
const INBOX_PROJECT: Project = {
  id: 'inbox',
  name: 'Inbox',
  color: '#3b82f6',
  order: 0,
  isArchived: false,
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // Initial Data
      tasks: [],
      projects: [INBOX_PROJECT],
      labels: [],
      sections: [],

      // Undo stack
      undoStack: [],

      // Initial UI State
      currentView: 'inbox',
      currentProjectId: null,
      currentLabelId: null,
      selectedTaskId: null,
      sidebarOpen: true,
      quickAddOpen: false,

      // Task Actions
      addTask: (taskData) => {
        const tasks = get().tasks;
        const projectTasks = tasks.filter(t => t.projectId === taskData.projectId);
        const maxOrder = projectTasks.length > 0
          ? Math.max(...projectTasks.map(t => t.order))
          : -1;

        const newTask: Task = {
          ...taskData,
          id: genId(),
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ tasks: [...tasks, newTask] });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        });
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          set({
            tasks: get().tasks.filter((t) => t.id !== id),
            selectedTaskId: get().selectedTaskId === id ? null : get().selectedTaskId,
            undoStack: [...get().undoStack, { type: 'DELETE_TASK', task }],
          });
        }
      },

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          set({
            tasks: get().tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    isCompleted: true,
                    completedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                : t
            ),
            undoStack: [...get().undoStack, { type: 'COMPLETE_TASK', task }],
          });
        }
      },

      uncompleteTask: (id) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isCompleted: false,
                  completedAt: undefined,
                  updatedAt: new Date().toISOString()
                }
              : task
          ),
        });
      },

      reorderTasks: (projectId, taskIds) => {
        set({
          tasks: get().tasks.map((task) => {
            if (task.projectId !== projectId) return task;
            const newOrder = taskIds.indexOf(task.id);
            return newOrder >= 0 ? { ...task, order: newOrder } : task;
          }),
        });
      },

      addSubtask: (parentId, content) => {
        const parent = get().tasks.find(t => t.id === parentId);
        if (!parent) return;

        const subtasks = get().tasks.filter(t => t.parentId === parentId);
        const maxOrder = subtasks.length > 0 ? Math.max(...subtasks.map(t => t.order)) : -1;

        const newTask: Task = {
          id: genId(),
          content,
          projectId: parent.projectId,
          sectionId: parent.sectionId,
          parentId,
          order: maxOrder + 1,
          priority: 4,
          labels: [],
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ tasks: [...get().tasks, newTask] });
        // Ensure parent is expanded
        if (!parent.isExpanded) {
          set({
            tasks: get().tasks.map(t => t.id === parentId ? { ...t, isExpanded: true } : t)
          });
        }
      },

      toggleTaskExpanded: (id) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id ? { ...t, isExpanded: !t.isExpanded } : t
          ),
        });
      },

      getSubtasks: (parentId) => {
        return get().tasks
          .filter(t => t.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      // Project Actions
      addProject: (projectData) => {
        const projects = get().projects;
        const maxOrder = projects.length > 0
          ? Math.max(...projects.map(p => p.order))
          : -1;

        const newProject: Project = {
          ...projectData,
          id: genId(),
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ projects: [...projects, newProject] });
      },

      updateProject: (id, updates) => {
        set({
          projects: get().projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        });
      },

      deleteProject: (id) => {
        if (id === 'inbox') return; // Can't delete inbox
        set({
          projects: get().projects.filter((project) => project.id !== id),
          tasks: get().tasks.filter((task) => task.projectId !== id),
          sections: get().sections.filter((section) => section.projectId !== id),
        });
      },

      // Section Actions
      addSection: (sectionData) => {
        const sections = get().sections.filter(s => s.projectId === sectionData.projectId);
        const maxOrder = sections.length > 0
          ? Math.max(...sections.map(s => s.order))
          : -1;

        const newSection: Section = {
          ...sectionData,
          id: genId(),
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
        };
        set({ sections: [...get().sections, newSection] });
      },

      updateSection: (id, updates) => {
        set({
          sections: get().sections.map((section) =>
            section.id === id ? { ...section, ...updates } : section
          ),
        });
      },

      deleteSection: (id) => {
        // Move tasks to no section
        set({
          sections: get().sections.filter((section) => section.id !== id),
          tasks: get().tasks.map((task) =>
            task.sectionId === id ? { ...task, sectionId: undefined } : task
          ),
        });
      },

      // Label Actions
      addLabel: (labelData) => {
        const labels = get().labels;
        const maxOrder = labels.length > 0
          ? Math.max(...labels.map(l => l.order))
          : -1;

        const newLabel: Label = {
          ...labelData,
          id: genId(),
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
        };
        set({ labels: [...labels, newLabel] });
      },

      updateLabel: (id, updates) => {
        const oldLabel = get().labels.find(l => l.id === id);
        set({
          labels: get().labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
          // Update tasks if label name changed
          tasks: oldLabel && updates.name && oldLabel.name !== updates.name
            ? get().tasks.map((task) => ({
                ...task,
                labels: task.labels.map(l => l === oldLabel.name ? updates.name! : l)
              }))
            : get().tasks,
        });
      },

      deleteLabel: (id) => {
        const label = get().labels.find(l => l.id === id);
        set({
          labels: get().labels.filter((l) => l.id !== id),
          tasks: label
            ? get().tasks.map((task) => ({
                ...task,
                labels: task.labels.filter(l => l !== label.name)
              }))
            : get().tasks,
        });
      },

      // UI Actions
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      setCurrentLabelId: (id) => set({ currentLabelId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),

      // Selectors
      getTasksByProject: (projectId) => {
        return get().tasks
          .filter((task) => task.projectId === projectId && !task.isCompleted)
          .sort((a, b) => a.order - b.order);
      },

      getTasksByLabel: (labelName) => {
        return get().tasks
          .filter((task) => task.labels.includes(labelName) && !task.isCompleted)
          .sort((a, b) => a.order - b.order);
      },

      getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks
          .filter((task) => task.dueDate === today && !task.isCompleted)
          .sort((a, b) => a.priority - b.priority);
      },

      getUpcomingTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().tasks
          .filter((task) => {
            if (!task.dueDate || task.isCompleted) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate > today;
          })
          .sort((a, b) => {
            const dateA = new Date(a.dueDate!);
            const dateB = new Date(b.dueDate!);
            return dateA.getTime() - dateB.getTime();
          });
      },

      getInboxTasks: () => {
        return get().tasks
          .filter((task) => task.projectId === 'inbox' && !task.isCompleted)
          .sort((a, b) => a.order - b.order);
      },

      getOverdueTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().tasks
          .filter((task) => {
            if (!task.dueDate || task.isCompleted) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
          })
          .sort((a, b) => {
            const dateA = new Date(a.dueDate!);
            const dateB = new Date(b.dueDate!);
            return dateA.getTime() - dateB.getTime();
          });
      },

      // Undo Actions
      undo: () => {
        const stack = get().undoStack;
        if (stack.length === 0) return null;

        const action = stack[stack.length - 1];
        const newStack = stack.slice(0, -1);

        switch (action.type) {
          case 'COMPLETE_TASK':
            set({
              tasks: get().tasks.map((t) =>
                t.id === action.task.id
                  ? { ...t, isCompleted: false, completedAt: undefined }
                  : t
              ),
              undoStack: newStack,
            });
            break;
          case 'DELETE_TASK':
            set({
              tasks: [...get().tasks, action.task],
              undoStack: newStack,
            });
            break;
          case 'DELETE_PROJECT':
            set({
              projects: [...get().projects, action.project],
              tasks: [...get().tasks, ...action.tasks],
              sections: [...get().sections, ...action.sections],
              undoStack: newStack,
            });
            break;
        }

        return action;
      },

      clearUndoStack: () => set({ undoStack: [] }),

      // Import/Export
      exportData: () => {
        const { tasks, projects, labels, sections } = get();
        return JSON.stringify({ tasks, projects, labels, sections }, null, 2);
      },

      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (data.tasks && data.projects) {
            set({
              tasks: data.tasks || [],
              projects: data.projects.length > 0 ? data.projects : [INBOX_PROJECT],
              labels: data.labels || [],
              sections: data.sections || [],
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        labels: state.labels,
        sections: state.sections,
      }),
    }
  )
);
