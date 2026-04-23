const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent("Say hello");
    console.log("Result:", result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
