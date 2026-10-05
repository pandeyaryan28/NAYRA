# NAYRA Master Development Plan
**Version**: 1.0.0  
**Project**: NAYRA — Unified Personal Operating System & Assistant Platform  
**Target Environment**: Web Application (React 18 + TypeScript + Vite + Tailwind CSS + Firebase 11)  
**Firebase Project**: `nayra-platform-2026`  

---

## 1. Executive Summary & Product Vision

NAYRA is a unified personal operating system and intelligent assistant designed to synthesize the critical dimensions of individual high-performance living into a cohesive, quiet, and responsive interface:
- **Time**: Google Calendar two-way synchronization, multi-calendar management, timeline views.
- **Action**: Google Tasks integration, hierarchical lists, inline capture, priority tagging.
- **Deep Work**: Task-linked Pomodoro / Focus sessions with strict tab-out accuracy and session metrics.
- **Habits**: Consistency tracking, streak retention, custom recurrence, completion analytics.
- **Nutrition**: Simple and friction-free daily calorie and macronutrient logging with progress gauges.
- **Domain Specialization**: Direct native integration of the **CA-Tracker** (ICAI CA Foundation Exam preparation engine) and **SCInt-Engine** (Semiconductor Supply Chain & 34-Node Venture Diligence platform).
- **Executive Intelligence**: Natural language Personal Assistant parsing instructions like *"Plan my day"*, *"Schedule 2 hours for deep work tomorrow"*, *"How much did I focus this week?"*, and *"How many calories do I have left?"*.

### Design Philosophy & Anti-AI Slop Mandates
In strict conformance with our global UX directives:
1. **Zero Pill Capsules**: No floating rounded-full decorative badges above headings. Real metadata uses crisp rectangular badges with `rounded-md` or `rounded-sm`.
2. **Zero Glowing / Pulsing Dots**: No `animate-ping` or neon drop shadows. Status indicators are static, high-contrast, and typographic.
3. **Zero Cliché Magic Icons**: No `Sparkles`, `Star`, or `Wand` icons to simulate artificial intelligence. Real functional glyphs only (`Bot`, `Clock`, `Calendar`, `CheckSquare`, `Activity`, `Flame`, `BookOpen`, `Cpu`, `Search`, etc.).
4. **Zero Fake Live Gimmicks**: No fake animated particle webs or simulated ticker logs. Every widget visualizes authentic, real-time data.
5. **Zero Custom Mouse Cursors**: Retain native OS pointer fidelity without custom trailing orbs.
6. **Mandatory Multi-Page Architecture**: Real multi-page routing via React Router DOM (`/`, `/calendar`, `/tasks`, `/focus`, `/habits`, `/calories`, `/ca-tracker`, `/scint-engine`, `/analytics`, `/assistant`, `/settings`) with persistent navigation, breadcrumbs, and deep-linkable URLs.
7. **Dual-Theme Parity**: Comprehensive light mode (`zinc-50` / `zinc-100`) and dark mode (`zinc-950` / `zinc-900`) support with high legibility and 1px hairline zinc borders.

---

## 2. Product Architecture

