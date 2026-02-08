'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTodoStore } from '@/store';
import { Sidebar } from './Sidebar';
import { QuickAdd } from '@/components/tasks/QuickAdd';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, quickAddOpen, setQuickAddOpen } = useTodoStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick add: Q or Cmd/Ctrl + K
      if (
        (e.key === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey) ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute('contenteditable') === 'true';

        if (!isInputFocused) {
          e.preventDefault();
          setQuickAddOpen(true);
        }
      }

      // Escape to close quick add
      if (e.key === 'Escape' && quickAddOpen) {
        setQuickAddOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickAddOpen, setQuickAddOpen]);

  return (
    <div className="min-h-screen gradient-bg mesh-gradient">
      <Sidebar />
      <motion.main
        animate={{
          marginLeft: sidebarOpen ? 280 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
          {children}
        </div>
      </motion.main>

      {/* Quick Add Modal */}
      <QuickAdd open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
