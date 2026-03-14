# Mission Control

OpenClaw's central operations dashboard.

## Features

- **Task Board** - Drag-and-drop task management with three columns (To Do, In Progress, Done)
- **Calendar** - Monthly calendar view with event indicators
- **Projects** - Project cards with progress tracking
- **Memories** - Timeline view of system memories
- **Docs** - Documentation browser with categories
- **Team** - Team member cards with status indicators
- **Office** - System monitoring dashboard

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- @dnd-kit (drag and drop)
- Lucide React (icons)
- date-fns

## Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Design

Dark theme with a sophisticated, modern aesthetic. Uses CSS variables for theming and follows a consistent design system with:
- Subtle gradients and shadows
- Smooth transitions and micro-interactions
- Consistent spacing and typography

## Routes

- `/tasks` - Task Board
- `/calendar` - Calendar
- `/projects` - Projects
- `/memories` - Memories
- `/docs` - Documentation
- `/team` - Team
- `/office` - Office Status