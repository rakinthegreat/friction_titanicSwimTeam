'use server';

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

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
      model: "moonshotai/kimi-k2-instruct-0905",
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
  try {
    // 1. Fetch from Curated Handles (Scraped)
    const channelsPath = path.join(process.cwd(), 'src/app/recreation/channels.json');
    const allChannels = JSON.parse(fs.readFileSync(channelsPath, 'utf-8'));
    
    // Create a map for quick metadata lookup
    const channelMap = new Map<string, { genre: string; language: string }>(
      allChannels.map((c: any) => {
        const handle = c.CreatorLink.split('@')[1];
        return [`@${handle}`, { genre: c.Genre, language: c.Language }];
      })
    );

    // Filter by user selected genres AND languages
    const matchedHandles = allChannels
      .filter((c: any) => (videoGenres.includes(c.Genre) || videoGenres.length === 0) && (languages.includes(c.Language) || languages.length === 0))
      .map((c: any) => {
        const parts = c.CreatorLink.split('@');
        return parts.length > 1 ? `@${parts[1]}` : null;
      })
      .filter(Boolean)
      .slice(0, 15);

    const curatedPoolResults = await Promise.all(
      matchedHandles.map((h: string) => fetchChannelVideosScraping(h))
    );
    const curatedPool = curatedPoolResults.flat().map(v => {
      const meta = channelMap.get(`@${v.creator}`);
      return { 
        ...v, 
        source: 'Curated',
        genre: meta?.genre || 'Curated',
        language: meta?.language || 'english'
      };
    });

    // 2. Fetch from Discovery (Scraped)
    const discoveryQueries = await getDynamicSearchQueries(interests, context, languages);
    const discoveryPoolResults = await Promise.all(
      discoveryQueries.map((q: string) => fetchYouTubeSearchScraping(q))
    );
    const discoveryPool = discoveryPoolResults.flat().map(v => ({
      ...v,
      genre: 'Discovery',
      language: 'Discovery' // AI will infer actual language from title
    }));

    // 3. Combine and Filter History
    let fullPool = [...curatedPool, ...discoveryPool];
    
    // Remove videos the user just saw
    if (history.length > 0) {
      fullPool = fullPool.filter(v => !history.includes(v.id));
    }

    if (fullPool.length === 0) return [];

    // 4. AI Selection
    const poolMetadata = fullPool.map((v, i) => {
      const mins = Math.floor(v.duration / 60);
      return `${i} [${v.source} | ${v.genre} | ${v.language} | ${mins} mins]: ${v.title} by ${v.creator}`;
    }).join('\n');
    const userVibe = `${context.timeOfDay} in ${context.location}, Weather: ${context.weather}. Interests: ${interests.join(', ')}`;
    
    const selection = await client.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: SELECTION_PROMPT },
        { role: "user", content: `Context: ${userVibe}\n\nCandidate Videos:\n${poolMetadata}` }
      ],
      temperature: 0.3,
    });

    const content = selection.choices[0].message.content || '[]';
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']') + 1;
    const selectedIndices = JSON.parse(content.substring(startIdx, endIdx));

    return selectedIndices
      .map((idx: number) => fullPool[idx])
      .filter(Boolean)
      .slice(0, 6);

  } catch (error) {
    console.error("Recreation selection failed:", error);
    return [];
  }
}

