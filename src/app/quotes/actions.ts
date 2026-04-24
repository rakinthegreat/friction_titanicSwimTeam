'use server';

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a quote generator for an app called WaitLess. 
Your goal is to provide users with short, sharp, and motivating one-liners about reclaiming time, building focus, and turning "life's friction" (waiting, commutes, queues, doomscrolling) into "focused productivity."

CRITICAL GUIDELINES:
1. NEVER use the word "patience" or themes of passive endurance.
2. Focus on AGGRESSIVE RECLAMATION of time. Tapping into curiosity, focus, and action.
3. Themes: Killing doomscrolling, sharpening the mind in the gaps, time as a weapon, focus as a superpower.
4. Each quote should be a single sentence.
5. The tone should be modern, sharp, and empowering. No "poetic" fluff.
6. Provide exactly 50 quotes in a JSON array of strings.
7. Return ONLY a valid JSON object with a "quotes" key.

SCHEMA:
{
  "quotes": ["quote 1", "quote 2", ...]
}`;

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function generateQuotes() {
  try {
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Generate 50 fresh quotes about the beauty and utility of waiting.' },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const fullContent = completion.choices[0]?.message?.content || '';
    const startIdx = fullContent.indexOf('{');
    const endIdx = fullContent.lastIndexOf('}') + 1;
    const jsonStr = startIdx !== -1 && endIdx !== 0
      ? fullContent.substring(startIdx, endIdx)
      : fullContent;

    const parsed = JSON.parse(jsonStr);
    return { success: true, quotes: parsed.quotes };

  } catch (error: any) {
    console.error('Quote generation failed:', error.message);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}
