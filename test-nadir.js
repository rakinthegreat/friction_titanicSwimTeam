async function run() {
  const res = await fetch("https://www.youtube.com/@NadirOnTheGoBangla/videos", { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
  const html = await res.text();
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  if (!match) console.log("NO MATCH", html.substring(0, 500));
  else console.log("MATCH FOUND", JSON.parse(match[1]).contents ? "Has contents" : "No contents");
}
run();
