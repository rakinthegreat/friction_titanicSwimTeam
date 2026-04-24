const fs = require('fs');

async function run() {
  const res = await fetch('https://www.youtube.com/@EliasHossain/videos', { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
  const html = await res.text();
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  if(!match) return;
  const data = JSON.parse(match[1]);
  const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
  const videosTab = tabs.find(t => t.tabRenderer && t.tabRenderer.title === 'Videos');
  const items = videosTab.tabRenderer.content.richGridRenderer.contents;
  
  const db = JSON.parse(fs.readFileSync('./src/stored-data/videos-db.json', 'utf8'));
  let count = 0;
  for (const item of items) {
    if (item.richItemRenderer && item.richItemRenderer.content.videoRenderer) {
      const v = item.richItemRenderer.content.videoRenderer;
      let durationSeconds = 0;
      if (v.lengthText && v.lengthText.simpleText) {
        const parts = v.lengthText.simpleText.split(':').map(Number);
        if (parts.length === 2) durationSeconds = parts[0]*60 + parts[1];
        else if (parts.length === 3) durationSeconds = parts[0]*3600 + parts[1]*60 + parts[2];
      }
      db.push({
        id: `${v.videoId}_EliasHossain_${count}`,
        ytId: v.videoId,
        title: v.title.runs[0].text,
        genre: "Politics",
        creator: "EliasHossain",
        duration: durationSeconds,
        thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
      });
      count++;
      if (count >= 10) break;
    }
  }
  fs.writeFileSync('./src/stored-data/videos-db.json', JSON.stringify(db, null, 2));
  console.log("Appended", count, "videos for EliasHossain. Total:", db.length);
}
run();
