import { registerPlugin, Capacitor } from '@capacitor/core';

export interface WaitLessSensorsPlugin {
  getStationaryStatus(): Promise<{ isStationary: boolean }>;
}

export interface WaitLessDigitalWellbeingPlugin {
  getForegroundApp(): Promise<{ packageName: string }>;
  hasUsageStatsPermission(): Promise<{ granted: boolean }>;
  openUsageSettings(): Promise<void>;
}

const isNative = Capacitor.isNativePlatform();

const WaitLessSensorsBase = registerPlugin<WaitLessSensorsPlugin>('WaitLessSensors');
const WaitLessDigitalWellbeingBase = registerPlugin<WaitLessDigitalWellbeingPlugin>('WaitLessDigitalWellbeing');

// Web Mocks to prevent crashes
const WaitLessSensors: WaitLessSensorsPlugin = isNative ? WaitLessSensorsBase : {
  getStationaryStatus: async () => ({ isStationary: true })
};

const WaitLessDigitalWellbeing: WaitLessDigitalWellbeingPlugin = isNative ? WaitLessDigitalWellbeingBase : {
  getForegroundApp: async () => ({ packageName: 'com.browser.web' }),
  hasUsageStatsPermission: async () => ({ granted: true }),
  openUsageSettings: async () => { console.log('Settings only available on Android'); }
};

export { WaitLessSensors, WaitLessDigitalWellbeing };