### 2.1 System Architecture Overview
```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAYRA Web Client (SPA)                          │
│   React 18 + TypeScript + Vite + Tailwind CSS + React Router DOM       │
│                                                                        │
│ ┌────────────────────────── Shell & Layout ──────────────────────────┐ │
│ │   Sidebar Nav (Persistent)  •  Top Command Header  •  Theme Engine  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────── Core Modules ────────────────────────────┐ │
│ │  Calendar  │  Tasks  │  Focus/Pomo  │  Habits  │  Calories  │ Ass't│ │
│ │  CA-Tracker (Integrated)    │   SCInt-Engine (Integrated)         │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────── Context State Layer ───────────────────────┐ │
│ │  AuthContext • DataContext • CalendarContext • FocusContext • Theme │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Google APIs (Direct OAuth)     │  │       Firebase Backend       │
│ • Google Calendar v3 API             │  │   (nayra-platform-2026)      │
│   (/calendars, /events, sync)        │  │ • Firebase Auth (Google)     │
│ • Google Tasks v1 API                │  │ • Cloud Firestore ((default))│
│   (/users/@me/lists, /tasks)         │  │ • Multi-Tab Offline Cache    │
│ • OAuth2 Token Lifecycle & Scopes    │  │ • Security Rules (Isolation) │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### 2.2 Frontend Architecture
- **Framework**: React 18.3+ with TypeScript 5.7+ running on Vite 6.
- **Styling**: Tailwind CSS 3.4 with zinc color hierarchy, CSS variables for theme tokens, hairline borders (`border-zinc-200 dark:border-zinc-800`), and tabular numbers (`font-mono tabular-nums`) for timers and analytics.
- **Routing**: `react-router-dom` v6 supplying distinct URLs for all 10 core views.
- **Icons**: `lucide-react` strictly mapping to unambiguous actions.
- **Component Decomposition**:
  - `components/layout`: `AppShell`, `Sidebar`, `Header`, `Breadcrumbs`, `ThemeToggle`, `UserMenu`.
  - `components/calendar`: `CalendarView`, `DayGrid`, `WeekGrid`, `MonthGrid`, `AgendaView`, `EventModal`, `MiniCalendar`, `CalendarSidebar`.
  - `components/tasks`: `TaskListView`, `TaskItem`, `TaskEditor`, `TaskListManager`, `TaskFilters`.
  - `components/focus`: `PomodoroTimer`, `FocusStats`, `TaskSelector`, `CycleProgress`.
  - `components/habits`: `HabitMatrix`, `HabitCard`, `HabitModal`, `StreakCounter`.
  - `components/calories`: `CalorieDashboard`, `FoodLoggerModal`, `MacroBreakdown`, `WeeklyIntakeChart`.
  - `components/ca-tracker`: `CAOverview`, `SyllabusTree`, `RevisionPlanner`, `TestLogger`.
  - `components/scint`: `SCIntExplorer`, `VentureBlueprintModal`, `SupplyChainMatrix`, `SubsidyCalculator`.
  - `components/assistant`: `AssistantChat`, `CommandSuggestions`, `ActionCard`.
  - `components/common`: `Button`, `Input`, `Select`, `Modal`, `Tabs`, `Card`, `Badge`, `EmptyState`.

### 2.3 Backend & Firebase Architecture
- **Firebase Project**: `nayra-platform-2026` (Project Number `413144887088`).
- **Database**: Cloud Firestore in `nam5` (Standard Native Mode).
- **Offline Persistence**: Enabled via `initializeFirestore` with `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`.
- **Local Fallback**: Synchronous `localStorage` cache guarantees 100% functionality even during offline execution, test runs, or when authentication is in guest mode.
- **Hosting**: Configured for Single Page Application rewrites to `/index.html`.

### 2.4 Authentication Architecture
- **Google OAuth 2.0**:
  - Primary provider: Firebase `GoogleAuthProvider`.
  - Additional Scopes requested:
    - `https://www.googleapis.com/auth/calendar` (Read, create, edit, delete Google Calendar events).
    - `https://www.googleapis.com/auth/tasks` (Read, create, edit, complete Google Tasks).
  - Scope Escalation: Granular / progressive consent. If user declines Google Calendar or Tasks scopes during sign-in, the app smoothly operates in Local/Firestore-only mode without crashing.
  - Token Management: OAuth `accessToken` extracted via `GoogleAuthProvider.credentialFromResult(result)` and preserved in encrypted browser session storage. Automatic renewal / re-prompt on 401 Unauthorized responses.
  - Guest/Local Demo Mode: Instant offline access with pre-seeded demo state when users want to test without connecting a Google account.

### 2.5 Database Schema (Firestore)
All user data is strictly scoped under `/users/{userId}/`:

