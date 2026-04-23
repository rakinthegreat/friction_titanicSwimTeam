'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert philosophy curator for an educational app.
Your task is to generate exactly 10 new, unique, and advanced philosophical concepts.

IMPORTANT REQUIREMENTS:
1. Return ONLY a valid JSON array.
2. Every object in the array MUST match the exact schema shown below.
3. The concepts must be profound, interesting, and cover varied branches of philosophy (ethics, metaphysics, epistemology, etc.).

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: gemini-3-flash-preview does not exist yet; using gemini-1.5-flash for stability
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_PROMPT
    });

    let userPrompt = "Generate 10 advanced philosophical concepts.";
    if (interests && interests.length > 0) {
      userPrompt += ` Try to relate some of the concepts to these user interests if possible: ${interests.join(', ')}. However, prioritize deep, classic philosophical concepts over forced relations.`;
    }

    console.log("Curating concepts with Gemini SDK...");

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
    console.error("Concept generation failed:", error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}