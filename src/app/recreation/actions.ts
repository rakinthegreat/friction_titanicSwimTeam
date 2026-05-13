'use server';

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// --- Pool cache: skip re-scraping on refresh, only re-run AI selection ---
const POOL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const poolCache = new Map<string, { pool: any[]; expiresAt: number }>();

function getPoolCacheKey(
  interests: string[],
  videoGenres: string[],
  context: { location?: string; timeOfDay?: string; weather?: string },
  languages: string[]
) {
  return JSON.stringify({
    interests: [...interests].sort(),
    videoGenres: [...videoGenres].sort(),
    location: context.location,
    timeOfDay: context.timeOfDay,
    languages: [...languages].sort(),
  });
}

const SELECTION_PROMPT = `You are a video curator for WaitLess.
Your goal is to pick the BEST 6 videos from the provided list for a user's current context and language preferences.

IMPORTANT CONSTRAINTS:
1. MANDATORY: You must select exactly 2 videos from the "Discovery" source (indices marked as [Discovery]).
2. MANDATORY: Each of the 6 videos must be from a unique creator.
3. LANGUAGE BALANCE: You must only select videos in the user's preferred languages. If multiple languages are selected, try to maintain a balance (e.g., 3 in English, 3 in Bengali).
4. DURATION DISTRIBUTION (Strict):
   - Exactly 1 "Short" video (2-5 mins)
   - Exactly 1 "Long" video (10-15 mins)
   - Exactly 1 "Epic" video (15+ mins)
   - The remaining 3 videos MUST be in the "Medium" range (5-10 mins).
5. GENRE DIVERSITY: Provide a balanced mix of genres.

SELECTION CRITERIA:
1. Match the Time of Day and Weather context.
2. Align with User Interests and Location.

Return ONLY a JSON array of the indices of the selected videos (e.g., [0, 2, 5, ...]).
`;

export async function getDynamicSearchQueries(
  interests: string[],
  context: { location?: string; timeOfDay?: string; weather?: string },
  languages: string[]
) {
  try {
    const userContext = `
      Interests: ${interests.join(', ')}.
      Preferred Languages: ${languages.join(', ')}.
      Current Context: ${context.timeOfDay || 'Unknown time'} in ${context.location || 'Unknown location'}.
      Weather: ${context.weather || 'Unknown weather'}.
    `;

    const completion = await client.chat.completions.create({
      model: "google/gemma-3n-e2b-it",
      messages: [
        {
          role: "system",
          content: `Generate 4 broad, high-quality YouTube search queries for discovery. 
          REQUIREMENTS:
          1. ALL queries MUST target content in the following languages: ${languages.join(', ')}.
          2. One query MUST be localized: identify the country from the location "${context.location}" and combine it with the user's interests in the preferred languages.
          3. One query should focus on the current vibe (${context.timeOfDay}, ${context.weather}).
          4. Two queries should be general high-interest topics matching interests.
          Return ONLY a JSON array of strings.`
        },
        { role: "user", content: userContext }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || '[]';
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']') + 1;
    return JSON.parse(content.substring(startIdx, endIdx));
  } catch (error) {
    return ["fascinating science", "nature relaxation", "productivity tips"];
  }
}


async function fetchChannelVideosScraping(handle: string) {
  try {
    const url = `https://www.youtube.com/${handle}/videos`;
    console.log(`[Scraper] Fetching curated content from ${url}`);

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const html = await res.text();

    const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!dataMatch) {
      console.error(`[Scraper] No ytInitialData found for ${handle}`);
      return [];
    }

    const data = JSON.parse(dataMatch[1]);
    const videos: any[] = [];

    // Navigate the deep YouTube JSON structure
    const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
    const videosTab = tabs.find((t: any) => t.tabRenderer && (t.tabRenderer.title === 'Videos' || t.tabRenderer.selected));
    const items = videosTab.tabRenderer.content.richGridRenderer.contents;

    for (const item of items) {
      if (item.richItemRenderer && item.richItemRenderer.content.videoRenderer) {
        const v = item.richItemRenderer.content.videoRenderer;

        let durationSeconds = 0;
        if (v.lengthText && v.lengthText.simpleText) {
          const parts = v.lengthText.simpleText.split(':').map(Number);
          if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
          else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        if (durationSeconds >= 120) { // Minimum 2 minutes
          videos.push({
            id: v.videoId,
            ytId: v.videoId,
            title: v.title.runs[0].text,
            duration: durationSeconds,
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
            creator: handle.replace('@', ''),
            url: `https://www.youtube.com/watch?v=${v.videoId}`,
            description: v.descriptionSnippet?.runs[0]?.text || ""
          });
        }
        if (videos.length >= 5) break;
      }
    }
    return videos;
  } catch (e: any) {
    console.error(`[Scraper] Error for ${handle}:`, e.message);
    return [];
  }
}

async function fetchYouTubeSearchScraping(query: string) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    console.log(`[Scraper] Searching for "${query}" at ${url}`);

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      next: { revalidate: 3600 }
    });
    const html = await res.text();

    const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!dataMatch) return [];

    const data = JSON.parse(dataMatch[1]);
    const videos: any[] = [];

    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const itemSection = contents.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer.contents || [];

    for (const item of itemSection) {
      if (item.videoRenderer) {
        const v = item.videoRenderer;

        let durationSeconds = 0;
        if (v.lengthText && v.lengthText.simpleText) {
          const parts = v.lengthText.simpleText.split(':').map(Number);
          if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
          else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        if (durationSeconds >= 120) { // Minimum 2 minutes
          videos.push({
            id: v.videoId,
            ytId: v.videoId,
            title: v.title.runs[0].text,
            duration: durationSeconds,
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
            creator: v.ownerText?.runs[0]?.text || "Unknown",
            url: `https://www.youtube.com/watch?v=${v.videoId}`,
            source: 'Discovery'
          });
        }
        if (videos.length >= 5) break;
      }
    }
    return videos;
  } catch (e: any) {
    console.error(`[Search Scraper] Error for "${query}":`, e.message);
    return [];
  }
}

