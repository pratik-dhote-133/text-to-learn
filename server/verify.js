require('dotenv').config();
const aiService = require('./services/aiService');
const youtubeService = require('./services/youtubeService');

async function verify() {
  try {
    console.log("==========================================");
    console.log("PART 1 & 2: CURRICULUM ENGINE VERIFICATION");
    console.log("==========================================");
    
    console.log("Test 1: 'Data Structures'");
    const course1 = await aiService.generateCourseStructure("Data Structures");
    console.log(JSON.stringify(course1, null, 2));
    
    console.log("\nTest 2: 'Java Data Structures'");
    const course2 = await aiService.generateCourseStructure("Java Data Structures");
    console.log(JSON.stringify(course2, null, 2));

    console.log("\n==========================================");
    console.log("PART 3 & 5: LESSON DEPTH & MCQ VERIFICATION");
    console.log("==========================================");
    
    const lessonTitle = course1.modules[0].lessons[0].title;
    console.log(`Generating Lesson for: Data Structures -> ${course1.modules[0].title} -> ${lessonTitle}`);
    
    const lessonContent = await aiService.generateLesson("Data Structures", course1.modules[0].title, lessonTitle);
    console.log(JSON.stringify(lessonContent, null, 2));

    console.log("\n==========================================");
    console.log("PART 4: YOUTUBE SEMANTIC VERIFICATION");
    console.log("==========================================");
    
    console.log(`Querying YouTube for: "Data Structures", "${lessonTitle}"`);
    const videoId = await youtubeService.searchYouTubeVideo("Data Structures", lessonTitle);
    console.log(`Selected Video ID: ${videoId}`);
    if (videoId) {
        console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
    }

    console.log("\n==========================================");
    console.log("PART 8: FALLBACK SYSTEM VERIFICATION");
    console.log("==========================================");
    
    // Simulate Gemini failure by tampering with API key
    const oldKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "invalid_key";
    
    console.log("Simulating AI failure for 'Machine Learning' structure...");
    const fallbackCourse = await aiService.generateCourseStructure("Machine Learning");
    console.log(JSON.stringify(fallbackCourse, null, 2));

    process.env.GEMINI_API_KEY = oldKey; // Restore

  } catch (err) {
    console.error("Verification failed:", err);
  }
}

verify();
