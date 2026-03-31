@AGENTS.md

# GRIND — Interval Timer Application

## What This Is

GRIND is a production-quality, offline-first interval timer web app for HIIT, Tabata, CrossFit, boxing, and any interval-based workout. All data lives in the browser (localStorage) — there is no backend, no accounts, no server state. The app is statically exported and hosted at grind-timer.fit.

## Tech Stack

- **Framework**: Next.js 16 with `output: "export"` (static site, no server runtime)
- **React**: 19 with TypeScript (strict mode)
- **Drag-and-drop**: @dnd-kit (core, sortable, utilities)
- **Styling**: Inline styles + Tailwind CSS 4, dark GitHub-inspired palette
- **Fonts**: Roboto (body), Orbitron (timer digits), Roboto Mono (durations)
- **Analytics**: Optional GA4 via `NEXT_PUBLIC_GA_ID` env var

## Core Data Model

```
Workout { name, type, segments[], rounds, prepareSeconds, description? }
IntervalSegment { type: 'work'|'rest'|'prepare', durationSeconds, label? }
```

Workouts are stored in localStorage under `user_workouts`. Session data (active workout) uses sessionStorage. Completed session count is tracked separately.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, meta, SEO, JSON-LD, PWA manifest
│   ├── page.tsx            # Home: workout list (draggable), presets, welcome popup
│   ├── config/
│   │   ├── page.tsx        # Suspense wrapper
│   │   └── ConfigClient.tsx # Workout editor (new/edit/preset/share modes)
│   ├── timer/
│   │   ├── page.tsx        # Suspense wrapper
│   │   └── TimerClient.tsx # Live timer with audio cues, wake lock, tap-to-toggle
│   ├── complete/
│   │   ├── page.tsx        # Suspense wrapper
│   │   └── CompleteClient.tsx # Success screen with elapsed time
│   ├── legal/
│   │   └── page.tsx        # Impressum & privacy policy
│   └── globals.css         # Dark theme, glow border animation, hover rules
├── components/
│   ├── ConfirmDialog.tsx   # Reusable modal dialog (Escape-closeable)
│   ├── Tooltip.tsx         # Hover tooltip (400ms delay, top/bottom)
│   ├── PresetCard.tsx      # Workout card with duration, rounds, segment dots
│   ├── SortableWorkoutCard.tsx # PresetCard + dnd-kit sortable wrapper
│   ├── SegmentRow.tsx      # Draggable interval row (type toggle, duration, label, delete)
│   ├── DurationPicker.tsx  # ± stepper for time values
│   ├── RoundsPicker.tsx    # ± stepper for round count (1-100)
│   ├── GrindLogo.tsx       # App branding (optionally clickable)
│   ├── GoogleAnalytics.tsx # Conditional GA4 script injection
│   └── BfcacheGuard.tsx    # Reloads on bfcache restore to prevent stale state
├── hooks/
│   └── useTimer.ts         # Core timer: 1s interval, segment tracking, audio, vibration
└── lib/
    ├── types.ts            # Workout & IntervalSegment types, SEGMENT_CONFIG colors
    ├── storage.ts          # localStorage CRUD + useSyncExternalStore integration
    ├── presets.ts           # 13 built-in workout templates with descriptions
    ├── utils.ts            # formatTime, formatDuration, share URL encode/decode
    ├── strings.ts          # All UI strings (i18n-ready)
    ├── colors.ts           # Dark theme color palette (C.bg, C.surface, C.green, etc.)
    ├── audio.ts            # Web Audio API: countdown ticks, transitions, completion melody
    ├── analytics.ts        # GA4 event wrapper
    └── theme-color.ts      # Updates <meta name="theme-color"> dynamically
```

## Key Architectural Patterns

### Storage & Reactivity
All persistent state uses localStorage with a custom event system. Components subscribe via React's `useSyncExternalStore`. Cross-tab sync works through native `storage` events + custom `workouts-changed` events.

### Workout Sharing
Share URLs encode workout data client-side with no server:
1. Compact text format: `name|rounds|prep|w30:Label,r15,w45`
2. Deflate compression via browser `CompressionStream` API
3. Base64url encoding (URL-safe, no padding)
4. Fallback to uncompressed format if CompressionStream unavailable
5. Decoder handles all 3 formats: compressed (`z.` prefix), compact, legacy JSON

### Timer System (useTimer hook)
- 1-second `setInterval` granularity
- States: idle → running → paused → running → finished
- Expands workout into flat segment sequence (with prepare segment prepended)
- Calculates current round from segment index
- Audio feedback: countdown ticks (last 10s), transition beeps, completion melody
- Vibration on segment transitions

### Color System
Segment colors drive the entire timer UI — background, text, theme-color meta tag all update per segment. Text color adapts: white on dark segments, black on light (prepare/orange).

## Page Flow

1. **Home** (`/`) — View saved workouts + presets, drag to reorder, tap to edit
2. **Config** (`/config`) — Build or edit a workout. Modes determined by URL params:
   - No params → new workout
   - `?edit=N` → edit saved workout at index N
   - `?preset=N` → load preset template
   - `?share=...` → decode shared workout (async)
3. **Timer** (`/timer`) — Reads workout from sessionStorage, runs the timer
4. **Complete** (`/complete?name=...&elapsed=...`) — Shows results, increments session count

## Web APIs Used

- Web Audio API (tone synthesis for countdown/transitions)
- localStorage & sessionStorage (persistence)
- Clipboard API & Navigator Share API (sharing)
- Screen Wake Lock API (keep screen on during workout)
- CompressionStream/DecompressionStream (URL compression)
- navigator.vibrate (haptic feedback)

## Conventions

- All UI strings live in `src/lib/strings.ts` (centralized for future i18n)
- Colors come from `src/lib/colors.ts` — never hardcode color values in components
- Inline styles are the primary styling approach (not CSS modules)
- Components should stay under 500 lines
- The app is fully offline — no network requests except optional GA4
- PWA manifest at `/manifest.json`, icons in `/public/icons/`
- Domain: grind-timer.fit
