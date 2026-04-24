const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PRODUCTION_URL = 'https://waitless-friction.vercel.app'; // UPDATE THIS

function run(command, env = {}) {
  console.log(`Running: ${command}`);
  execSync(command, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, ...env }
  });
}

try {
  console.log('--- STARTING ANDROID BUILD ---');

  // 1. Seed Content
  run('node scripts/seed-android-content.js');

  // 2. Next.js Build
  console.log('Building Next.js static export...');
  run('npx next build', {
    NEXT_PUBLIC_IS_CAPACITOR: 'true',
    NEXT_PUBLIC_API_BASE_URL: PRODUCTION_URL,
    CAPACITOR_BUILD: 'true'
  });

  // 3. Capacitor Sync
  console.log('Syncing with Capacitor Android...');
  run('npx cap sync android');

  console.log('--- ANDROID BUILD COMPLETE ---');
  console.log(`Note: The app is configured to use ${PRODUCTION_URL} as its gateway.`);
  console.log('Open Android Studio to build the APK.');

} catch (e) {
  console.error('Build failed:', e.message);
  process.exit(1);
}
