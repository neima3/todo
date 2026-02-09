# Todoist Clone

A beautiful, feature-rich task management app built with Next.js 16, React 19, and TypeScript. Supports natural language input, recurring tasks, keyboard-driven workflows, and a polished dark/light UI.

## Features

### Task Management
- Create, edit, complete, and delete tasks
- Set priority levels (P1-P4) with color-coded indicators
- Due dates with calendar picker
- Due times support
- Task descriptions
- Subtasks with expand/collapse
- Recurring tasks (daily, weekly, monthly, yearly, custom intervals)
- Undo support for completions and deletions

### Natural Language Input
Type naturally and the app detects:
- **Dates**: `tomorrow`, `next week`, `monday`, `in 3 days`, `Jan 15`
- **Times**: `at 5pm`, `17:00`, `5:30pm`
- **Priority**: `p1`, `p2`, `!!`, `!!!`
- **Labels**: `@urgent`, `@work`
- **Projects**: `#myproject`
- **Recurrence**: `every day`, `every monday`, `weekly`, `monthly`, `every 2 weeks`

### Organization
- **Inbox** - Default catch-all for uncategorized tasks
- **Today** - Tasks due today + overdue section
- **Upcoming** - Future tasks grouped by date
- **Projects** - Custom projects with color coding
- **Sections** - Organize tasks within projects
- **Labels** - Tag tasks with colored labels

### Keyboard Shortcuts
Press `?` to see all shortcuts:

| Shortcut | Action |
|----------|--------|
| `Q` | Quick add task |
| `Cmd+K` | Command palette |
| `?` | Show keyboard shortcuts |
| `G` then `I` | Go to Inbox |
| `G` then `T` | Go to Today |
| `G` then `U` | Go to Upcoming |
| `Cmd+Z` | Undo last action |
| `Cmd+A` | Select all tasks |
| `Esc` | Close dialog / deselect |

### Bulk Actions
Select multiple tasks and perform batch operations:
- Complete all selected
- Delete all selected
- Move to a different project
- Change priority

### Search & Filter
- Filter tasks by text (searches content, labels, descriptions)
- Filter by priority level
- Command palette for quick navigation and task search

### UI/UX
- Dark and light theme with smooth toggle
- Glassmorphism sidebar with gradient mesh background
- Framer Motion animations throughout
- Satisfying task completion animation with checkbox burst
- Responsive design for all screen sizes
- Toast notifications with undo actions
- Data export/import (JSON backup)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Components**: Radix UI primitives (Dialog, Dropdown, Popover, Checkbox, etc.)
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Forms**: React Hook Form + Zod
- **Dates**: date-fns
- **Drag & Drop**: dnd-kit
- **Testing**: Playwright (e2e)

## Getting Started

```bash
npm install
npm run dev -- -p 3022
```

Open [http://localhost:3022](http://localhost:3022) in your browser.

## Testing

```bash
# Install browser
npx playwright install chromium

# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test -g "Quick Add"
```

## Project Structure

```
src/
  app/              # Next.js pages (inbox, today, upcoming, project, label, help)
  components/
    layout/         # MainLayout, Sidebar, CommandPalette, KeyboardShortcutsDialog
    tasks/          # TaskList, TaskItem, QuickAdd, AddTaskInline, TaskFilter, BulkActionBar
    projects/       # ProjectDialog, SectionList
    labels/         # LabelDialog
    providers/      # ThemeProvider, HydrationGuard
    ui/             # Reusable UI primitives (button, checkbox, dialog, etc.)
  lib/              # NLP parser, utility functions
  store/            # Zustand store (tasks, projects, labels, sections)
  types/            # TypeScript interfaces and constants
e2e/                # Playwright end-to-end tests
```

## License

MIT
