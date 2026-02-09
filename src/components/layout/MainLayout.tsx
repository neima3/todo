'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTodoStore } from '@/store';
import { Sidebar } from './Sidebar';
import { QuickAdd } from '@/components/tasks/QuickAdd';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, quickAddOpen, setQuickAddOpen, undo } = useTodoStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const router = useRouter();
  const pendingNavKey = useRef<string | null>(null);
  const navTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

    // Undo: Cmd/Ctrl + Z (only outside inputs)
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !isInputFocused) {
      e.preventDefault();
      const action = undo();
      if (action) {
        toast.success('Action undone');
      }
      return;
    }

    // Skip other shortcuts when input is focused
    if (isInputFocused) return;

    // Quick add: Q
    if (e.key === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setQuickAddOpen(true);
      return;
    }

    // Keyboard shortcuts: ?
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShortcutsOpen(true);
      return;
    }

    // Navigation: G then I/T/U (vim-style two-key navigation)
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
      pendingNavKey.current = 'g';
      if (navTimeout.current) clearTimeout(navTimeout.current);
      navTimeout.current = setTimeout(() => { pendingNavKey.current = null; }, 500);
      return;
    }

    if (pendingNavKey.current === 'g') {
      pendingNavKey.current = null;
      if (navTimeout.current) clearTimeout(navTimeout.current);
      switch (e.key) {
        case 'i': router.push('/'); return;
        case 't': router.push('/today'); return;
        case 'u': router.push('/upcoming'); return;
      }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      if (shortcutsOpen) setShortcutsOpen(false);
      else if (quickAddOpen) setQuickAddOpen(false);
      else if (commandPaletteOpen) setCommandPaletteOpen(false);
    }
  }, [quickAddOpen, commandPaletteOpen, shortcutsOpen, setQuickAddOpen, undo, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
