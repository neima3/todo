'use client';

import { motion } from 'framer-motion';
import {
  HelpCircle,
  Keyboard,
  Sparkles,
  Calendar,
  Flag,
  Tag,
  Hash,
  Inbox,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRIORITY_COLORS } from '@/types';

const shortcuts = [
  { key: 'Q', description: 'Quick add a new task' },
  { key: 'Cmd/Ctrl + K', description: 'Quick add (alternative)' },
  { key: 'Escape', description: 'Close dialogs' },
];

const nlpExamples = [
  {
    input: 'Buy groceries tomorrow',
    output: 'Creates task with due date set to tomorrow',
  },
  {
    input: 'Call mom today at 5pm',
    output: 'Creates task due today at 5:00 PM',
  },
  {
    input: 'Finish report p1',
    output: 'Creates high priority (P1) task',
  },
  {
    input: 'Team meeting next monday #work',
    output: 'Creates task in Work project, due next Monday',
  },
  {
    input: 'Review PR @code @urgent',
    output: 'Creates task with code and urgent labels',
  },
  {
    input: 'Submit proposal in 3 days p2',
    output: 'Creates P2 task due in 3 days',
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Help & Shortcuts</h1>
              <p className="text-sm text-muted-foreground">
                Learn how to use Todoist effectively
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-12">
        {/* Getting Started */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            Getting Started
          </h2>
          <div className="glass rounded-xl p-6 space-y-4">
            <p className="text-muted-foreground">
              Welcome to Todoist! This is a powerful task management app that helps you
              organize your work and life. Here&apos;s how to get started:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Inbox className="h-4 w-4 mt-0.5 text-blue-400" />
                <span>
                  <strong>Inbox</strong> - Your default landing zone for new tasks.
                  Process them by moving to projects or adding due dates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-green-400" />
                <span>
                  <strong>Today</strong> - See all tasks due today and overdue tasks.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Hash className="h-4 w-4 mt-0.5 text-purple-400" />
                <span>
                  <strong>Projects</strong> - Organize related tasks together.
                  Create projects for work, personal, or specific goals.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5 text-orange-400" />
                <span>
                  <strong>Labels</strong> - Add context to tasks that spans across projects.
                  Use labels like @urgent, @waiting, or @quick-win.
                </span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Keyboard Shortcuts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-400" />
            Keyboard Shortcuts
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {shortcuts.map((shortcut, index) => (
              <div
                key={shortcut.key}
                className={`flex items-center justify-between px-6 py-4 ${
                  index !== shortcuts.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="px-3 py-1.5 rounded-lg bg-white/10 font-mono text-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Natural Language */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Natural Language Input
          </h2>
          <div className="glass rounded-xl p-6">
            <p className="text-muted-foreground mb-6">
              Type naturally when adding tasks. The app automatically detects dates,
              priorities, projects, and labels from your input.
            </p>
            <div className="space-y-4">
              {nlpExamples.map((example, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-sm font-mono">
                    {example.input}
                  </code>
                  <span className="text-xs text-muted-foreground sm:w-48">
                    → {example.output}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Priority Levels */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-400" />
            Priority Levels
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {[
              { level: 1, name: 'Urgent', desc: 'Needs immediate attention' },
              { level: 2, name: 'High', desc: 'Important but not urgent' },
              { level: 3, name: 'Medium', desc: 'Normal priority' },
              { level: 4, name: 'Low', desc: 'Can wait' },
            ].map((p, index) => (
              <div
                key={p.level}
                className={`flex items-center gap-4 px-6 py-4 ${
                  index !== 3 ? 'border-b border-white/5' : ''
                }`}
              >
                <Flag
                  className="h-4 w-4"
                  style={{ color: PRIORITY_COLORS[p.level as 1 | 2 | 3 | 4] }}
                />
                <div>
                  <span className="font-medium">P{p.level} - {p.name}</span>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <code className="ml-auto px-2 py-1 rounded bg-white/5 text-xs font-mono">
                  p{p.level}
                </code>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Date Shortcuts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Date Shortcuts
          </h2>
          <div className="glass rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { input: 'today', desc: 'Today' },
                { input: 'tomorrow', desc: 'Tomorrow' },
                { input: 'monday', desc: 'Next Monday' },
                { input: 'next week', desc: 'In 7 days' },
                { input: 'next month', desc: 'In 1 month' },
                { input: 'in 3 days', desc: 'In 3 days' },
                { input: 'Jan 15', desc: 'January 15' },
                { input: '1/15', desc: 'January 15' },
                { input: 'at 5pm', desc: 'At 5:00 PM' },
              ].map((item) => (
                <div key={item.input} className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded bg-white/5 text-xs font-mono">
                    {item.input}
                  </code>
                  <span className="text-muted-foreground text-xs">= {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Pro Tips</h2>
          <div className="glass rounded-xl p-6 space-y-3 text-sm text-muted-foreground">
            <p>
              💡 <strong>Use prefixes:</strong> # for projects, @ for labels, p1-p4 for priority
            </p>
            <p>
              💡 <strong>Combine everything:</strong> &quot;Meeting with John tomorrow at 2pm #work @important p2&quot;
            </p>
            <p>
              💡 <strong>Quick complete:</strong> Click the checkbox to complete a task with a satisfying animation
            </p>
            <p>
              💡 <strong>Keyboard first:</strong> Press Q anywhere to quickly add a task
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
