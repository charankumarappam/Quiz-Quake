# ⚡ QuizQuake: BrainStorm Arena
### Computerized Adaptive Testing & Cognitive Diagnostics Platform

> **Hackathon Problem Solution**: Built to eliminate uniform testing fatigue by dynamically adjusting question difficulty in real time based on candidate performance and delivering an interactive weak-topic diagnostic report upon quiz completion.

---

## 🚀 Quick Start Guide

### 1. Installation
All packages are already installed in this directory. If running on a new environment:
```bash
npm install
```

### 2. Run Development Mode (Full Stack)
Starts both the Express API (`http://localhost:5000`) and the Vite React app (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

### 3. Run Production Server
Serves the pre-compiled, optimized static frontend assets directly through the Express server on port 5000:
```bash
npm start
```
Visit: **`http://localhost:5000`**

### 4. Verify Adaptive Engine Algorithm
Runs the automated verification suite testing difficulty escalation, tier descending, topic coverage, and diagnostic calculations:
```bash
npm run test:engine
```

---

## 🌟 Implemented Features

### Core Features (Must-Have)
- **Real-Time Difficulty Scaling**: 
  - Dynamic 3-tier difficulty model (`Easy`, `Medium`, `Hard`).
  - Starts at `Medium`. 
  - Requires **two consecutive correct answers** to escalate to `Hard`.
  - Drops immediately to a lower tier upon a single incorrect answer.
  - Live animated tier badge in the UI displaying ascend progress dots.
- **Topic-Tagged Question Repository**:
  - **64 verified, high-rigor Computer Science MCQs** categorized across:
    - *Operating Systems* (Deadlocks, Process Scheduling, Virtual Memory, Concurrency)
    - *Data Structures* (Trees, Heaps, AVL/Red-Black, Hash Tables, Graphs)
    - *Algorithms* (Dynamic Programming, Greedy, Graph Algorithms, Sorting)
    - *Computer Networks* (TCP/IP, Congestion Control, Routing, HTTP/QUIC, DNS)
  - Round-robin topic selector that prioritizes unasked topics before repeating an evaluated domain.
- **Synchronized Timer Engine**:
  - Real-time countdown timer with visual urgency states (warning at &lt;60s, pulsing crimson at &lt;20s).
  - Automated test submission when the timer expires.
  - Session state persistence in `sessionStorage` ensuring accidental page refreshes never lose the candidate's timer or progress.
- **Interactive Weak-Topic Radar Chart**:
  - Responsive Chart.js Radar visualization mapping mastery percentages across all evaluated topics.
  - Explicit **60% Critical Deficit boundary** highlighting specific gaps (e.g. *Deadlock Avoidance*).
- **Solution Review Breakdown**:
  - Detailed rationale cards displaying question stem, candidate's choice, correct choice, time spent vs recommended target time.
  - In-depth conceptual explanations and "Core Takeaway" bullet points for every question.
  - Filter by All, Incorrect Only, or by Topic.
- **Attempt History Logger**:
  - Automatically records past attempts in both server storage and `localStorage`.
  - Historical modal with chronological accuracy/ability trend line chart.

### Stretch Features (Good-to-Have)
- **Targeted Remedial Quiz Generator**:
  - Instantly generates an interactive 5-question drill targeting the candidate's detected weak subtopics (e.g. *Deadlock Avoidance* or *Dynamic Programming*).
  - Features immediate conceptual feedback upon every answer.
- **Cohort Percentile Benchmark**:
  - Compares candidate accuracy against a simulated batch of 1,500 engineering test takers ($\mu = 63\%$, $\sigma = 14\%$).
  - Displays user percentile rank (e.g. *88th Percentile*) alongside batch median and top 10% threshold.
- **Gamified Streak Multiplier**:
  - Dynamic score point calculator factoring tier multipliers (Hard questions award 350 base pts &times; streak bonus).
  - Visual streak flame indicator and unlockable achievement badges.
- **One-Click PDF Report Export**:
  - Diagnostic scorecard formatted for faculty and mentor review, printable or exportable as PDF with a single click.
- **Hackathon Judge Quick-Demo Preset**:
  - Prominent banner at the top of the interface allowing evaluators to run the exact scenario specified in the problem brief with 1 click:
    > *"Start OS test &rarr; 2 Medium Correct &rarr; Ascends to Hard (Deadlocks) &rarr; 1 Incorrect &rarr; Drops to Medium &rarr; Flags 'Deadlock Avoidance' on Weak-Topic Radar Chart."*

---

## 🏗️ Project Architecture

```
quizwquake/
├── dist/                              # Compiled, production-ready static assets
├── server/
│   └── src/
│       ├── data/
│       │   ├── questions.json         # 64 verified Computer Science MCQs
│       │   └── history.json           # Persistent attempt logger store
│       ├── adaptiveEngine.ts          # Core IRT heuristic scaling & diagnostic calculation engine
│       ├── server.ts                  # Express REST API (quiz session, scaling, reports)
│       └── test-adaptive.ts           # Automated algorithm test suite
├── src/
│   ├── components/
│   │   ├── AttemptHistoryModal.tsx    # Past attempts table & trend line chart
│   │   ├── CohortBenchmark.tsx        # Percentile rank & distribution bar chart
│   │   ├── DiagnosticReportView.tsx   # Comprehensive post-test report & scorecard
│   │   ├── DifficultyBadge.tsx        # Tier indicator with ascend progress dots
│   │   ├── JudgeDemoBar.tsx           # Quick 1-click hackathon evaluation flow
│   │   ├── Navbar.tsx                 # Header navigation & modal triggers
│   │   ├── QuestionBankModal.tsx      # Browser for all 64 questions with filters
│   │   ├── QuestionCard.tsx           # Timed question card with keyboard shortcuts (1-4, Enter)
│   │   ├── QuizSetup.tsx              # Arena setup, domain selector & candidate config
│   │   ├── RadarChart.tsx             # Interactive weak-topic Chart.js radar chart
│   │   ├── RemedialQuizModal.tsx      # 5-question targeted drill for weak subtopics
│   │   ├── SolutionReview.tsx         # Comprehensive rationale cards with filter
│   │   ├── StreakMultiplier.tsx       # Gamified multiplier & streak flame ticker
│   │   └── TimerEngine.tsx            # Synchronized countdown clock with auto-submit
│   ├── services/
│   │   ├── adaptiveClientEngine.ts    # Resilient client-side fallback engine
│   │   └── api.ts                     # Full-stack API client
│   ├── App.tsx                        # Master application state coordinator with session recovery
│   ├── index.css                      # Tailwind styles & print stylesheet
│   └── main.tsx                       # React application root
├── shared/
│   └── types.ts                       # Shared TypeScript interfaces (Question, DiagnosticReport, etc.)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🧪 Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Chart.js, react-chartjs-2, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript, TSX
- **Algorithms**: Heuristic Item Response Theory (IRT) approximation, sliding-window accuracy, round-robin domain rotation, normal cohort distribution
