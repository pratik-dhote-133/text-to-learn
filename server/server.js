require("dotenv").config();
const express = require("express");
const cors = require("cors");

console.log("[ENV LOADED]");
console.log("[ENV] GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const debugRoutes = require("./routes/debugRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/debug", debugRoutes);

const { getYoutubeVideo } = require('./controllers/courseController');
const { protect } = require('./middleware/authMiddleware');
app.get("/api/youtube", protect, getYoutubeVideo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// GLOBAL CRASH PROTECTION
process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
});