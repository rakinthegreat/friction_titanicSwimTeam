# WaitLess


![alt text](icon.png)


**WaitLess** is a modern productivity app designed to help you utilize friction in daily life rather than eliminating it. It transforms friction moments into opportunities for retrospection, real-life challenges, brain challenges, learning, and mindful recreation.

## The WaitLess Identity

Waitless derives its name from the desire to feel the wait a bit less, or make our life appear wait-less. Our icon is a stylized representation of a clock embedded inside a W based shape, with a cutout at the bottom symbolizing the "Less" part of the name. The hands of the clock represent the letter L, the other part of initials. Surrounding the time, there are two arrows rotating in opposite directions, symbolizing the friction that we utilize to make our life better.

## The Philosophy of Friction

We believe friction is not something to be always eliminated or sped up, rather it can be a tool for personal growth in the congitive and social field through learning, brain games and real life challenges.

By automatically detecting friction moments, such as when you are idle at home or stuck in a commute, and by learning "Friction Times" where you would otherwise doomscroll, WaitLess enables you to turn this friction into something meaningful. This friction isn't a barrier; it's a tool for awareness, helping you pause before falling into mindless scrolling and redirecting your energy toward meaningful growth.

## Design Aesthetic: Neumorphism

WaitLess utilizes a **Neumorphic design system** to keep the interface exceptionally simple and distraction-free. By using soft shadows and subtle depth instead of loud colors and complex gradients, the app creates a calm, tactile environment that keeps the user focused on the task at hand. This "soft UI" approach reduces cognitive load, ensuring that the app itself never becomes a point of unnecessary digital friction.

## Core Features

### Automatic Detection & Friction Periods
*   **Intelligent Friction Detection**: The app monitors and detects periods of potential digital friction by GPS, helping you stay aware of your habits in real-time.
*   **Recurring Friction**: Set specific daily or weekly time blocks (e.g., "Bedtime Procrastination" or "Morning Commute").
*   **Custom Friction**: Quickly add one-off friction blocks for immediate focus needs.
*   **Native Alerts**: Receive system notifications (Android & Web) the moment a friction period begins or ends.
*   **Privacy-First Design**: Optional permission tracking with no data uploaded to servers.

### AI-Powered Personalization
*   **Tailored Suggestions**: The platform analyzes your interests and behavior, offering personalized learning paths and productivity tips using efficient algorithms and AI models.
*   **Dynamic Content**: Learning modules in Science and Philosophy adapt based on your specific curiosity and previous reflections.
*   **Smart Video Curation**: WaitLess utilizes AI to curate YouTube videos that match your specific interests and available time, ensuring even your breaks are meaningful.

### The Laboratory (Science)
*   **Discoveries on Demand**: Explore advanced scientific concepts
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
*   **Database**: Firebase Firestore
*   **Authentication**: Firebase Auth (Secure user management)
*   **Mobile Framework**: Capacitor JS (Native Android & iOS support)
*   **Activity Recognition**: Google Activity Recognition API (Automatic habit & friction detection)
*   **Notifications**: Capacitor Local Notifications (System-level scheduling)
*   **Icons & Motion**: Lucide React & Framer Motion

## APIs & Services

WaitLess integrates several industry-standard APIs to provide a rich, real-time experience:

*   **Weather Data**: Open-Meteo API (High-resolution weather forecasting)
*   **Geolocation & Mapping**: Nominatim (OpenStreetMap) for reverse geocoding and location context.
*   **IP Services**: IPAPI.co and FreeIPAPI for fallback location detection.
*   **Content Discovery**: YouTube (Custom curated scraping for mindful video recommendations).
*   **Activity Recognition**: Google Activity Recognition API for intelligent habit and commute detection.

## In App Screenshots
<img width="1469" height="708" alt="mode selection" src="https://github.com/user-attachments/assets/10652bf7-70e6-43ca-951a-e8b63d7c2531" />
<br/>
<img width="1466" height="702" alt="onboarding interests" src="https://github.com/user-attachments/assets/8c3e5215-be13-4970-a7c2-2e505957545b" />
<br/>
<img width="1470" height="706" alt="onboarding videos" src="https://github.com/user-attachments/assets/c262d75b-7800-4055-9063-8557918ba271" />
<br/>
<img width="1470" height="711" alt="onboarding download" src="https://github.com/user-attachments/assets/a442cec1-d054-4c6a-8655-392059ca1bc8" />
<br/>
This is the Homepage
<img width="2940" height="1774" alt="homepage" src="https://github.com/user-attachments/assets/ad9a3f27-6a5c-429c-b47c-48a67005e556" />
<br/>
When user selects 5 minute time break, this suggestions are updated alogorithmically
<img width="2940" height="1548" alt="5 min" src="https://github.com/user-attachments/assets/5da76bc0-664e-41e4-94c4-a51446f4fad1" />
5 min video suggestion
<img width="1410" height="692" alt="image" src="https://github.com/user-attachments/assets/04b5f578-6496-46b0-8660-149858533754" />
Philosophical Exploration
<img width="2940" height="2014" alt="image" src="https://github.com/user-attachments/assets/ca709a2b-eadb-47a7-b5b8-18ef07a4e1cd" />
Memory match game + Session end notification
<img width="2940" height="1574" alt="image" src="https://github.com/user-attachments/assets/b15357c2-6b7d-4f2f-a17e-505953e6533a" />
Profile page
<img width="2940" height="5170" alt="image" src="https://github.com/user-attachments/assets/0a5fed56-f80c-4aa6-9395-8ad966259e75" />
Idle Time detection on phone
<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/a7145d0f-da5a-465a-b39e-fd28fc86b760" />
Dark Mode
<img width="2940" height="1774" alt="image" src="https://github.com/user-attachments/assets/92211867-4dac-4e9f-95b9-eea306a83cc0" />








