import { registerPlugin, Capacitor } from '@capacitor/core';

export interface WaitLessSensorsPlugin {
  getStationaryStatus(): Promise<{ isStationary: boolean }>;
}

export interface WaitLessDigitalWellbeingPlugin {
  getForegroundApp(): Promise<{ packageName: string }>;
  hasUsageStatsPermission(): Promise<{ granted: boolean }>;
  openUsageSettings(): Promise<void>;
  hasNotificationPermission(): Promise<{ granted: boolean }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  hasBatteryOptimizationPermission(): Promise<{ granted: boolean }>;
  requestBatteryOptimizationPermission(): Promise<void>;
  hasPhysicalActivityPermission(): Promise<{ granted: boolean }>;
  requestPhysicalActivityPermission(): Promise<{ granted: boolean }>;
  hasBackgroundLocationPermission(): Promise<{ granted: boolean }>;
  requestBackgroundLocationPermission(): Promise<void>;
  setupGeofencing(): Promise<{ status: string }>;
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
  openUsageSettings: async () => { console.log('Settings only available on Android'); },
  hasNotificationPermission: async () => ({ granted: true }),
  requestNotificationPermission: async () => ({ granted: true }),
  hasBatteryOptimizationPermission: async () => ({ granted: true }),
  requestBatteryOptimizationPermission: async () => { console.log('Battery optimization only on Android'); },
  hasPhysicalActivityPermission: async () => ({ granted: true }),
  requestPhysicalActivityPermission: async () => ({ granted: true }),
  hasBackgroundLocationPermission: async () => ({ granted: true }),
  requestBackgroundLocationPermission: async () => { console.log('Location settings only on Android'); },
  setupGeofencing: async () => ({ status: 'success' })
};


export { WaitLessSensors, WaitLessDigitalWellbeing };

