'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTodoStore } from '@/store';
import { Sidebar } from './Sidebar';
import { QuickAdd } from '@/components/tasks/QuickAdd';
import { CommandPalette } from './CommandPalette';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, quickAddOpen, setQuickAddOpen } = useTodoStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Quick add: Q (only when not focused on input)
      if (e.key === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInputFocused) {
        e.preventDefault();
        setQuickAddOpen(true);
        return;
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        if (quickAddOpen) setQuickAddOpen(false);
        if (commandPaletteOpen) setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickAddOpen, commandPaletteOpen, setQuickAddOpen]);

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

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onQuickAdd={() => setQuickAddOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAdd open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
