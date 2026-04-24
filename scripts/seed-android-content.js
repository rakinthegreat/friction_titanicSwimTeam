const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Simple .env.local parser
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const YT_API = process.env.YT_API;

if (!NVIDIA_API_KEY) {
  console.error('NVIDIA_API_KEY not found in .env.local');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function seedQuotes() {
  console.log('Seeding quotes...');
  try {
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        { 
          role: 'system', 
          content: 'Generate 100 short, sharp one-liner quotes for an app called WaitLess. Themes: Reclaiming time, focus, anti-doomscrolling. Return ONLY a JSON object with a "quotes" key.' 
        },
      ],
      response_format: { type: 'json_object' }
    });
    
    const content = JSON.parse(completion.choices[0].message.content);
    return content.quotes;
  } catch (e) {
    console.error('Failed to seed quotes:', e);
    return ["Wait less, live more.", "Focus is your only weapon."];
  }
}

async function seedVideos() {
  console.log('Seeding videos (minimal mock for now)...');
  // In a real scenario, we'd fetch from YouTube API here.
  // For the sake of speed and quota, we'll use some high-quality defaults.
  return [
    {
      id: "w7ejDZ8SWv8",
      title: "How to focus in a world of distractions",
      thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg",
      creator: "TED",
      duration: 600
    },
    {
      id: "m8-3Yv03I3w",
      title: "The Art of Doing Nothing",
      thumbnail: "https://i.ytimg.com/vi/m8-3Yv03I3w/maxresdefault.jpg",
      creator: "The School of Life",
      duration: 350
    }
  ];
}

async function main() {
  const outputPath = path.resolve(__dirname, '../src/lib/offline-data.json');
  
  if (fs.existsSync(outputPath)) {
    console.log(`Offline data already exists at ${outputPath}. Skipping seed.`);
    return;
  }

  const quotes = await seedQuotes();
  const videos = await seedVideos();

  const data = {
    quotes,
    videos,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Successfully seeded offline data to ${outputPath}`);
}

main();
