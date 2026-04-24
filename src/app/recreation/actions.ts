'use server';

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const SELECTION_PROMPT = `You are a video curator for WaitLess.
Your goal is to pick the BEST 6 videos from a provided list for a user's current context.

SELECTION CRITERIA:
1. Match the Time of Day (e.g., Morning = energizing, Night = relaxing).
2. Match the Weather/Location context.
3. Align with User Interests.
4. Prioritize diversity in creators.

Return ONLY a JSON array of the indices of the selected videos (e.g., [0, 2, 5, ...]).
`;

export async function getDynamicSearchQueries(
  interests: string[],
  context: { location?: string; timeOfDay?: string; weather?: string }
) {
  try {
    const userContext = `
      Interests: ${interests.join(', ')}.
      Current Context: ${context.timeOfDay || 'Unknown time'} in ${context.location || 'Unknown location'}.
      Weather: ${context.weather || 'Unknown weather'}.
    `;

    const completion = await client.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: "Generate 3 broad, high-quality YouTube search queries for discovery based on this context. Return ONLY a JSON array of strings." },
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

export async function fetchYouTubeVideos(queries: string[], type: 'search' | 'channel' = 'search') {
  const API_KEY = process.env.YT_API;
  if (!API_KEY) throw new Error("YT_API key not configured");

  console.log(`[YT API] Fetching ${type} pool for:`, queries);
  const allVideos: any[] = [];
  
  try {
    // Quota Optimization: Batch queries into groups of 5 to save units
    // Each search request costs 100 units regardless of results count (up to 50)
    const batchSize = type === 'channel' ? 10 : 3;
    const batchedQueries: string[] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      batchedQueries.push(batch.join(' | '));
    }

    for (const q of batchedQueries) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${type === 'channel' ? 20 : 10}&q=${encodeURIComponent(q)}&type=video&relevanceLanguage=en&order=${type === 'channel' ? 'date' : 'relevance'}&key=${API_KEY}`;
      
      console.log(`[YT API] Requesting: ${url}`);
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        console.error(`[YT API] Error:`, data.error.message);
        if (data.error.message.includes('quota')) break; // Stop if quota hit
        continue;
      }

      if (data.items) {
        console.log(`[YT API] Found ${data.items.length} items for batch: ${q}`);
        data.items.forEach((item: any) => {
          allVideos.push({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            creator: item.snippet.channelTitle,
            description: item.snippet.description
          });
        });
      }
    }
    
    if (allVideos.length === 0) return [];

    // Get durations and filter
    const videoIds = allVideos.map(v => v.id).slice(0, 50); // API limit is 50
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(',')}&key=${API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    const processedVideos: any[] = [];
    if (detailsData.items) {
      detailsData.items.forEach((item: any) => {
        const duration = parseISO8601Duration(item.contentDetails.duration);
        if (duration >= 60) {
          processedVideos.push({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            creator: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            duration: duration,
            description: item.snippet.description
          });
        }
      });
    }
    return processedVideos;
  } catch (error) {
    console.error("YouTube fetch failed:", error);
    return [];
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

        if (durationSeconds >= 60) { // No shorts
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

export async function getRecommendedVideos(
  interests: string[],
  videoGenres: string[],
  context: { location?: string; timeOfDay?: string; weather?: string }
) {
  try {
    // 1. Get Curated Handles from JSON
    const channelsPath = path.join(process.cwd(), 'src/app/recreation/channels.json');
    const allChannels = JSON.parse(fs.readFileSync(channelsPath, 'utf-8'));
    
    // Filter by user selected genres
    const matchedHandles = allChannels
      .filter((c: any) => videoGenres.includes(c.Genre) || videoGenres.length === 0)
      .map((c: any) => {
        const parts = c.CreatorLink.split('@');
        return parts.length > 1 ? `@${parts[1]}` : null;
      })
      .filter(Boolean);

    // 2. Fetch via Scraper (0 Quota, 0 YT API usage)
    // We fetch a bit more to give AI a good pool to select from
    const curatedPoolResults = await Promise.all(
      matchedHandles.slice(0, 15).map((h: string) => fetchChannelVideosScraping(h))
    );
    const fullPool = curatedPoolResults.flat();

    if (fullPool.length === 0) return [];

    // 3. AI Selection from Curated Pool
    const poolMetadata = fullPool.map((v, i) => `${i}: ${v.title} by ${v.creator}`).join('\n');
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

    // Return the AI-selected videos
    return selectedIndices
      .map((idx: number) => fullPool[idx])
      .filter(Boolean)
      .slice(0, 6);

  } catch (error) {
    console.error("Recreation selection failed:", error);
    return [];
  }
}
