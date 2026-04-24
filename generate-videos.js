const fs = require('fs');

const creators = [
  { genre: "Travel", handle: "NadirOnTheGoBangla" },
  { genre: "Travel", handle: "drewbinsky" },
  { genre: "Politics", handle: "PinakiBhattacharya" },
  { genre: "Politics", handle: "EliasHossain" },
  { genre: "News", handle: "aljazeeraenglish" },
  { genre: "News", handle: "ATNBanglanews" },
  { genre: "History", handle: "ADYOPANTO" },
  { genre: "Educational", handle: "veritasium" },
  { genre: "Educational", handle: "10msmain" },
  { genre: "Educational", handle: "kurzgesagt" }
];

const mockIds = [
  "QAaImmqMNj0", "TPWq4XwWCoM", "w4ep9YwpT1g", "HkH4O9_N4k0", "aL-a7P2M_vI",
  "J1OqM70L75Y", "Pz7ZkH8c1zQ", "h6fcK_fRYaI", "FvA2fN8zBXY", "Qn1p8iB2Fj8",
  "dDZb8L8T7K4", "L8h5Kq3jF2c", "qR8B18_j2W0", "w8gKjO2zDLA", "tQoBqL1e1Jg",
  "vM0A7B2Xy2w", "dQw4w9WgXcQ", "M7FIvfx5J10", "c6w22Yk4A6o", "3Z8B_W1JmFk"
];

function getRandomId() {
  return mockIds[Math.floor(Math.random() * mockIds.length)];
}

const adjectives = ["Incredible", "Shocking", "Complete", "Ultimate", "Secret", "Hidden", "New", "Daily"];
const nouns = ["Truth", "Journey", "History", "Analysis", "Updates", "Discoveries", "Facts"];

function getRandomTitle(genre) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `The ${adj} ${noun} of ${genre} - Episode ${Math.floor(Math.random() * 100)}`;
}

let db = [];
let idCounter = 1;

for (let creator of creators) {
  for (let i = 0; i < 10; i++) {
    // Generate different durations to cover all buckets
    let duration;
    if (i < 2) duration = Math.floor(Math.random() * 200) + 60; // <5
    else if (i < 5) duration = Math.floor(Math.random() * 200) + 350; // 5-10
    else if (i < 7) duration = Math.floor(Math.random() * 200) + 650; // 10-15
    else duration = Math.floor(Math.random() * 1000) + 950; // 15+

    const ytId = getRandomId();
    db.push({
      id: `${ytId}_${creator.handle}_${i}`, // Ensure unique react keys
      ytId: ytId, // actual youtube id for iframe
      title: getRandomTitle(creator.genre),
      genre: creator.genre,
      creator: creator.handle,
      duration: duration,
      thumbnail: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
    });
  }
}

fs.writeFileSync('src/stored-data/videos-db.json', JSON.stringify(db, null, 2));
console.log("videos-db.json generated with", db.length, "videos");
