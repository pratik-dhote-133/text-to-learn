require('dotenv').config({ path: '/Users/pratik/text-to-learn/server/.env' });
const { generateCourseFromAI } = require('./services/aiService');

async function test() {
  try {
    console.log("Starting test...");
    const result = await generateCourseFromAI("Python for beginners");
    console.log("Success:", JSON.stringify(result).substring(0, 100));
  } catch (err) {
    console.error("Fatal Error:", err);
  }
}
test();
