'use server';

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an expert science curator for an educational app.
Your task is to generate exactly 5 new, unique, and advanced scientific concepts across various fields (Physics, Biology, Chemistry, Astronomy, etc.).

IMPORTANT REQUIREMENTS:
1. Return ONLY a valid JSON array.
2. Every object in the array MUST match the exact schema shown below.
3. The concepts must be profound, interesting, and cover varied branches of science.

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
      "question_body": "An open-ended, reflective question asking the user to think about the implications or applications of this science."
    }
  }
]`;

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function generateScienceConcepts(interests: string[] = [], exclude: string[] = []) {
    try {
        console.log("Generating science concepts...");
        let userPrompt = "Generate 5 advanced scientific concepts.";
        if (interests && interests.length > 0) {
            userPrompt += ` Try to relate some of the concepts to these user interests if possible: ${interests.join(', ')}. However, prioritize deep, fascinating science over forced relations.`;
        }

        const messages: any[] = [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ];

        if (exclude.length > 0) {
          messages.push({
            role: "system",
            content: `MANDATORY: Do NOT generate any of the following concepts as the user has already learned them: ${exclude.join(', ')}.`
          });
        }

        const completion = await client.chat.completions.create({
          model: "moonshotai/kimi-k2-instruct-0905",
          messages: messages,
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 4096,
          stream: true
        });

        let fullContent = "";
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
          }
        }

        try {
          const startIdx = fullContent.indexOf('[');
          const endIdx = fullContent.lastIndexOf(']') + 1;
          const jsonStr = startIdx !== -1 && endIdx !== -1 ? fullContent.substring(startIdx, endIdx) : fullContent;
          
          const parsed = JSON.parse(jsonStr);
          const concepts = Array.isArray(parsed) ? parsed : (parsed.concepts || parsed.data || Object.values(parsed)[0]);

          if (!Array.isArray(concepts)) {
              throw new Error('Parsed data is not an array.');
          }

          return { success: true, concepts: concepts.slice(0, 5) };
        } catch (parseError) {
          console.error("JSON Parse Error:", fullContent);
          throw new Error("Failed to parse AI response as valid JSON.");
        }

    } catch (error: any) {
        console.error("Science generation failed:", error.message);
        return { success: false, error: error.message || 'Unknown error occurred.' };
    }
}

export async function getScienceFeedback(conceptName: string, conceptText: string, question: string, userAnswer: string) {
    try {
        const prompt = `
          You are a brilliant and encouraging scientific mentor. 
          A student is learning about the scientific concept: "${conceptName}".
          Concept Context: "${conceptText}"
          
          The student was asked this question: "${question}"
          The student provided this answer: "${userAnswer}"
          
          Provide a brief (2-3 sentences) feedback that:
          1. Acknowledges their specific thought or reasoning.
          2. Offers a deeper scientific insight or clarifies a technical point related to their answer.
          3. Is encouraging and promotes scientific curiosity.
          
          Keep the tone inspiring, precise, and intellectually stimulating.
        `;

        const completion = await client.chat.completions.create({
          model: "moonshotai/kimi-k2-instruct-0905",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 512,
        });

        const feedback = completion.choices[0].message.content;
        return { success: true, feedback };

    } catch (error: any) {
        console.error("Science feedback failed:", error.message);
        return { success: false, error: "I couldn't generate scientific feedback right now, but your curiosity is the key to discovery!" };
    }
}
