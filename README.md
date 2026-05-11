# Calexa — Professional Calendar

A modern, feature-rich calendar application built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **3 Calendar Views** — Month, Week, and Day with smooth Framer Motion transitions
- **Multi-Calendar System** — Gregorian (default), Jalali (Persian/Shamsi), and Hijri (Islamic)
- **Dark / Light / System Theme** — Fully controllable, persisted across sessions
- **Recurring Events** — Daily, weekly, monthly, and yearly recurrence with full expansion across all views
- **Event Categories** — Tag events as Work, Personal, Health, Social, or Travel
- **Command Palette** — `⌘K` / `Ctrl+K` to search commands, navigate, and find events instantly
- **Keyboard Shortcuts** — `N` new event · `T` today · `M/W/D` views · `←/→` navigate months
- **Drag & Drop** — Move events between days directly in the month view
- **Export / Import** — Full `.ics` support — compatible with Google Calendar, Apple Calendar, and Outlook
- **Cloud Sync** — Sign in with Google to sync events across devices via Supabase
- **PWA Ready** — Installable on mobile and desktop
- **Mobile Responsive** — Optimized layout for all screen sizes with swipe navigation
- **localStorage Persistence** — Events saved locally, no account required

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Auth & Sync | Supabase (Google OAuth + PostgreSQL) |
| Drag & Drop | @dnd-kit |
| Command Palette | cmdk |
| Calendar Engine | date-fns |

## Getting Started

```bash
git clone https://github.com/arsixit/calexa.git
cd calexa
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Cloud Sync (optional)

To enable Google sign-in and cross-device sync, create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app works fully offline without these variables.

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
│   └── page.tsx             # Main app shell + swipe navigation
├── components/
│   ├── header.tsx           # Top navigation bar (responsive)
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
    ├── calendar-engine.ts   # Multi-calendar conversion + recurrence
    ├── ics.ts               # iCalendar export/import
    └── supabase/            # Auth & database helpers
```

## Roadmap

- [x] Month / Week / Day views
- [x] Multi-calendar system (Gregorian, Jalali, Hijri)
- [x] Dark / Light / System theme
- [x] Recurring events (daily / weekly / monthly / yearly)
- [x] Event categories (Work, Personal, Health, Social, Travel)
- [x] Command Palette (⌘K)
- [x] Keyboard shortcuts
- [x] Drag & Drop events
- [x] Export / Import .ics
- [x] PWA support
- [x] Google OAuth + cloud sync (Supabase)
- [x] Mobile responsive layout + swipe navigation
- [ ] Event search
- [ ] Reminders & notifications
- [ ] Google Calendar API sync
- [ ] Team event sharing

## License

MIT
