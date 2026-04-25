# TODO List - WaitLess

## Phase 2: AI & Content
- [x] Implement AI Content Cache (via `contentStore.ts`)
- [x] Create background sync hook (`useContentSync.ts`)
- [x] Build **WordLess** (Wordle clone using cached vocab)
- [x] Build **Sudoku** (Minimal, offline puzzles)
- [x] Build **Tic Tac Toe** (Minimal, offline puzzles)
- [x] Build **Memory Match** (Card flipping game)
- [x] Build **2048** (Number sliding game)
- [x] Implement **Trivia** session UI (Bangladesh & International)
- [x] Implement **English Learning** (New words, Literature)
- [x] Implement **Philosophy Learning** (Philosophical Ideas)
- [x] Implement **Science Learning** (Facts, concepts)

## Phase 3: Native Features (Capacitor/Java)
- [x] Develop `WaitLessSensors` Java plugin (Stationary detection)
- [x] Develop `WaitLessDigitalWellbeing` Java plugin (UsageStats monitoring)
- [x] Implement Native Permission Sequencing (Notifications -> Battery -> Usage)
- [ ] Implement local push notifications for "Wait" triggers
- [x] Add Activity Recognition & Location permissions (In Manifest)
- [ ] Refine background location logic for high-accuracy wait detection

## Phase 4 & 5: Polish, Backend & Animations
- [x] Integrate **Firebase Auth** for cross-device sync
- [x] Implement **Google Auth** Login/Profile flow with Cloud Backup UI
- [x] Implement **Persistent Daily Streak** system (Date-based tracking)
- [x] Add **Interests Editor** to Profile Tab
- [x] Refine **Sudoku** with high-contrast, professional grid UI
- [x] Stabilize **2048** logic (Movement, Merging, Scaling)
- [x] Implement **Wait-Time Activity Engine** (Interest-matched content)
- [x] Create **Inline Suggestion UI** for Dashboard (3 random options)
- [x] Implement **Dynamic Difficulty Scaling** (Sudoku/Maze consistency)
- [x] Implement **Scalable Session Length** (Trivia/Rapid Math vs time)
- [x] Implement **Persistent Suggestion Engine** (Lock/Restore logic)
- [x] Create **Daily Completion Ticks** (ShieldCheck UI)
- [/] Finalize **Back-to-Dashboard** state restoration for all games
- [ ] Implement "Time Reclaimed" animations and interactive XP leveling system
- [ ] Develop **Vocab Flashcards** module (Gemini-powered)
- [ ] Integrate **Haptic Feedback** for Android via Capacitor Haptics
- [ ] Final UI/UX audit for "Premium" feel (Micro-interactions, Transitions)
- [ ] Production build and Android APK generation

## Phase 6: Testing & Bug Fixes
- [x] Onboarding Page
- [ ] Dashboard Page
    - [ ] English And Trivia dont appear in the dash board.
- [x] Learning Page
    - [x] English Learning
    - [x] Philosophy Learning
    - [x] Science Learning
    - [x] History Trivia
- [x] Games Page
    - [x] WordLess
    - [x] Sudoku
    - [x] Tic Tac Toe
    - [x] Memory Match
    - [x] 2048
    - [x] Rapid Math
- [x] Activities Page
- [ ] Profile Page
- [ ] Settings Page
- [ ] Notification Permission Page
- [ ] Battery Optimization Page
- [ ] Digital Wellbeing Page
- [ ] Location Permission Page
