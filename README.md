# Calexa — Professional Calendar

A modern, feature-rich calendar application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **3 Calendar Views** — Month, Week, and Day with smooth Framer Motion transitions
- **Multi-Calendar System** — Gregorian (default), Jalali (Persian/Shamsi), and Hijri (Islamic)
- **Dark / Light / System Theme** — Fully controllable, persisted across sessions
- **Command Palette** — `⌘K` / `Ctrl+K` to search commands, navigate, and find events instantly
- **Keyboard Shortcuts** — `N` new event · `T` today · `M/W/D` views · `←/→` navigate months
- **Drag & Drop** — Move events between days directly in the month view
- **Event Management** — Create, edit, delete with color categories and recurring events
- **Export / Import** — Full `.ics` support — compatible with Google Calendar, Apple Calendar, and Outlook
- **Supabase Google OAuth** — Sign in with Google and keep events synced across devices
- **Cloud Sync** — Per-user persistent sync between local storage and Supabase
- **PWA Ready** — Installable on mobile and desktop
- **localStorage Persistence** — Events saved locally, no account required

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Drag & Drop | @dnd-kit |
| Command Palette | cmdk |
| Calendar Engine | date-fns |

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/calexa.git
cd calexa
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open Command Palette |
| `N` | New Event |
| `T` | Go to Today |
| `M` | Month View |
| `W` | Week View |
| `D` | Day View |
| `←` / `→` | Navigate Month |

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens & utilities
│   ├── layout.tsx           # Root layout + providers
│   └── page.tsx             # Main app shell
├── components/
│   ├── header.tsx           # Top navigation bar
│   ├── sidebar.tsx          # Mini-calendar + upcoming events
│   ├── command-palette.tsx  # ⌘K search & navigation
│   ├── settings-panel.tsx   # Export / Import panel
│   ├── event-dialog.tsx     # Event create/edit modal
│   └── views/
│       ├── month-view.tsx   # Month grid with drag & drop
│       ├── week-view.tsx    # Week time grid
│       └── day-view.tsx     # Day detail view
└── lib/
    ├── types.ts             # TypeScript types
    ├── store.ts             # Zustand store
    ├── calendar-engine.ts   # Multi-calendar conversion
    └── ics.ts               # iCalendar export/import
```

## Roadmap

- [x] Month / Week / Day views
- [x] Multi-calendar system (Gregorian, Jalali, Hijri)
- [x] Dark / Light / System theme
- [x] Command Palette (⌘K)
- [x] Keyboard shortcuts
- [x] Drag & Drop events
- [x] Export / Import .ics
- [x] PWA support
- [x] Supabase Auth (Google OAuth)
- [x] Cloud sync across devices
- [ ] Google Calendar API sync
- [ ] Team event sharing

## License

MIT
