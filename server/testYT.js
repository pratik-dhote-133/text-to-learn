require('dotenv').config();
const { searchYouTubeVideo } = require('./services/youtubeService');

async function testYT() {
  try {
    const videoId = await searchYouTubeVideo("Data Structures", "Arrays and Memory Representation");
    console.log("SUCCESS YT:", videoId);
  } catch (e) {
    console.log("FAIL YT:", e);
  }
}
testYT();
