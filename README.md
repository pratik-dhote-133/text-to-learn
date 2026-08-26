# Text-to-Learn: AI-Powered Course Generator 🚀

**Text-to-Learn** is a full-stack, AI-driven educational platform that transforms any learning topic into a structured, interactive, professional curriculum. Powered by Google Gemini 2.5 Flash, YouTube Data API v3, and an interactive flow roadmap, Text-to-Learn breaks down complex topics into progressive modules, bite-sized lessons, practical code examples, callouts, knowledge-check MCQs, YouTube video tutorials, and printable PDF exports.

---

## 🌟 Key Features

1. **Dynamic Topic-Aware Curriculum Generation**: Converts any input topic (e.g. *React*, *Dynamic Programming*, *CSS Flexbox*, *Machine Learning*, *Photography*, *Culinary Arts*) into a 4-module x 4-lesson curriculum with a final assessment module.
2. **Interactive Visual Learning Roadmap**: Renders an interactive node graph (`LearningRoadmap.jsx`) showing course progress, node completion status, module accordions, active lesson highlights, and high-resolution PNG image export (`html-to-image`).
3. **On-Demand AI Lesson Breakdown**: Generates beginner-friendly explanations, key objectives, syntax-highlighted code blocks (`Prism`), callout badges (*Interview Tip*, *Common Mistake*, *Best Practice*, *Pro Tip*), and 5 scenario-based MCQs per lesson.
4. **Semantic YouTube Video Integration**: Searches YouTube API v3 with a scoring algorithm that filters out Shorts, music, memes, and reaction videos, prioritizing trusted channels (*freeCodeCamp*, *MIT OpenCourseWare*, *Coursera*, *GeeksforGeeks*, *Fireship*, etc.), rendering a responsive 16:9 player inside the lesson.
5. **Print-Optimized PDF Export**: Native browser PDF export (`window.print()`) styled via print CSS (`@media print`) that converts the dark-mode dashboard into a clean white document layout with black text, formatted callouts, code blocks, and no clipped content.
6. **Robust Progress Tracking & Quiz Scoring**: Tracks completed lessons and quiz scores per user in MongoDB, persisted across sessions and logins.
7. **Production-Ready Security & Authentication**: Custom `bcryptjs` password hashing and `jsonwebtoken` Bearer token verification with protected API routes.

---

## 🏗 Architecture Overview

```
Text-to-Learn/
├── client/                     # React 18 + Vite SPA Frontend
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, LessonRenderer, LearningRoadmap
│   │   ├── context/           # AuthContext (JWT & User state)
│   │   ├── pages/             # Home, CoursePage, ModulePage, LessonPage, Login, Signup, ForgotPassword
│   │   └── utils/             # Centralized API fetch configuration (api.js)
│   └── index.css              # Custom CSS design system & print stylesheet
└── server/                     # Express 5 Node.js Backend API
    ├── config/                # MongoDB Mongoose connection (db.js)
    ├── controllers/           # authController.js, courseController.js
    ├── middleware/            # authMiddleware.js (JWT Bearer protect)
    ├── models/                # User.js, Course.js
    ├── routes/                # authRoutes.js, courseRoutes.js, debugRoutes.js
    └── services/              # aiService.js (Gemini 2.5 Flash), youtubeService.js, domainRoadmaps.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (`mongodb://127.0.0.1:27017/textToLearn`) or MongoDB Atlas connection string
- Google Gemini API Key (`GEMINI_API_KEY`)
- YouTube Data API v3 Key (`YOUTUBE_API_KEY`)

### Environment Variables Setup

Create a `.env` file in the `server` directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/textToLearn
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

### Running Locally

1. **Start Backend Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend Dev Server**:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`.

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create user account & return JWT token.
- `POST /api/auth/login`: Authenticate user & return JWT token.
- `POST /api/auth/reset-password`: Reset user password.
- `GET /api/auth/me`: Get current user details.

### Courses & Lessons (`/api/courses`)
- `GET /api/courses`: Fetch user's generated courses.
- `POST /api/courses/generate`: Generate course structure for a topic.
- `GET /api/courses/:id`: Get full details of a specific course.
- `POST /api/courses/generate-lesson/:id/:moduleIndex/:lessonIndex`: On-demand AI lesson generation.
- `POST /api/courses/:id/progress`: Toggle lesson completion state.
- `POST /api/courses/:id/quiz`: Submit MCQ quiz score.
- `GET /api/youtube`: Query YouTube proxy with semantic filtering.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Prism Syntax Highlighter, html-to-image.
- **Backend**: Node.js, Express 5, Mongoose, @google/generative-ai, Axios, bcryptjs, jsonwebtoken, p-queue.
- **Database**: MongoDB.
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`).

---

## 📝 Intentional Implementation Deviations from Original Proposal

1. **Authentication (JWT vs Auth0)**: The project intentionally utilizes custom `bcryptjs` password hashing and `jsonwebtoken` Bearer token authentication rather than Auth0. This eliminates external OAuth dependency risks while maintaining full security and user ownership.
2. **Database Schema (Embedded Document Model)**: Courses embed `modules[]` and `lessons[]` in a single document schema. This allows atomic single-query retrieval of complete roadmaps without expensive relational joins or N+1 queries.
3. **Multilingual / Hinglish & TTS**: Text-To-Speech audio and Hinglish translation were intentionally scoped out of this release to prioritize deep topic-aware AI lesson quality, YouTube semantic filtering, interactive node graph export, and print PDF styling.