```
/users/{userId}
  ├── profile: { uid, email, displayName, photoURL, createdAt, updatedAt }
  ├── settings: { theme: 'light'|'dark', defaultFocusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, dailyCalorieTarget: 2200, defaultView: 'week' }
  ├── calendars/{calendarId}
  │     { id, googleCalendarId, summary, description, colorId, primary, selected, timeZone }
  ├── events/{eventId}
  │     { id, googleEventId, calendarId, title, description, start: ISOString, end: ISOString, allDay: boolean, location, recurrence, color, reminders }
  ├── taskLists/{listId}
  │     { id, googleTaskListId, title, updated, isDefault: boolean }
  ├── tasks/{taskId}
  │     { id, googleTaskId, taskListId, title, notes, status: 'needsAction'|'completed', due: ISOString, completedAt: ISOString, priority: 'low'|'med'|'high', totalFocusSeconds: number, pomodoroCount: number }
  ├── focusSessions/{sessionId}
  │     { id, taskId: string|null, taskTitle: string|null, durationMinutes: number, completedAt: ISOString, mode: 'focus'|'shortBreak'|'longBreak' }
  ├── habits/{habitId}
  │     { id, title, frequency: 'daily'|'weekly'|'custom', targetDays: number[], category: string, currentStreak: number, bestStreak: number, completions: Record<string, boolean> }
  ├── calorieEntries/{entryId}
  │     { id, date: 'YYYY-MM-DD', mealType: 'breakfast'|'lunch'|'dinner'|'snack', foodName: string, calories: number, proteinGrams: number, carbsGrams: number, fatGrams: number, loggedAt: ISOString }
  ├── caTrackerSyllabus/{topicId}
  │     { id, subjectId, chapterId, title, status: 'pending'|'in_progress'|'completed', startedAt, completedAt, revisions: RevisionRecord[], testRecords: TestRecord[] }
  └── assistantHistory/{msgId}
        { id, role: 'user'|'assistant', text: string, actionExecuted?: any, timestamp: ISOString }
```

### 2.6 State Management & Data Synchronization Strategy
1. **Layer 1: Memory / React Context**:
   - `AuthContext`: Holds current user profile, OAuth tokens, and Google API client readiness.
   - `DataContext`: Holds in-memory caches for tasks, calendars, events, habits, focus sessions, calories, and CA tracker items. Dispatches optimistic UI updates immediately.
   - `FocusContext`: Holds running timer state, ticker tick, active task association, Web Audio chime synthesis.
2. **Layer 2: LocalStorage Persistent Fallback**:
   - Every state update commits synchronously to `localStorage` under namespaced keys (`nayra_tasks`, `nayra_events`, `nayra_habits`, etc.).
3. **Layer 3: Firestore Cloud Storage**:
   - Asynchronous batch writes to Firestore when online.
4. **Layer 4: Google Cloud APIs (Calendar & Tasks)**:
   - When Google OAuth token is present, two-way sync occurs:
     - Pull on initial load with ETags / RFC 3339 timestamps.
     - Push on user edit (Create/Update/Delete).
     - Conflict handling: Last-write-wins with optimistic client rendering and rollback on API reject.

### 2.7 Security & Permission Model
- **Firestore Security Rules**: User isolation enforced via `request.auth != null && request.auth.uid == userId`.
- **OAuth Token Storage**: Access tokens are kept in transient session state and memory, never leaked to public logs or URLs.
- **Input Validation**: Type validation with sanitize helpers stripping undefined keys before database writes.
- **Content Security**: No raw HTML injection, no eval, no external untrusted CDNs.

---

## 3. Feature Architecture & Module Breakdown

### Module 1: Authentication & User Accounts
- **Flow**: User lands on NAYRA -> Clicks "Sign in with Google" -> Popup opens -> User grants Calendar & Tasks scopes -> Redirected to dashboard. Or user selects "Continue as Guest" to test locally.
- **Frontend Components**: `LoginModal`, `UserAvatarMenu`, `ScopeBadgeIndicator`, `SessionStatus`.
- **Edge Cases**: OAuth popup blocked, offline sign-in, token expiration (401), permission revocation.

### Module 2: Calendar (Google Calendar Clone UX)
- **Flow**: User navigates to `/calendar`. Shows standard Google Calendar layout: Left collapsible sidebar with mini date-picker and calendar list; center time-grid with Day, Week, Month, or Agenda views. Clicking any timeslot opens `EventModal` to schedule.
- **Frontend Components**: `CalendarHeader`, `MiniCalendar`, `CalendarListFilter`, `DayView`, `WeekView`, `MonthView`, `AgendaView`, `EventCard`, `EventModal`.
- **Google Calendar API Endpoints**:
  - `GET /calendar/v3/users/me/calendarList`
  - `GET /calendar/v3/calendars/{calendarId}/events`
  - `POST /calendar/v3/calendars/{calendarId}/events`
  - `PATCH /calendar/v3/calendars/{calendarId}/events/{eventId}`
  - `DELETE /calendar/v3/calendars/{calendarId}/events/{eventId}`
