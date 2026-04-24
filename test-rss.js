const Parser = require('rss-parser');
const parser = new Parser();
(async () => {
  let feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UCLZLfy4DVTfpBpylslR_OPQ');
  console.log(feed.title);
  feed.items.slice(0,2).forEach(item => {
    console.log(item.title + ':' + item.link);
  });
})();