export async function getRecommendedVideos(
  interests: string[],
  videoGenres: string[],
  context: { location?: string; timeOfDay?: string; weather?: string },
  history: string[] = [],
  languages: string[] = ['english']
) {
  console.log(`\n===== getRecommendedVideos =====`);
  console.log(`[Input] interests: ${interests.join(', ')}`);
  console.log(`[Input] videoGenres: ${videoGenres.join(', ')}`);
  console.log(`[Input] languages: ${languages.join(', ')}`);
  console.log(`[Input] context:`, context);
  console.log(`[Input] history length: ${history.length}`);

  try {
    const cacheKey = getPoolCacheKey(interests, videoGenres, context, languages);
    console.log(`[Cache] Key: ${cacheKey}`);
    const cached = poolCache.get(cacheKey);

    let fullPool: any[];

    if (cached && cached.expiresAt > Date.now()) {
      const minsLeft = Math.round((cached.expiresAt - Date.now()) / 60000);
      console.log(`[Cache] HIT — ${cached.pool.length} videos, expires in ${minsLeft} min`);
      fullPool = cached.pool;
    } else {
      console.log(`[Cache] MISS — starting scrape`);
      const channelsPath = path.join(process.cwd(), 'src/app/recreation/channels.json');
      const allChannels = JSON.parse(fs.readFileSync(channelsPath, 'utf-8'));
      console.log(`[Channels] Total channels in JSON: ${allChannels.length}`);

      const channelMap = new Map<string, { genre: string; language: string }>(
        allChannels.map((c: any) => {
          const handle = c.CreatorLink.split('@')[1];
          return [`@${handle}`, { genre: c.Genre, language: c.Language }];
        })
      );

      const matchedHandles = allChannels
        .filter((c: any) => (videoGenres.includes(c.Genre) || videoGenres.length === 0) && (languages.includes(c.Language) || languages.length === 0))
        .map((c: any) => {
          const parts = c.CreatorLink.split('@');
          return parts.length > 1 ? `@${parts[1]}` : null;
        })
        .filter(Boolean)
        .slice(0, 5);

      console.log(`[Channels] Matched & capped handles (${matchedHandles.length}): ${matchedHandles.join(', ')}`);
      console.log(`[Fetch] Starting parallel: channel scraping + AI query generation`);
      const fetchStart = Date.now();

      const [curatedPoolResults, discoveryQueries] = await Promise.all([
        Promise.all(matchedHandles.map((h: string) => fetchChannelVideosScraping(h))),
        getDynamicSearchQueries(interests, context, languages),
      ]);

      console.log(`[Fetch] Parallel phase done in ${Date.now() - fetchStart}ms`);
      console.log(`[Discovery] AI-generated queries: ${JSON.stringify(discoveryQueries)}`);

      const curatedPool = curatedPoolResults.flat().map(v => {
        const meta = channelMap.get(`@${v.creator}`);
        return {
          ...v,
          source: 'Curated',
          genre: meta?.genre || 'Curated',
          language: meta?.language || 'english'
        };
      });
      console.log(`[Pool] Curated videos scraped: ${curatedPool.length}`);

      console.log(`[Fetch] Starting discovery search scraping (${discoveryQueries.length} queries)`);
      const discoveryStart = Date.now();
      const discoveryPoolResults = await Promise.all(
        discoveryQueries.map((q: string) => fetchYouTubeSearchScraping(q))
      );
      console.log(`[Fetch] Discovery scraping done in ${Date.now() - discoveryStart}ms`);

      const discoveryPool = discoveryPoolResults.flat().map(v => ({
        ...v,
        genre: 'Discovery',
        language: 'Discovery',
      }));
      console.log(`[Pool] Discovery videos scraped: ${discoveryPool.length}`);

      fullPool = [...curatedPool, ...discoveryPool];
      console.log(`[Pool] Full pool size: ${fullPool.length}`);

      poolCache.set(cacheKey, { pool: fullPool, expiresAt: Date.now() + POOL_CACHE_TTL });
      console.log(`[Cache] Pool stored (TTL: 10 min)`);
    }

    let filteredPool = fullPool;
    if (history.length > 0) {
      filteredPool = fullPool.filter(v => !history.includes(v.id));
      console.log(`[History] Filtered out ${fullPool.length - filteredPool.length} already-seen videos → ${filteredPool.length} remaining`);
    } else {
      console.log(`[History] No history, using full pool (${filteredPool.length} videos)`);
    }

    if (filteredPool.length === 0) {
      console.warn(`[Pool] filteredPool is empty — returning []`);
      return [];
    }

    console.log(`[AI Selection] Calling model with ${filteredPool.length} candidates...`);
    const aiStart = Date.now();

    const poolMetadata = filteredPool.map((v, i) => {
      const mins = Math.floor(v.duration / 60);
      return `${i} [${v.source} | ${v.genre} | ${v.language} | ${mins} mins]: ${v.title} by ${v.creator}`;
    }).join('\n');
    const userVibe = `${context.timeOfDay} in ${context.location}, Weather: ${context.weather}. Interests: ${interests.join(', ')}`;

    const selection = await client.chat.completions.create({
      model: "google/gemma-3n-e2b-it",
      messages: [
        { role: "system", content: SELECTION_PROMPT },
        { role: "user", content: `Context: ${userVibe}\n\nCandidate Videos:\n${poolMetadata}` }
      ],
      temperature: 0.3,
    });

    console.log(`[AI Selection] Model responded in ${Date.now() - aiStart}ms`);
    const content = selection.choices[0].message.content || '';
    console.log('[AI Selection] Raw response:', content);

    try {
      const startIdx = content.indexOf('[');
      const endIdx = content.lastIndexOf(']') + 1;
      if (startIdx !== -1 && endIdx > startIdx) {
        const selectedIndices: number[] = JSON.parse(content.substring(startIdx, endIdx));
        console.log(`[AI Selection] Parsed indices: ${JSON.stringify(selectedIndices)}`);
        const picked = selectedIndices
          .map((idx: number) => filteredPool[idx])
          .filter(Boolean)
          .slice(0, 6);
        console.log(`[AI Selection] Returning ${picked.length} videos`);
        if (picked.length > 0) return picked;
      } else {
        console.warn('[AI Selection] No JSON array found in response');
      }
    } catch (parseErr) {
      console.warn('[AI Selection] JSON parse failed:', parseErr);
    }

    console.log('[AI Selection] Falling back to random selection');
    const fallback = [...filteredPool].sort(() => Math.random() - 0.5).slice(0, 6);
    console.log(`[AI Selection] Fallback returning ${fallback.length} videos`);
    return fallback;

  } catch (error) {
    console.error("Recreation selection failed:", error);
    return [];
  }
}

