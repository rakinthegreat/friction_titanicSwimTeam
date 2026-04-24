const fs = require('fs');

async function fetchChannelVideos(handle) {
  const url = `https://www.youtube.com/${handle}/videos`;
  console.log('Fetching', url);
  const res = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
  const html = await res.text();
  
  const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  if (!dataMatch) {
    console.error('No ytInitialData found for', handle);
    return [];
  }
  
  let data;
  try {
    data = JSON.parse(dataMatch[1]);
  } catch (e) {
    console.error('Error parsing JSON for', handle);
    return [];
  }

  let videos = [];
  try {
    const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
    const videosTab = tabs.find(t => t.tabRenderer && t.tabRenderer.title === 'Videos');
    const items = videosTab.tabRenderer.content.richGridRenderer.contents;
    
    for (const item of items) {
      if (item.richItemRenderer && item.richItemRenderer.content.videoRenderer) {
        const v = item.richItemRenderer.content.videoRenderer;
        
        // Parse duration text like "10:35" or "1:05:20" to seconds
        let durationSeconds = 0;
        if (v.lengthText && v.lengthText.simpleText) {
          const parts = v.lengthText.simpleText.split(':').map(Number);
          if (parts.length === 2) durationSeconds = parts[0]*60 + parts[1];
          else if (parts.length === 3) durationSeconds = parts[0]*3600 + parts[1]*60 + parts[2];
        }

        videos.push({
          ytId: v.videoId,
          title: v.title.runs[0].text,
          duration: durationSeconds,
          thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` // Use standardized thumbnail
        });
        
        if (videos.length >= 10) break;
      }
    }
  } catch (e) {
    console.error('Error extracting videos for', handle, e.message);
  }
  
  return videos;
}

async function run() {
  const channels = JSON.parse(fs.readFileSync('src/stored-data/channels.json', 'utf8'));
  let db = [];
  
  for (const c of channels) {
    const handle = c.CreatorLink.split('/').pop();
    const fetched = await fetchChannelVideos(handle);
    
    fetched.forEach((v, idx) => {
      db.push({
        id: `${v.ytId}_${handle}_${idx}`,
        ytId: v.ytId,
        title: v.title,
        genre: c.Genre,
        creator: handle.replace('@', ''),
        duration: v.duration,
        thumbnail: v.thumbnail
      });
    });
    
    // Add small delay
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('src/stored-data/videos-db.json', JSON.stringify(db, null, 2));
  console.log(`Generated videos-db.json with ${db.length} videos`);
}

run();
