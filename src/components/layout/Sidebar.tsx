'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Hash,
  Tag,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  Settings,
  HelpCircle,
  Download,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTodoStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { LabelDialog } from '@/components/labels/LabelDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  color?: string;
}

function NavItem({ href, icon, label, count, isActive, color }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/20 text-white shadow-sm ring-1 ring-primary/30'
          : 'text-muted-foreground hover:bg-white/10 hover:text-white'
      )}
    >
      <span style={{ color: color || 'inherit' }}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { projects, labels, sidebarOpen, toggleSidebar, getTodayTasks, getInboxTasks, exportData, importData } = useTodoStore();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todoist-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          if (importData(result)) {
            toast.success('Data imported successfully');
          } else {
            toast.error('Failed to import data. Invalid format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const todayCount = hasMounted ? getTodayTasks().length : 0;
  const inboxCount = hasMounted ? getInboxTasks().length : 0;
  const userProjects = projects.filter((p) => p.id !== 'inbox');

  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="text-primary font-bold text-lg">T</span>
                  </motion.div>
                  <span className="font-semibold text-lg tracking-tight">Todoist</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleSidebar}
                  className="text-muted-foreground hover:text-white hover:bg-white/10"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 px-2 py-4">
                {/* Main Views */}
                <nav className="space-y-1">
                  <NavItem
                    href="/"
                    icon={<Inbox className="h-4 w-4" />}
                    label="Inbox"
                    count={inboxCount}
                    isActive={pathname === '/'}
                  />
                  <NavItem
                    href="/today"
                    icon={<Calendar className="h-4 w-4" />}
                    label="Today"
                    count={todayCount}
                    isActive={pathname === '/today'}
                  />
                  <NavItem
                    href="/upcoming"
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Upcoming"
                    isActive={pathname === '/upcoming'}
                  />
                </nav>

                {/* Projects Section */}
                <div className="mt-6">
                  <div className="group flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <button
                      onClick={() => setProjectsExpanded(!projectsExpanded)}
                      className="flex flex-1 items-center gap-2 hover:text-white transition-colors"
                    >
                      {projectsExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span className="flex-1 text-left">Projects</span>
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setProjectDialogOpen(true)}
                          className="opacity-0 group-hover:opacity-100 hover:text-primary p-1 rounded"
                          aria-label="Add project"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add project</TooltipContent>
                    </Tooltip>
                  </div>
                  <AnimatePresence>
                    {projectsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <nav className="mt-1 space-y-1">
                          {userProjects.map((project) => (
                            <NavItem
                              key={project.id}
                              href={`/project/${project.id}`}
                              icon={<Hash className="h-4 w-4" />}
                              label={project.name}
                              color={project.color}
                              isActive={pathname === `/project/${project.id}`}
                            />
                          ))}
                          <button
                            onClick={() => setProjectDialogOpen(true)}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-all duration-200"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add project</span>
                          </button>
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Labels Section */}
                <div className="mt-6">
                  <div className="group flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <button
                      onClick={() => setLabelsExpanded(!labelsExpanded)}
                      className="flex flex-1 items-center gap-2 hover:text-white transition-colors"
                    >
                      {labelsExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span className="flex-1 text-left">Labels</span>
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setLabelDialogOpen(true)}
                          className="opacity-0 group-hover:opacity-100 hover:text-primary p-1 rounded"
                          aria-label="Add label"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add label</TooltipContent>
                    </Tooltip>
                  </div>
                  <AnimatePresence>
                    {labelsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <nav className="mt-1 space-y-1">
                          {labels.map((label) => (
                            <NavItem
                              key={label.id}
                              href={`/label/${label.id}`}
                              icon={<Tag className="h-4 w-4" />}
                              label={label.name}
                              color={label.color}
                              isActive={pathname === `/label/${label.id}`}
                            />
                          ))}
                          <button
                            onClick={() => setLabelDialogOpen(true)}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-all duration-200"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add label</span>
                          </button>
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-white/10 p-2">
                <div className="flex gap-1">
                  <ThemeToggle />
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-1 text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="start" side="top">
                      <DropdownMenuItem onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleImport}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="flex-1 text-muted-foreground hover:text-foreground"
                      >
                        <Link href="/help">
                          <HelpCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Help & Shortcuts</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      )}

      {/* Dialogs */}
      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      <LabelDialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen} />
    </TooltipProvider>
  );
}
