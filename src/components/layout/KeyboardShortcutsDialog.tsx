'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUT_GROUPS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Q'], description: 'Quick add task' },
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close dialog / deselect' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'I'], description: 'Go to Inbox' },
      { keys: ['G', 'T'], description: 'Go to Today' },
      { keys: ['G', 'U'], description: 'Go to Upcoming' },
    ],
  },
  {
    title: 'Task Actions',
    shortcuts: [
      { keys: ['Enter'], description: 'Submit task / confirm' },
      { keys: ['⌘', 'Z'], description: 'Undo last action' },
      { keys: ['⌘', 'A'], description: 'Select all tasks' },
    ],
  },
  {
    title: 'Bulk Actions',
    shortcuts: [
      { keys: ['Click'], description: 'Select task (with checkbox)' },
      { keys: ['⌘', 'D'], description: 'Delete selected tasks' },
      { keys: ['⌘', 'Shift', 'C'], description: 'Complete selected tasks' },
    ],
  },
  {
    title: 'Natural Language',
    shortcuts: [
      { keys: ['tomorrow'], description: 'Set due date to tomorrow' },
      { keys: ['p1'], description: 'Set priority 1 (urgent)' },
      { keys: ['@label'], description: 'Add label to task' },
      { keys: ['#project'], description: 'Assign to project' },
      { keys: ['every day'], description: 'Make task recurring' },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] overflow-auto rounded-xl border border-white/10 bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/5 bg-card">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <span key={j}>
                              <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-mono rounded bg-white/10 border border-white/10 text-foreground">
                                {key}
                              </kbd>
                              {j < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground mx-0.5 text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
