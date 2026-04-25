import { getCachedData, setCachedData, CACHE_KEYS, getOfflineQuotes, getOfflineVideos } from './offline-data-manager';
import { CapacitorHttp } from '@capacitor/core';

const IS_CAPACITOR = typeof window !== 'undefined' && (window as any).Capacitor;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function callGateway(action: string, payload: any = {}) {
  const url = `${API_BASE_URL}/api/android-gateway`;
  
  // Use Native HTTP Bridge if on Capacitor to bypass local interception and CORS
  if (IS_CAPACITOR) {
    try {
      console.log(`[Action Proxy] Using Native Bridge for ${action}`);
      const response = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: { action, payload }
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      
      console.error(`[Action Proxy] Native Bridge Error: Status ${response.status}`);
      throw new Error(`Gateway returned ${response.status}`);
    } catch (e: any) {
      console.error(`[Action Proxy] Native Bridge failed for ${action}:`, e);
      // Fallback to fetch
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    if (!response.ok) {
      console.error(`[Action Proxy] Gateway Error: Status ${response.status} for action ${action}`);
      throw new Error(`Gateway returned ${response.status}`);
    }
    return await response.json();
  } catch (e: any) {
    console.error(`[Action Proxy] Failed to call gateway for ${action}. URL: ${url}. Error:`, e);
    // Log if it's a network error vs a configuration error
    if (e.message.includes('fetch')) {
      console.error('[Action Proxy] Possible CORS issue or Network Disconnected.');
    }
    throw e;
  }
}

export async function generateQuotes() {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
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

export async function getRecommendedVideos(...args: any[]) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
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

export async function generateCrossword() {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { generateCrossword } = await import('@/app/games/crosswords/actions');
    return await generateCrossword();
  }

  try {
    const result = await callGateway('generateCrossword');
    return result;
  } catch (e) {
    return { success: false, error: 'Offline', clues: [] };
  }
}

// Missing action exports to fix build errors
export async function generateConcepts(interests: string[] = [], exclude: string[] = []) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { generateConcepts } = await import('@/app/learn/philosophy/actions');
    return await generateConcepts(interests, exclude);
  }
  return await callGateway('generateConcepts', { interests, exclude });
}

export async function getPhilosophyFeedback(...args: any[]) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { getPhilosophyFeedback } = await import('@/app/learn/philosophy/actions');
    return await getPhilosophyFeedback(args[0], args[1], args[2], args[3]);
  }
  return await callGateway('getPhilosophyFeedback', {
    conceptName: args[0],
    conceptText: args[1],
    question: args[2],
    userAnswer: args[3]
  });
}

export async function generateScienceConcepts(interests: string[] = [], exclude: string[] = []) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { generateScienceConcepts } = await import('@/app/learn/science/actions');
    return await generateScienceConcepts(interests, exclude);
  }
  return await callGateway('generateScienceConcepts', { interests, exclude });
}

export async function getScienceFeedback(...args: any[]) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { getScienceFeedback } = await import('@/app/learn/science/actions');
    return await getScienceFeedback(args[0], args[1], args[2], args[3]);
  }
  return await callGateway('getScienceFeedback', {
    conceptName: args[0],
    conceptText: args[1],
    question: args[2],
    userAnswer: args[3]
  });
}

export async function generateChallenge(...args: any[]) {
  if (process.env.CAPACITOR_BUILD !== 'true' && !IS_CAPACITOR) {
    // @ts-ignore
    const { generateChallenge } = await import('@/app/activities/challenges/actions');
    return await generateChallenge(args[0], args[1]);
  }
  return await callGateway('generateChallenge', {
    context: args[0],
    previousChallenges: args[1]
  });
}

export async function getChallengeFeedback(...args: any[]) {
  return await callGateway('getChallengeFeedback', { payload: args });
}

export async function generatePhilosophyLesson(...args: any[]) {
  return await callGateway('generatePhilosophyLesson', { payload: args });
}

export async function generateScienceLesson(...args: any[]) {
  return await callGateway('generateScienceLesson', { payload: args });
}
