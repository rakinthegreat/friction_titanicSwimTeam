# WaitLess

**WaitLess** is a modern productivity app designed to help you utilize friction in daily life rather than eliminating it. It transforms friction moments into opportunities for retrospection, real-life challenges, brain challenges, learning, and mindful recreation.

## The Philosophy of Friction

Unlike traditional productivity apps that focus on speed and efficiency, **WaitLess** detects friction points in your life and guides you to use them mindfully. 

By automatically detecting friction moments—such as when you are idle at home or stuck in a commute—and by learning "Friction Times" where you would otherwise doomscroll, WaitLess enables you to turn this friction into something meaningful. This friction isn't a barrier; it's a tool for awareness, helping you pause before falling into mindless scrolling and redirecting your energy toward meaningful growth.

## Design Aesthetic: Neumorphism

WaitLess utilizes a **Neumorphic design system** to keep the interface exceptionally simple and distraction-free. By using soft shadows and subtle depth instead of loud colors and complex gradients, the app creates a calm, tactile environment that keeps the user focused on the task at hand. This "soft UI" approach reduces cognitive load, ensuring that the app itself never becomes a point of unnecessary digital friction.

## Core Features

### Intentional Friction & Automatic Detection
*   **Intelligent Friction Detection**: The app monitors and detects periods of potential digital friction by GPS, helping you stay aware of your habits in real-time.
*   **Recurring Friction**: Set specific daily or weekly time blocks (e.g., "Bedtime Procrastination" or "Morning Commute").
*   **Custom Friction**: Quickly add one-off friction blocks for immediate focus needs.
*   **Native Alerts**: Receive system notifications (Android & Web) the moment a friction period begins or ends.

### AI-Powered Personalization
*   **Tailored Suggestions**: The platform analyzes your interests and behavior, offering personalized learning paths and productivity tips using efficient algorithms and AI models.
*   **Dynamic Content**: Learning modules in Science and Philosophy adapt based on your specific curiosity and previous reflections.
*   **Smart Video Curation**: WaitLess utilizes AI to curate YouTube videos that match your specific interests and available time, ensuring even your breaks are meaningful.

### The Laboratory (Science)
*   **Discoveries on Demand**: Explore advanced scientific concepts in Physics, Biology, Astronomy, and more.
*   **AI-Guided Learning**: Engage with interactive MCQs and open-ended reflections.
*   **Researcher Feedback**: Get real-time AI insights on your scientific observations.

### The Sanctum (Philosophy)
*   **Wisdom Curation**: Deep-dive into profound philosophical concepts tailored to your interests.
*   **Self-Reflection**: Log your thoughts on life’s biggest questions and receive wisdom from an AI mentor.
*   **Research Log**: Maintain a historical record of all your philosophical insights and scientific findings.

### Trivia Quest
*   **Knowledge Challenges**: Test your knowledge across multiple categories including Geography, International Affairs, and Bangladesh-specific history and culture.
*   **Rapid Fire**: Engage in timed trivia sessions to sharpen your recall.

### English Mastery
*   **Vocabulary Building**: Expand your vocabulary through interactive "Fill in the Blanks" and "Word Match" games.
*   **Targeted Review**: Master words you've missed through personalized AI-driven review sessions.

### Focused Sessions
*   **Activity Timer**: Launch timed sessions to tackle specific tasks.
*   **Visual Progress**: A beautiful, neumorphic timer keeps you focused, with automatic notifications when your session is complete.

### Games & Mindful Learning
*   **The Arcade**: A diverse collection of brain-training games including 2048, Sudoku, Crosswords, Maze, Memory Match, Rapid Math, Tic-Tac-Toe, and Wordless.

### Adaptive Dashboard
*   **Smart Weather**: Real-time weather updates with context-aware productivity tips.
*   **Intent Setting**: Start your day by defining exactly what you want to achieve.
*   **Progress Tracking**: Monitor your growth through completed concepts and streaks.

### Cloud Sync & Continuity
*   **Multi-Device Sync**: Your progress, friction settings, and learning history are synchronized in real-time across all your devices via Firebase Firestore.
*   **Seamless Transition**: Start a learning session on your desktop and continue exactly where you left off on your mobile device.

## Native Android Support

WaitLess is fully optimized for the Android ecosystem. By leveraging Capacitor JS, the app provides a deep, native experience including:
*   **System-Level Notifications**: Friction alerts and session timers utilize native Android notification channels for reliability.
*   **Background Processing**: The app is designed to handle state and alerts even when minimized, ensuring you never miss a focus window.
*   **Performance**: Deep OS integration ensures smooth animations and fast load times on Android devices.

## Tech Stack

WaitLess is built with a cutting-edge, cross-platform architecture:

*   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
*   **Styling**: Custom Neumorphic Design System (CSS Variables)
*   **State Management**: Zustand with persistent storage
*   **AI Engine**: NVIDIA NIM (moonshotai/kimi-k2-instruct-0905)
*   **Database**: Firebase Firestore (Real-time data synchronization)
*   **Authentication**: Firebase Auth (Secure user management)
*   **Mobile Framework**: Capacitor JS (Native Android & iOS support)
*   **Activity Recognition**: Google Activity Recognition API (Automatic habit & friction detection)
*   **Notifications**: Capacitor Local Notifications (System-level scheduling)
*   **Icons & Motion**: Lucide React & Framer Motion

## External APIs & Services

WaitLess integrates several industry-standard APIs to provide a rich, real-time experience:

*   **Weather Data**: Open-Meteo API (High-resolution weather forecasting)
*   **Geolocation & Mapping**: Nominatim (OpenStreetMap) for reverse geocoding and location context.
*   **IP Services**: IPAPI.co and FreeIPAPI for fallback location detection.
*   **Content Discovery**: YouTube (Custom curated scraping for mindful video recommendations).
*   **Core Infrastructure**: Firebase Authentication and Firestore for secure, real-time data persistence.
*   **Intelligence**: NVIDIA NIM (Kimi model) & Google Gemini (Advanced language models for personalized content and feedback).
*   **Activity Recognition**: Google Activity Recognition API for intelligent habit and commute detection.
