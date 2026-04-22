import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateContent = async (interests: string[]) => {
  const model = getGeminiModel();
  const prompt = `Generate 50 trivia questions, 20 advanced vocabulary words with definitions, 10 short clean jokes, and 5 search queries for educational YouTube shorts based on these interests: ${interests.join(", ")}. Return strictly as a JSON object with keys: trivia (q, a, category), vocab (word, meaning, example), jokes (setup, punchline), and watchables (title, url, type, category, durationEstimateMins).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // In a real implementation, we'd sanitize the JSON string here
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating content:", error);
    return null;
  }
};
