'use server';

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const SYSTEM_PROMPT = `You are an AI video recommendation expert for an app called WaitLess.
Based on the user's profile and current environmental context, your goal is to generate exactly 5 diverse and highly specific YouTube search queries.

ENVIRONMENTAL FACTORS TO CONSIDER:
1. Time of Day (e.g., Morning = productive/news, Night = relax/docuseries).
2. Location & Weather (e.g., Rain = cozy content, Sunny = travel/outdoor).
3. Interests & Recent Activity.

REQUIREMENTS:
1. Return ONLY a valid JSON array of strings.
2. Make queries specific and high-quality.
3. Align queries with the user's current "vibe" based on the context provided.
`;

export async function getDynamicSearchQueries(
  interests: string[], 
  activityHistory: string[],
  context: { location?: string; timeOfDay?: string; weather?: string }
) {
  try {
    const userContext = `
      Interests: ${interests.join(', ')}. 
      Recent activities: ${activityHistory.join(', ')}.
      Current Context: ${context.timeOfDay || 'Unknown time'} in ${context.location || 'Unknown location'}.
      Weather: ${context.weather || 'Unknown weather'}.
    `;
    
    const completion = await client.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate 5 search queries for this profile: ${userContext}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || '[]';
    // Handle potential string vs array return from Kimi
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.queries || Object.values(parsed)[0] || []);
  } catch (error) {
    console.error("Query generation failed:", error);
    return interests.length > 0 ? [interests[0]] : ["interesting educational videos"];
  }
}

export async function fetchYouTubeVideos(queries: string[]) {
  const API_KEY = process.env.YT_API;
  if (!API_KEY) {
    throw new Error("YT_API key not configured");
  }

  const allVideos: any[] = [];
  
  try {
    const selectedQueries = queries.slice(0, 3);
    const videoIds: string[] = [];
    
    for (const q of selectedQueries) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(q)}&type=video&relevanceLanguage=en&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items) {
        data.items.forEach((item: any) => {
          videoIds.push(item.id.videoId);
        });
      }
    }

    if (videoIds.length === 0) return [];

    // Get durations for all found videos
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(',')}&key=${API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (detailsData.items) {
      detailsData.items.forEach((item: any) => {
        const duration = parseISO8601Duration(item.contentDetails.duration);
        if (duration >= 60) { // Only include videos longer than 1 minute
          allVideos.push({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            creator: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            genre: "For You",
            duration: duration
          });
        }
      });
    }
    
    return allVideos;
  } catch (error) {
    console.error("YouTube fetch failed:", error);
    return [];
  }
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}
