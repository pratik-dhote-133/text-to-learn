require('dotenv').config();
const mongoose = require('mongoose');
const aiService = require('../services/aiService');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/text-to-learn')
  .then(async () => {
    console.log("Connected to MongoDB");
    
    const topics = ['Data Structures', 'ReactJS', 'Machine Learning', 'Italian Cooking', 'Photography'];
    
    for (const topic of topics) {
      console.log(`\n--- Testing Structure for: ${topic} ---`);
      try {
        const structure = await aiService.generateCourseStructure(topic);
        console.log(`Structure success: ${structure.modules.length} modules`);
        
        console.log(`Testing Lesson Generation for: ${topic} (Module 1, Lesson 1)`);
        const lesson = await aiService.generateLesson(topic, structure.modules[0].title, structure.modules[0].lessons[0].title);
        console.log(`Lesson success! Items: ${lesson.content.length}`);
        const callouts = lesson.content.filter(c => c.type === 'callout');
        console.log(`Callouts found: ${callouts.length}`);
      } catch (e) {
        console.error(`Failed on ${topic}:`, e);
      }
    }

    console.log("\nTesting Final Assessment Generation...");
    try {
      const assessment = await aiService.generateLesson("ReactJS", "Module 5: Final Assessment", "Advanced Assessment");
      console.log(`Assessment success! Items: ${assessment.content.length}`);
      const mcqs = assessment.content.filter(c => c.type === 'mcq');
      console.log(`MCQs found: ${mcqs.length} (Expected 10)`);
    } catch (e) {
      console.error("Failed on Assessment:", e);
    }
    
    process.exit(0);
  })
  .catch(err => console.error(err));
