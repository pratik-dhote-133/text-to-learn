const express = require('express');
const router = express.Router();
const { 
  generateCourse, 
  generateLessonContent,
  getYoutubeVideo,
  getCourses, 
  getCourseDetails,
  markLessonComplete,
  submitQuizScore
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCourses);
router.route('/youtube').get(protect, getYoutubeVideo);
router.route('/:id').get(protect, getCourseDetails);
router.post('/generate', protect, generateCourse);
router.post('/generate-lesson/:id/:moduleIndex/:lessonIndex', protect, generateLessonContent);
router.post('/:id/progress', protect, markLessonComplete);
router.post('/:id/quiz', protect, submitQuizScore);

module.exports = router;