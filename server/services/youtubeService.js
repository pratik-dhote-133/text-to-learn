const axios = require('axios');

const searchYouTubeVideo = async (courseTitle, lessonTitle, usedVideoIds = []) => {
  if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    console.warn("[YOUTUBE] API Key missing or default");
    return null;
  }

  // Semantic Cleaning
  const removeGenericWords = (text) => {
    if (!text) return '';
    let cleaned = text.replace(/module \d+/i, '').replace(/^\d+\.\s*/, '');
    const genericWords = ['course', 'masterclass', 'lesson', 'fundamentals', 'basics', 'introduction to', 'introduction', 'advanced', 'with', 'using', 'in', 'and', 'the', 'of', 'for', 'a', 'an'];
    genericWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    return cleaned.trim().replace(/\s+/g, ' ');
  };

  const cleanCourse = removeGenericWords(courseTitle);
  const cleanLesson = removeGenericWords(lessonTitle);
  
    // Multi-Query Fallback Strategy
    const queriesToTry = [
      lessonTitle,
      `${cleanLesson} tutorial`,
      `${cleanCourse} tutorial`,
      `${cleanCourse} beginner tutorial`
    ];

    for (let i = 0; i < queriesToTry.length; i++) {
      const q = queriesToTry[i];
      console.log(`[YOUTUBE] Attempting search with query: "${q}"`);
      
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 15,
            q: q,
            type: 'video',
            videoDuration: 'medium',
            key: process.env.YOUTUBE_API_KEY
          },
          timeout: 5000
        });

        const items = response.data.items || [];
        if (items.length === 0) continue;

        let bestVideoId = null;
        let maxScore = -Infinity;

        const lowerLesson = cleanLesson.toLowerCase();
        const lowerCourse = cleanCourse.toLowerCase();
        const lessonKeywords = lowerLesson.split(' ').filter(k => k.length > 2);
        const courseKeywords = lowerCourse.split(' ').filter(k => k.length > 2);
        
        const trustedChannels = [
          'freecodecamp', 'abdul bari', 'mit', 'mit opencourseware', 'harvard', 'coursera', 
          'geeksforgeeks', 'fireship', 'programming with mosh', 'traversy media', 'codewithharry',
          'ibm', 'khan academy', 'simplilearn', 'edureka', 'stanford', 'coding ninjas', 'apna college'
        ];

        for (const item of items) {
          const videoId = item.id.videoId;
          if (usedVideoIds.includes(videoId)) continue;

          const title = item.snippet.title.toLowerCase();
          const channelTitle = item.snippet.channelTitle.toLowerCase();
          
          if (title.includes("shorts") || title.includes("#shorts") || title.includes("music") || 
              title.includes("song") || title.includes("meme") || title.includes("trailer") || 
              title.includes("compilation") || title.includes("reels") || title.includes("reaction")) {
            continue; 
          }

          let score = 0;

          // Lesson Keyword Match
          lessonKeywords.forEach(kw => {
            if (title.includes(kw)) score += 5;
          });

          // Course Keyword Match
          courseKeywords.forEach(kw => {
            if (title.includes(kw)) score += 2;
          });

          // Tutorial/Beginner Keywords
          if (title.includes("tutorial")) score += 5;
          if (title.includes("beginner") || title.includes("basics")) score += 3;
          if (title.includes("full")) score += 3;

          // Trusted Channels
          if (trustedChannels.some(channel => channelTitle.includes(channel))) {
            score += 15;
          }

          // Penalize bad content
          if (title.includes("hack") || title.includes("cheat")) {
            score -= 20;
          }

          // Relevance Threshold (lower for fallback queries)
          const threshold = i === 0 ? 5 : 2; 
          if (score < threshold) continue;

          if (score > maxScore) {
            maxScore = score;
            bestVideoId = videoId;
          }
        }

        if (bestVideoId) {
          console.log(`[YOUTUBE] Found highly relevant video for query: "${q}"`);
          return { videoId: bestVideoId, title: "YouTube Video", thumbnail: "" };
        }

        // If no high-score video, but we have items, just take the first educational one if it's the last query
        if (i === queriesToTry.length - 1 && items.length > 0) {
          console.log("[YOUTUBE WARNING] Using safe fallback from last query list.");
          const firstValid = items.find(item => {
            const t = item.snippet.title.toLowerCase();
            return !t.includes("shorts") && !t.includes("#shorts") && !usedVideoIds.includes(item.id.videoId) && !t.includes("music") && !t.includes("reaction");
          });
          if (firstValid) return { videoId: firstValid.id.videoId, title: firstValid.snippet.title, thumbnail: "" };
        }

      } catch (err) {
        console.error(`[YOUTUBE SEARCH ERROR] Query "${q}": ${err.message}`);
      }
    }
    
    // Absolute Ultimate Fallback (Search just the course title + tutorial to guarantee something)
    try {
        console.log(`[YOUTUBE] Ultimate safe fallback search: "${cleanCourse} tutorial"`);
        const fallbackResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: { part: 'snippet', maxResults: 5, q: `${cleanCourse} tutorial`, type: 'video', key: process.env.YOUTUBE_API_KEY },
          timeout: 5000
        });
        const items = fallbackResponse.data.items || [];
        if (items.length > 0) {
          return {
            videoId: items[0].id.videoId,
            title: items[0].snippet.title,
            thumbnail: items[0].snippet.thumbnails?.high?.url || ''
          };
        }
    } catch (e) {
        console.error(`[YOUTUBE] Ultimate fallback failed: ${e.message}`);
    }

    // Absolute last resort hardcoded fallback to prevent frontend crash or empty state
    return {
      videoId: "PkZNo7MFNFg", // FreeCodeCamp JavaScript as a safe generic fallback
      title: "Educational Tutorial",
      thumbnail: ""
    };
};

module.exports = { searchYouTubeVideo };
