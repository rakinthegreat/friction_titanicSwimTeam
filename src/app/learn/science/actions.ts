'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert science curator for an educational app.
Your task is to generate exactly 10 new, unique, and advanced scientific concepts across various fields (Physics, Biology, Chemistry, Astronomy, etc.).

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

export async function generateScienceConcepts(interests: string[] = []) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            systemInstruction: SYSTEM_PROMPT
        });

        let userPrompt = "Generate 10 advanced scientific concepts.";
        if (interests && interests.length > 0) {
            userPrompt += ` Try to relate some of the concepts to these user interests if possible: ${interests.join(', ')}. However, prioritize deep, fascinating science over forced relations.`;
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        });

        const content = result.response.text();

        if (!content) {
            throw new Error('No content received from Gemini SDK.');
        }

        const parsedConcepts = JSON.parse(content);

        if (!Array.isArray(parsedConcepts) || parsedConcepts.length === 0) {
            throw new Error('Parsed data is not an array of concepts.');
        }

        return { success: true, concepts: parsedConcepts };

    } catch (error: any) {
        console.error("Science concept generation failed:", error);
        return { success: false, error: error.message || 'Unknown error occurred.' };
    }
}

export async function getScienceFeedback(conceptName: string, conceptText: string, question: string, userAnswer: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
        });

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

        const result = await model.generateContent(prompt);
        const feedback = result.response.text();

        return { success: true, feedback };
    } catch (error: any) {
        console.error("Science feedback generation failed:", error);
        return { success: false, error: "I couldn't generate scientific feedback right now, but your curiosity is the key to discovery!" };
    }
}
