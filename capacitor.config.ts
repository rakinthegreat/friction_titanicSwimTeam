import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waitless.app',
  appName: 'WaitLess',
  webDir: 'out',
  server: {
    hostname: 'waitless-friction.vercel.app',
    androidScheme: 'https'
  }
};

export default config;
