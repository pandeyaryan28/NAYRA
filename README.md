# 🌌 Nayra — Personal Command Center

> **Nayra** is a futuristic personal command center designed to unify task management, Google ecosystem synchronization, Pomodoro focus sessions, notes capture, and AI-driven nutrition tracking into a single command dashboard.

---

## 🚀 Key Modules & Capabilities

### 1. 📋 Tasks & Project Kanban (Google Tasks 2-Way Sync)
- **Kanban Board & List Views**: Organize work across *To Do*, *In Progress*, *Review*, and *Completed*.
- **Google Tasks 2-Way Sync**: Bidirectional sync between Nayra and Google Tasks with automatic status updates, due dates, and conflict handling.
- **Task Prioritization**: Urgent, High, Medium, and Low flags with estimated vs logged time metrics.
- **One-Click Pomodoro Linking**: Start a focus timer directly attached to any task.

### 2. 📅 Google Calendar Schedule & Agenda
- **Live Google Calendar Sync**: Real-time 2-way sync with your Google Calendar events.
- **Interactive Day & Week Agenda**: Timeline schedule view with meeting links, room locations, and color categories.
- **One-Click Google Meet**: Join conference meetings directly from the HUD.

### 3. ⏱️ Pomodoro Focus & Work Log Entry System
- **Precision Focus Timer**: Focus (25m), Deep Focus (50m), Short Break (5m), and Long Break (15m) with SVG countdown rings and particle celebrations.
- **Manual Work Logger**: Log time spent on tasks after the fact (e.g., *"1h 45m on frontend refactoring"*).
- **Time Analytics**: Track daily focus minutes, streaks, and time spent per project.

### 4. 🥗 Calorie & Nutrition Engine (Antigravity AI Driven)
- **Zero Frontend Friction**: As designed, there is no tedious manual food database setting or calorie searching on the frontend.
- **Natural Language Parsing**: Tell Antigravity AI (or Nayra) what you ate (e.g. *"I had 2 boiled eggs, 2 slices whole wheat toast with butter and black coffee for breakfast"*).
- **Automated Macro Calculations**: Antigravity automatically estimates total calories, protein (g), carbohydrates (g), and fat (g), and writes the structured meal log to the backend!
- **Daily Target Tracking**: Monitor daily calorie budget, macronutrient progress, and water hydration (+250ml quick logs).

### 5. 💡 Keep Notes & Scratchpad
- Sticky note board with color customization, pinning, markdown support, tags, and quick search.

### 6. 🤖 Nayra AI Intelligence HUD (Command Palette)
- Global `Cmd + K` or `Ctrl + K` quick command launcher.
- Conversational Nayra HUD with daily briefings and action execution.

---

## 🛠️ Architecture & Firebase Project

- **Firebase Project**: `nayra-ap28-2026` (Active Firestore database deployed with native security rules & web configuration)
- **Backend API**: Node.js + Express + TypeScript (`server/`)
- **Frontend App**: Vite + React 19 + TypeScript + Tailwind CSS (`client/`)

---

## ⚡ Quickstart Guide

### 1. Start Client and Backend Concurrently
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **Backend Server**: [http://localhost:5000](http://localhost:5000)

### 2. Build for Production
```bash
npm run build
```

---

## 💬 How to Log Meals from Antigravity AI

Whenever you have a meal, simply tell Antigravity:
> *"I had 3 scrambled eggs, 1 bowl of oatmeal with milk, and a banana for breakfast"*

Antigravity or Nayra will parse the meal, calculate the exact macronutrients and calories, and log it directly to your command center dashboard.
