'use server';

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a real-life challenge generator for an app called WaitLess. 
Your goal is to provide users with small, meaningful, and slightly outside-the-box challenges they can do in the real world while they are waiting.

CONTEXTUAL AWARENESS:
The user will provide their current location (e.g., vehicle, crowded place, cafe, waiting room, home, office, nature), posture (sitting, standing), social vibe (introverted, extroverted), and energy level (chill, active).
The challenge MUST be safe, socially appropriate, and physically possible for this specific context.

CHALLENGE GUIDELINES:
1. Keep it simple and low-barrier.
2. It should involve observation, interaction, or a small mindfulness act.
3. Provide an estimated time in seconds (e.g., 60 to 300 seconds).
4. Return ONLY a valid JSON object.

SCHEMA:
{
  "challenge": "A brief, clear description of the challenge.",
  "estimatedTime": number (seconds),
  "rationale": "A one-sentence explanation of why this is a good challenge for the current context."
}`;

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function generateChallenge(
  context: { location: string; posture: string; vibe: string; energy: string },
  previousChallenges: any[] = []
) {
  try {
    let userPrompt = `I am currently ${context.posture} in a ${context.location}. 
    I am feeling ${context.vibe} and my energy level is ${context.energy}. 
    Generate a real-life challenge for me based on the system instructions.`;

    if (previousChallenges.length > 0) {
      const pastTitles = previousChallenges.slice(0, 5).map(c => c.challenge).join(', ');
      userPrompt += ` Avoid repeating these recent challenges: ${pastTitles}.`;
    }

    const completion = await client.chat.completions.create({
      model: 'moonshotai/kimi-k2-instruct-0905',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      top_p: 0.9,
      max_tokens: 1024,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
      }
    }

    const startIdx = fullContent.indexOf('{');
    const endIdx = fullContent.lastIndexOf('}') + 1;
    const jsonStr = startIdx !== -1 && endIdx !== 0
      ? fullContent.substring(startIdx, endIdx)
      : fullContent;

    const parsed = JSON.parse(jsonStr);
    return { success: true, challenge: parsed };

  } catch (error: any) {
    console.error('Challenge generation failed:', error.message);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}
