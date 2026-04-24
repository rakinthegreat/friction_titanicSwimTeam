import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'WaitLess',
  storeName: 'offline_cache'
});

export const CACHE_KEYS = {
  QUOTES: 'cached_quotes',
  VIDEOS: 'cached_videos',
  DEFINITIONS: 'cached_definitions',
  DAILY_STATE: 'daily_state'
};

export async function getCachedData<T>(key: string): Promise<T | null> {
  return await localforage.getItem<T>(key);
}

export async function setCachedData<T>(key: string, data: T): Promise<T> {
  return await localforage.setItem(key, data);
}

// Fallback pool (This will be populated by the build-time seeding script)
let bundledPool: any = null;

async function getBundledPool() {
  if (bundledPool) return bundledPool;
  try {
    // We use a dynamic import to avoid bundling this in the web build if not needed
    // The build script will ensure this file exists
    const data = await import('./offline-data.json');
    bundledPool = data.default;
    return bundledPool;
  } catch (e) {
    console.warn('Offline data pack not found. Fallback to minimal defaults.');
    return {
      quotes: ["Reclaim your time.", "Focus is a superpower."],
      videos: []
    };
  }
}

export async function getOfflineQuotes(): Promise<string[]> {
  const cached = await getCachedData<string[]>(CACHE_KEYS.QUOTES);
  if (cached && cached.length > 0) return cached;
  
  const pool = await getBundledPool();
  return pool.quotes || [];
}

export async function getOfflineVideos(): Promise<any[]> {
  const cached = await getCachedData<any[]>(CACHE_KEYS.VIDEOS);
  if (cached && cached.length > 0) return cached;
  
  const pool = await getBundledPool();
  return pool.videos || [];
}
