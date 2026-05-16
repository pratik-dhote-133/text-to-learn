require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Course = require('../models/Course');

const API_URL = 'http://localhost:3000/api';
let token;
let courseId;

async function runQA() {
  console.log("=== STARTING BACKEND QA ===");
  
  // Connect DB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/textToLearn');
  console.log("✅ DB Connected");

  // 1. Auth Test
  try {
    const email = `test_${Date.now()}@qa.com`;
    const res = await axios.post(`${API_URL}/auth/register`, { name: "QA Tester", email, password: "password123" });
    token = res.data.token;
    console.log("✅ Auth Success (Token received)");
  } catch (err) {
    console.error("❌ Auth Failed", err.response?.data || err.message);
    return;
  }

  // 2. Course Generation (API & DB Validation)
  try {
    console.log("Generating 'Data Structures' Course...");
    const res = await axios.post(`${API_URL}/courses/generate`, { topic: "Data Structures" }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    courseId = res.data._id;
    const { title, modules } = res.data;
    
    if (modules.length === 4 && modules[0].lessons.length === 4) {
      console.log("✅ Course Generated: 4 Modules, 4 Lessons enforced");
    } else {
      console.log("❌ Course Generation Failed Structural Rules", modules.length);
    }
    
    if (title.includes("Module 1") || modules[0].title.includes("Module 1")) {
      console.log("❌ Generic naming detected!");
    } else {
      console.log(`✅ Meaningful Naming Validated (Title: ${title}, Mod 1: ${modules[0].title})`);
    }

    // DB Check
    const dbCourse = await Course.findById(courseId);
    if (dbCourse && dbCourse.modules.length === 4) {
      console.log("✅ MongoDB Integrity Validated");
    }

  } catch (err) {
    console.error("❌ Course Generation Failed", err.response?.data || err.message);
  }

  // 3. Lesson Generation (Stress Test + Structure)
  try {
    console.log("Generating Lesson 0.0...");
    let lessonRes = await axios.post(`${API_URL}/courses/generate-lesson/${courseId}/0/0`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Handle 202 Polling
    while (lessonRes.status === 202) {
      console.log("   Waiting for lesson generation (202 Accepted)...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      lessonRes = await axios.post(`${API_URL}/courses/generate-lesson/${courseId}/0/0`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    const lesson = lessonRes.data.modules[0].lessons[0];
    if (Array.isArray(lesson.content) && lesson.content.length > 0) {
      console.log("✅ Lesson Generated: Strict Array Format Validated");
      
      const hasHeading = lesson.content.some(b => b.type === 'heading');
      const hasParagraph = lesson.content.some(b => b.type === 'paragraph');
      const hasMcq = lesson.content.some(b => b.type === 'mcq');
      const hasVideo = lesson.content.some(b => b.type === 'video');

      if (hasHeading && hasParagraph && hasMcq && hasVideo) {
         console.log("✅ Lesson Depth Validated: Contains headings, paragraphs, mcqs, video");
      } else {
         console.log("❌ Lesson Missing Components:", {hasHeading, hasParagraph, hasMcq, hasVideo});
         console.log("RAW CONTENT ARRAY:", JSON.stringify(lesson.content, null, 2));
      }
    } else {
      console.log("❌ Lesson Format Invalid:", lesson.content);
    }
  } catch (err) {
    console.error("❌ Lesson Generation Failed", err.response?.data || err.message);
  }

  // 4. Progress Tracking
  try {
    const res = await axios.post(`${API_URL}/courses/${courseId}/progress`, { moduleIndex: 0, lessonIndex: 0 }, {
       headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.data.completedLessons && res.data.completedLessons.includes("0_0")) {
      console.log("✅ Progress Tracking API Validated");
    } else {
      console.log("❌ Progress Tracking API Failed");
    }

    const dbCourse = await Course.findById(courseId);
    if (dbCourse && dbCourse.completedLessons && dbCourse.completedLessons.includes("0_0")) {
      console.log("✅ MongoDB Progress Persistence Validated");
    } else {
      console.log("❌ MongoDB Progress Persistence Failed", dbCourse?.completedLessons);
    }

  } catch(err) {
    console.error("❌ Progress API Failed", err.response?.data || err.message);
  }

  console.log("=== BACKEND QA COMPLETE ===");
  process.exit(0);
}

runQA();
