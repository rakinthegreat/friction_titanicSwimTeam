async function run() {
  const res = await fetch("https://www.youtube.com/@NadirOnTheGoBangla/videos", { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
  const html = await res.text();
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  const data = JSON.parse(match[1]);
  const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
  const videosTab = tabs.find(t => t.tabRenderer && t.tabRenderer.title === 'Videos');
  const items = videosTab.tabRenderer.content.richGridRenderer.contents;
  let count = 0;
  for (const item of items) {
    if (item.richItemRenderer && item.richItemRenderer.content.videoRenderer) {
      count++;
    }
  }
  console.log("Found", count, "videos for Nadir");
}
run();
