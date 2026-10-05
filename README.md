# NAYRA — Personal Operating System

NAYRA is an integrated personal operating system designed for execution, cognitive focus, nutrition tracking, exam preparation, and supply chain diligence. Built with React, TypeScript, Tailwind CSS, and Firebase.

---

## Core Capabilities

- **Command Dashboard**: Unified operational hub presenting today's calendar schedule, top priority tasks, deep work focus metrics, and daily macro/calorie balance.
- **Deep Calendar & Task Scheduling**: Direct integration with Google Calendar and Google Tasks, supporting Day, Week, Month, and Agenda layouts with bidirectional drag-and-drop rescheduling.
- **Focus Lab**: Pomodoro and deep work timer supporting Focus (25m), Short Break (5m), and Long Break (15m) cycles, audio chimes, cycle progress pips, and task association.
- **Habit Streaks**: Weekly and daily habit consistency tracking with category breakdowns and streak retention.
- **Nutrition & Calorie Tracker**: Daily calorie and macronutrient logging (Protein, Carbs, Fat) with real-time target gauges and meal categorization.
- **CA Foundation Tracker**: ICAI Foundation examination syllabus planner featuring spaced repetition scheduling, 4-paper pass criteria monitoring (≥40% per paper, ≥50% aggregate), and mock test performance logs.
- **SCInt (Semiconductor Diligence Engine)**: 6-tier supply chain matrix covering 34 venture blueprints with CapEx models (Modular vs. Benchmark scale) and ISM 2.0 / SPECS subsidy calculators.
- **Personal Assistant**: Natural language command interface for structuring days, scheduling deep focus blocks, managing task queues, and querying analytics.
- **Productivity Analytics**: Cross-module metrics including 7-day deep work distribution, task completion velocity, and habit adherence.
- **System Settings**: Configurable timer durations, nutritional daily targets, dark/light theme parity, and JSON data export.

---

## Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom micro-interaction keyframes and strict Dark/Light theme parity
- **Routing**: React Router v6 with genuine multi-page deep linking
- **State & Storage**: React Context with LocalStorage caching and cloud synchronization
- **Backend & Cloud**: Firebase Authentication (Google OAuth), Cloud Firestore, Cloud Functions (Node.js)
- **Testing**: Vitest, React Testing Library (43 passing unit and integration tests)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/pandeyaryan28/NAYRA.git
cd NAYRA
npm install
```

### Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Development Server

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

---

## Deployment

NAYRA is configured for deployment to Firebase Hosting and Cloud Functions:

```bash
firebase deploy
```

---

## License

Private repository. All rights reserved.
