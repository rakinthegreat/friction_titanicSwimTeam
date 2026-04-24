'use server';

import axios from 'axios';

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

export async function generateChallenge(
  context: { location: string; posture: string; vibe: string; energy: string }, 
  previousChallenges: any[] = []
) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error('NVIDIA_API_KEY not configured.');

    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    let userPrompt = `I am currently ${context.posture} in a ${context.location}. 
    I am feeling ${context.vibe} and my energy level is ${context.energy}. 
    Generate a real-life challenge for me based on the system instructions.`;
    
    if (previousChallenges.length > 0) {
      const pastTitles = previousChallenges.slice(0, 5).map(c => c.challenge).join(', ');
      userPrompt += ` Avoid repeating these recent challenges: ${pastTitles}.`;
    }

    const payload = {
      "model": "mistralai/mistral-large-3-675b-instruct-2512",
      "messages": [
        { "role": "system", "content": SYSTEM_PROMPT },
        { "role": "user", "content": userPrompt }
      ],
      "max_tokens": 1024,
      "temperature": 0.15,
      "top_p": 1.00,
      "response_format": { "type": "json_object" }
    };

    const response = await axios.post(invokeUrl, payload, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    const content = response.data.choices[0].message.content;
    return { success: true, challenge: JSON.parse(content) };

  } catch (error: any) {
    console.error("Challenge generation failed:", error.response?.data || error.message);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}
