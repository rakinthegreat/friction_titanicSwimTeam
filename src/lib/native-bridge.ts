import { registerPlugin } from '@capacitor/core';

export interface WaitLessSensorsPlugin {
  getStationaryStatus(): Promise<{ isStationary: boolean }>;
}

const WaitLessSensors = registerPlugin<WaitLessSensorsPlugin>('WaitLessSensors');

export default WaitLessSensors;