- **Edge Cases**: All-day events spanning midnight, overlapping events layout calculation, time-zone offsets, recurring events expansion.

### Module 3: Tasks (Google Tasks Clone UX)
- **Flow**: User navigates to `/tasks`. Displays task lists in left pane, task items in center with check circles, due dates, notes, and an inline "+ Add a task" bar.
- **Task -> Focus Handoff**: Every task row displays a direct "Focus" button. Clicking transitions to `/focus` with the task pre-selected.
- **Frontend Components**: `TaskListSelector`, `TaskItemRow`, `TaskQuickAdd`, `TaskDetailDrawer`, `TaskFilterTabs`.
- **Google Tasks API Endpoints**:
  - `GET /tasks/v1/users/@me/lists`
  - `GET /tasks/v1/lists/{tasklist}/tasks`
  - `POST /tasks/v1/lists/{tasklist}/tasks`
  - `PATCH /tasks/v1/lists/{tasklist}/tasks/{task}`
  - `DELETE /tasks/v1/lists/{tasklist}/tasks/{task}`

### Module 4: Focus / Pomodoro (Focus To-Do Model)
- **Flow**: User selects a task (or enters custom focus objective) -> Sets duration (default 25 min) -> Starts timer. Timer displays minutes:seconds in tabular-nums.
- **Background Accuracy**: Stores `targetEndTime = Date.now() + remainingMs`. On every animation tick / interval, recalculates `remaining = Math.max(0, targetEndTime - Date.now())`. Even if the browser tab sleeps for 20 minutes, the timer accurately expires at the exact second.
- **Audio Notification**: Web Audio API generates a clean, gentle synthesized bell tone when session or break completes.
- **Persistence**: Tab refresh or closing reloads the active timer cleanly.
- **Frontend Components**: `PomodoroClock`, `TimerControls`, `ActiveTaskBanner`, `CyclePips`, `SessionHistoryList`.

### Module 5: Productivity Analytics
- **Metrics**: Total focus hours, completed pomodoros, task velocity (created vs completed), habit consistency rate, daily focus distribution.
- **Visualization**: Zero-slop SVG bar charts and sparklines with dual-theme contrast.
- **Frontend Components**: `MetricStatCard`, `FocusHoursChart`, `TaskCompletionChart`, `HabitAdherenceSummary`.

### Module 6: Habit Tracker
- **Flow**: User creates habits with target frequencies (e.g., Daily, 5x/week). Displays weekly horizontal calendar grid with 1-tap completion toggles.
- **Streaks**: Calculates continuous streak and longest streak accurately.
- **Frontend Components**: `HabitRow`, `HabitWeekGrid`, `NewHabitModal`, `StreakBadge`.

### Module 7: Calorie & Nutrition Tracker
- **Flow**: User sets daily target (e.g., 2,200 kcal). Categorizes food entries into Breakfast, Lunch, Dinner, Snacks.
- **Metrics**: Total consumed, remaining calories, macronutrient split (Protein, Carbs, Fat in grams).
- **Frontend Components**: `CalorieProgressArc`, `MealSectionCard`, `FoodLogItem`, `AddFoodModal`.

### Module 8: CA-Tracker Integration
- **Direct Native Module**: Full incorporation of the ICAI CA Foundation Exam blueprint (Accounting, Business Laws, Quantitative Aptitude, Business Economics), 45 chapters, 129 topics.
- **Features**: 3-tier hierarchical syllabus tree, 4-subject progress gauges, countdown to exam, 1-tap status updates, spaced repetition scheduler, test score logger with ICAI 40% subject / 50% aggregate pass engine.
- **Frontend Components**: `CASyllabusView`, `CAProgressCards`, `CARevisionPlanner`, `CATestLogger`.

