'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a crossword puzzle generator for a fun educational app.
Your task is to generate a valid, EASY 9x9 crossword puzzle.

REQUIREMENTS:
1. Return ONLY a valid JSON object with a "clues" array.
2. Each object in "clues" must match this schema:
   {
     "number": number,
     "direction": "across" | "down",
     "clue": "string",
     "answer": "UPPERCASE_STRING",
     "row": number,
     "col": number
   }
3. INTERSECTION RULES:
   - All words in the puzzle MUST share at least one letter with another word.
   - Letters at intersection points must be identical in both words.
   - Coordinates (row, col) are 0-indexed (0 to 8).
4. CONTENT:
   - Clues and answers should be general knowledge and EASY.
   - Avoid obscure terms or highly specialized academic language.
   - Words should be 3 to 8 characters long.
5. GRID SIZE:
   - The entire puzzle must fit within a 9x9 grid (row/col 0 to 8).

Example output format:
{
  "clues": [
    { "number": 1, "direction": "across", "clue": "Man's best friend", "answer": "DOG", "row": 1, "col": 1 },
    { "number": 1, "direction": "down", "clue": "A place where you live", "answer": "DWELL", "row": 1, "col": 1 }
  ]
}`;

export async function generateCrossword() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Generate a new EASY daily crossword puzzle with 5-8 intersecting words. Use simple general knowledge clues and answers. Ensure all words fit in 9x9 grid." }] }],
      generationConfig: {
        temperature: 1,
        responseMimeType: "application/json",
      }
    });

    const content = result.response.text();
    if (!content) throw new Error("Empty response from AI");
    
    return { success: true, clues: JSON.parse(content).clues };
  } catch (error: any) {
    console.error("Gemini Crossword Error:", error);
    return {
      success: false,
      error: error.message,
      clues: [
        { number: 1, direction: 'across', clue: 'Moral principles', answer: 'ETHICS', row: 1, col: 1 },
        { number: 1, direction: 'down', clue: 'To be or not to be', answer: 'EXIST', row: 1, col: 1 },
        { number: 2, direction: 'across', clue: 'Platonic concept of perfection', answer: 'IDEAL', row: 3, col: 1 },
      ]
    };
  }
}
