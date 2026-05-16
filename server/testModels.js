require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = ai.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`SUCCESS ${m}:`, result.response.text());
      return;
    } catch (e) {
      console.log(`FAIL ${m}:`, e.message);
    }
  }
}
run();
