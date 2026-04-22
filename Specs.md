WaitLess - App Specifications Sheet

Tagline: Turn life's friction into focused productivity.
Concept: A productivity/micro-learning app that detects or anticipates waiting periods (commutes, queues, doomscrolling) and provides curated, time-boxed activities based on user interests.

1. Technology Stack

Frontend: Next.js (React), TypeScript, Tailwind CSS.

Mobile Wrapper: Capacitor JS.

Native Android: Java (for background services, sensor managers, and UsageStats).

State Management: Zustand (lightweight, easy to persist to storage).

Local Storage/Caching: IndexedDB (via localforage or idb) for robust offline caching of JSON content.

AI Engine: Gemini API (structured JSON output for trivia/vocab generation).

Future Backend: Firebase / Google Auth (for cross-device sync of stats, interests, and saved links).

2. UI / UX Design System

Style: "Modern Soft UI" (Accessible Minimalist). We are shifting away from strict neomorphism (which fails outdoor contrast tests) to a clean, card-based minimal design with subtle drop shadows, rounded corners, and high-contrast typography.

Light Theme: Beige background (#F9F6F0), dark charcoal text (#2D2D2D), soft white cards (#FFFFFF).

Dark Theme: Deep Grey background (#121212), off-white text (#E0E0E0), elevated grey cards (#1E1E1E).

Accent Colors: Muted, calming tones (e.g., Sage Green for productivity, Soft Orange for warnings/timers).

3. Core User Flow

Onboarding (First Launch):

Select 3-5 interests (e.g., Tech, History, Logic Puzzles, Languages).

Location permission (Standard prompt: "To show local weather and traffic-based prompts").

The "Wait" Trigger:

Manual: User opens app, selects wait time (5, 10, 15, 20, 25, 30 mins).

Automated (Android): App detects stationary status at a known traffic node OR user opens Instagram for >10 mins -> sends local notification -> "Looks like you're stuck. Got 5 minutes?"

Dashboard:

Dynamic Greeting + Local Weather + 1 "Did you know?" Trivia fact.

Grid of suggested activities matching the chosen time block.

Activity Session:

User engages in activity (Game, Read, Watch).

Timer runs in background.

Completion & Stats:

"Time Reclaimed" logged.

Points/XP awarded based on cognitive load (Games = 10xp, Reading = 20xp).

4. Curated Activities & Games

To keep the app engaging during waits, we will design several built-in, offline-capable React mini-games, alongside consumable media.

Built-in Mini-Games (React-based, Offline):

WordLess: A 5-letter word guessing game (Wordle clone) pulling from the user's cached vocab list.

Sudoku (Minimal): Clean, auto-generating Sudoku puzzles of varying difficulty based on wait time.

Tic-Tac-Toe / Connect 4: Quick rounds against a simple AI.

Memory Match: Card flipping game using icons related to their chosen interests.

2048 (Number Swipe): For longer commutes where users just need mindless but non-toxic engagement.

Quick Math: Rapid-fire arithmetic questions for 2-minute bursts.

Feature Offline/Online Matrix:

Feature

Online Behavior

Offline Behavior (Cached)

Games (Listed above)

Runs locally in React.

Runs locally in React.

Vocab / Trivia

Fetches fresh batch if cache is > 5 days old.

Reads from local JSON cache.

Reading / Jokes

Fetches fresh batch if cache is > 5 days old.

Reads from local JSON cache.

YouTube / Shorts

Renders via iframe/WebView.

Disabled/Hidden. Replaced by cached text content.

Weather

Fetches current location weather.

Shows "Offline" or last known forecast.

5. Gemini API & Caching Strategy

To minimize token usage and latency, the app will never query Gemini in real-time while the user is waiting.

The Cache Cycle: On first launch (and every 5th day in the background), the app sends a single, large prompt to Gemini including the user's saved interests.

Prompt Example: "Generate 50 trivia questions, 20 advanced vocabulary words with definitions, 10 short clean jokes, and 5 search queries for educational YouTube shorts based on [User Interests]. Return strictly as a JSON object."

Storage: The Next.js app parses this JSON and stores it in IndexedDB.

Serving: When the user selects "10 minutes of Trivia," the app serves questions directly from IndexedDB.

6. Native-to-Web Bridge (Capacitor + Java)

Since Capacitor acts as a bridge between the web view and the Android OS, we need custom plugins to communicate state.

Plugin 1: WaitLessSensors

Native (Java): Uses ActivityRecognitionClient (detects if walking, in vehicle, or still) and LocationManager.

Bridge: Sends events to Next.js like onUserStationary or onCommuteStarted.

Plugin 2: WaitLessDigitalWellbeing

Native (Java): Uses UsageStatsManager to monitor foreground app times.

Bridge: If a blacklisted app (e.g., TikTok) is open for > X minutes, sends a local push notification. Tapping the notification opens WaitLess with a specific Next.js route (/intervention).

7. Progressive Permission Flow

To prevent high uninstall rates on Android, permissions are requested contextually:

Location (Basic): Asked during onboarding for Weather.

Notifications: Asked after the user completes their first successful activity ("Want us to remind you to do this next time you're stuck in traffic?").

Background Location (Traffic): Asked in a dedicated settings banner ("Enable Automatic Commute Detection").

Usage Access (Doomscrolling): Triggered by a specific feature card on the dashboard called "Social Media Rescue." The app explains why it needs UsageStats before opening the Android system settings.

8. Data Models (Zustand & IndexedDB)

User Profile State (userStore - Local & Synced to Firebase later)

{
  uid: string | null,
  interests: string[], // e.g., ["Space", "History", "Coding"]
  stats: {
    totalMinutesSaved: number,
    activitiesCompleted: number,
    streakDays: number
  },
  preferences: {
    darkMode: boolean,
    blockDoomscrolling: boolean
  }
}


Content Cache Schema (contentDB - IndexedDB)

{
  lastFetched: timestamp,
  trivia: [{ q: string, a: string, category: string, used: boolean }],
  vocab: [{ word: string, meaning: string, example: string, used: boolean }],
  jokes: [{ setup: string, punchline: string, used: boolean }],
  // Newly added: Storing URLs for quick access when online
  watchables: [{ 
    title: string, 
    url: string, 
    type: "tutorial" | "short", 
    category: string, 
    durationEstimateMins: number 
  }] 
}
