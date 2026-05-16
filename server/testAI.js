// require('dotenv').config();
// const { GoogleGenAI, Type } = require('@google/genai');
// const ai = new GoogleGenAI({}); // will use GEMINI_API_KEY from env if available

// async function test() {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: "Hello",
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             test: { type: Type.STRING }
//           }
//         }
//       }
//     });
//     console.log("Success:", response.text);
//   } catch (err) {
//     console.error("Error:", err);
//   }
// }
// test();


require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `
Return JSON in this format:
{
  "test": "some string"
}

Now respond with a simple test message.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            test: { type: Type.STRING }
          }
        }
      }
    });

    console.log("Success:", response.text);

  } catch (err) {
    console.error("Error:", err);
  }
}

test();