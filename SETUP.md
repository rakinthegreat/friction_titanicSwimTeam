# WaitLess - Developer Setup Guide

This project is a hybrid application built with **Next.js** and **Capacitor JS**.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v18.x or higher (npm v9+)
- **Android Studio**: Required for Android development and background services (Java).
- **Java Development Kit (JDK)**: 17+ (usually bundled with Android Studio).
- **Capacitor CLI**: Handled via `npx cap`.

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd friction_titanicSwimTeam
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Capacitor** (Already done in repo, but for reference):
   ```bash
   npx cap init WaitLess com.waitless.app --web-dir out
   ```

4. **Add Android Platform**:
   ```bash
   npx cap add android
   ```

## Development Workflow

### 1. Web Development (Next.js)
Run the development server for real-time web development:
```bash
npm run dev
```

### 2. Building for Native Android
When you're ready to test on a physical device or emulator:

1. **Export the Next.js app**:
   ```bash
   npm run build
   ```
   *Note: Ensure `next.config.ts` (or `.js`) is configured for static exports if required by your Capacitor setup.*

2. **Sync with Android**:
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   From here, you can run the app on an emulator or device.

## Core Stack Reference
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **State**: Zustand
- **Storage**: IndexedDB (localforage)
- **AI**: Gemini API
- **Native**: Java (Background Services)

## Project Structure
- `/src`: Web application code (React/Next.js)
- `/android`: Native Android project
- `/public`: Static assets
- `Specs.md`: Product specification and roadmap
