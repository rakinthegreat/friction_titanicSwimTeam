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
  const apiPath = path.resolve(__dirname, '../src/app/api');
  const tempApiPath = path.resolve(__dirname, '../api-temp-hidden');
  
  let apiHidden = false;
  if (fs.existsSync(apiPath)) {
    try {
      fs.renameSync(apiPath, tempApiPath);
      apiHidden = true;
    } catch (e) {
      console.warn('Could not move API folder automatically. If the build fails, try moving it manually.');
      console.warn('Error:', e.message);
    }
  } else if (fs.existsSync(tempApiPath)) {
    console.log('API folder already hidden.');
    apiHidden = true;
  }

  const actionBackups = new Map();
  let actionFiles = [];
  try {
    // 2.5 Disable Server Actions for static export
    console.log('Temporarily redirecting Server Actions to proxy...');
    actionFiles = execSync('powershell -Command "Get-ChildItem -Path src/app -Recurse -Filter \\"actions.ts\\" | Select-Object -ExpandProperty FullName"', { encoding: 'utf8' })
      .split('\n')
      .map(f => f.trim())
      .filter(f => f);
    
    for (const file of actionFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes("from '@/lib/action-proxy'")) {
        console.log(`  Skipping already proxied file: ${file}`);
        continue;
      }
      console.log(`  Redirecting: ${file}`);
      actionBackups.set(file, content);
      fs.writeFileSync(file, "export * from '@/lib/action-proxy';\n", 'utf8');
    }

    run('npx next build --webpack', {
      NEXT_PUBLIC_IS_CAPACITOR: 'true',
      NEXT_PUBLIC_API_BASE_URL: PRODUCTION_URL,
      CAPACITOR_BUILD: 'true'
    });
  } finally {
    // Restore Server Actions
    if (actionBackups.size > 0) {
      console.log('Restoring original Server Actions...');
      for (const [file, content] of actionBackups) {
        try {
          fs.writeFileSync(file, content, 'utf8');
        } catch (err) {
          console.error(`Failed to restore ${file}: ${err.message}`);
        }
      }
    }

    if (apiHidden) {
      console.log('Restoring API routes...');
      // Retry logic for Windows EPERM/EBUSY errors
      let restored = false;
      for (let i = 0; i < 5; i++) {
        try {
          if (fs.existsSync(tempApiPath)) {
            fs.renameSync(tempApiPath, apiPath);
          }
          restored = true;
          break;
        } catch (err) {
          console.warn(`  Attempt ${i + 1} failed to restore API folder. Retrying in 2s...`);
          execSync('powershell -Command "Start-Sleep -Seconds 2"');
        }
      }
      if (!restored) {
        console.error('CRITICAL: API folder could not be restored automatically. Please move it manually from api-temp-hidden to src/app/api');
      }
    }
  }

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
