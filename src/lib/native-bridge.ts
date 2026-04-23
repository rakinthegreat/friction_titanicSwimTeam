import { registerPlugin } from '@capacitor/core';

export interface WaitLessSensorsPlugin {
  getStationaryStatus(): Promise<{ isStationary: boolean }>;
}

export interface WaitLessDigitalWellbeingPlugin {
  getForegroundApp(): Promise<{ packageName: string }>;
  hasUsageStatsPermission(): Promise<{ granted: boolean }>;
  openUsageSettings(): Promise<void>;
}

const WaitLessSensors = registerPlugin<WaitLessSensorsPlugin>('WaitLessSensors');
const WaitLessDigitalWellbeing = registerPlugin<WaitLessDigitalWellbeingPlugin>('WaitLessDigitalWellbeing');

export { WaitLessSensors, WaitLessDigitalWellbeing };

