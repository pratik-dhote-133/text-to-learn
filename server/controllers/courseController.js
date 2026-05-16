const Course = require('../models/Course');
const aiService = require('../services/aiService');
const youtubeService = require('../services/youtubeService');

// In-memory tracking for active generations
const generationMap = new Map();
const GENERATION_TTL = 60000;

const sendSafeError = (res, err, defaultStatus = 400) => {
  console.error("[FATAL ERROR]", err);
  return res.status(err.status || defaultStatus).json({
    success: false,
    error: err.message || "An unexpected error occurred"
  });
};

/**
 * 1. Generate Course Structure ONLY
 */
const generateCourse = async (req, res) => {
  const { topic } = req.body;

  try {
    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: "Topic must be at least 3 characters long" });
    }

    console.log("[COURSE GENERATION START]", topic);

    let structure = await aiService.generateCourseStructure(topic.trim());

    console.log("[AI RAW STRUCTURE]", structure);

    // 🔥 STRICT SAFETY
    const safeStructure = {
      title: structure.title || `${topic} Course`,
      description: structure.description || `Learn ${topic} step by step`,
      modules: Array.isArray(structure.modules) ? structure.modules : []
    };

    const cleanModules = safeStructure.modules.map((m, i) => ({
      title: m.title || `${topic} Module ${i + 1}`,
      lessons: (Array.isArray(m.lessons) ? m.lessons : []).map((l, j) => ({
        title: l.title || `${topic} Lesson ${i + 1}.${j + 1}`,
        isGenerated: false
      }))
    }));

    let isFixed = false;
    
    if (!safeStructure.title || safeStructure.title.trim() === '') {
      safeStructure.title = `${topic} Masterclass`;
      isFixed = true;
    }
    if (!safeStructure.description || safeStructure.description.trim() === '') {
      safeStructure.description = `A professional, structured course on ${topic}. Learn core concepts, practical applications, and advanced skills through targeted lessons and examples.`;
      isFixed = true;
    }

    // Ensure exactly 4 regular modules
    if (cleanModules.length < 4) {
      while (cleanModules.length < 4) {
        cleanModules.push({ title: `${topic} Module ${cleanModules.length + 1}`, lessons: [] });
      }
      isFixed = true;
    } else if (cleanModules.length > 4) {
      cleanModules.splice(4);
      isFixed = true;
    }

    for (let i = 0; i < cleanModules.length; i++) {
      const mod = cleanModules[i];
      if (!Array.isArray(mod.lessons)) mod.lessons = [];
      if (mod.lessons.length < 4) {
        while (mod.lessons.length < 4) {
          mod.lessons.push({ title: `${topic} Lesson ${i + 1}.${mod.lessons.length + 1}`, isGenerated: false });
        }
        isFixed = true;
      } else if (mod.lessons.length > 4) {
        mod.lessons.splice(4);
        isFixed = true;
      }
    }

    // Append Final Assessment Module
    cleanModules.push({
      title: "Module 5: Final Assessment",
      lessons: [
        { title: "Beginner Assessment", isGenerated: false },
        { title: "Intermediate Assessment", isGenerated: false },
        { title: "Advanced Assessment", isGenerated: false }
      ]
    });

    if (isFixed) {
      console.log("[VALIDATION FIXED] Course structure auto-corrected to 4x4");
    }

    const course = await Course.create({
      title: safeStructure.title,
      description: safeStructure.description,
      topic: topic,
      userId: req.user._id,
      modules: cleanModules
    });

    console.log("[COURSE CREATED SUCCESSFULLY]");

    return res.status(201).json(course);

  } catch (err) {
    return sendSafeError(res, err);
  }
};

/**
 * 2. Generate Lesson Content ON-DEMAND
 */
