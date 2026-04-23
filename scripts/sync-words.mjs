import fs from 'fs';
import path from 'path';

async function sync() {
  console.log('Fetching master word list...');
  const res = await fetch('https://random-word-api.herokuapp.com/all');
  if (!res.ok) throw new Error('Failed to fetch');
  
  const allWords = await res.json();
  console.log('Received ' + allWords.length + ' words.');

  const content = 'export const WORD_LIST = ' + JSON.stringify(allWords) + ';';
  const targetPath = path.join(process.cwd(), 'src', 'lib', 'wordlist.ts');
  
  fs.writeFileSync(targetPath, content);
  console.log('Successfully synced to ' + targetPath);
}

sync().catch(console.error);