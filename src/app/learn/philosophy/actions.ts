'use server';

const SYSTEM_PROMPT = `You are an expert philosophy curator for an educational app.
Your task is to generate exactly 10 new, unique, and advanced philosophical concepts.

IMPORTANT REQUIREMENTS:
1. Return ONLY a valid JSON array. Do not include markdown formatting (like \`\`\`json) or any conversational text before or after the JSON.
2. If the model forces a <think> block, ensure the final output strictly ends with the JSON array.
3. Every object in the array MUST match the exact schema shown below.
4. The concepts must be profound, interesting, and cover varied branches of philosophy (ethics, metaphysics, epistemology, etc.).

SCHEMA:
[
  {
    "concept_name": "String",
    "concept_text": "A detailed, engaging explanation of the concept (approx 3-4 sentences).",
    "question 1": {
      "type": "mcq",
      "question_body": "First multiple choice question testing understanding.",
      "options": [
        { "optiontext": "String", "is_correct": false },
        { "optiontext": "String", "is_correct": true },
        { "optiontext": "String", "is_correct": false },
        { "optiontext": "String", "is_correct": false }
      ]
    },
    "question 2": {
      "type": "mcq",
      "question_body": "Second multiple choice question.",
      "options": [
        { "optiontext": "String", "is_correct": false },
        { "optiontext": "String", "is_correct": true },
        { "optiontext": "String", "is_correct": false },
        { "optiontext": "String", "is_correct": false }
      ]
    },
    "question 3": {
      "type": "text",
      "question_body": "An open-ended, reflective question asking the user to apply the concept to their life."
    }
  }
]`;

export async function generateConcepts(interests: string[] = []) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_NVIDIA_API_KEY is not configured.');
    }

    let userPrompt = "Generate 10 advanced philosophical concepts.";
    if (interests && interests.length > 0) {
      userPrompt += ` Try to relate some of the concepts to these user interests if possible: ${interests.join(', ')}. However, prioritize deep, classic philosophical concepts over forced relations.`;
    }
    console.log("curating concepts")
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistralai/mistral-large-3-675b-instruct-2512",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 8192,
        stream: false
      })
    });
    console.log(response)

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API Error:", response.status, errorText);
      throw new Error(`Failed to generate concepts: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";

    // Robust JSON extraction to handle <think> blocks or markdown code fences
    // Find the first '[' and the last ']'
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error("Raw content:", content);
      throw new Error('Could not find a valid JSON array in the response.');
    }

    const jsonString = content.substring(startIndex, endIndex + 1);
    const parsedConcepts = JSON.parse(jsonString);

    if (!Array.isArray(parsedConcepts) || parsedConcepts.length === 0) {
      throw new Error('Parsed data is not an array of concepts.');
    }

    return { success: true, concepts: parsedConcepts };

  } catch (error: any) {
    console.error("Concept generation failed:", error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}
