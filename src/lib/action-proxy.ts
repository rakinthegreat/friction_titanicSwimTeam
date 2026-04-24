import { getCachedData, setCachedData, CACHE_KEYS, getOfflineQuotes, getOfflineVideos } from './offline-data-manager';

const IS_CAPACITOR = typeof window !== 'undefined' && (window as any).Capacitor;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function callGateway(action: string, payload: any = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/android-gateway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    if (!response.ok) throw new Error(`Gateway returned ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error(`[Action Proxy] Failed to call gateway for ${action}:`, e);
    throw e;
  }
}

export async function proxyGenerateQuotes() {
  if (!IS_CAPACITOR) {
    // This should never happen if aliased correctly, but for safety:
    const { generateQuotes } = await import('@/app/quotes/actions');
    return await generateQuotes();
  }

  try {
    const result = await callGateway('generateQuotes');
    if (result.success && result.quotes) {
      await setCachedData(CACHE_KEYS.QUOTES, result.quotes);
      return result;
    }
    throw new Error('Invalid quotes result');
  } catch (e) {
    console.log('[Action Proxy] Offline/Error. Using local quotes.');
    const quotes = await getOfflineQuotes();
    return { success: true, quotes };
  }
}

export async function proxyGetRecommendedVideos(...args: any[]) {
  if (!IS_CAPACITOR) {
    const { getRecommendedVideos } = await import('@/app/recreation/actions');
    return await getRecommendedVideos(args[0], args[1], args[2], args[3], args[4]);
  }

  try {
    const result = await callGateway('getRecommendedVideos', {
      interests: args[0],
      videoGenres: args[1],
      context: args[2],
      history: args[3],
      preferredLanguages: args[4]
    });
    if (result && result.length > 0) {
      await setCachedData(CACHE_KEYS.VIDEOS, result);
      return result;
    }
    throw new Error('Invalid videos result');
  } catch (e) {
    console.log('[Action Proxy] Offline/Error. Using local videos.');
    return await getOfflineVideos();
  }
}

export async function proxyGenerateCrossword() {
  if (!IS_CAPACITOR) {
    const { generateCrossword } = await import('@/app/games/crosswords/actions');
    return await generateCrossword();
  }

  try {
    const result = await callGateway('generateCrossword');
    return result;
  } catch (e) {
    // Crosswords are deterministic, but definitions might be missing.
    // For now, we return a fallback or let the component handle it.
    return { 
      success: false, 
      error: 'Offline',
      clues: [] 
    };
  }
}