const generateLessonContent = async (req, res) => {
  const { id, moduleIndex, lessonIndex } = req.params;
  const genKey = `lesson_${id}_${moduleIndex}_${lessonIndex}`;
  const now = Date.now();

  try {
    const course = await Course.findOne({ _id: id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const modIdx = parseInt(moduleIndex);
    const lesIdx = parseInt(lessonIndex);

    if (isNaN(modIdx) || modIdx < 0 || modIdx >= course.modules.length ||
      isNaN(lesIdx) || lesIdx < 0 || lesIdx >= course.modules[modIdx].lessons.length) {
      return res.status(400).json({ error: 'Invalid module or lesson index' });
    }

    const lesson = course.modules[modIdx].lessons[lesIdx];

    // Check if already generated
    if (lesson.isGenerated) {
      return res.json(course);
    }

    // Concurrency protection
    if (generationMap.has(genKey)) {
      const startTime = generationMap.get(genKey);
      if (now - startTime < GENERATION_TTL) {
        return res.status(202).json({ status: "generating", message: "Lesson is being generated." });
      }
    }

    generationMap.set(genKey, now);

    try {
      const lessonData = await aiService.generateLesson(course.title, course.modules[modIdx].title, lesson.title);

      // Update DB
      const updatePath = `modules.${modIdx}.lessons.${lesIdx}`;
      const updatedCourse = await Course.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        {
          $set: {
            [`${updatePath}.objectives`]: lessonData.objectives,
            [`${updatePath}.content`]: lessonData.content,
            [`${updatePath}.isGenerated`]: true
          }
        },
        { new: true }
      );

      return res.json(updatedCourse);
    } finally {
      generationMap.delete(genKey);
    }
  } catch (err) {
    return sendSafeError(res, err);
  }
};

/**
 * 3. YouTube Search Proxy
 */
const getYoutubeVideo = async (req, res) => {
  const { query, courseId } = req.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    let usedVideoIds = [];
    let course = null;
    if (courseId && courseId !== "undefined") {
      course = await Course.findById(courseId);
      if (course && course.usedVideoIds) {
        usedVideoIds = course.usedVideoIds;
      }
    }

    const videoData = await youtubeService.searchYouTubeVideo(course?.title || '', query, usedVideoIds);

    if (videoData && videoData.videoId && course) {
      if (!course.usedVideoIds) course.usedVideoIds = [];
      if (!course.usedVideoIds.includes(videoData.videoId)) {
        course.usedVideoIds.push(videoData.videoId);
        await course.save();
      }
    }

    if (videoData && videoData.videoId) {
      return res.json({ 
        videoId: videoData.videoId, 
        title: videoData.title || '', 
        thumbnail: videoData.thumbnail || '' 
      });
    } else if (typeof videoData === 'string') {
      return res.json({ videoId: videoData, title: "Tutorial", thumbnail: "" });
    }

    return res.json({ videoId: "PkZNo7MFNFg", title: "Fallback Tutorial", thumbnail: "" });
  } catch (err) {
    console.error("[YOUTUBE FATAL]", err);
    return res.json({ videoId: "PkZNo7MFNFg", title: "Fallback Tutorial", thumbnail: "" });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return sendSafeError(res, err);
  }
};

const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json(course);
  } catch (err) {
    return sendSafeError(res, err);
  }
};

const markLessonComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex, lessonIndex } = req.body;

    if (moduleIndex === undefined || lessonIndex === undefined) {
      return res.status(400).json({ error: "moduleIndex and lessonIndex required" });
    }

    const course = await Course.findOne({ _id: id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lessonKey = `${moduleIndex}_${lessonIndex}`;
    
    if (!course.completedLessons) {
      course.completedLessons = [];
    }
    
    if (!course.completedLessons.includes(lessonKey)) {
      course.completedLessons.push(lessonKey);
      await course.save();
    }

    return res.json({ success: true, completedLessons: course.completedLessons });
  } catch (err) {
    return sendSafeError(res, err);
  }
};

const submitQuizScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex, lessonIndex, score, totalQuestions } = req.body;

    if (moduleIndex === undefined || lessonIndex === undefined || score === undefined || totalQuestions === undefined) {
      return res.status(400).json({ error: "Missing required quiz fields" });
    }

    const course = await Course.findOne({ _id: id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lessonKey = `${moduleIndex}_${lessonIndex}`;
    
    // Using Mongoose Map
    let quizData = course.quizScores.get(lessonKey);
    if (!quizData) {
      quizData = { score, attempts: 1, totalQuestions };
    } else {
      quizData.attempts += 1;
      if (score > quizData.score) {
        quizData.score = score;
      }
    }
    course.quizScores.set(lessonKey, quizData);
    await course.save();

    return res.json({ success: true, quizScores: course.quizScores });
  } catch (err) {
    return sendSafeError(res, err);
  }
};

module.exports = {
  generateCourse,
  generateLessonContent,
  getYoutubeVideo,
  getCourses,
  getCourseDetails,
  markLessonComplete,
  submitQuizScore
};