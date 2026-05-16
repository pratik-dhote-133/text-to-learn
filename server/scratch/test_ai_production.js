require('dotenv').config({ path: '../.env' });
const aiService = require('../services/aiService');

async function runTests() {
  console.log("--- STARTING PRODUCTION-GRADE AI TESTS ---");

  // Test 1: Course Structure (Normal)
  console.log("\n[TEST 1] Generating Course Structure for 'Artificial Intelligence'...");
  const structResult = await aiService.generateCourseStructure("Artificial Intelligence");
  console.log("Source:", structResult.source);
  console.log("Modules Count:", structResult.data.modules.length);
  
  const allModulesHave4Lessons = structResult.data.modules.every(m => m.lessons.length === 4);
  console.log("All modules have 4 lessons:", allModulesHave4Lessons);

  if (structResult.data.modules.length !== 4 || !allModulesHave4Lessons) {
    console.error("FAIL: Structure is not 4x4");
  } else {
    console.log("PASS: Structure is 4x4");
  }

  // Test 2: Module Content (Normal)
  console.log("\n[TEST 2] Generating Module Content for Module 1...");
  const contentResult = await aiService.generateModuleContent(
    "Artificial Intelligence", 
    structResult.data.modules[0].title, 
    structResult.data.modules[0].lessons
  );
  
  console.log("Source:", contentResult.source);
  const lessons = contentResult.data.lessons;
  console.log("Lessons Count:", lessons.length);

  const validLessons = lessons.every(l => 
    l.content && l.example && l.summary && l.videoId && 
    Array.isArray(l.mcqs) && l.mcqs.length === 5 &&
    l.mcqs.every(q => q.options.length === 4 && q.answer && q.options.includes(q.answer))
  );

  console.log("All lessons valid (fields, MCQs, Video):", validLessons);
  
  if (lessons.length !== 4 || !validLessons) {
    console.error("FAIL: Module content invalid or incomplete");
    console.log("First Lesson Sample:", JSON.stringify(lessons[0], null, 2));
  } else {
    console.log("PASS: Module content is rich and valid");
  }

  // Test 3: Cache Verification
  console.log("\n[TEST 3] Verifying Cache for same topic...");
  const cacheResult = await aiService.generateCourseStructure("Artificial Intelligence");
  console.log("Source (should be 'ai' but from cache):", cacheResult.source);
  // Note: logger in aiService will log "Cache Hit"

  console.log("\n--- TESTS COMPLETE ---");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