### Module 9: SCInt-Engine Integration
- **Direct Native Module**: Full incorporation of the 34-Node Semiconductor Venture Diligence Platform & 6-tier supply chain matrix.
- **Features**: 6-tier supply chain explorer (Mining -> Refining -> Ingot/Wafer -> Fab -> Packaging -> Systems), 34 venture blueprints with 11-pillar diligence framework, CapEx engine, ISM 2.0 / SPECS subsidy calculator, industrial clusters (Dholera, Sanand, Jewar, Dahej), process flow charts.
- **Frontend Components**: `SCIntMatrixView`, `BlueprintDetailModal`, `CapExSubsidyCalculator`, `ClusterMapView`.

### Module 10: NAYRA Personal Assistant Layer
- **Flow**: Interactive natural language bar with quick action chips.
- **Natural Language Parsing Engine**:
  - *"Plan my day"* -> Scans today's calendar and pending tasks; produces structured morning agenda.
  - *"Create task [title] tomorrow"* -> Extracts title and relative date, dispatches task creation.
  - *"Schedule [title] at [time]"* -> Extracts event details, dispatches calendar event creation.
  - *"How much did I focus this week?"* -> Queries focus session logs, computes hours and pomodoro counts.
  - *"How many calories remaining?"* -> Computes target minus consumed.
  - *"Which habits did I miss?"* -> Analyzes uncompleted habit targets for the current week.
- **Frontend Components**: `AssistantDrawer`, `NaturalLanguageInput`, `SuggestedCommandList`, `ActionExecutionReceipt`.

### Module 11: Settings & Preferences
- **Configurations**: Theme selection (Light/Dark/System), Pomodoro durations (Focus, Short Break, Long Break, Long Break Interval), Daily calorie target & macro targets, Google Account connection status & scope management, Data Export & Reset.

---

## 4. Implementation Phases

- **Phase 0 — Project Foundation & Inspection**: (DONE) Inspected `ca-tracker` and `SCInt-Engine`, verified MCP capabilities, created Firebase project `nayra-platform-2026`, enabled APIs.
- **Phase 1 — Workspace Setup & Core Configuration**: Initialize Vite + React + TypeScript + Tailwind CSS in `/home/pandeyaryan28/Documents/NAYRA`, setup `package.json`, `tsconfig.json`, `tailwind.config.js`, `vite.config.ts`, `firebase.json`, `.firebaserc`.
- **Phase 2 — Design System & Application Shell**: Implement `AppShell`, persistent multi-page routing with `react-router-dom`, left navigation sidebar, top executive header, theme provider with light/dark parity.
- **Phase 3 — Authentication & Google API Client**: Firebase Auth integration, Google OAuth popup with Calendar and Tasks scopes, token handling, guest mode fallback.
- **Phase 4 — Google Calendar Integration & UI**: Google Calendar clone UI (Day/Week/Month/Agenda), event creation/editing modal, date navigation, Google Calendar v3 API sync.
- **Phase 5 — Google Tasks Integration & UI**: Google Tasks clone UI (task lists, tasks, subtasks, due dates), Google Tasks v1 API sync.
- **Phase 6 — Focus / Pomodoro & Task Integration**: Accurate timer engine, Web Audio chime synthesis, direct Task -> Focus linking, session recording.
- **Phase 7 — Habit Tracker**: Habit management, weekly grid checkoff, streak computation.
- **Phase 8 — Calorie Tracker**: Food logging, meal categorization, progress gauge, weekly bar chart.
- **Phase 9 — CA-Tracker Native Integration**: ICAI syllabus blueprint, subject gauges, revision planner, test series logger.
- **Phase 10 — SCInt-Engine Native Integration**: 6-tier supply chain matrix, 34 venture blueprints, CapEx subsidy calculator.
- **Phase 11 — Productivity Analytics**: Unified cross-module dashboard combining tasks, focus hours, habits, and calories.
- **Phase 12 — NAYRA Personal Assistant**: Natural language command parser and action execution engine.
- **Phase 13 — Testing, Hardening & Verification**: Vitest unit/integration test suite, security rules validation, production build test.
