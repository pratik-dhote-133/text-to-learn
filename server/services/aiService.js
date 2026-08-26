const { GoogleGenerativeAI } = require("@google/generative-ai");
const PQueue = require("p-queue").default;
const { getRoadmapForDomain } = require('./domainRoadmaps');

const queue = new PQueue({ concurrency: 2 });
let genAI;

const initializeAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[ERROR] Missing GEMINI_API_KEY");
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const cleanAIResponse = (text) => {
  try {
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const callAI = async (prompt) => {
  const ai = initializeAI();
  if (!ai) throw new Error("AI not initialized");

  return queue.add(async () => {
    console.log("[AI REQUEST]", prompt.slice(0, 100).replace(/\n/g, ' '));
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
};

const normalizeTopic = (topic) => {
  return typeof topic === 'string' ? topic.trim().toLowerCase() : "topic";
};

const detectDomain = (topic) => {
  const lower = normalizeTopic(topic);
  const domains = {
    tech: ['javascript', 'python', 'java', 'react', 'node', 'coding', 'programming', 'web', 'backend', 'frontend', 'system', 'cloud', 'aws'],
    dsa: ['data structure', 'algorithm', 'dsa', 'leetcode', 'binary tree', 'graph'],
    machine_learning: ['machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural network', 'data science'],
    cooking: ['cook', 'food', 'recipe', 'baking', 'chef', 'kitchen', 'culinary', 'pastry', 'meal'],
    fitness: ['fitness', 'gym', 'diet', 'workout', 'weight', 'yoga', 'pilates', 'muscle', 'strength'],
    dance: ['dance', 'salsa', 'hip hop', 'ballet', 'choreography', 'tango', 'rhythm'],
    health: ['health', 'nutrition', 'wellness', 'recovery', 'sleep', 'mental', 'stress'],
    finance: ['finance', 'invest', 'trading', 'stocks', 'crypto', 'money', 'economics', 'budget'],
    business: ['business', 'startup', 'entrepreneur', 'management', 'leadership', 'sales', 'marketing'],
    photography: ['photo', 'camera', 'lens', 'portrait', 'landscape', 'editing', 'lightroom', 'shoot'],
    music: ['music', 'guitar', 'piano', 'vocal', 'singing', 'melody', 'beat', 'producer', 'instrument'],
    education: ['teach', 'learn', 'student', 'pedagogy', 'school', 'tutor'],
    language: ['language', 'spanish', 'french', 'english', 'grammar', 'vocabulary', 'speak', 'fluency'],
    science: ['physics', 'chemistry', 'biology', 'science', 'astronomy', 'quantum'],
    design: ['design', 'ui', 'ux', 'graphic', 'photoshop', 'illustrator', 'figma', 'art', 'draw']
  };

  let primary = 'general';
  let secondary = null;
  let maxScore = 0;
  let secScore = 0;

  for (const [domain, keywords] of Object.entries(domains)) {
    let score = 0;
    keywords.forEach(kw => {
      if (lower.includes(kw)) score += 1;
    });

    if (score > maxScore) {
      secScore = maxScore;
      secondary = primary !== 'general' ? primary : null;
      maxScore = score;
      primary = domain;
    } else if (score > secScore) {
      secScore = score;
      secondary = domain;
    }
  }

  return { primary, secondary };
};

// ================= COURSE STRUCTURE =================

const generateCourseStructure = async (topic) => {
  console.log(`[GENERATING STRUCTURE] Topic: ${topic}`);
  const cleanTopic = normalizeTopic(topic);
  const domainInfo = detectDomain(cleanTopic);
  const baseRoadmap = getRoadmapForDomain(domainInfo.primary);
  
  const prompt = `
You are a university-level curriculum designer for a premium platform like Coursera or GeeksforGeeks.
Create a deeply educational, realistic roadmap for the exact topic: "${topic}".
Domain: ${domainInfo.primary}

CRITICAL INSTRUCTIONS:
1. ACTUALLY TEACH THE SUBJECT. Adapt the provided baseline roadmap specifically to "${topic}". If the topic is "Java Data Structures", make sure titles mention "Java" and specific Java classes (e.g. "ArrayList", "HashMap").
2. NEVER generate generic placeholder names like "Module 1", "Introduction to X", "Basics of X", "Advanced Concepts", "Intermediate Mechanics", "Core Principles", "Working with Data", "Foundations", "Mastery", "Real-world Application", "Key Concepts".
3. Each module MUST have a descriptive, educational title (e.g. "Arrays, Linked Lists, and Stacks in Java").
4. Each lesson MUST have a specific, actionable title (e.g. "Time Complexity and Big-O Notation").
5. DESCRIPTION RULES (STRICT):
   - MAXIMUM 2 lines / 35-45 words
   - Professional concise tone
   - Quick overview of what the course covers and who it's for
   - NO paragraphs. NO lengthy introductions.
   - Example: "Master modern JavaScript from fundamentals to advanced async patterns, DOM manipulation, APIs, and backend integration through structured hands-on lessons."
6. Generate EXACTLY 4 modules, each with EXACTLY 4 lessons.

BASELINE ROADMAP TO ADAPT (DO NOT copy verbatim, customize deeply for "${topic}"):
${JSON.stringify(baseRoadmap, null, 2)}

EXPECTED JSON FORMAT (Strictly valid JSON, no markdown):
{
  "title": "Professional Course Title",
  "description": "Deep professional description.",
  "modules": [
    {
      "title": "Specific Educational Module Title",
      "lessons": [
        { "title": "Specific Lesson 1" },
        { "title": "Specific Lesson 2" },
        { "title": "Specific Lesson 3" },
        { "title": "Specific Lesson 4" }
      ]
    }
  ]
}
`;

  try {
    let raw = await callAI(prompt);
    let data = cleanAIResponse(raw);

    if (!data || !data.modules || data.modules.length !== 4) {
      throw new Error("Invalid AI structure response");
    }

    return data;
  } catch (err) {
    console.error("[STRUCTURE ERROR] AI failed, returning safe fallback", err.message);
    return {
      title: `${topic} Masterclass`,
      description: `A complete educational roadmap covering the core concepts, practical applications, and advanced techniques of ${topic}.`,
      modules: baseRoadmap.modules
    };
  }
};

// ================= LESSON =================

const generateLesson = async (courseTitle, moduleTitle, lessonTitle, isRetry = false) => {
  const domainInfo = detectDomain(courseTitle);
  const isTech = domainInfo.primary === 'tech' || domainInfo.secondary === 'tech';
  const isAssessment = moduleTitle.includes("Final Assessment") || lessonTitle.includes("Assessment");

  let prompt = "";
  
  if (isAssessment) {
    prompt = `
You are an elite educator creating a ${lessonTitle} for the Final Assessment of the course: "${courseTitle}".
Domain: ${domainInfo.primary}

CRITICAL RULES:
1. NO paragraphs, NO headings, NO videos. ONLY MCQs.
2. Generate EXACTLY 10 high-quality, scenario-based MCQs.
3. The difficulty must match: "${lessonTitle}".
4. Question text MAXIMUM 1 line.
5. Option text MAXIMUM 3-6 words. No paragraph options.

EXPECTED STRICT JSON FORMAT:
{
  "objectives": ["Evaluate mastery of ${courseTitle} at ${lessonTitle} level."],
  "content": [
    { "type": "paragraph", "text": "Welcome to the ${lessonTitle}. Please answer the following questions to test your knowledge." },
    { "type": "mcq", "question": "Scenario question 1?", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "Why A is correct." },
    ... (10 MCQs total) ...
  ]
}
`;
  } else {
    prompt = `
You are an elite AI mentor (like ChatGPT) teaching a student. 
Course: ${courseTitle}
Module: ${moduleTitle}
Lesson: ${lessonTitle}
Domain: ${domainInfo.primary}

CRITICAL TEACHING PSYCHOLOGY (SIMPLIFIED & BEGINNER FRIENDLY):
1. Use SIMPLE, EASY English. No academic jargon. No huge documentation-like text walls.
2. Teach concept-by-concept using short, bite-sized chunks.
3. Every paragraph MUST be 2-3 sentences maximum. NEVER write long paragraphs.
4. MUST include highlight blocks using the "callout" type.
5. Start with a TINY intro (1-2 sentences MAX), then immediately go into structured content.

MANDATORY EDUCATIONAL FLOW:
1. Tiny Intro (1-2 sentences ONLY explaining what this lesson covers)
2. Core Concept Definition (Tiny definition, simple explanation)
3. Real Example (Relatable, real-world scenario)
4. Code Example (Simple code demonstrating the concept)
5. Important Point (Use "callout" block)
6. Common Mistake (Use "callout" block)

${isTech ? 
`DSA & TECH DOMAIN MANDATORY CONTENT:
- MUST explain: overlapping subproblems, optimal substructure, tabulation, memoization, recursion tree, state transition (if applicable).
- MUST use a classic example (e.g., Fibonacci, Knapsack) where relevant.
- MUST include a dry run of the algorithm.
- MUST include complexity analysis (Time/Space).
- MUST include Interview tips, Edge cases, and Common bugs as callouts.` 
: 
`NON-TECH DOMAIN MANDATORY FLOW:
- MUST include practical real-life examples.
- MUST use visual-style explanations.
- NO code blocks.`}

MCQ REQUIREMENTS (STRICTLY COMPACT):
1. Provide EXACTLY 5 MCQs.
2. Question text MUST be MAXIMUM 1 line. Direct, conceptual, and concise.
3. Options MUST be MAXIMUM 3-6 words only. Highly concise.
4. DO NOT use paragraph options. Options must look like: "Memoization", "DFS", "Greedy", "Backtracking".
5. MCQs must test concepts, feel interview-oriented, and be meaningful (complexity, recursion, memoization, graph traversal, trees, stack/queue usage, edge cases).
6. FORBIDDEN: paragraph questions, paragraph answers, essay-style MCQs, long option text, vague motivational questions, generic learning questions.

EXPECTED STRICT JSON FORMAT (Use these exact types: "heading", "paragraph", "callout", "code", "video", "mcq"):
{
  "objectives": ["Specific Goal 1"],
  "content": [
    { "type": "heading", "text": "1. Introduction" },
    { "type": "paragraph", "text": "..." },
    { "type": "callout", "style": "interview_tip", "text": "..." },
    ${isTech ? `{ "type": "code", "language": "python", "text": "# Sample\\n..." },` : ''}
    ...
    { "type": "video", "query": "${lessonTitle.replace(/"/g, '\\"')}" },
    { "type": "mcq", "question": "Scenario-based question testing understanding?", "options": ["Realistic A", "Realistic B", "Realistic C", "Realistic D"], "answer": 0, "explanation": "Detailed explanation of why this is correct." }
  ]
}
`;
  }

  const minimalValidLesson = {
    title: lessonTitle,
    objectives: [`Master the core concepts of ${lessonTitle}`, `Apply ${lessonTitle} practically`],
    content: [
      { type: "heading", text: `Introduction to ${lessonTitle}` },
      { type: "paragraph", text: `Welcome to ${lessonTitle}. In this lesson, we will cover the core mechanics and implementation details of this concept.` },
      { type: "heading", text: `Core Concept` },
      { type: "paragraph", text: `This concept involves understanding the primary algorithm and data structure behavior to optimize performance and logic.` },
      { type: "callout", style: "interview_tip", text: `Always clarify the edge cases and time complexity with your interviewer before writing code.` },
      { type: "heading", text: `Summary` },
      { type: "paragraph", text: `To summarize, mastering ${lessonTitle} requires recognizing the optimal patterns and potential pitfalls. Review the video tutorial below for a visual deep dive.` },
      { type: "video", query: lessonTitle },
      { type: "mcq", question: `Which aspect is most critical when optimizing an algorithm related to ${lessonTitle}?`, options: ["Time and Space Complexity", "Variable Naming", "Code Length", "Syntax Highlighting"], answer: 0, explanation: "Complexity analysis ensures the algorithm scales efficiently." },
      { type: "mcq", question: `What is a common edge case to handle?`, options: ["Empty or null inputs", "Printing output", "Adding comments", "Declaring variables"], answer: 0, explanation: "Empty inputs are a frequent source of runtime errors." },
      { type: "mcq", question: `Why might a brute-force approach fail in a production environment?`, options: ["It exceeds time limits on large datasets", "It is too easy to read", "It uses too many comments", "It doesn't use modern syntax"], answer: 0, explanation: "Brute force approaches typically have exponential or quadratic time complexities." },
      { type: "mcq", question: `How can you test the logic of your algorithm without a computer?`, options: ["Performing a manual dry run", "Guessing the output", "Running a linter", "Reading the problem again"], answer: 0, explanation: "A dry run allows you to trace state changes step-by-step." },
      { type: "mcq", question: `Which tool is primarily used to store previously computed results to avoid redundant calculations?`, options: ["Memoization table", "Linear Search", "Binary Tree", "Stack"], answer: 0, explanation: "Memoization caches results of subproblems to optimize execution." }
    ]
  };

  try {
    let raw = await callAI(prompt);
    let data = cleanAIResponse(raw);

    // Validate structure
    let isValid = true;
    if (!data || !data.content || !Array.isArray(data.content)) isValid = false;
    else {
      const mcqs = data.content.filter(c => c.type === 'mcq');
      if (mcqs.length < 5) isValid = false;
      if (!isAssessment) {
        const headings = data.content.filter(c => c.type === 'heading');
        if (headings.length < 3) isValid = false;
      }
    }

    if (!isValid) {
      if (!isRetry) {
        console.log("[LESSON WARNING] Malformed structure. Retrying once.");
        return await generateLesson(courseTitle, moduleTitle, lessonTitle, true);
      }
      console.log("[LESSON ERROR] AI failed strict validation on retry. Using fallback.");
      return minimalValidLesson;
    }

    data.title = lessonTitle;
    return data;
  } catch (err) {
    console.log("[LESSON ERROR] AI execution failed:", err.message);
    if (!isRetry) {
      console.log("[LESSON WARNING] Execution failed. Retrying once.");
      return await generateLesson(courseTitle, moduleTitle, lessonTitle, true);
    }
    return minimalValidLesson;
  }
};

module.exports = {
  generateCourseStructure,
  generateLesson
};