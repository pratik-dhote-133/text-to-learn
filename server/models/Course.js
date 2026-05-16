const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: Number, required: true }, // Index 0-3
  explanation: { type: String, required: true },
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objectives: [String],
  content: [mongoose.Schema.Types.Mixed], // Flexible array for heading, paragraph, code, video, mcq
  isGenerated: { type: Boolean, default: false },
  videoId: { type: String }, // Stored after YouTube API fetch
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  modules: [moduleSchema],
  source: { type: String, enum: ['ai', 'repaired', 'fallback'], default: 'ai' },
  usedVideoIds: [{ type: String }],
  completedLessons: [{ type: String }], // Array of "moduleIndex_lessonIndex"
  quizScores: {
    type: Map,
    of: {
      score: Number,
      attempts: Number,
      totalQuestions: Number
    },
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);

